# Cloudflare Migration Plan

This branch is for the changes needed to run the project on Cloudflare.

## Target Setup

- Cloudflare Pages or Workers for hosting
- Cloudflare D1 instead of the local SQLite file
- Cloudflare R2 instead of local uploaded product images
- Cloudflare environment variables for production secrets

## Main Changes Needed

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

