# Afakpress Supabase Schema Audit

## Scope

Audited the database contract used by:

- `src/lib/supabase-cms.ts`
- `src/lib/cms-reference-data.ts`
- `src/lib/article-validation.ts`
- `src/app/api/admin/[resource]/route.ts`
- `src/app/api/admin-users/route.ts`
- `src/app/api/auth/*`
- `src/components/AdminCMS.tsx`
- `src/lib/supabase-types.ts`

No live Supabase environment variables were available in this local workspace, so the real production database cannot be introspected from here. The new `npm run db:check` command performs that real check whenever `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are available.

## Naming Decisions

- Authors are represented by `public.profiles`. The application does not use a separate `authors` table.
- The chosen avatar column is `profiles.avatar`.
- If an older `profiles.avatar_url` column exists, the migration copies existing values into `profiles.avatar` without dropping `avatar_url`.
- Public URLs use slugs. Foreign key columns use UUIDs only.
- Article foreign keys are:
  - `articles.category_id -> categories.id`
  - `articles.author_id -> profiles.id`
  - `articles.region_id -> regions.id`
  - `articles.province_id -> provinces.id`
  - `articles.commune_id -> communes.id`

## Tables Required By Code

- `profiles`: `id`, `name`, `slug`, `email`, `role`, `avatar`, `created_at`, `updated_at`
- `admin_users`: `id`, `user_id`, `email`, `role`, `status`, `created_at`, `updated_at`
- `categories`: `id`, `name`, `slug`, `description`, `parent_id`, `order_index`, `is_active`, `created_at`, `updated_at`
- `regions`: `id`, `name`, `slug`, `created_at`, `updated_at`
- `provinces`: `id`, `region_id`, `name`, `slug`, `created_at`, `updated_at`
- `communes`: `id`, `province_id`, `name`, `slug`, `created_at`, `updated_at`
- `media`: `id`, `name`, `url`, `type`, `folder`, `alt`, `caption`, `copyright`, `optimized`, `created_at`, `updated_at`
- `articles`: `id`, `title`, `slug`, `excerpt`, `content`, `featured_image`, `category_id`, `author_id`, `region_id`, `province_id`, `commune_id`, `status`, `is_featured`, `allow_comments`, `views`, `seo_title`, `seo_description`, `seo_keywords`, `published_at`, `created_at`, `updated_at`
- `menus`: `id`, `title`, `slug`, `parent_id`, `level`, `order_index`, `is_active`, `show_header`, `show_footer`, `created_at`, `updated_at`
- `pages`: `id`, `title`, `slug`, `content`, `seo_title`, `seo_description`, `status`, `created_at`, `updated_at`
- `tags`: `id`, `name`, `slug`, `created_at`
- `article_tags`: `article_id`, `tag_id`
- `comments`: `id`, `article_id`, `author`, `email`, `content`, `status`, `created_at`, `updated_at`
- `breaking_news`: `id`, `title`, `article_id`, `url`, `is_active`, `order_index`, `created_at`, `updated_at`
- `settings`: `id`, `key`, `value`, `created_at`, `updated_at`

## Form/FK Audit

Article Editor dropdowns send UUID IDs:

- Author dropdown: `value={user.id}`
- Category dropdown: `value={category.id}`
- Region dropdown: `value={region.id}`
- Province dropdown: `value={province.id}`
- Commune dropdown: `value={commune.id}`

The UI validation and API validation both use the shared Zod schema in `src/lib/article-validation.ts`. The admin API also seeds/resolves default lookup rows before saving articles.

## Migration

Generated migration:

- `supabase/migrations/complete_schema_sync.sql`

The migration:

- Creates missing tables.
- Adds missing columns.
- Attempts safe UUID conversion only when existing values are valid UUIDs.
- Adds unique indexes and lookup indexes.
- Adds foreign keys as `NOT VALID` so existing production orphan records do not block deployment, while new writes are enforced.
- Enables RLS.
- Adds public read policies required by the current browser Supabase read architecture.
- Seeds default categories, initial profiles/admin, and minimum region/province/commune lookup data.

## Health Check

Generated command:

```bash
npm run db:check
```

The health check detects:

- Missing tables.
- Missing columns.
- Empty required lookup tables.
- Invalid UUID IDs/references.
- Orphan article/location/category/profile references.
- Invalid article statuses.
- Missing required article `title`/`slug`.
- Missing Supabase env configuration.

## Remaining Operational Note

Apply `supabase/migrations/complete_schema_sync.sql` to production Supabase before relying on Vercel deployment. After that, run `npm run db:check` with production or staging Supabase environment variables before deployment.
