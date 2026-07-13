-- Afakpress complete Supabase schema synchronization.
-- Safe to run repeatedly. It creates or updates the CMS schema without deleting production data.

create extension if not exists pgcrypto;

create or replace function public.afakpress_seed_uuid(seed text)
returns uuid
language sql
immutable
as $$
  select (
    substr(md5(seed), 1, 8) || '-' ||
    substr(md5(seed), 9, 4) || '-4' ||
    substr(md5(seed), 14, 3) || '-8' ||
    substr(md5(seed), 18, 3) || '-' ||
    substr(md5(seed), 21, 12)
  )::uuid;
$$;

create or replace function public.afakpress_try_uuid_column(table_name text, column_name text)
returns void
language plpgsql
as $$
declare
  invalid_count bigint;
  column_type text;
begin
  select columns.udt_name
  into column_type
  from information_schema.columns
  where columns.table_schema = 'public'
    and columns.table_name = afakpress_try_uuid_column.table_name
    and columns.column_name = afakpress_try_uuid_column.column_name;

  if column_type is null or column_type = 'uuid' then
    return;
  end if;

  execute format(
    'select count(*) from public.%I where %I is not null and %I::text <> '''' and %I::text !~* %L',
    table_name,
    column_name,
    column_name,
    column_name,
    '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  )
  into invalid_count;

  if invalid_count = 0 then
    execute format(
      'alter table public.%I alter column %I type uuid using nullif(%I::text, '''')::uuid',
      table_name,
      column_name,
      column_name
    );
  else
    raise notice 'Afakpress schema sync: public.%.% has % invalid UUID values; type conversion skipped.', table_name, column_name, invalid_count;
  end if;
end;
$$;

create or replace function public.afakpress_add_fk(
  source_table text,
  source_column text,
  target_table text,
  constraint_name text,
  delete_action text default 'set null'
)
returns void
language plpgsql
as $$
declare
  source_type text;
  target_type text;
  action_sql text;
begin
  if exists (select 1 from pg_constraint where conname = constraint_name) then
    return;
  end if;

  select columns.udt_name into source_type
  from information_schema.columns
  where columns.table_schema = 'public'
    and columns.table_name = source_table
    and columns.column_name = source_column;

  select columns.udt_name into target_type
  from information_schema.columns
  where columns.table_schema = 'public'
    and columns.table_name = target_table
    and columns.column_name = 'id';

  if source_type <> 'uuid' or target_type <> 'uuid' then
    raise notice 'Afakpress schema sync: FK %.% -> %.id skipped because column types are % and %.', source_table, source_column, target_table, source_type, target_type;
    return;
  end if;

  action_sql := case lower(delete_action)
    when 'cascade' then 'on delete cascade'
    when 'restrict' then 'on delete restrict'
    else 'on delete set null'
  end;

  execute format(
    'alter table public.%I add constraint %I foreign key (%I) references public.%I(id) %s not valid',
    source_table,
    constraint_name,
    source_column,
    target_table,
    action_sql
  );
end;
$$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid()
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid()
);

create table if not exists public.regions (
  id uuid primary key default gen_random_uuid()
);

create table if not exists public.provinces (
  id uuid primary key default gen_random_uuid()
);

create table if not exists public.communes (
  id uuid primary key default gen_random_uuid()
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid()
);

create table if not exists public.menus (
  id uuid primary key default gen_random_uuid()
);

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid()
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid()
);

create table if not exists public.article_tags (
  article_id uuid not null,
  tag_id uuid not null
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid()
);

create table if not exists public.breaking_news (
  id uuid primary key default gen_random_uuid()
);

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid()
);

select public.afakpress_try_uuid_column('profiles', 'id');
select public.afakpress_try_uuid_column('admin_users', 'id');
select public.afakpress_try_uuid_column('admin_users', 'user_id');
select public.afakpress_try_uuid_column('categories', 'id');
select public.afakpress_try_uuid_column('categories', 'parent_id');
select public.afakpress_try_uuid_column('regions', 'id');
select public.afakpress_try_uuid_column('provinces', 'id');
select public.afakpress_try_uuid_column('provinces', 'region_id');
select public.afakpress_try_uuid_column('communes', 'id');
select public.afakpress_try_uuid_column('communes', 'province_id');
select public.afakpress_try_uuid_column('media', 'id');
select public.afakpress_try_uuid_column('articles', 'id');
select public.afakpress_try_uuid_column('articles', 'category_id');
select public.afakpress_try_uuid_column('articles', 'author_id');
select public.afakpress_try_uuid_column('articles', 'region_id');
select public.afakpress_try_uuid_column('articles', 'province_id');
select public.afakpress_try_uuid_column('articles', 'commune_id');
select public.afakpress_try_uuid_column('menus', 'id');
select public.afakpress_try_uuid_column('menus', 'parent_id');
select public.afakpress_try_uuid_column('pages', 'id');
select public.afakpress_try_uuid_column('tags', 'id');
select public.afakpress_try_uuid_column('article_tags', 'article_id');
select public.afakpress_try_uuid_column('article_tags', 'tag_id');
select public.afakpress_try_uuid_column('comments', 'id');
select public.afakpress_try_uuid_column('comments', 'article_id');
select public.afakpress_try_uuid_column('breaking_news', 'id');
select public.afakpress_try_uuid_column('breaking_news', 'article_id');
select public.afakpress_try_uuid_column('settings', 'id');

