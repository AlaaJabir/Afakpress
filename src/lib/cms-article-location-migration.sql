-- Afakpress CMS UUID architecture migration.
-- Non-destructive: existing text IDs are preserved in legacy_id before UUID IDs
-- are introduced. Existing rows are kept; relationships are remapped by legacy_id.

create extension if not exists pgcrypto;

do $$
declare
  required_table text;
begin
  foreach required_table in array array['profiles', 'categories', 'regions', 'provinces', 'communes', 'articles']
  loop
    if to_regclass(format('public.%I', required_table)) is null then
      raise exception 'Missing required table: public.%', required_table;
    end if;
  end loop;
end $$;

do $$
declare
  constraint_record record;
begin
  for constraint_record in
    select conrelid::regclass as table_name, conname
    from pg_constraint
    where contype = 'f'
      and (
        conrelid in ('public.categories'::regclass, 'public.provinces'::regclass, 'public.communes'::regclass, 'public.articles'::regclass)
        or confrelid in ('public.profiles'::regclass, 'public.categories'::regclass, 'public.regions'::regclass, 'public.provinces'::regclass, 'public.communes'::regclass, 'public.articles'::regclass)
      )
  loop
    execute format('alter table %s drop constraint if exists %I', constraint_record.table_name, constraint_record.conname);
  end loop;
end $$;

create or replace function pg_temp.ensure_uuid_primary_id(p_table text) returns void
language plpgsql
as $$
declare
  id_type text;
  pk_record record;
begin
  select format_type(attribute.atttypid, attribute.atttypmod)
    into id_type
  from pg_attribute attribute
  where attribute.attrelid = format('public.%I', p_table)::regclass
    and attribute.attname = 'id'
    and not attribute.attisdropped;

  if id_type is null then
    execute format('alter table public.%I add column id uuid default gen_random_uuid()', p_table);
    execute format('update public.%I set id = gen_random_uuid() where id is null', p_table);
    execute format('alter table public.%I alter column id set not null', p_table);
  elsif id_type <> 'uuid' then
    for pk_record in
      select conname
      from pg_constraint
      where conrelid = format('public.%I', p_table)::regclass
        and contype = 'p'
    loop
      execute format('alter table public.%I drop constraint if exists %I', p_table, pk_record.conname);
    end loop;

    if not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = p_table
        and column_name = 'legacy_id'
    ) then
      execute format('alter table public.%I rename column id to legacy_id', p_table);
    end if;

    if not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = p_table
        and column_name = 'id'
    ) then
      execute format('alter table public.%I add column id uuid default gen_random_uuid()', p_table);
    end if;

    execute format('update public.%I set id = gen_random_uuid() where id is null', p_table);
    execute format('alter table public.%I alter column id set not null', p_table);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = format('public.%I', p_table)::regclass
      and contype = 'p'
  ) then
    execute format('alter table public.%I add constraint %I primary key (id)', p_table, format('%s_pkey', p_table));
  end if;
end;
$$;

select pg_temp.ensure_uuid_primary_id('profiles');
select pg_temp.ensure_uuid_primary_id('categories');
select pg_temp.ensure_uuid_primary_id('regions');
select pg_temp.ensure_uuid_primary_id('provinces');
select pg_temp.ensure_uuid_primary_id('communes');
select pg_temp.ensure_uuid_primary_id('articles');

alter table public.profiles add column if not exists slug text;
update public.profiles
set slug = lower(regexp_replace(coalesce(nullif(name, ''), split_part(email, '@', 1), id::text), '[^a-zA-Z0-9]+', '-', 'g'))
where slug is null or slug = '';

alter table public.categories add column if not exists name text;
alter table public.categories add column if not exists slug text;
alter table public.categories add column if not exists order_index integer default 0;
alter table public.categories add column if not exists is_active boolean default true;

alter table public.regions add column if not exists name text;
alter table public.regions add column if not exists slug text;
alter table public.provinces add column if not exists name text;
alter table public.provinces add column if not exists slug text;
alter table public.communes add column if not exists name text;
alter table public.communes add column if not exists slug text;

alter table public.articles add column if not exists title text;
alter table public.articles add column if not exists slug text;
alter table public.articles add column if not exists excerpt text;
alter table public.articles add column if not exists content text;
alter table public.articles add column if not exists featured_image text;
alter table public.articles add column if not exists status text default 'draft';
alter table public.articles add column if not exists is_featured boolean default false;
alter table public.articles add column if not exists allow_comments boolean default true;
alter table public.articles add column if not exists views integer default 0;
alter table public.articles add column if not exists seo_title text;
alter table public.articles add column if not exists seo_description text;
alter table public.articles add column if not exists seo_keywords text;
alter table public.articles add column if not exists published_at timestamptz;
alter table public.articles add column if not exists created_at timestamptz default now();

create or replace function pg_temp.ensure_uuid_fk_column(
  p_table text,
  p_column text,
  p_ref_table text,
  p_constraint_name text,
  p_required boolean default false
) returns void
language plpgsql
as $$
declare
  column_type text;
  ref_has_legacy_id boolean;
