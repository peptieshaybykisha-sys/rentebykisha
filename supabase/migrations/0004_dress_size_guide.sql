-- Size guides now belong to each dress instead of one site-wide table. Safe to re-run.
alter table public.dresses
  add column if not exists size_guide jsonb check (size_guide is null or jsonb_typeof(size_guide) = 'object');

-- Give every existing dress a copy of the old site-wide guide (or the default table) so nothing disappears.
update public.dresses
set size_guide = coalesce(
  (select value from public.settings where key = 'sizeGuide'),
  '{"note":"Measurements are body measurements in centimetres. If you are between sizes, choose the larger one or book a fitting.","columns":["Size","Bust","Waist","Hips"],"rows":[["XS","80–84","60–64","86–90"],["S","85–89","65–69","91–95"],["M","90–94","70–74","96–100"],["L","95–99","75–79","101–105"],["XL","100–106","80–86","106–112"]]}'::jsonb
)
where size_guide is null;

delete from public.settings where key = 'sizeGuide';
