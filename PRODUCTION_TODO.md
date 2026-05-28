# Production Handoff Checklist

This checklist reflects the current production setup:

- Cloudflare Worker for hosting
- Cloudflare D1 for the database
- Cloudinary for uploaded product images
- Direct image URLs as a fallback

## 1. Ownership Transfer

- [ ] Client owns or is invited to the GitHub repository.
- [ ] Client owns or is invited to the Cloudflare account/project.
- [ ] Client owns or is invited to the Cloudinary account.
- [ ] Domain is purchased under the client's account/email.
- [ ] Developer access is added separately instead of using only a personal owner account.
- [ ] Confirm recovery email, billing email, and account security belong to the client.

## 2. Cloudflare Hosting

- [ ] Worker is deployed from branch `cloudflare-deployment-migration`.
- [ ] Latest deployment opens successfully.
- [ ] Worker URL is enabled and reachable.
- [ ] Custom domain is connected if the client has purchased one.
- [ ] HTTPS works on the final domain.
- [ ] `NEXT_PUBLIC_SITE_URL` matches the final live site URL.

## 3. Cloudflare D1 Database

- [ ] D1 database exists.
- [ ] D1 binding name is exactly `DB`.
- [ ] D1 migration has been applied from `migrations/0001_initial.sql`.
- [ ] `/api/health` returns `ok: true`.
- [ ] Initial product/store data has been added or imported.
- [ ] Confirm products, orders, customers, and settings persist after redeploy.

## 4. Cloudinary Image Storage

- [ ] Cloudinary account belongs to the client.
- [ ] Cloudinary variables are set in Cloudflare:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
  - `CLOUDINARY_FOLDER`
- [ ] `CLOUDINARY_API_SECRET` is saved as a secret, not committed to Git.
- [ ] Product image upload works from admin.
- [ ] Uploaded product images render on storefront and admin pages.

## 5. Admin Security

- [ ] Admin variables are set in Cloudflare:
  - `ADMIN_EMAIL`
  - `ADMIN_PASSWORD`
  - `ADMIN_SESSION_SECRET`
  - `COOKIE_SECRET`
- [ ] Password and secret values are saved as Cloudflare secrets.
- [ ] Admin login works at `/en/admin/login` or `/ko/admin/login`.
- [ ] Admin session remains logged in after refresh.
- [ ] Admin logout/login flow is tested.

## 6. Product And Store Content

- [ ] Replace demo/sample products with real products.
- [ ] Add real prices and inventory.
- [ ] Add real product descriptions/specs.
- [ ] Add real product images.
- [ ] Confirm product create/edit/delete works.
- [ ] Confirm inventory increment works.

## 7. Checkout Verification

- [ ] Open storefront home page.
- [ ] Browse products.
- [ ] Open product details.
- [ ] Add product to cart.
- [ ] Submit checkout.
- [ ] Confirm order appears in admin.
- [ ] Confirm customer appears in admin.
- [ ] Confirm inventory updates after checkout.

## 8. Notifications And Integrations

- [ ] If Resend is used, set `RESEND_API_KEY`.
- [ ] Set admin notification email variables if needed.
- [ ] Submit a test order and confirm email notification arrives.
- [ ] Verify Telegram notification variables only if Telegram is used.

## 9. Domain Handoff

- [ ] Choose final domain.
- [ ] Buy domain under the client's registrar account.
- [ ] Connect domain to Cloudflare Worker.
- [ ] Update `NEXT_PUBLIC_SITE_URL` to the final domain.
- [ ] Redeploy after URL update.
- [ ] Test redirects, sitemap, and admin login on the final domain.

## 10. Cleanup Before Client Delivery

- [ ] Remove or protect diagnostic endpoint `/api/admin-config`.
- [ ] Keep `/api/health` only if the client/developer needs it.
- [ ] Remove unused failed Cloudflare Pages/Worker experiments.
- [ ] Confirm `.env` is not committed.
- [ ] Confirm secrets are not present in GitHub.
- [ ] Confirm `.open-next/` build output is not committed.

## 11. Client Handoff Package

- [ ] Website URL.
- [ ] Admin login URL.
- [ ] Admin email and temporary password.
- [ ] Cloudflare account/project access.
- [ ] Cloudinary account access.
- [ ] GitHub repo access.
- [ ] Domain registrar access.
- [ ] Short guide for adding products, uploading images, checking orders, and updating inventory.

