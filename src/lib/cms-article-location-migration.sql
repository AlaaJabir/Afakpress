-- Make the Supabase articles table compatible with the current Afakpress CMS.
-- This migration is intentionally non-destructive: it only adds missing columns,
-- indexes, and foreign-key constraints. Existing data is not deleted or rewritten.

do $$
begin
  if to_regclass('public.articles') is null then
    raise exception 'Missing required table: public.articles';
  end if;
end $$;

create or replace function pg_temp.ensure_articles_fk_column(
  p_column_name text,
  p_referenced_table text,
  p_referenced_column text,
  p_constraint_name text
) returns void
language plpgsql
as $$
declare
  referenced_type text;
  current_type text;
  referenced_regclass regclass;
  source_attnum smallint;
  type_matches boolean;
begin
  if to_regclass(format('public.%I', p_referenced_table)) is null then
    raise exception 'Missing required referenced table: public.%', p_referenced_table;
  end if;

  referenced_regclass := format('public.%I', p_referenced_table)::regclass;

  select format_type(attribute.atttypid, attribute.atttypmod)
    into referenced_type
  from pg_attribute attribute
  where attribute.attrelid = referenced_regclass
    and attribute.attname = p_referenced_column
    and not attribute.attisdropped;

  if referenced_type is null then
    raise exception 'Missing referenced column: public.%.%', p_referenced_table, p_referenced_column;
  end if;

  if not exists (
    select 1
    from information_schema.columns existing_columns
    where existing_columns.table_schema = 'public'
      and existing_columns.table_name = 'articles'
      and existing_columns.column_name = p_column_name
  ) then
    execute format(
      'alter table public.articles add column %I %s',
      p_column_name,
      referenced_type
    );
  end if;

  select format_type(attribute.atttypid, attribute.atttypmod)
    into current_type
  from pg_attribute attribute
  where attribute.attrelid = 'public.articles'::regclass
    and attribute.attname = p_column_name
    and not attribute.attisdropped;

  select attribute.attnum
    into source_attnum
  from pg_attribute attribute
  where attribute.attrelid = 'public.articles'::regclass
    and attribute.attname = p_column_name
    and not attribute.attisdropped;

  type_matches := current_type = referenced_type;

  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'articles'
      and indexname = format('articles_%s_idx', p_column_name)
  ) then
    execute format(
      'create index %I on public.articles(%I)',
      format('articles_%s_idx', p_column_name),
      p_column_name
    );
  end if;

  if type_matches and not exists (
    select 1
    from pg_constraint
    where contype = 'f'
      and conrelid = 'public.articles'::regclass
      and confrelid = referenced_regclass
      and conkey = array[source_attnum]
  ) then
    execute format(
      'alter table public.articles add constraint %I foreign key (%I) references public.%I(%I) not valid',
      p_constraint_name,
      p_column_name,
      p_referenced_table,
      p_referenced_column
    );
  elsif not type_matches then
    raise notice 'Skipped foreign key %. public.articles.% is %, but public.%.% is %.',
      p_constraint_name,
      p_column_name,
      current_type,
      p_referenced_table,
      p_referenced_column,
      referenced_type;
  end if;
end;
$$;

select pg_temp.ensure_articles_fk_column('category_id', 'categories', 'id', 'articles_category_id_fkey');
select pg_temp.ensure_articles_fk_column('author_id', 'profiles', 'id', 'articles_author_id_fkey');
select pg_temp.ensure_articles_fk_column('region_id', 'regions', 'id', 'articles_region_id_fkey');
select pg_temp.ensure_articles_fk_column('province_id', 'provinces', 'id', 'articles_province_id_fkey');
select pg_temp.ensure_articles_fk_column('commune_id', 'communes', 'id', 'articles_commune_id_fkey');

notify pgrst, 'reload schema';

select
  columns.column_name,
  columns.data_type,
  columns.udt_name,
  case when indexes.indexname is null then false else true end as has_index,
  case when constraints.conname is null then false else true end as has_foreign_key
from information_schema.columns columns
left join pg_indexes indexes
  on indexes.schemaname = columns.table_schema
  and indexes.tablename = columns.table_name
  and indexes.indexname = format('articles_%s_idx', columns.column_name)
left join pg_attribute article_attribute
  on article_attribute.attrelid = 'public.articles'::regclass
  and article_attribute.attname = columns.column_name
  and not article_attribute.attisdropped
left join pg_constraint constraints
  on constraints.contype = 'f'
  and constraints.conrelid = 'public.articles'::regclass
  and constraints.conkey = array[article_attribute.attnum]
where columns.table_schema = 'public'
  and columns.table_name = 'articles'
  and columns.column_name in ('category_id', 'author_id', 'region_id', 'province_id', 'commune_id')
order by columns.column_name;
