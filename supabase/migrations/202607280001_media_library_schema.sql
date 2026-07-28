-- Keep article uploads and the CMS media library on the same canonical schema.
-- Safe to run repeatedly on databases that already contain these columns.

create extension if not exists pgcrypto;

create table if not exists public.media (
  id uuid primary key default gen_random_uuid()
);

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

alter table public.media enable row level security;

drop policy if exists "Public read media" on public.media;
create policy "Public read media"
on public.media
for select
to anon, authenticated
using (true);