begin
  select format_type(attribute.atttypid, attribute.atttypmod)
    into column_type
  from pg_attribute attribute
  where attribute.attrelid = format('public.%I', p_table)::regclass
    and attribute.attname = p_column
    and not attribute.attisdropped;

  if column_type is null then
    execute format('alter table public.%I add column %I uuid', p_table, p_column);
  elsif column_type <> 'uuid' then
    execute format('alter table public.%I add column if not exists %I uuid', p_table, format('%s_uuid', p_column));

    select exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = p_ref_table
        and column_name = 'legacy_id'
    ) into ref_has_legacy_id;

    execute format(
      'update public.%I target
       set %I = ref.id
       from public.%I ref
       where target.%I is null
         and target.%I::text = ref.id::text',
      p_table,
      format('%s_uuid', p_column),
      p_ref_table,
      format('%s_uuid', p_column),
      p_column
    );

    if ref_has_legacy_id then
      execute format(
        'update public.%I target
         set %I = ref.id
         from public.%I ref
         where target.%I is null
           and target.%I::text = ref.legacy_id::text',
        p_table,
        format('%s_uuid', p_column),
        p_ref_table,
        format('%s_uuid', p_column),
        p_column
      );
    end if;

    execute format('alter table public.%I drop column %I', p_table, p_column);
    execute format('alter table public.%I rename column %I to %I', p_table, format('%s_uuid', p_column), p_column);
  end if;

  if p_required then
    execute format('alter table public.%I alter column %I set not null', p_table, p_column);
  end if;

  execute format('create index if not exists %I on public.%I(%I)', format('%s_%s_idx', p_table, p_column), p_table, p_column);

  if not exists (
    select 1
    from pg_constraint
    where contype = 'f'
      and conrelid = format('public.%I', p_table)::regclass
      and conname = p_constraint_name
  ) then
    execute format(
      'alter table public.%I add constraint %I foreign key (%I) references public.%I(id) not valid',
      p_table,
      p_constraint_name,
      p_column,
      p_ref_table
    );
  end if;
end;
$$;

select pg_temp.ensure_uuid_fk_column('categories', 'parent_id', 'categories', 'categories_parent_id_fkey', false);
select pg_temp.ensure_uuid_fk_column('provinces', 'region_id', 'regions', 'provinces_region_id_fkey', false);
select pg_temp.ensure_uuid_fk_column('communes', 'province_id', 'provinces', 'communes_province_id_fkey', false);

select pg_temp.ensure_uuid_fk_column('articles', 'category_id', 'categories', 'articles_category_id_fkey', false);
select pg_temp.ensure_uuid_fk_column('articles', 'author_id', 'profiles', 'articles_author_id_fkey', false);
select pg_temp.ensure_uuid_fk_column('articles', 'region_id', 'regions', 'articles_region_id_fkey', false);
select pg_temp.ensure_uuid_fk_column('articles', 'province_id', 'provinces', 'articles_province_id_fkey', false);
select pg_temp.ensure_uuid_fk_column('articles', 'commune_id', 'communes', 'articles_commune_id_fkey', false);

alter table public.articles
  alter column category_id drop default,
  alter column author_id drop default,
  alter column region_id drop default,
  alter column province_id drop default,
  alter column commune_id drop default;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'articles'
      and column_name = 'status'
  ) and not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.articles'::regclass
      and conname = 'articles_status_check'
  ) then
    alter table public.articles
      add constraint articles_status_check
      check (status in ('draft', 'pending_review', 'scheduled', 'published')) not valid;
  end if;
end $$;

create unique index if not exists articles_slug_unique_idx on public.articles(slug);
create index if not exists articles_published_at_idx on public.articles(published_at desc);
create unique index if not exists categories_slug_unique_idx on public.categories(slug);
create unique index if not exists regions_slug_unique_idx on public.regions(slug);
create unique index if not exists provinces_slug_unique_idx on public.provinces(slug);
create unique index if not exists communes_slug_unique_idx on public.communes(slug);

notify pgrst, 'reload schema';

select
  columns.table_name,
  columns.column_name,
  columns.data_type,
  columns.udt_name,
  case when constraints.conname is null then false else true end as has_foreign_key
from information_schema.columns columns
left join pg_attribute article_attribute
  on article_attribute.attrelid = format('public.%I', columns.table_name)::regclass
  and article_attribute.attname = columns.column_name
  and not article_attribute.attisdropped
left join pg_constraint constraints
  on constraints.contype = 'f'
  and constraints.conrelid = format('public.%I', columns.table_name)::regclass
  and constraints.conkey = array[article_attribute.attnum]
where columns.table_schema = 'public'
  and (
    (columns.table_name = 'articles' and columns.column_name in ('category_id', 'author_id', 'region_id', 'province_id', 'commune_id'))
    or (columns.table_name = 'provinces' and columns.column_name = 'region_id')
    or (columns.table_name = 'communes' and columns.column_name = 'province_id')
    or (columns.table_name in ('profiles', 'categories', 'regions', 'provinces', 'communes', 'articles') and columns.column_name = 'id')
  )
order by columns.table_name, columns.column_name;