alter table public.profiles
  add column if not exists name text,
  add column if not exists slug text,
  add column if not exists email text,
  add column if not exists role text,
  add column if not exists avatar text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'avatar_url'
  ) then
    update public.profiles
    set avatar = coalesce(avatar, avatar_url)
    where avatar is null;
  end if;
end $$;

alter table public.admin_users
  add column if not exists user_id uuid,
  add column if not exists email text,
  add column if not exists role text default 'admin',
  add column if not exists status text default 'active',
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

alter table public.categories
  add column if not exists name text,
  add column if not exists slug text,
  add column if not exists description text,
  add column if not exists parent_id uuid,
  add column if not exists order_index integer default 0,
  add column if not exists is_active boolean default true,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

alter table public.regions
  add column if not exists name text,
  add column if not exists slug text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

alter table public.provinces
  add column if not exists region_id uuid,
  add column if not exists name text,
  add column if not exists slug text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

alter table public.communes
  add column if not exists province_id uuid,
  add column if not exists name text,
  add column if not exists slug text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

alter table public.media
  add column if not exists name text,
  add column if not exists url text,
  add column if not exists type text,
  add column if not exists folder text,
  add column if not exists alt text,
  add column if not exists caption text,
  add column if not exists copyright text,
  add column if not exists optimized boolean default true,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

alter table public.articles
  add column if not exists title text,
  add column if not exists slug text,
  add column if not exists excerpt text,
  add column if not exists content text,
  add column if not exists featured_image text,
  add column if not exists category_id uuid,
  add column if not exists author_id uuid,
  add column if not exists region_id uuid,
  add column if not exists province_id uuid,
  add column if not exists commune_id uuid,
  add column if not exists status text default 'draft',
  add column if not exists is_featured boolean default false,
  add column if not exists allow_comments boolean default true,
  add column if not exists views integer default 0,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists seo_keywords text,
  add column if not exists published_at timestamptz,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

alter table public.menus
  add column if not exists title text,
  add column if not exists slug text,
  add column if not exists parent_id uuid,
  add column if not exists level integer default 0,
  add column if not exists order_index integer default 0,
  add column if not exists is_active boolean default true,
  add column if not exists show_header boolean default true,
  add column if not exists show_footer boolean default false,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

alter table public.pages
  add column if not exists title text,
  add column if not exists slug text,
  add column if not exists content text,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists status text default 'draft',
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

alter table public.tags
  add column if not exists name text,
  add column if not exists slug text,
  add column if not exists created_at timestamptz default now();

alter table public.comments
  add column if not exists article_id uuid,
  add column if not exists author text,
  add column if not exists email text,
  add column if not exists content text,
  add column if not exists status text default 'pending',
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

alter table public.breaking_news
  add column if not exists title text,
  add column if not exists article_id uuid,
  add column if not exists url text,
  add column if not exists is_active boolean default true,
  add column if not exists order_index integer default 0,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

alter table public.settings
  add column if not exists key text,
  add column if not exists value jsonb,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create unique index if not exists profiles_email_key on public.profiles(email);
create unique index if not exists profiles_slug_key on public.profiles(slug);
create unique index if not exists admin_users_email_key on public.admin_users(email);
create unique index if not exists categories_slug_key on public.categories(slug);
create unique index if not exists regions_slug_key on public.regions(slug);
create unique index if not exists provinces_region_slug_key on public.provinces(region_id, slug);
create unique index if not exists communes_province_slug_key on public.communes(province_id, slug);
create unique index if not exists articles_slug_key on public.articles(slug);
create unique index if not exists pages_slug_key on public.pages(slug);
create unique index if not exists tags_slug_key on public.tags(slug);
create unique index if not exists settings_key_key on public.settings(key);

create index if not exists articles_category_id_idx on public.articles(category_id);
create index if not exists articles_author_id_idx on public.articles(author_id);
create index if not exists articles_region_id_idx on public.articles(region_id);
create index if not exists articles_province_id_idx on public.articles(province_id);
create index if not exists articles_commune_id_idx on public.articles(commune_id);
create index if not exists articles_status_idx on public.articles(status);
create index if not exists articles_published_at_idx on public.articles(published_at desc);
create index if not exists provinces_region_id_idx on public.provinces(region_id);
create index if not exists communes_province_id_idx on public.communes(province_id);
create index if not exists menus_parent_id_idx on public.menus(parent_id);
create index if not exists breaking_news_article_id_idx on public.breaking_news(article_id);
create index if not exists comments_article_id_idx on public.comments(article_id);

