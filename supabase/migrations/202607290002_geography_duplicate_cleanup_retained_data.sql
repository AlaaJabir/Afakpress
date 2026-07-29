-- Approved retained-data cleanup generated from the 2026-07-29 read-only audit.
-- It intentionally preserves two live geography records absent from the official seed:
--   province b7805c78-5314-4048-8e06-82ca5c97840d (عمالة الدار البيضاء)
--   communes 4330e8b8-89f4-45b4-8b6f-3117644c92d6 (الرباط)
--            f7c5e840-008b-4087-87f5-2cce846d5caa (المعاريف)
-- Those rows have no canonical seed target; forcing 12/73/1497 would be destructive.
-- Safe expected result of this draft: 12 regions, 74 provinces, 1499 communes.

begin;

lock table public.regions, public.provinces, public.communes, public.articles
  in share row exclusive mode;

do $$
declare
  required_id uuid;
begin
  foreach required_id in array array[
    '1b04b800-a782-4d8f-83e8-d1959f12b90f'::uuid,
    'bcc23fd9-2781-4418-873c-0efae4ee7107'::uuid,
    '523e90c5-7663-449d-8a5f-b0569e95a613'::uuid,
    'c6b2db9e-30ef-4ab0-8e90-f5d24fa227b9'::uuid,
    '1f05571c-d75f-40e5-8f0b-8767478a4bbb'::uuid,
    'bcb568d0-874e-4a15-8a23-817663d8bde2'::uuid
  ] loop
    if not exists (select 1 from public.regions where id = required_id) then
      raise exception 'Required region % is missing; aborting', required_id;
    end if;
  end loop;

  foreach required_id in array array[
    '7425c804-f854-4d43-8408-a10af8d8908f'::uuid,
    '02cd8af1-7a53-40f4-8c4e-6222dba16772'::uuid,
    '00d53848-0c14-4d58-8004-dd5b7cd8478e'::uuid,
    '441e2a93-e89b-4c74-8e31-a4682fb0a314'::uuid,
    'b7805c78-5314-4048-8e06-82ca5c97840d'::uuid
  ] loop
    if not exists (select 1 from public.provinces where id = required_id) then
      raise exception 'Required province % is missing; aborting', required_id;
    end if;
  end loop;

  foreach required_id in array array[
    'b5572c27-1da7-4902-8d21-163cb502e4f3'::uuid,
    '83bb84ac-5c59-4a13-81ef-40e0b54e56d3'::uuid,
    '4330e8b8-89f4-45b4-8b6f-3117644c92d6'::uuid,
    'f7c5e840-008b-4087-87f5-2cce846d5caa'::uuid
  ] loop
    if not exists (select 1 from public.communes where id = required_id) then
      raise exception 'Required commune % is missing; aborting', required_id;
    end if;
  end loop;

  if (select count(*) from public.regions) <> 15
    or (select count(*) from public.provinces) <> 76
    or (select count(*) from public.communes) <> 1500 then
    raise exception 'Unexpected pre-cleanup geography counts; aborting';
  end if;

  if (select count(*) from public.articles where region_id in (
    'bcc23fd9-2781-4418-873c-0efae4ee7107',
    'c6b2db9e-30ef-4ab0-8e90-f5d24fa227b9',
    'bcb568d0-874e-4a15-8a23-817663d8bde2'
  )) <> 9 then raise exception 'Expected 9 duplicate-region article references'; end if;

  if (select count(*) from public.articles where province_id in (
    '02cd8af1-7a53-40f4-8c4e-6222dba16772',
    '441e2a93-e89b-4c74-8e31-a4682fb0a314'
  )) <> 5 then raise exception 'Expected 5 mergeable-province article references'; end if;
  if (select count(*) from public.articles where province_id =
    'b7805c78-5314-4048-8e06-82ca5c97840d') <> 1 then
    raise exception 'Expected 1 retained Casablanca province article reference';
  end if;

  if (select count(*) from public.articles where commune_id =
    '83bb84ac-5c59-4a13-81ef-40e0b54e56d3') <> 0 then
    raise exception 'Unexpected Tangier duplicate commune article references';
  end if;
  if (select count(*) from public.articles where commune_id in (
    '4330e8b8-89f4-45b4-8b6f-3117644c92d6',
    'f7c5e840-008b-4087-87f5-2cce846d5caa'
  )) <> 4 then raise exception 'Expected 4 retained-commune article references'; end if;

  if (select count(*) from public.provinces where region_id in (
    'bcc23fd9-2781-4418-873c-0efae4ee7107',
    'c6b2db9e-30ef-4ab0-8e90-f5d24fa227b9',
    'bcb568d0-874e-4a15-8a23-817663d8bde2'
  )) <> 3 then raise exception 'Expected 3 child provinces to reassign or merge'; end if;
  if (select count(*) from public.communes where province_id in (
    '02cd8af1-7a53-40f4-8c4e-6222dba16772',
    '441e2a93-e89b-4c74-8e31-a4682fb0a314'
  )) <> 2 then raise exception 'Expected 2 child communes to reassign or merge'; end if;

  if exists (
    select 1
    from pg_constraint fk
    join pg_class source_table on source_table.oid = fk.conrelid
    where fk.contype = 'f'
      and fk.confrelid in ('public.regions'::regclass, 'public.provinces'::regclass, 'public.communes'::regclass)
      and source_table.relname not in ('articles', 'provinces', 'communes')
  ) then raise exception 'Unexpected geography foreign-key reference discovered'; end if;
