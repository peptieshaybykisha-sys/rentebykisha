-- One short clip (max 5 s, enforced in the admin form) per dress.
alter table public.dresses
  add column if not exists video jsonb check (video is null or (jsonb_typeof(video) = 'object' and video ? 'url' and video ? 'path'));

-- The dresses bucket now also accepts MP4/WebM. Size cap is 20 MB; photos are resized before upload so they stay far below it.
update storage.buckets
set file_size_limit = 20971520,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
where id = 'dresses';
