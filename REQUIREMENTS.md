# Requirements

## Runtime

- Node.js 20.x or newer
- npm 10.x or newer
- PostgreSQL 13 or newer

## External Services

- Resend account for admin order notification emails
- Verified Resend domain for production sending

For local testing, Resend's test sender can be used with the Resend account owner email.

## Installation

Install JavaScript dependencies from the lockfile:

```bash
npm install
```

Run the frontend:

```bash
npm run dev
```

Run the Medusa backend:

```bash
npm run backend
```

Run Medusa database migrations:

```bash
npm run backend:migrate
```

Apply storefront-specific schema additions:

```bash
psql "postgres://postgres:YOUR_PASSWORD@127.0.0.1:5432/medusa_db" -f data/schema.sql
```

Seed the database:

```bash
npm run backend:seed
```

## Required Environment Variables

Create a `.env` file from `.env.example` and fill in real values:

```env
PORT=9000
DATABASE_URL=postgres://postgres:12345678@127.0.0.1:5434/medusa_db
JWT_SECRET=replace-with-a-secure-jwt-secret
COOKIE_SECRET=replace-with-a-secure-cookie-secret
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://127.0.0.1:9000
MEDUSA_DEFAULT_CURRENCY=KRW
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace-with-a-secure-admin-password
ADMIN_SESSION_SECRET=replace-with-a-secure-admin-session-secret
RESEND_API_KEY=re_your_api_key_here
ORDER_NOTIFICATION_FROM_EMAIL=orders@yourdomain.com
ADMIN_ORDER_NOTIFICATION_EMAIL=admin@example.com
```

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