end $$;

-- Preserve every article reference by moving it to a confirmed canonical row.
update public.articles set region_id = '1b04b800-a782-4d8f-83e8-d1959f12b90f'
where region_id = 'bcc23fd9-2781-4418-873c-0efae4ee7107';
update public.articles set region_id = '523e90c5-7663-449d-8a5f-b0569e95a613'
where region_id = 'c6b2db9e-30ef-4ab0-8e90-f5d24fa227b9';
update public.articles set region_id = '1f05571c-d75f-40e5-8f0b-8767478a4bbb'
where region_id = 'bcb568d0-874e-4a15-8a23-817663d8bde2';

update public.articles set province_id = '7425c804-f854-4d43-8408-a10af8d8908f'
where province_id = '02cd8af1-7a53-40f4-8c4e-6222dba16772';
update public.articles set province_id = '00d53848-0c14-4d58-8004-dd5b7cd8478e'
where province_id = '441e2a93-e89b-4c74-8e31-a4682fb0a314';

update public.articles set commune_id = 'b5572c27-1da7-4902-8d21-163cb502e4f3'
where commune_id = '83bb84ac-5c59-4a13-81ef-40e0b54e56d3';

-- Reparent unique live records that have no canonical seed equivalent.
update public.communes set province_id = '7425c804-f854-4d43-8408-a10af8d8908f'
where province_id = '02cd8af1-7a53-40f4-8c4e-6222dba16772';
delete from public.communes where id = '83bb84ac-5c59-4a13-81ef-40e0b54e56d3';

update public.provinces set region_id = '523e90c5-7663-449d-8a5f-b0569e95a613'
where id = 'b7805c78-5314-4048-8e06-82ca5c97840d';
delete from public.provinces where id in (
  '02cd8af1-7a53-40f4-8c4e-6222dba16772',
  '441e2a93-e89b-4c74-8e31-a4682fb0a314'
);
delete from public.regions where id in (
  'bcc23fd9-2781-4418-873c-0efae4ee7107',
  'c6b2db9e-30ef-4ab0-8e90-f5d24fa227b9',
  'bcb568d0-874e-4a15-8a23-817663d8bde2'
);

-- Parent-scoped uniqueness permits legitimate same-slug communes in different provinces.
create unique index if not exists regions_slug_key on public.regions(slug);
create unique index if not exists provinces_region_slug_key on public.provinces(region_id, slug);
create unique index if not exists communes_province_slug_key on public.communes(province_id, slug);

