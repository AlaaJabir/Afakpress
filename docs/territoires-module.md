## Territories module (feature branch)

The Territories module is being added additively on top of the existing Afakpress geography and article model.

### Compatibility decisions

- Existing `regions`, `provinces`, and `communes` tables remain canonical. They are extended in place; they are not recreated or reseeded.
- Existing `articles.region_id`, `articles.province_id`, and `articles.commune_id` remain untouched and continue to support legacy publishing and routes.
- `article_territories` adds optional many-to-many links for articles that need to appear in more than one territory.
- Admin authorization follows the existing `admin_users` table and its active `super_admin` / `admin` roles, rather than introducing a second role system.
- Official names are not seeded. Administrators must enter verified people, political affiliation, and mandate details.
- Existing Morocco geography seed data remains the source of the 12 regions and current provinces/communes. This feature does not add guessed names or delete/reseed geography records.
- Existing `name` values are preserved and copied into `name_ar` only when that field is empty. French labels remain empty until verified translations are entered.

### Schema migration

Review `supabase/migrations/202611200001_territoires_module.sql`. It extends existing geography metadata, adds `officials` and `article_territories`, enables RLS, and provisions the public `territory-media` bucket with admin-only writes.

**This migration is committed but has not been executed against Supabase.** Apply it first to a staging Supabase project or a verified backup clone, inspect the SQL results, and confirm the policies and Storage bucket before production approval. No database migration is automatically executed by GitHub Actions.

### How to add content

1. Sign in to the Afakpress Admin CMS with an active `super_admin` or `admin` account.
2. Open **Territories & Officials** (or `/admin/territoires`).
3. Choose **New official**, select the exact region, province/prefecture, or commune, enter verified French/Arabic names, role, party, mandate dates and biography, then upload a profile photo and choose whether to publish.
4. To publish news on multiple territories, first create or edit the article in the existing **Articles** section. Then use **Attach news to territories** to link that article to one or more regions, provinces, or communes.
5. Published officials and linked published articles appear automatically on their matching public territory pages. Draft articles and unpublished officials remain hidden from public pages.

### Storage and configuration

- The migration creates the public `territory-media` bucket with a 2 MB limit and JPEG/PNG/WebP MIME allow-list.
- The browser compresses/resizes the selected image and uploads it using a short-lived signed upload token created by an admin-only API route.
- The Supabase service-role key is used only in server-side routes; it is never sent to the browser.
- Ensure the existing `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and server-only `SUPABASE_SERVICE_ROLE_KEY` environment variables are configured.
- For the optional CI database audit, add GitHub Actions secrets `STAGING_SUPABASE_URL` and `STAGING_SUPABASE_SERVICE_ROLE_KEY`, then set the Actions repository variable `RUN_STAGING_DB_AUDIT=true`. These must point to a staging project, never production.
- Ensure the first administrator exists in `admin_users`, is active, has role `super_admin` or `admin`, and is linked to the intended Supabase Auth user.

### Verification

GitHub Actions now runs `npm ci`, ESLint, TypeScript, production build, and Playwright on `feature/**` branches. The Territories Playwright smoke tests verify public route rendering and that anonymous requests cannot access admin APIs. Full CRUD, image upload, and real Supabase persistence still require a staging Supabase project and an authenticated administrator test account.
