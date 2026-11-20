## Territories module (feature branch)

The Territories module is being added additively on top of the existing Afakpress geography and article model.

### Compatibility decisions

- Existing `regions`, `provinces`, and `communes` tables remain canonical. They are extended in place; they are not recreated or reseeded.
- Existing `articles.region_id`, `articles.province_id`, and `articles.commune_id` remain untouched and continue to support legacy publishing and routes.
- `article_territories` adds optional many-to-many links for articles that need to appear in more than one territory.
- Admin authorization follows the existing `admin_users` table and its active status, rather than introducing a second role system.
- Official names are not seeded. Administrators must enter verified people and mandate details.
- The migration in `supabase/migrations` is additive and must be reviewed and applied manually in a non-production Supabase project first. No database migration is automatically executed by GitHub.

### Schema migration

Review `supabase/migrations/202611200001_territoires_module.sql`. It extends existing geography metadata, adds `officials` and `article_territories`, enables RLS, and provisions the public `territory-media` bucket with admin-only writes.

Do not apply the migration to production until it has been tested against a backup/staging database and the SQL plan has been approved.
