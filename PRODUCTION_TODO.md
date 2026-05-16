# Production Cleanup Checklist

This file tracks the remaining work before deploying the SQLite-based version to production.

## Status

- Current app state: SQLite migration is implemented and builds locally.
- Current gap: deployment, environment cleanup, persistence, and production verification.

## 1. Environment Cleanup

- [x] Replace the current `.env` with production-focused variables only.
- [x] Remove old Medusa/Postgres variables from `.env`.
- [x] Keep only the variables the current app uses:
  - `SQLITE_PATH`
  - `DEFAULT_CURRENCY`
  - `NEXT_PUBLIC_SITE_URL`
  - `ADMIN_EMAIL`
  - `ADMIN_PASSWORD`
  - `ADMIN_SESSION_SECRET`
  - `RESEND_API_KEY`
  - `ORDER_NOTIFICATION_FROM_EMAIL`
  - `ADMIN_ORDER_NOTIFICATION_EMAIL`
  - optional: `TELEGRAM_BOT_TOKEN`
  - optional: `TELEGRAM_CHAT_ID`
- [x] Replace placeholder secrets with real values.

## 2. Hosting Decision

- [ ] Choose a production host that supports:
  - Node.js runtime
  - persistent disk/volume
  - custom domain + HTTPS
- [ ] Candidate platforms:
  - VPS
  - Railway with persistent volume
  - Render with persistent disk
  - Fly.io with attached volume

## 3. Persistent Storage

- [ ] Persist the SQLite database file:
  - `data/ephikorea.sqlite`
- [ ] Persist uploaded product images:
  - `public/uploads/products`
- [ ] Confirm both survive:
  - app restart
  - redeploy
  - server reboot

## 4. Production Boot Flow

- [ ] Install dependencies:
  ```bash
  npm install
  ```
- [ ] Initialize or migrate the database:
  ```bash
  npm run db:init
  ```
- [ ] Build the app:
  ```bash
  npm run build
  ```
- [ ] Start the app:
  ```bash
  npm run start
  ```
- [ ] Put the app behind a process manager or service:
  - PM2
  - systemd
  - Docker
  - host-native app runner

## 5. Reverse Proxy and Domain

- [ ] Point the domain to the server.
- [ ] Configure HTTPS.
- [ ] Reverse proxy traffic to the Node app port.
- [ ] Confirm locale redirects still work correctly at the real domain.

## 6. Admin Security

- [ ] Set a strong `ADMIN_PASSWORD`.
- [ ] Set a strong `ADMIN_SESSION_SECRET`.
- [ ] Confirm admin login works on the production domain.
- [ ] Confirm auth cookies behave correctly over HTTPS.

## 7. External Services

- [ ] Verify Resend credentials and sender address.
- [ ] Test a real order notification email.
- [ ] Verify Telegram settings if used.
- [ ] Confirm external integrations still work after deployment.

## 8. Backups and Recovery

- [x] Back up `data/ephikorea.sqlite`.
- [x] Back up `public/uploads/products`.
- [x] Define backup frequency.
- [x] Define restore procedure.

Backup command:

```bash
npm run backup:data
```

Restore command:

```bash
npm run restore:data -- backups/<timestamp>
```

Recommended production frequency:

- Run a daily backup at minimum.
- Run a manual backup before deploys, schema changes, bulk imports, or large inventory updates.
- Keep at least 7 daily backups and 4 weekly backups on storage separate from the app server.
- After restore, restart the app so the SQLite connection reopens against the restored file.

## 9. Functional Verification

- [ ] Open storefront home page.
- [ ] Browse product list.
- [ ] Open product details page.
- [ ] Add item to cart.
- [ ] Submit checkout.
- [ ] Confirm order appears in admin.
- [ ] Confirm customer appears in admin.
- [ ] Create product in admin.
- [ ] Edit product in admin.
- [ ] Remove product in admin.
- [ ] Upload a product image and verify it renders.

## 10. Performance Verification

- [ ] Run the app in production mode, not `next dev`.
- [ ] Re-run latency checks against the production server.
- [ ] Compare startup latency and warm-route latency.
- [ ] Confirm acceptable response times on the target host.

## 11. SEO Cleanup

- [x] Replace generic site metadata with production brand copy.
- [x] Define per-page `title` and `description` for:
  - home
  - products listing
  - product details
  - collections
  - support/info pages
- [x] Add canonical URLs for public pages.
- [x] Add `metadataBase` for the production domain.
- [x] Generate a proper `robots.txt`.
- [x] Generate a proper `sitemap.xml`.
- [x] Confirm locale-aware URLs are reflected consistently in metadata.
- [x] Add Open Graph metadata:
  - `og:title`
  - `og:description`
  - `og:url`
  - `og:image`
- [x] Add Twitter card metadata.
- [x] Ensure product pages expose useful crawlable content:
  - product title
  - description
  - price
  - availability/inventory state where appropriate
- [x] Add structured data where useful:
  - Organization
  - WebSite / SearchAction
  - Product on product pages
- [x] Confirm no accidental indexing of admin pages.
- [x] Confirm search result pages should or should not be indexed.
- [x] Review heading structure on key public pages.
- [x] Verify all important pages are reachable by internal links.
- [ ] Replace placeholder/fallback thumbnails with real share images where needed.

## Notes For Later Execution

- The app is fast in local production mode. The earlier slow page loads were primarily from `next dev` route compilation, not SQLite itself.
- The production measurement script already exists:
  - [measure-latency.ps1](c:/Users/Amen/ephikorea/scripts/measure-latency.ps1)
- Public SEO/page verification now exists:
  - Run `npm run verify:public` against the local production server.
  - This checks key public pages for successful responses, one `h1`, browser errors, and internal link reachability.
- Existing local build and latency evidence:
  - [REQUIREMENTS.md](c:/Users/Amen/ephikorea/REQUIREMENTS.md)
  - [logs](c:/Users/Amen/ephikorea/logs)

## Suggested Order When We Resume

1. Clean `.env`
2. Choose host
3. Configure persistent storage
4. Deploy and boot app
5. Verify admin/auth and external notifications
6. Run end-to-end functional check
7. Run performance checks on the target host
8. Replace placeholder/fallback share thumbnails where needed
