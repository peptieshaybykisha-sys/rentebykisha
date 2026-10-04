-- Renté by Kisha: customer accounts, rentals, fittings, wishlist and private receipts.
-- Run after 0001_init.sql. Safe to re-run.
--
-- Business rules enforced here (keep in sync with src/constants/business.ts):
--   3 days included in the rental price, 7 days maximum, 20% of the price per extra day,
--   2 days lead time, delivery fee 150, fittings Mon-Sat 10:00-17:00 on the hour.

create extension if not exists btree_gist with schema extensions;

-- ================================================================ profiles
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  name       text not null default '' check (char_length(name) <= 120),
  phone      text not null default '' check (char_length(phone) <= 30),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, phone)
  values (
    new.id,
    new.email,
    left(coalesce(new.raw_user_meta_data ->> 'name', ''), 120),
    left(coalesce(new.raw_user_meta_data ->> 'phone', ''), 30)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Accounts created before this migration.
insert into public.profiles (id, email, name, phone)
select u.id, u.email, left(coalesce(u.raw_user_meta_data ->> 'name', ''), 120), left(coalesce(u.raw_user_meta_data ->> 'phone', ''), 30)
from auth.users u
on conflict (id) do nothing;

alter table public.profiles enable row level security;
drop policy if exists "read own profile" on public.profiles;
drop policy if exists "update own profile" on public.profiles;
create policy "read own profile"   on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
-- Customers may only change their name and phone.
revoke update on public.profiles from authenticated;
grant update (name, phone) on public.profiles to authenticated;

-- ================================================================ addresses
create table if not exists public.addresses (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  label      text not null check (char_length(label) between 1 and 40),
  line1      text not null check (char_length(line1) between 8 and 300),
  city       text not null check (char_length(city) between 2 and 80),
  created_at timestamptz not null default now()
);
create index if not exists addresses_user_idx on public.addresses (user_id);

alter table public.addresses enable row level security;
drop policy if exists "own addresses" on public.addresses;
create policy "own addresses" on public.addresses for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ================================================================ wishlist
create table if not exists public.wishlist (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  dress_id   uuid not null references public.dresses (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, dress_id)
);

alter table public.wishlist enable row level security;
drop policy if exists "own wishlist" on public.wishlist;
create policy "own wishlist" on public.wishlist for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ================================================================ rentals
create table if not exists public.rentals (
  id             text primary key,                       -- REN-20261004-001
  user_id        uuid references auth.users (id) on delete set null,
  status         text not null default 'Payment Verification' check (status in (
                   'Pending Payment', 'Payment Verification', 'Confirmed', 'Preparing', 'Ready for Pickup',
                   'Rented', 'Return Due', 'Returned', 'Under Inspection', 'Completed', 'Cancelled')),
  payment_status text not null default 'Pending Verification'
                   check (payment_status in ('Pending Verification', 'Verified', 'Rejected', 'Deposit Refunded')),
  customer_name  text not null,
  customer_email text not null,
  customer_phone text not null,
  fulfillment    text not null check (fulfillment in ('delivery', 'pickup')),
  address        text,
  notes          text check (char_length(notes) <= 1000),
  rental_fee     integer not null default 0 check (rental_fee >= 0),
  deposit        integer not null default 0 check (deposit >= 0),
  delivery_fee   integer not null default 0 check (delivery_fee >= 0),
  total          integer not null default 0 check (total >= 0),
  receipt_path   text,
  history        jsonb not null default '[]',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists rentals_user_idx on public.rentals (user_id, created_at desc);
create index if not exists rentals_status_idx on public.rentals (status, created_at desc);

create table if not exists public.rental_items (
  id          uuid primary key default gen_random_uuid(),
  rental_id   text not null references public.rentals (id) on delete cascade,
  dress_id    uuid references public.dresses (id) on delete set null,
  dress_name  text not null,
  category    text not null,
  size        text not null,
  start_date  date not null,
  end_date    date not null check (end_date >= start_date),
  rental_fee  integer not null check (rental_fee >= 0),
  deposit     integer not null check (deposit >= 0),
  active      boolean not null default true,              -- false once the dress is back or the rental is cancelled
  -- The database itself refuses to double-book a dress, even under concurrent checkouts.
  constraint rental_items_no_double_booking exclude using gist (
    dress_id with =, daterange(start_date, end_date, '[]') with &&
  ) where (active and dress_id is not null)
);
create index if not exists rental_items_rental_idx on public.rental_items (rental_id);

-- history + timestamps, and release the dates when the dress comes back or the rental is cancelled
create or replace function public.rentals_before_update()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status then
    new.history := old.history || jsonb_build_array(jsonb_build_object('status', new.status, 'at', now()));
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.rentals_after_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status and new.status in ('Returned', 'Under Inspection', 'Completed', 'Cancelled') then
    update public.rental_items set active = false where rental_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists rentals_before_update on public.rentals;
drop trigger if exists rentals_after_update on public.rentals;
create trigger rentals_before_update before update on public.rentals for each row execute function public.rentals_before_update();
create trigger rentals_after_update  after update  on public.rentals for each row execute function public.rentals_after_update();

alter table public.rentals      enable row level security;
alter table public.rental_items enable row level security;

drop policy if exists "read own rentals"      on public.rentals;
drop policy if exists "admins update rentals" on public.rentals;
drop policy if exists "read own rental items" on public.rental_items;
-- No insert policy: customers create rentals only through create_rental(), which validates everything.
create policy "read own rentals"      on public.rentals for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "admins update rentals" on public.rentals for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "read own rental items" on public.rental_items for select to authenticated using (
  exists (select 1 from public.rentals r where r.id = rental_id and (r.user_id = auth.uid() or public.is_admin()))
);

-- ================================================================ create_rental
create or replace function public.create_rental(
  p_items        jsonb,
  p_customer     jsonb,
  p_fulfillment  text,
  p_address      text,
  p_notes        text,
  p_receipt_path text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  c_included  constant int := 3;
  c_max_days  constant int := 7;
  c_lead_days constant int := 2;
  c_delivery  constant int := 150;
  uid         uuid := auth.uid();
  today       date := (now() at time zone 'Asia/Manila')::date;
  item        jsonb;
  d           public.dresses;
  v_start     date;
  v_end       date;
  v_days      int;
  v_fee       int;
  v_total_fee int := 0;
  v_total_dep int := 0;
  v_delivery  int := 0;
  v_prefix    text;
  v_seq       int;
  v_id        text;
begin
  if uid is null then
    raise exception 'Please log in to rent a dress.' using errcode = '28000';
  end if;
  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) not between 1 and 10 then
    raise exception 'Your rental cart is empty.';
  end if;
  if p_fulfillment not in ('delivery', 'pickup') then
    raise exception 'Choose delivery or pickup.';
  end if;
  if p_fulfillment = 'delivery' then
    if char_length(trim(coalesce(p_address, ''))) < 8 then
      raise exception 'Please enter a complete delivery address.';
    end if;
    v_delivery := c_delivery;
  end if;
  if char_length(trim(coalesce(p_customer ->> 'name', ''))) < 2
     or char_length(trim(coalesce(p_customer ->> 'email', ''))) < 5
     or char_length(trim(coalesce(p_customer ->> 'phone', ''))) < 7 then
    raise exception 'Please complete your contact details.';
  end if;
  if p_receipt_path is null or p_receipt_path not like uid::text || '/%' then
    raise exception 'Please upload your payment receipt.';
  end if;

  -- one rental number sequence per day; the lock stops two checkouts getting the same number
  perform pg_advisory_xact_lock(hashtext('rental-number'));
  v_prefix := 'REN-' || to_char(today, 'YYYYMMDD') || '-';
  select count(*) + 1 into v_seq from public.rentals where id like v_prefix || '%';
  v_id := v_prefix || lpad(v_seq::text, 3, '0');

  insert into public.rentals (id, user_id, customer_name, customer_email, customer_phone, fulfillment, address, notes, receipt_path, history)
  values (
    v_id, uid,
    trim(p_customer ->> 'name'), trim(p_customer ->> 'email'), trim(p_customer ->> 'phone'),
    p_fulfillment, case when p_fulfillment = 'delivery' then trim(p_address) end, nullif(trim(coalesce(p_notes, '')), ''),
    p_receipt_path,
    jsonb_build_array(jsonb_build_object('status', 'Payment Verification', 'at', now()))
  );

  for item in select * from jsonb_array_elements(p_items) loop
    select * into d from public.dresses where id = (item ->> 'dressId')::uuid;
    if not found then
      raise exception 'One of the dresses is no longer in our collection.';
    end if;
    if d.status <> 'available' then
      raise exception '% is not available right now.', d.name;
    end if;
    if not ((item ->> 'size') = any (d.sizes)) then
      raise exception 'Size % is not offered for %.', item ->> 'size', d.name;
    end if;

    v_start := (item ->> 'startDate')::date;
    v_end   := (item ->> 'endDate')::date;
    if v_end < v_start then
      raise exception '%: the return date must be on or after the pick-up date.', d.name;
    end if;
    if v_start < today + c_lead_days then
      raise exception '%: please book at least % days ahead.', d.name, c_lead_days;
    end if;
    v_days := v_end - v_start + 1;
    if v_days > c_max_days then
      raise exception '%: rentals can be up to % days.', d.name, c_max_days;
    end if;
    if exists (
      select 1 from jsonb_array_elements(d.booked_ranges) r
      where daterange((r ->> 'start')::date, (r ->> 'end')::date, '[]') && daterange(v_start, v_end, '[]')
    ) then
      raise exception '% is reserved for part of those dates. Please choose different dates.', d.name;
    end if;

    v_fee := d.price + greatest(0, v_days - c_included) * (round(d.price * 0.2 / 10) * 10)::int;

    insert into public.rental_items (rental_id, dress_id, dress_name, category, size, start_date, end_date, rental_fee, deposit)
    values (v_id, d.id, d.name, d.category, item ->> 'size', v_start, v_end, v_fee, d.deposit);

    v_total_fee := v_total_fee + v_fee;
    v_total_dep := v_total_dep + d.deposit;
  end loop;

  update public.rentals
     set rental_fee = v_total_fee, deposit = v_total_dep, delivery_fee = v_delivery,
         total = v_total_fee + v_total_dep + v_delivery
   where id = v_id;

  return v_id;
exception
  when exclusion_violation then
    raise exception 'That dress was just reserved for those dates. Please choose different dates.';
end;
$$;

-- ================================================================ cancel_rental
create or replace function public.cancel_rental(p_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.rentals;
begin
  select * into r from public.rentals where id = p_id and user_id = auth.uid();
  if not found then
    raise exception 'We could not find that rental.';
  end if;
  if r.status not in ('Pending Payment', 'Payment Verification', 'Confirmed') then
    raise exception 'This rental can no longer be cancelled online. Please message us.';
  end if;
  update public.rentals set status = 'Cancelled' where id = p_id;
end;
$$;

-- ================================================================ reserved dates (no personal data)
create or replace function public.dress_reserved_ranges()
returns table (dress_id uuid, start_date date, end_date date)
language sql
stable
security definer
set search_path = public
as $$
  select dress_id, start_date, end_date from public.rental_items where active and dress_id is not null;
$$;

-- ================================================================ fittings
create table if not exists public.fittings (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users (id) on delete set null,
  name       text not null check (char_length(name) between 2 and 120),
  phone      text not null check (char_length(phone) between 7 and 30),
  dress_id   uuid references public.dresses (id) on delete set null,
  fit_date   date not null,
  fit_time   text not null,
  created_at timestamptz not null default now(),
  constraint fittings_one_per_slot unique (fit_date, fit_time)
);
create index if not exists fittings_user_idx on public.fittings (user_id, fit_date);

alter table public.fittings enable row level security;
drop policy if exists "read own fittings"   on public.fittings;
drop policy if exists "delete own fittings" on public.fittings;
create policy "read own fittings"   on public.fittings for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "delete own fittings" on public.fittings for delete to authenticated using (user_id = auth.uid() or public.is_admin());

create or replace function public.book_fitting(p_name text, p_phone text, p_dress uuid, p_date date, p_time text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  today date := (now() at time zone 'Asia/Manila')::date;
  v_id  uuid;
begin
  if p_time not in ('10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM') then
    raise exception 'Please choose one of the available times.';
  end if;
  if p_date <= today then
    raise exception 'Please choose a date from tomorrow onwards.';
  end if;
  if extract(dow from p_date) = 0 then
    raise exception 'We are closed on Sundays.';
  end if;
  insert into public.fittings (user_id, name, phone, dress_id, fit_date, fit_time)
  values (auth.uid(), trim(p_name), trim(p_phone), p_dress, p_date, p_time)
  returning id into v_id;
  return v_id;
exception
  when unique_violation then
    raise exception 'Sorry, that slot was just taken. Please choose another time.';
end;
$$;

create or replace function public.fitting_taken(p_date date)
returns text[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(fit_time), '{}') from public.fittings where fit_date = p_date;
$$;

-- ================================================================ function permissions
revoke execute on function public.create_rental(jsonb, jsonb, text, text, text, text) from public, anon;
revoke execute on function public.cancel_rental(text) from public, anon;
grant  execute on function public.create_rental(jsonb, jsonb, text, text, text, text) to authenticated;
grant  execute on function public.cancel_rental(text) to authenticated;
grant  execute on function public.dress_reserved_ranges() to anon, authenticated;
grant  execute on function public.book_fitting(text, text, uuid, date, text) to anon, authenticated;
grant  execute on function public.fitting_taken(date) to anon, authenticated;

-- ================================================================ private payment receipts
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('receipts', 'receipts', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = false, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "upload own receipts" on storage.objects;
drop policy if exists "read receipts"       on storage.objects;
-- Files live under <user id>/..., so a customer can only add to and read their own folder. Admins can read all.
create policy "upload own receipts" on storage.objects for insert to authenticated
  with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "read receipts" on storage.objects for select to authenticated
  using (bucket_id = 'receipts' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- ================================================================ realtime
do $$
begin
  alter publication supabase_realtime add table public.rentals;
exception when duplicate_object then null;
end $$;
