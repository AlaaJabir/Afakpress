alter table public.articles
  add column if not exists region_id text references public.regions(id),
  add column if not exists province_id text references public.provinces(id),
  add column if not exists commune_id text references public.communes(id);

create index if not exists articles_region_id_idx on public.articles(region_id);
create index if not exists articles_province_id_idx on public.articles(province_id);
create index if not exists articles_commune_id_idx on public.articles(commune_id);

notify pgrst, 'reload schema';
