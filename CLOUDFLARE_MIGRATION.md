# Cloudflare Migration Plan

This branch is for the changes needed to run the project on Cloudflare.

## Target Setup

- Cloudflare Pages or Workers for hosting
- Cloudflare D1 instead of the local SQLite file
- Cloudflare R2 instead of local uploaded product images
- Cloudflare environment variables for production secrets
- `CLOUDFLARE_BINDINGS=1` in Cloudflare so the app uses D1/R2 bindings there

## Current Status

- D1-ready database adapter added.
- R2-ready product media storage added.
- Cloudflare `wrangler.toml` added with `DB` and `PRODUCT_MEDIA` bindings.
- Initial D1 schema migration added in `migrations/0001_initial.sql`.
- Local development still falls back to the existing SQLite file and local uploads.

## Remaining Cloudflare Setup

1. Create the D1 database in Cloudflare and replace `database_id` in `wrangler.toml`.
2. Create the R2 bucket named `ephikorea-product-media`.
3. Run the D1 migration.
4. Import the existing SQLite data into D1 if the current products/orders should be kept.
5. Test with `npm run preview:cloudflare`, then deploy with `npm run deploy:cloudflare`.

## Main Changes Made

1. Replace `better-sqlite3` database access with Cloudflare D1 access.
2. Convert database reads and writes from synchronous code to async code.
3. Rewrite transaction-heavy areas, especially checkout and product admin actions.
4. Move product image uploads from `public/uploads/products` to R2.
5. Change media routes so product images are read from R2.
6. Add Cloudflare deployment configuration.
7. Export/import the current SQLite schema and data into D1.

## Important Files

- `src/lib/db.ts`
- `src/lib/admin-data.ts`
- `src/lib/catalog-data.ts`
- `src/lib/checkout.ts`
- `src/app/[locale]/(admin)/admin/products/actions.ts`
- `src/app/media/products/[filename]/route.ts`
- `data/schema.sql`
