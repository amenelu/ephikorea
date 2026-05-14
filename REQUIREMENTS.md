# Requirements

## Runtime

- Node.js 20.x or newer
- npm 10.x or newer
- Persistent disk for `data/ephikorea.sqlite` in production

## External Services

- Resend account for admin order notification emails
- Verified Resend domain for production sending
- Optional Telegram bot and chat ID for order notifications

For local testing, Resend's test sender can be used with the Resend account owner email.

## Installation

Install JavaScript dependencies from the lockfile:

```bash
npm install
```

Create or migrate the SQLite database and seed starter data:

```bash
npm run db:init
```

Run the storefront/admin app:

```bash
npm run dev
```

## Required Environment Variables

Create a `.env` file from `.env.example` and fill in real values:

```env
SQLITE_PATH=./data/ephikorea.sqlite
DEFAULT_CURRENCY=USD
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace-with-a-secure-admin-password
ADMIN_SESSION_SECRET=replace-with-a-secure-admin-session-secret
RESEND_API_KEY=re_your_api_key_here
ORDER_NOTIFICATION_FROM_EMAIL=orders@yourdomain.com
ADMIN_ORDER_NOTIFICATION_EMAIL=admin@example.com
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

## Production Hosting

This app no longer needs a separate Medusa or PostgreSQL service. Host the Next.js app on a Node.js host with persistent storage, then keep `SQLITE_PATH` on that persistent disk.

Good fits:

- VPS running Node.js with PM2 or systemd
- Railway/Render/Fly service with a mounted persistent volume
- Docker host with a mounted volume for `/app/data`

Vercel-style serverless hosting is not recommended for local SQLite because its filesystem is not durable between deploys. If you want serverless hosting, use a remote SQLite-compatible service such as Turso/libSQL instead of a local file.

## Verification

Type-check the project:

```bash
npx tsc --noEmit --incremental false --pretty false
```

Build for production:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```
