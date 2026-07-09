-- Afakpress CMS normalized database schema draft.
-- Intended for PostgreSQL/Supabase/Neon when persistent multi-user storage is connected.

create table roles (
  id text primary key,
  name text not null unique
);

create table users (
  id uuid primary key default gen_random_uuid(),
  role_id text not null references roles(id),
  name text not null,
  email text not null unique,
  password_hash text not null,
  bio text,
  avatar text,
  social_links jsonb default '[]',
  position text,
  created_at timestamptz default now()
);

create table admin_users (
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

create table categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references categories(id),
  name text not null,
  slug text not null unique,
  color text,
  icon text,
  description text,
  seo_title text,
  seo_description text
);

create table regions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);

create table provinces (
  id uuid primary key default gen_random_uuid(),
  region_id uuid not null references regions(id) on delete cascade,
  name text not null,
  slug text not null
);

create table communes (
  id uuid primary key default gen_random_uuid(),
  province_id uuid not null references provinces(id) on delete cascade,
  name text not null,
  slug text not null
);

create table media (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references users(id),
  name text not null,
  url text not null,
  type text not null,
  folder text,
  alt text,
  caption text,
  copyright text,
  optimized boolean default false,
  created_at timestamptz default now()
);

create table articles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references users(id),
  author_id uuid references users(id),
  category_id uuid references categories(id),
  region_id uuid references regions(id),
  province_id uuid references provinces(id),
  commune_id uuid references communes(id),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  featured_image_id uuid references media(id),
  gallery jsonb default '[]',
  video_url text,
  tags jsonb default '[]',
  seo_title text,
  seo_description text,
  canonical_url text,
  status text not null default 'Draft',
  publish_date timestamptz,
  featured boolean default false,
  breaking boolean default false,
  homepage_position integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table related_articles (
  article_id text references articles(id) on delete cascade,
  related_article_id text references articles(id) on delete cascade,
  primary key (article_id, related_article_id)
);

create table menus (
  id text primary key,
  name text not null,
  location text not null
);

create table menu_items (
  id text primary key,
  menu_id text not null references menus(id) on delete cascade,
  parent_id text references menu_items(id) on delete cascade,
  label text not null,
  href text not null,
  type text not null,
  sort_order integer not null default 0
);

create table pages (
  id text primary key,
  title text not null,
  slug text not null unique,
  content text,
  seo_title text,
  seo_description text,
  status text not null default 'Draft'
);

create table comments (
  id text primary key,
  article_id text references articles(id) on delete cascade,
  author text not null,
  email text,
  content text not null,
  status text not null default 'Pending',
  created_at timestamptz default now()
);

create table newsletter_subscribers (
  id text primary key,
  email text not null unique,
  name text,
  created_at timestamptz default now()
);

create table homepage_sections (
  id text primary key,
  label text not null,
  enabled boolean default true,
  sort_order integer not null default 0
);

create table site_settings (
  id text primary key default 'global',
  data jsonb not null default '{}'
);
