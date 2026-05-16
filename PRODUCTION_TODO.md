# Production Cleanup Checklist

This file tracks the remaining work before deploying the SQLite-based version to production.

## Status

- Current app state: SQLite migration is implemented and builds locally.
- Current gap: hosting decision, persistent storage, deployment, and production verification.

## 1. Hosting Decision

- [ ] Choose a production host that supports:
  - Node.js runtime
  - persistent disk/volume
  - custom domain + HTTPS
- [ ] Candidate platforms:
  - VPS
  - Railway with persistent volume
  - Render with persistent disk
  - Fly.io with attached volume

## 2. Persistent Storage

- [ ] Persist the SQLite database file:
  - `data/ephikorea.sqlite`
- [ ] Persist uploaded product images:
  - `public/uploads/products`
- [ ] Confirm both survive:
  - app restart
  - redeploy
  - server reboot

## 3. Production Boot Flow

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

## 4. Reverse Proxy and Domain

- [ ] Point the domain to the server.
- [ ] Configure HTTPS.
- [ ] Reverse proxy traffic to the Node app port.
- [ ] Confirm locale redirects still work correctly at the real domain.

## 5. Admin Security

- [ ] Set a strong `ADMIN_PASSWORD`.
- [ ] Set a strong `ADMIN_SESSION_SECRET`.
- [ ] Confirm admin login works on the production domain.
- [ ] Confirm auth cookies behave correctly over HTTPS.

## 6. External Services

- [ ] Verify Resend credentials and sender address.
- [ ] Test a real order notification email.
- [ ] Verify Telegram settings if used.
- [ ] Confirm external integrations still work after deployment.

## 7. Functional Verification

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

## 8. Performance Verification

- [ ] Run the app in production mode, not `next dev`.
- [ ] Re-run latency checks against the production server.
- [ ] Compare startup latency and warm-route latency.
- [ ] Confirm acceptable response times on the target host.

## 9. SEO Cleanup

- [ ] Replace placeholder/fallback thumbnails with real share images where needed.

## Notes For Later Execution

- Backup command:
  ```bash
  npm run backup:data
  ```
- Restore command:
  ```bash
  npm run restore:data -- backups/<timestamp>
  ```
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

1. Choose host
2. Configure persistent storage
3. Deploy and boot app
4. Verify admin/auth and external notifications
5. Run end-to-end functional check
6. Run performance checks on the target host
7. Replace placeholder/fallback share thumbnails where needed
