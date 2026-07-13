-- Afakpress production CMS schema for Supabase/PostgreSQL.
-- This file matches the application code in src/lib/supabase-cms.ts.

create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  slug text,
  email text unique,
  role text,
  avatar text,
  created_at timestamptz default now()
);

create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text unique not null,
  role text not null default 'admin' check (role in ('super_admin', 'admin', 'editor', 'journalist')),
  status text not null default 'active' check (status in ('active', 'disabled')),
  created_at timestamptz default now()
);

insert into admin_users (user_id, email, role, status)
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

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  parent_id uuid references categories(id),
  order_index integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists regions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz default now()
);

create table if not exists provinces (
  id uuid primary key default gen_random_uuid(),
  region_id uuid not null references regions(id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz default now()
);

create table if not exists communes (
  id uuid primary key default gen_random_uuid(),
  province_id uuid not null references provinces(id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz default now()
);

create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  name text,
  url text not null,
  type text,
  folder text,
  alt text,
  caption text,
  copyright text,
  optimized boolean default true,
  created_at timestamptz default now()
);

create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  featured_image text,
  category_id uuid references categories(id),
  author_id uuid references profiles(id),
  region_id uuid references regions(id),
  province_id uuid references provinces(id),
  commune_id uuid references communes(id),
  status text default 'draft' check (status in ('draft', 'pending_review', 'scheduled', 'published')),
  is_featured boolean default false,
  allow_comments boolean default true,
  views integer default 0,
  seo_title text,
  seo_description text,
  seo_keywords text,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists menus (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  parent_id uuid references menus(id) on delete cascade,
  level integer default 0,
  order_index integer default 0,
  is_active boolean default true,
  show_header boolean default true,
  show_footer boolean default false,
  created_at timestamptz default now()
);

create table if not exists pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text,
  seo_title text,
  seo_description text,
  status text default 'draft',
  created_at timestamptz default now()
);

create table if not exists breaking_news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  article_id uuid references articles(id) on delete set null,
  url text,
  is_active boolean default true,
  order_index integer default 0,
  created_at timestamptz default now()
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references articles(id) on delete cascade,
  author text,
  email text,
  content text not null,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  key text unique,
  value jsonb,
  created_at timestamptz default now()
);

create index if not exists articles_category_id_idx on articles(category_id);
create index if not exists articles_author_id_idx on articles(author_id);
create index if not exists articles_region_id_idx on articles(region_id);
create index if not exists articles_province_id_idx on articles(province_id);
create index if not exists articles_commune_id_idx on articles(commune_id);
create index if not exists articles_status_idx on articles(status);
create index if not exists articles_published_at_idx on articles(published_at desc);
create index if not exists provinces_region_id_idx on provinces(region_id);
create index if not exists communes_province_id_idx on communes(province_id);
create index if not exists menus_parent_id_idx on menus(parent_id);
create index if not exists breaking_news_article_id_idx on breaking_news(article_id);

alter table profiles enable row level security;
alter table admin_users enable row level security;
alter table categories enable row level security;
alter table regions enable row level security;
alter table provinces enable row level security;
alter table communes enable row level security;
alter table media enable row level security;
alter table articles enable row level security;
alter table menus enable row level security;
alter table pages enable row level security;
alter table breaking_news enable row level security;
alter table comments enable row level security;
alter table settings enable row level security;

drop policy if exists "Public read profiles" on profiles;
create policy "Public read profiles" on profiles for select using (true);

drop policy if exists "Public read categories" on categories;
create policy "Public read categories" on categories for select using (true);

drop policy if exists "Public read regions" on regions;
create policy "Public read regions" on regions for select using (true);

drop policy if exists "Public read provinces" on provinces;
create policy "Public read provinces" on provinces for select using (true);

drop policy if exists "Public read communes" on communes;
create policy "Public read communes" on communes for select using (true);

drop policy if exists "Public read media" on media;
create policy "Public read media" on media for select using (true);

drop policy if exists "Public read articles" on articles;
create policy "Public read articles" on articles for select using (true);

drop policy if exists "Public read menus" on menus;
create policy "Public read menus" on menus for select using (is_active is not false);

drop policy if exists "Public read pages" on pages;
create policy "Public read pages" on pages for select using (status = 'published');

drop policy if exists "Public read breaking news" on breaking_news;
create policy "Public read breaking news" on breaking_news for select using (is_active is not false);
