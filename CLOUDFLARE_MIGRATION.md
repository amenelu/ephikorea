# Cloudflare Migration Plan

This branch is for the changes needed to run the project on Cloudflare.

## Target Setup

- Cloudflare Pages or Workers for hosting
- Cloudflare D1 instead of the local SQLite file
- Product images by Cloudinary upload or external URL
- Cloudflare environment variables for production secrets
- `CLOUDFLARE_BINDINGS=1` in Cloudflare so the app uses D1 bindings there

## Current Status

- D1-ready database adapter added.
- Product media storage uploads to Cloudinary when Cloudinary variables are set, falls back to local uploads in development, and still allows direct image URLs.
- Cloudflare `wrangler.toml` added with the `DB` binding.
- Initial D1 schema migration added in `migrations/0001_initial.sql`.
- Local development still falls back to the existing SQLite file and local uploads.

## Remaining Cloudflare Setup

1. Create the D1 database in Cloudflare and replace `database_id` in `wrangler.toml`.
2. Run the D1 migration.
3. Import the existing SQLite data into D1 if the current products/orders should be kept.
4. Add Cloudinary variables in Cloudflare if admin image uploads should work.
5. Use direct image URLs as a fallback for product thumbnails.
6. Test with `npm run preview:cloudflare`, then deploy with `npm run deploy:cloudflare`.

## Cloudinary Variables

Add these in Cloudflare as Worker variables/secrets:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET` as a secret
- `CLOUDINARY_FOLDER` optional, defaults to `ephikorea/products`

## Main Changes Made

1. Replace `better-sqlite3` database access with Cloudflare D1 access.
2. Convert database reads and writes from synchronous code to async code.
3. Rewrite transaction-heavy areas, especially checkout and product admin actions.
4. Upload product images to Cloudinary on Cloudflare when Cloudinary credentials are configured.
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
