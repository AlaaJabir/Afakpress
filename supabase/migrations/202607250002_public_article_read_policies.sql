-- Public article/detail reads. This changes SELECT policies only.

alter table public.articles enable row level security;
alter table public.categories enable row level security;
alter table public.regions enable row level security;
alter table public.provinces enable row level security;
alter table public.communes enable row level security;

drop policy if exists "Public read articles" on public.articles;
drop policy if exists "Public can read published articles" on public.articles;
create policy "Public can read published articles"
on public.articles
for select
to anon, authenticated
using (status = 'published');

drop policy if exists "Public read categories" on public.categories;
drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories"
on public.categories
for select
to anon, authenticated
using (true);

drop policy if exists "Public read regions" on public.regions;
drop policy if exists "Public can read regions" on public.regions;
create policy "Public can read regions"
on public.regions
for select
to anon, authenticated
using (true);

drop policy if exists "Public read provinces" on public.provinces;
drop policy if exists "Public can read provinces" on public.provinces;
create policy "Public can read provinces"
on public.provinces
for select
to anon, authenticated
using (true);

drop policy if exists "Public read communes" on public.communes;
drop policy if exists "Public can read communes" on public.communes;
create policy "Public can read communes"
on public.communes
for select
to anon, authenticated
using (true);
