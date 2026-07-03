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

## 12. New Cloudflare Account Deployment Runbook

Use this when moving the whole site into a new Cloudflare account.

### A. Local setup

- [ ] Open PowerShell in the project folder:
  ```powershell
  cd C:\Users\Amen\ephikorea
  ```
- [ ] Install dependencies if this is a fresh machine:
  ```powershell
  npm install
  ```
- [ ] Log in to the new Cloudflare account:
  ```powershell
  npx wrangler login
  ```
- [ ] If login cannot open a browser, create a Cloudflare API token and set it only in the current PowerShell session:
  ```powershell
  $env:CLOUDFLARE_API_TOKEN="paste-token-here"
  ```

### B. Create the new D1 database

- [ ] Create the production D1 database in the new Cloudflare account:
  ```powershell
  npx wrangler d1 create ephikorea
  ```
- [ ] Copy the returned `database_id`.
- [ ] Update `wrangler.toml`:
  - Keep `binding = "DB"`.
  - Set `database_name = "ephikorea"` or the exact name you created.
  - Replace `database_id` with the new ID.
- [ ] Apply the schema to the remote D1 database:
  ```powershell
  npx wrangler d1 execute ephikorea --remote --file=./migrations/0001_initial.sql
  ```
- [ ] If you need to move existing products/orders/customers from the old database, export from the old account first and import into the new D1 database before accepting new orders.

### C. Configure Cloudinary in the new Cloudinary account

- [ ] Create or log in to the new Cloudinary account.
- [ ] In Cloudinary Console, find:
  - Cloud name
  - API key
  - API secret
- [ ] Set public Cloudinary values in `wrangler.toml` under `[vars]`:
  ```toml
  CLOUDINARY_CLOUD_NAME = "new-cloud-name"
  CLOUDINARY_API_KEY = "new-api-key"
  CLOUDINARY_FOLDER = "ephikorea/products"
  ```
- [ ] Set the Cloudinary API secret as a Cloudflare Worker secret:
  ```powershell
  npx wrangler secret put CLOUDINARY_API_SECRET
  ```
- [ ] After deployment, test product image upload from admin and confirm the image appears in the new Cloudinary Media Library.

### D. Configure admin login and site URL

- [ ] Set non-secret public/runtime values in `wrangler.toml`:
  ```toml
  ADMIN_EMAIL = "your-admin-email@example.com"
  NEXT_PUBLIC_SITE_URL = "https://yourdomain.com"
  CLOUDFLARE_BINDINGS = "1"
  ```
- [ ] Set admin secrets:
  ```powershell
  npx wrangler secret put ADMIN_PASSWORD
  npx wrangler secret put ADMIN_SESSION_SECRET
  npx wrangler secret put COOKIE_SECRET
  ```

### E. Configure new order email notifications

- [ ] Create or log in to the Resend account that will send order emails.
- [ ] Verify the sending domain in Resend if using a real domain sender.
- [ ] Set these Worker secrets:
  ```powershell
  npx wrangler secret put RESEND_API_KEY
  npx wrangler secret put ORDER_NOTIFICATION_FROM_EMAIL
  npx wrangler secret put ADMIN_ORDER_NOTIFICATION_EMAIL
  ```
- [ ] Use a sender like `orders@yourdomain.com` for `ORDER_NOTIFICATION_FROM_EMAIL`.
- [ ] Use the store owner/admin inbox for `ADMIN_ORDER_NOTIFICATION_EMAIL`.

### F. Configure Telegram order notifications

- [ ] In Telegram, open `@BotFather`.
- [ ] Create a bot with `/newbot`.
- [ ] Copy the bot token.
- [ ] Send at least one message to the new bot from the Telegram account/group that should receive order alerts.
- [ ] Get the chat ID. Common options:
  - Use a Telegram chat ID helper bot.
  - Or call `https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates` after sending a message to the bot.
- [ ] Set the Worker secrets:
  ```powershell
  npx wrangler secret put TELEGRAM_BOT_TOKEN
  npx wrangler secret put TELEGRAM_CHAT_ID
  ```
- [ ] For a Telegram group, add the bot to the group first, send a message in the group, then get the group chat ID.

### G. Deploy to the new Cloudflare account

- [ ] Build and deploy:
  ```powershell
  npm run deploy:cloudflare
  ```
- [ ] If the deploy fails because Wrangler is not authenticated, run `npx wrangler login` again or set `CLOUDFLARE_API_TOKEN`.
- [ ] Check the Worker URL first:
  ```text
  https://<worker-name>.<account-subdomain>.workers.dev
  ```
- [ ] Open `/api/health` and confirm it returns `ok: true`.
- [ ] Open `/api/admin-config` and confirm these are `true` under `bindings`:
  - `resendApiKey`
  - `orderNotificationFromEmail`
  - `adminOrderNotificationEmail`
  - `telegramBotToken`
  - `telegramChatId`
  - `cloudinaryCloudName`
  - `cloudinaryApiKey`
  - `cloudinaryApiSecret`

### H. Connect the domain name

- [ ] Add the domain to the new Cloudflare account.
- [ ] If the domain is registered outside Cloudflare:
  - Copy the two nameservers Cloudflare assigns.
  - Go to the domain registrar.
  - Replace the old nameservers with the new Cloudflare nameservers.
  - Wait for Cloudflare to show the domain as active.
- [ ] If the domain is already in another Cloudflare account, remove/transfer the zone from the old account or follow Cloudflare's account-transfer flow before changing final DNS.
- [ ] In the Cloudflare dashboard, go to Workers & Pages.
- [ ] Open the deployed Worker.
- [ ] Go to Settings > Domains & Routes > Add > Custom Domain.
- [ ] Add both domains if needed:
  - `yourdomain.com`
  - `www.yourdomain.com`
- [ ] Update `NEXT_PUBLIC_SITE_URL` in `wrangler.toml` to the final preferred domain.
- [ ] Redeploy:
  ```powershell
  npm run deploy:cloudflare
  ```
- [ ] Test:
  - `https://yourdomain.com`
  - `https://yourdomain.com/en/admin/login`
  - `https://yourdomain.com/api/health`
  - `https://yourdomain.com/sitemap.xml`

### I. Final checkout test

- [ ] Log in to admin.
- [ ] Create or edit a test product with inventory.
- [ ] Upload a product image and confirm Cloudinary delivery.
- [ ] Place a test order from the storefront.
- [ ] Confirm the order appears in admin.
- [ ] Confirm inventory decreases.
- [ ] Confirm the email notification arrives.
- [ ] Confirm the Telegram notification arrives.
- [ ] If email or Telegram fails, open `/api/admin-config` first. If any notification binding is `false`, set that secret again and redeploy.
