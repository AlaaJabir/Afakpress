-- Afakpress Territories: additive schema only.
-- This migration is committed to a feature branch for review.
-- It is NOT applied to any Supabase project by this change.
-- Existing regions/provinces/communes/articles records and relationships are preserved.

create extension if not exists pgcrypto;

do $$
begin
  create type public.territory_type as enum ('region', 'province', 'commune');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.official_house as enum (
    'conseil',
    'chambre_representants',
    'chambre_conseillers'
  );
exception
  when duplicate_object then null;
end $$;

-- Extend the existing geography tables instead of replacing them.
alter table public.regions
  add column if not exists name_fr text,
  add column if not exists name_ar text,
  add column if not exists population bigint,
  add column if not exists sort_order integer not null default 0,
  add column if not exists updated_at timestamptz not null default now();

alter table public.provinces
  add column if not exists name_fr text,
  add column if not exists name_ar text,
  add column if not exists kind text,
  add column if not exists population bigint,
  add column if not exists sort_order integer not null default 0,
  add column if not exists updated_at timestamptz not null default now();

alter table public.communes
  add column if not exists name_fr text,
  add column if not exists name_ar text,
  add column if not exists kind text,
  add column if not exists population bigint,
  add column if not exists address text,
  add column if not exists phone text,
  add column if not exists website text,
  add column if not exists sort_order integer not null default 0,
  add column if not exists updated_at timestamptz not null default now();

