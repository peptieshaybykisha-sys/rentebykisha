-- Allow the admin-editable navigation (header links and footer) in the settings table. Safe to re-run.
alter table public.settings drop constraint if exists settings_key_check;
alter table public.settings
  add constraint settings_key_check check (key in ('sizeGuide', 'howItWorks', 'hero', 'navigation'));