do $$
begin
  alter table public.admin_users drop constraint if exists admin_users_role_check;
  alter table public.admin_users add constraint admin_users_role_check check (role in ('super_admin', 'admin', 'editor', 'journalist'));
  alter table public.admin_users drop constraint if exists admin_users_status_check;
  alter table public.admin_users add constraint admin_users_status_check check (status in ('active', 'disabled'));
  alter table public.articles drop constraint if exists articles_status_check;
  alter table public.articles add constraint articles_status_check check (status in ('draft', 'pending_review', 'scheduled', 'published'));
  alter table public.pages drop constraint if exists pages_status_check;
  alter table public.pages add constraint pages_status_check check (status in ('draft', 'published'));
  alter table public.comments drop constraint if exists comments_status_check;
  alter table public.comments add constraint comments_status_check check (status in ('pending', 'approved', 'rejected', 'spam'));
end $$;

do $$
declare
  source_type text;
begin
  if not exists (select 1 from pg_constraint where conname = 'admin_users_user_id_fkey') then
    select columns.udt_name into source_type
    from information_schema.columns
    where columns.table_schema = 'public'
      and columns.table_name = 'admin_users'
      and columns.column_name = 'user_id';

    if source_type = 'uuid' then
      alter table public.admin_users
        add constraint admin_users_user_id_fkey
        foreign key (user_id) references auth.users(id) on delete cascade not valid;
    end if;
  end if;
end $$;
select public.afakpress_add_fk('categories', 'parent_id', 'categories', 'categories_parent_id_fkey', 'set null');
select public.afakpress_add_fk('provinces', 'region_id', 'regions', 'provinces_region_id_fkey', 'cascade');
select public.afakpress_add_fk('communes', 'province_id', 'provinces', 'communes_province_id_fkey', 'cascade');
select public.afakpress_add_fk('articles', 'category_id', 'categories', 'articles_category_id_fkey', 'set null');
select public.afakpress_add_fk('articles', 'author_id', 'profiles', 'articles_author_id_fkey', 'set null');
select public.afakpress_add_fk('articles', 'region_id', 'regions', 'articles_region_id_fkey', 'set null');
select public.afakpress_add_fk('articles', 'province_id', 'provinces', 'articles_province_id_fkey', 'set null');
select public.afakpress_add_fk('articles', 'commune_id', 'communes', 'articles_commune_id_fkey', 'set null');
select public.afakpress_add_fk('menus', 'parent_id', 'menus', 'menus_parent_id_fkey', 'cascade');
select public.afakpress_add_fk('comments', 'article_id', 'articles', 'comments_article_id_fkey', 'cascade');
select public.afakpress_add_fk('breaking_news', 'article_id', 'articles', 'breaking_news_article_id_fkey', 'set null');
select public.afakpress_add_fk('article_tags', 'article_id', 'articles', 'article_tags_article_id_fkey', 'cascade');
select public.afakpress_add_fk('article_tags', 'tag_id', 'tags', 'article_tags_tag_id_fkey', 'cascade');

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'article_tags_pkey') then
    alter table public.article_tags add constraint article_tags_pkey primary key (article_id, tag_id);
  end if;
exception
  when others then
    raise notice 'Afakpress schema sync: article_tags primary key skipped: %', sqlerrm;
end $$;

alter table public.profiles enable row level security;
alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.regions enable row level security;
alter table public.provinces enable row level security;
alter table public.communes enable row level security;
alter table public.media enable row level security;
alter table public.articles enable row level security;
alter table public.menus enable row level security;
alter table public.pages enable row level security;
alter table public.tags enable row level security;
alter table public.article_tags enable row level security;
alter table public.comments enable row level security;
alter table public.breaking_news enable row level security;
alter table public.settings enable row level security;

drop policy if exists "Public read profiles" on public.profiles;
create policy "Public read profiles" on public.profiles for select using (true);
drop policy if exists "Public read categories" on public.categories;
create policy "Public read categories" on public.categories for select using (is_active is not false);
drop policy if exists "Public read regions" on public.regions;
create policy "Public read regions" on public.regions for select using (true);
drop policy if exists "Public read provinces" on public.provinces;
create policy "Public read provinces" on public.provinces for select using (true);
drop policy if exists "Public read communes" on public.communes;
create policy "Public read communes" on public.communes for select using (true);
drop policy if exists "Public read media" on public.media;
create policy "Public read media" on public.media for select using (true);
drop policy if exists "Public read articles" on public.articles;
create policy "Public read articles" on public.articles for select using (true);
drop policy if exists "Public read menus" on public.menus;
create policy "Public read menus" on public.menus for select using (is_active is not false);
drop policy if exists "Public read pages" on public.pages;
create policy "Public read pages" on public.pages for select using (status = 'published');
drop policy if exists "Public read tags" on public.tags;
create policy "Public read tags" on public.tags for select using (true);
drop policy if exists "Public read article tags" on public.article_tags;
create policy "Public read article tags" on public.article_tags for select using (true);
drop policy if exists "Public read breaking news" on public.breaking_news;
create policy "Public read breaking news" on public.breaking_news for select using (is_active is not false);

