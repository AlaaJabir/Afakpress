-- AfakPress article routing and geographic integrity.
-- Idempotent, non-destructive, and safe to run more than once.

alter table if exists public.articles
  add column if not exists geographic_scope text;

update public.articles
set geographic_scope = case
  when commune_id is not null then 'commune'
  when province_id is not null then 'province'
  when region_id is not null then 'region'
  else 'national'
end
where geographic_scope is null
   or geographic_scope not in ('national', 'region', 'province', 'commune');

update public.articles
set published_at = coalesce(created_at, now())
where status = 'published' and published_at is null;

update public.categories
set slug = trim(both '-' from regexp_replace(lower(coalesce(nullif(name, ''), id::text)), '[^[:alnum:]]+', '-', 'g'))
where slug is null or btrim(slug) = '';
update public.regions
set slug = trim(both '-' from regexp_replace(lower(coalesce(nullif(name, ''), id::text)), '[^[:alnum:]]+', '-', 'g'))
where slug is null or btrim(slug) = '';
update public.provinces
set slug = trim(both '-' from regexp_replace(lower(coalesce(nullif(name, ''), id::text)), '[^[:alnum:]]+', '-', 'g'))
where slug is null or btrim(slug) = '';
update public.communes
set slug = trim(both '-' from regexp_replace(lower(coalesce(nullif(name, ''), id::text)), '[^[:alnum:]]+', '-', 'g'))
where slug is null or btrim(slug) = '';

-- Repair missing slugs without changing already valid, stable article URLs.
update public.articles
set slug = trim(both '-' from regexp_replace(
  lower(coalesce(nullif(title, ''), id::text)),
  '[^[:alnum:]]+',
  '-',
  'g'
))
where slug is null or btrim(slug) = '';

-- Resolve duplicate article slugs deterministically while preserving the oldest URL.
with ranked as (
  select
    id,
    slug,
    row_number() over (partition by slug order by created_at nulls last, id) as occurrence
  from public.articles
  where slug is not null
)
update public.articles as article
set slug = article.slug || '-' || left(replace(article.id::text, '-', ''), 8)
from ranked
where article.id = ranked.id and ranked.occurrence > 1;

with ranked as (
  select id, slug, row_number() over (partition by slug order by created_at nulls last, id) as occurrence
  from public.categories where slug is not null
)
update public.categories as entity set slug = entity.slug || '-' || left(replace(entity.id::text, '-', ''), 8)
from ranked where entity.id = ranked.id and ranked.occurrence > 1;
with ranked as (
  select id, slug, row_number() over (partition by slug order by created_at nulls last, id) as occurrence
  from public.regions where slug is not null
)
update public.regions as entity set slug = entity.slug || '-' || left(replace(entity.id::text, '-', ''), 8)
from ranked where entity.id = ranked.id and ranked.occurrence > 1;
with ranked as (
  select id, slug, row_number() over (partition by slug order by created_at nulls last, id) as occurrence
  from public.provinces where slug is not null
)
update public.provinces as entity set slug = entity.slug || '-' || left(replace(entity.id::text, '-', ''), 8)
from ranked where entity.id = ranked.id and ranked.occurrence > 1;
with ranked as (
  select id, slug, row_number() over (partition by slug order by created_at nulls last, id) as occurrence
  from public.communes where slug is not null
)
update public.communes as entity set slug = entity.slug || '-' || left(replace(entity.id::text, '-', ''), 8)
from ranked where entity.id = ranked.id and ranked.occurrence > 1;

-- Null orphan article references rather than deleting articles.
update public.articles a set category_id = null
where category_id is not null and not exists (select 1 from public.categories c where c.id = a.category_id);
update public.articles a set region_id = null
where region_id is not null and not exists (select 1 from public.regions r where r.id = a.region_id);
update public.articles a set province_id = null
where province_id is not null and not exists (select 1 from public.provinces p where p.id = a.province_id);
update public.articles a set commune_id = null
where commune_id is not null and not exists (select 1 from public.communes c where c.id = a.commune_id);

-- Normalize hierarchy after orphan repair.
update public.articles set province_id = null, commune_id = null where region_id is null;
update public.articles set commune_id = null where province_id is null;
update public.articles a set province_id = null, commune_id = null
where province_id is not null
  and not exists (
    select 1 from public.provinces p
    where p.id = a.province_id and p.region_id = a.region_id
  );
update public.articles a set commune_id = null
where commune_id is not null
  and not exists (
    select 1 from public.communes c
    where c.id = a.commune_id and c.province_id = a.province_id
  );

update public.articles
set geographic_scope = case
  when commune_id is not null then 'commune'
  when province_id is not null then 'province'
  when region_id is not null then 'region'
  else 'national'
end;

create unique index if not exists articles_slug_unique_idx on public.articles (slug);
create unique index if not exists categories_slug_unique_idx on public.categories (slug);
create unique index if not exists regions_slug_unique_idx on public.regions (slug);
create unique index if not exists provinces_slug_unique_idx on public.provinces (slug);
create unique index if not exists communes_slug_unique_idx on public.communes (slug);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.articles'::regclass
      and conname = 'articles_geographic_scope_check'
  ) then
    alter table public.articles
      add constraint articles_geographic_scope_check
      check (geographic_scope in ('national', 'region', 'province', 'commune'));
  end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.articles'::regclass
      and conname = 'articles_geographic_hierarchy_check'
  ) then
    alter table public.articles
      add constraint articles_geographic_hierarchy_check
      check (
        (geographic_scope = 'national' and region_id is null and province_id is null and commune_id is null)
        or (geographic_scope = 'region' and region_id is not null and province_id is null and commune_id is null)
        or (geographic_scope = 'province' and region_id is not null and province_id is not null and commune_id is null)
        or (geographic_scope = 'commune' and region_id is not null and province_id is not null and commune_id is not null)
      );
  end if;
end $$;

alter table public.articles alter column geographic_scope set default 'national';
alter table public.articles alter column geographic_scope set not null;