do $$
begin
  if (select count(*) from public.regions) <> 12 then raise exception 'Expected 12 regions'; end if;
  if (select count(*) from public.provinces) <> 74 then raise exception 'Expected 74 safely retained provinces'; end if;
  if (select count(*) from public.communes) <> 1499 then raise exception 'Expected 1499 safely retained communes'; end if;

  if exists (
    select 1 from public.provinces p left join public.regions r on r.id = p.region_id
    where r.id is null
  ) then raise exception 'Orphan provinces detected'; end if;
  if exists (
    select 1 from public.communes c left join public.provinces p on p.id = c.province_id
    where p.id is null
  ) then raise exception 'Orphan communes detected'; end if;
  if exists (
    select 1 from public.articles a left join public.regions r on r.id = a.region_id
    where a.region_id is not null and r.id is null
  ) then raise exception 'Articles reference missing regions'; end if;
  if exists (
    select 1 from public.articles a left join public.provinces p on p.id = a.province_id
    where a.province_id is not null and p.id is null
  ) then raise exception 'Articles reference missing provinces'; end if;
  if exists (
    select 1 from public.articles a left join public.communes c on c.id = a.commune_id
    where a.commune_id is not null and c.id is null
  ) then raise exception 'Articles reference missing communes'; end if;
  if exists (
    select slug from public.regions group by slug having count(*) > 1
  ) then raise exception 'Duplicate region slugs remain'; end if;
  if exists (
    select region_id, slug from public.provinces group by region_id, slug having count(*) > 1
  ) then raise exception 'Duplicate province slugs remain within a parent'; end if;
  if exists (
    select province_id, slug from public.communes group by province_id, slug having count(*) > 1
  ) then raise exception 'Duplicate commune slugs remain within a parent'; end if;

  if exists (select 1 from public.articles where region_id in (
    'bcc23fd9-2781-4418-873c-0efae4ee7107',
    'c6b2db9e-30ef-4ab0-8e90-f5d24fa227b9',
    'bcb568d0-874e-4a15-8a23-817663d8bde2'
  )) then raise exception 'Duplicate region article references remain'; end if;
  if exists (select 1 from public.articles where province_id in (
    '02cd8af1-7a53-40f4-8c4e-6222dba16772',
    '441e2a93-e89b-4c74-8e31-a4682fb0a314'
  )) then raise exception 'Duplicate province article references remain'; end if;
  if exists (select 1 from public.articles where commune_id =
    '83bb84ac-5c59-4a13-81ef-40e0b54e56d3') then
    raise exception 'Duplicate commune article references remain';
  end if;
end $$;

-- Verification result sets are visible when run manually.
select count(*) as total_regions from public.regions;
select count(*) as total_provinces from public.provinces;
select count(*) as total_communes from public.communes;
select slug, count(*) from public.regions group by slug having count(*) > 1;
select region_id, slug, count(*) from public.provinces group by region_id, slug having count(*) > 1;
select province_id, slug, count(*) from public.communes group by province_id, slug having count(*) > 1;
select lower(regexp_replace(name, '[^[:alnum:]]', '', 'g')) as normalized_name, count(*)
from public.regions group by normalized_name having count(*) > 1;
select region_id, lower(regexp_replace(name, '[^[:alnum:]]', '', 'g')) as normalized_name, count(*)
from public.provinces group by region_id, normalized_name having count(*) > 1;
select province_id, lower(regexp_replace(name, '[^[:alnum:]]', '', 'g')) as normalized_name, count(*)
from public.communes group by province_id, normalized_name having count(*) > 1;
select p.* from public.provinces p left join public.regions r on r.id = p.region_id where r.id is null;
select c.* from public.communes c left join public.provinces p on p.id = c.province_id where p.id is null;
select a.id from public.articles a left join public.regions r on r.id = a.region_id where a.region_id is not null and r.id is null;
select a.id from public.articles a left join public.provinces p on p.id = a.province_id where a.province_id is not null and p.id is null;
select a.id from public.articles a left join public.communes c on c.id = a.commune_id where a.commune_id is not null and c.id is null;

commit;
