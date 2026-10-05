-- Collapse the six occasion categories into two: Long Dress and Short Dress.
alter table public.dresses drop constraint if exists dresses_category_check;

update public.dresses
set category = case when category in ('Cocktail', 'Events') then 'Short Dress' else 'Long Dress' end
where category not in ('Long Dress', 'Short Dress');

alter table public.dresses
  add constraint dresses_category_check check (category in ('Long Dress', 'Short Dress'));