insert into public.profiles (id, name, slug, email, role, avatar)
values
  (public.afakpress_seed_uuid('profile-admin'), 'Alaa Jabir', 'alaa-jabir', 'professionnal.a@gmail.com', 'Super Admin', null),
  (public.afakpress_seed_uuid('profile-editor'), 'Afakpress Editor', 'afakpress-editor', 'editor@afakpress.ma', 'Editor', null)
on conflict (id) do update
set name = excluded.name,
    slug = excluded.slug,
    email = excluded.email,
    role = excluded.role;

insert into public.admin_users (user_id, email, role, status)
values (
  (select id from auth.users where lower(email) = 'professionnal.a@gmail.com' limit 1),
  'professionnal.a@gmail.com',
  'super_admin',
  'active'
)
on conflict (email) do update
set user_id = excluded.user_id,
    role = 'super_admin',
    status = 'active';

insert into public.categories (id, name, slug, description, order_index, is_active)
values
  (public.afakpress_seed_uuid('category-national'), 'National', 'national', 'Public affairs, institutions, economy, and society across Morocco.', 1, true),
  (public.afakpress_seed_uuid('category-regions'), 'Regions', 'regions', 'Local coverage from Morocco regions, provinces, prefectures, and communes.', 2, true),
  (public.afakpress_seed_uuid('category-economy'), 'Economy', 'economy', 'Markets, investment, employment, industry, agriculture, and public finance.', 3, true),
  (public.afakpress_seed_uuid('category-culture'), 'Culture', 'culture', 'Arts, heritage, festivals, books, cinema, and creative communities.', 4, true),
  (public.afakpress_seed_uuid('category-opinion'), 'Opinion', 'opinion', 'Editorial analysis, columns, and informed civic debate.', 5, true)
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    order_index = excluded.order_index,
    is_active = excluded.is_active;

with seeded_regions(id, name, slug) as (
  values
    (public.afakpress_seed_uuid('region-rabat-sale-kenitra'), 'جهة الرباط سلا القنيطرة', 'rabat-sale-kenitra'),
    (public.afakpress_seed_uuid('region-casablanca-settat'), 'جهة الدار البيضاء سطات', 'casablanca-settat'),
    (public.afakpress_seed_uuid('region-tanger-tetouan-al-hoceima'), 'جهة طنجة تطوان الحسيمة', 'tanger-tetouan-al-hoceima')
)
insert into public.regions (id, name, slug)
select id, name, slug from seeded_regions
on conflict (slug) do update set name = excluded.name;

with seeded_provinces(id, region_slug, name, slug) as (
  values
    (public.afakpress_seed_uuid('province-rabat'), 'rabat-sale-kenitra', 'عمالة الرباط', 'rabat'),
    (public.afakpress_seed_uuid('province-casablanca'), 'casablanca-settat', 'عمالة الدار البيضاء', 'casablanca'),
    (public.afakpress_seed_uuid('province-tanger-assilah'), 'tanger-tetouan-al-hoceima', 'عمالة طنجة أصيلة', 'tanger-assilah')
)
insert into public.provinces (id, region_id, name, slug)
select seeded_provinces.id, regions.id, seeded_provinces.name, seeded_provinces.slug
from seeded_provinces
join public.regions on regions.slug = seeded_provinces.region_slug
on conflict (region_id, slug) do update set name = excluded.name;

with seeded_communes(id, province_slug, name, slug) as (
  values
    (public.afakpress_seed_uuid('commune-rabat'), 'rabat', 'الرباط', 'rabat'),
    (public.afakpress_seed_uuid('commune-maarif'), 'casablanca', 'المعاريف', 'maarif'),
    (public.afakpress_seed_uuid('commune-tanger'), 'tanger-assilah', 'طنجة', 'tanger')
)
insert into public.communes (id, province_id, name, slug)
select seeded_communes.id, provinces.id, seeded_communes.name, seeded_communes.slug
from seeded_communes
join public.provinces on provinces.slug = seeded_communes.province_slug
on conflict (province_id, slug) do update set name = excluded.name;

drop function if exists public.afakpress_try_uuid_column(text, text);
drop function if exists public.afakpress_add_fk(text, text, text, text, text);
