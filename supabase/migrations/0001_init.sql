-- Renté by Kisha: catalogue, editable site content, admin allow-list and photo storage.
-- Run once in Supabase: SQL Editor > New query > paste > Run (or `supabase db push`). Safe to re-run.

-- ---------------------------------------------------------------- tables
create table if not exists public.dresses (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(name) between 1 and 120),
  category      text not null check (category in ('Evening', 'Formal', 'Cocktail', 'Bridal', 'Prom', 'Events')),
  color_name    text not null default '',
  price         integer not null check (price >= 0),
  deposit       integer not null check (deposit >= 0),
  description   text not null default '' check (char_length(description) <= 4000),
  details       text[] not null default '{}' check (cardinality(details) <= 30),
  sizes         text[] not null check (cardinality(sizes) between 1 and 20),
  images        jsonb not null default '[]' check (jsonb_typeof(images) = 'array' and jsonb_array_length(images) <= 12),
  status        text not null default 'available' check (status in ('available', 'unavailable')),
  booked_ranges jsonb not null default '[]' check (jsonb_typeof(booked_ranges) = 'array' and jsonb_array_length(booked_ranges) <= 100),
  featured      boolean not null default false,
  created_at    timestamptz not null default now()
);

-- One row per editable block of site content: sizeGuide, howItWorks, hero.
create table if not exists public.settings (
  key        text primary key check (key in ('sizeGuide', 'howItWorks', 'hero')),
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

-- Admin allow-list. Rows are created by the seeder (service role), never from the browser.
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email   text
);

-- ---------------------------------------------------------------- helpers
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------- row level security
alter table public.dresses  enable row level security;
alter table public.settings enable row level security;
alter table public.admins   enable row level security;

drop policy if exists "dresses are public"        on public.dresses;
drop policy if exists "admins insert dresses"     on public.dresses;
drop policy if exists "admins update dresses"     on public.dresses;
drop policy if exists "admins delete dresses"     on public.dresses;
create policy "dresses are public"    on public.dresses for select using (true);
create policy "admins insert dresses" on public.dresses for insert to authenticated with check (public.is_admin());
create policy "admins update dresses" on public.dresses for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins delete dresses" on public.dresses for delete to authenticated using (public.is_admin());

drop policy if exists "settings are public"       on public.settings;
drop policy if exists "admins insert settings"    on public.settings;
drop policy if exists "admins update settings"    on public.settings;
drop policy if exists "admins delete settings"    on public.settings;
create policy "settings are public"    on public.settings for select using (true);
create policy "admins insert settings" on public.settings for insert to authenticated with check (public.is_admin());
create policy "admins update settings" on public.settings for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins delete settings" on public.settings for delete to authenticated using (public.is_admin());

-- A signed-in user may only check their own admin entry. No insert/update/delete policies = no writes.
drop policy if exists "read own admin row" on public.admins;
create policy "read own admin row" on public.admins for select to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------- photo storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('dresses', 'dresses', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "admins upload dress photos" on storage.objects;
drop policy if exists "admins update dress photos" on storage.objects;
drop policy if exists "admins delete dress photos" on storage.objects;
create policy "admins upload dress photos" on storage.objects for insert to authenticated with check (bucket_id = 'dresses' and public.is_admin());
create policy "admins update dress photos" on storage.objects for update to authenticated using (bucket_id = 'dresses' and public.is_admin());
create policy "admins delete dress photos" on storage.objects for delete to authenticated using (bucket_id = 'dresses' and public.is_admin());

-- ---------------------------------------------------------------- realtime (the site updates live when an admin saves)
do $$
begin
  alter publication supabase_realtime add table public.dresses;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.settings;
exception when duplicate_object then null;
end $$;