-- The existing seed uses Arabic names. Preserve those as Arabic labels; do not
-- mislabel Arabic source values as French translations.
update public.regions set name_ar = name where name_ar is null;
update public.provinces set name_ar = name where name_ar is null;
update public.communes set name_ar = name where name_ar is null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.provinces'::regclass
      and conname = 'provinces_kind_check'
  ) then
    alter table public.provinces
      add constraint provinces_kind_check
      check (kind is null or kind in ('province', 'prefecture'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.communes'::regclass
      and conname = 'communes_kind_check'
  ) then
    alter table public.communes
      add constraint communes_kind_check
      check (kind is null or kind in ('urbaine', 'rurale'));
  end if;
end $$;

create table if not exists public.officials (
  id uuid primary key default gen_random_uuid(),
  territory_type public.territory_type not null,
  region_id uuid references public.regions(id) on delete cascade,
  province_id uuid references public.provinces(id) on delete cascade,
  commune_id uuid references public.communes(id) on delete cascade,
  full_name text not null,
  full_name_ar text,
  role text not null,
  house public.official_house,
  party text,
  mandate_start date,
  mandate_end date,
  bio text,
  photo_path text,
  display_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint officials_exactly_one_territory_check check (
    (territory_type = 'region' and region_id is not null and province_id is null and commune_id is null)
    or (territory_type = 'province' and region_id is null and province_id is not null and commune_id is null)
    or (territory_type = 'commune' and region_id is null and province_id is null and commune_id is not null)
  )
);

create table if not exists public.article_territories (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  territory_type public.territory_type not null,
  region_id uuid references public.regions(id) on delete cascade,
  province_id uuid references public.provinces(id) on delete cascade,
  commune_id uuid references public.communes(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint article_territories_exactly_one_territory_check check (
    (territory_type = 'region' and region_id is not null and province_id is null and commune_id is null)
    or (territory_type = 'province' and region_id is null and province_id is not null and commune_id is null)
    or (territory_type = 'commune' and region_id is null and province_id is null and commune_id is not null)
  )
);

create unique index if not exists article_territories_article_region_uidx
  on public.article_territories(article_id, region_id) where region_id is not null;
create unique index if not exists article_territories_article_province_uidx
  on public.article_territories(article_id, province_id) where province_id is not null;
create unique index if not exists article_territories_article_commune_uidx
  on public.article_territories(article_id, commune_id) where commune_id is not null;

create index if not exists officials_region_id_idx on public.officials(region_id);
create index if not exists officials_province_id_idx on public.officials(province_id);
create index if not exists officials_commune_id_idx on public.officials(commune_id);
create index if not exists officials_published_order_idx on public.officials(is_published, display_order);
create index if not exists article_territories_article_id_idx on public.article_territories(article_id);
create index if not exists article_territories_region_id_idx on public.article_territories(region_id);
create index if not exists article_territories_province_id_idx on public.article_territories(province_id);
create index if not exists article_territories_commune_id_idx on public.article_territories(commune_id);

create or replace function public.set_afakpress_territories_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists regions_territories_updated_at on public.regions;
create trigger regions_territories_updated_at before update on public.regions
for each row execute function public.set_afakpress_territories_updated_at();

drop trigger if exists provinces_territories_updated_at on public.provinces;
create trigger provinces_territories_updated_at before update on public.provinces
for each row execute function public.set_afakpress_territories_updated_at();

drop trigger if exists communes_territories_updated_at on public.communes;
create trigger communes_territories_updated_at before update on public.communes
for each row execute function public.set_afakpress_territories_updated_at();

drop trigger if exists officials_updated_at on public.officials;
create trigger officials_updated_at before update on public.officials
for each row execute function public.set_afakpress_territories_updated_at();

-- The existing application authenticates administrators against admin_users.
-- This helper is used only by RLS/Storage policies; it never exposes the service key.
create or replace function public.is_active_afakpress_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.status = 'active'
      and au.role in ('super_admin', 'admin')
      and (
        au.user_id = auth.uid()
        or lower(au.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  );
$$;

revoke all on function public.is_active_afakpress_admin() from public;
grant execute on function public.is_active_afakpress_admin() to anon, authenticated;

alter table public.officials enable row level security;
alter table public.article_territories enable row level security;

drop policy if exists "Public can read published officials" on public.officials;
create policy "Public can read published officials"
on public.officials for select to anon, authenticated
using (is_published = true);

drop policy if exists "Admins can manage officials" on public.officials;
create policy "Admins can manage officials"
on public.officials for all to authenticated
using (public.is_active_afakpress_admin())
with check (public.is_active_afakpress_admin());

drop policy if exists "Public can read published article territories" on public.article_territories;
create policy "Public can read published article territories"
on public.article_territories for select to anon, authenticated
using (
  exists (
    select 1 from public.articles a
    where a.id = article_id and a.status = 'published'
  )
);

drop policy if exists "Admins can manage article territories" on public.article_territories;
create policy "Admins can manage article territories"
on public.article_territories for all to authenticated
using (public.is_active_afakpress_admin())
with check (public.is_active_afakpress_admin());

-- Public bucket. Actual object writes remain restricted to active admins.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'territory-media',
  'territory-media',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read territory media" on storage.objects;
create policy "Public can read territory media"
on storage.objects for select to anon, authenticated
using (bucket_id = 'territory-media');

drop policy if exists "Admins can upload territory media" on storage.objects;
create policy "Admins can upload territory media"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'territory-media'
  and public.is_active_afakpress_admin()
  and (storage.foldername(name))[1] in ('officials', 'covers')
);

drop policy if exists "Admins can update territory media" on storage.objects;
create policy "Admins can update territory media"
on storage.objects for update to authenticated
using (bucket_id = 'territory-media' and public.is_active_afakpress_admin())
with check (
  bucket_id = 'territory-media'
  and public.is_active_afakpress_admin()
  and (storage.foldername(name))[1] in ('officials', 'covers')
);

drop policy if exists "Admins can delete territory media" on storage.objects;
create policy "Admins can delete territory media"
on storage.objects for delete to authenticated
using (bucket_id = 'territory-media' and public.is_active_afakpress_admin());

comment on table public.officials is
  'Elected officials linked to exactly one existing Afakpress territory.';
comment on table public.article_territories is
  'Many-to-many article-to-territory links; legacy articles.region_id/province_id/commune_id remain supported.';
