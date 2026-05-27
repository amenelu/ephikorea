# Cloudflare Migration Plan

This branch is for the changes needed to run the project on Cloudflare.

## Target Setup

- Cloudflare Pages or Workers for hosting
- Cloudflare D1 instead of the local SQLite file
- Product images by external URL for the free storageless setup
- Cloudflare environment variables for production secrets
- `CLOUDFLARE_BINDINGS=1` in Cloudflare so the app uses D1 bindings there

## Current Status

- D1-ready database adapter added.
- Product media storage now falls back to local uploads in development and disables uploads on Cloudflare unless R2 is added later.
- Cloudflare `wrangler.toml` added with the `DB` binding.
- Initial D1 schema migration added in `migrations/0001_initial.sql`.
- Local development still falls back to the existing SQLite file and local uploads.

## Remaining Cloudflare Setup

1. Create the D1 database in Cloudflare and replace `database_id` in `wrangler.toml`.
2. Run the D1 migration.
3. Import the existing SQLite data into D1 if the current products/orders should be kept.
4. Use direct image URLs for product thumbnails in production.
5. Test with `npm run preview:cloudflare`, then deploy with `npm run deploy:cloudflare`.

## Main Changes Made

1. Replace `better-sqlite3` database access with Cloudflare D1 access.
2. Convert database reads and writes from synchronous code to async code.
3. Rewrite transaction-heavy areas, especially checkout and product admin actions.
4. Disable local product image uploads on Cloudflare unless R2 or another storage provider is added later.
5. Add Cloudflare deployment configuration.
6. Export/import the current SQLite schema and data into D1.

## Important Files

- `src/lib/db.ts`
- `src/lib/admin-data.ts`
- `src/lib/catalog-data.ts`
- `src/lib/checkout.ts`
- `src/app/[locale]/(admin)/admin/products/actions.ts`
- `src/app/media/products/[filename]/route.ts`
- `data/schema.sql`
