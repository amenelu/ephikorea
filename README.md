# Aman Mobiles Storefront

Aman Mobiles is a Next.js commerce storefront with an admin console for managing products, inventory, customers, orders, image uploads, and new-order notifications.

The production deployment is configured for Cloudflare Workers through OpenNext, Cloudflare D1 for database storage, Cloudinary for product images, Resend for email notifications, and Telegram for order alerts.

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Cloudflare Workers
- Cloudflare D1
- OpenNext for Cloudflare
- Cloudinary image uploads
- Resend email notifications
- Telegram bot notifications

## Project Structure

```text
src/app                  Next.js app routes
src/components           Shared UI components
src/lib                  Database, checkout, admin, SEO, email, and utility logic
migrations               Cloudflare D1 schema migrations
scripts                  Local database and verification scripts
public                   Static public assets
wrangler.toml            Cloudflare Worker configuration
PRODUCTION_TODO.md       Production handoff and deployment checklist
```

## Local Setup

Install dependencies:

```powershell
npm install
```

Create a local environment file:

```powershell
Copy-Item .env.example .env
```

Initialize the local SQLite database:

```powershell
npm run db:init
```

Start the development server:

```powershell
npm run dev
```

The local site runs at:

```text
http://localhost:3000
```

## Environment Variables

Use `.env.example` as the template. Do not commit real secrets.

Required local variables:

```text
SQLITE_PATH
DEFAULT_CURRENCY
NEXT_PUBLIC_SITE_URL
ADMIN_EMAIL
ADMIN_PASSWORD
ADMIN_SESSION_SECRET
```

Production Cloudflare variables and secrets:

```text
CLOUDFLARE_BINDINGS
NEXT_PUBLIC_SITE_URL
ADMIN_EMAIL
ADMIN_PASSWORD
ADMIN_SESSION_SECRET
COOKIE_SECRET
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
CLOUDINARY_FOLDER
RESEND_API_KEY
ORDER_NOTIFICATION_FROM_EMAIL
ADMIN_ORDER_NOTIFICATION_EMAIL
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
```

Set Cloudflare secrets with Wrangler:

```powershell
npx wrangler secret put SECRET_NAME
```

Examples:

```powershell
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put ADMIN_SESSION_SECRET
npx wrangler secret put COOKIE_SECRET
npx wrangler secret put CLOUDINARY_API_SECRET
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_CHAT_ID
```

## Database

Local development uses SQLite through `SQLITE_PATH`.

Production uses Cloudflare D1 through the `DB` binding in `wrangler.toml`.

Create a D1 database:

```powershell
npx wrangler d1 create ephikorea
```

Apply the schema:

```powershell
npx wrangler d1 execute ephikorea --remote --file=./migrations/0001_initial.sql
```

Check the live database connection:

```text
https://yourdomain.com/api/health
```

## Admin

Admin login:

```text
https://yourdomain.com/en/admin/login
```

Main admin areas:

```text
/en/admin
/en/admin/products
/en/admin/orders
/en/admin/customers
/en/admin/settings
```

## Product Images

In production, product uploads use Cloudinary when these values are configured:

```text
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
CLOUDINARY_FOLDER
```

If Cloudinary is not configured locally, the app can fall back to local uploads or direct image URLs.

## Order Notifications

New order notifications can be sent by email and Telegram.

Email notification variables:

```text
RESEND_API_KEY
ORDER_NOTIFICATION_FROM_EMAIL
ADMIN_ORDER_NOTIFICATION_EMAIL
```

Telegram notification variables:

```text
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
```

For Telegram groups, the chat ID is usually negative. Confirm it from Telegram `getUpdates` output by using the `id` inside the `chat` object.

## Cloudflare Deployment

Log in to Cloudflare:

```powershell
npx wrangler login
```

Build for Cloudflare:

```powershell
npm run build:cloudflare
```

Preview on Cloudflare locally:

```powershell
npm run preview:cloudflare
```

Deploy to Cloudflare:

```powershell
npm run deploy:cloudflare
```

The active Worker configuration is in `wrangler.toml`.

## Useful Commands

Run the standard Next.js build:

```powershell
npm run build
```

Run linting:

```powershell
npm run lint
```

Verify translations:

```powershell
npm run verify:translations
```

Verify public pages:

```powershell
npm run verify:public
```

Back up local data:

```powershell
npm run backup:data
```

Restore local data:

```powershell
npm run restore:data
```

## SEO

The app includes:

- Metadata in `src/lib/seo.ts`
- Root metadata in `src/app/layout.tsx`
- Sitemap at `/sitemap.xml`
- Robots file at `/robots.txt`

After connecting the production domain, verify the domain in Google Search Console, request indexing for the homepage, and submit the sitemap.

## Production Checklist

Use `PRODUCTION_TODO.md` for the full handoff checklist, including Cloudflare setup, D1, Cloudinary, notifications, domain setup, SEO, and final client delivery steps.
