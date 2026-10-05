-- Hardening: fittings need a signed-in account (with a cap per customer), and a rental's contact email always
-- comes from the account, never from the form. Run after 0008. Safe to re-run.

-- ================================================================ book_fitting: signed-in only, max 3 upcoming
create or replace function public.book_fitting(p_name text, p_phone text, p_dress uuid, p_date date, p_time text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid   uuid := auth.uid();
  today date := (now() at time zone 'Asia/Manila')::date;
  v_id  uuid;
begin
  if uid is null then
    raise exception 'Please log in to book a fitting.' using errcode = '28000';
  end if;
  if char_length(trim(coalesce(p_name, ''))) < 2 or char_length(trim(coalesce(p_phone, ''))) < 7 then
    raise exception 'Please complete your contact details.';
  end if;
  if p_time not in ('10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM') then
    raise exception 'Please choose one of the available times.';
  end if;
  if p_date <= today then
    raise exception 'Please choose a date from tomorrow onwards.';
  end if;
  if extract(dow from p_date) = 0 then
    raise exception 'We are closed on Sundays.';
  end if;
  -- stops one account from hoarding the calendar
  if (select count(*) from public.fittings where user_id = uid and fit_date > today) >= 3 then
    raise exception 'You already have 3 upcoming fittings. Please cancel one before booking another.';
  end if;
  insert into public.fittings (user_id, name, phone, dress_id, fit_date, fit_time)
  values (uid, trim(p_name), trim(p_phone), p_dress, p_date, p_time)
  returning id into v_id;
  return v_id;
exception
  when unique_violation then
    raise exception 'Sorry, that slot was just taken. Please choose another time.';
end;
$$;

revoke execute on function public.book_fitting(text, text, uuid, date, text) from public, anon;
grant  execute on function public.book_fitting(text, text, uuid, date, text) to authenticated;

-- ================================================================ create_rental: email comes from the account
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
    trim(p_customer ->> 'name'), (select email from auth.users where id = uid), trim(p_customer ->> 'phone'),
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

revoke execute on function public.create_rental(jsonb, jsonb, text, text, text, text) from public, anon;
grant  execute on function public.create_rental(jsonb, jsonb, text, text, text, text) to authenticated;
