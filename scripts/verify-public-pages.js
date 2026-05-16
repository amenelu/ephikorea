const path = require("path");
const Database = require("better-sqlite3");
const { chromium } = require("@playwright/test");
require("dotenv").config();

const root = path.resolve(__dirname, "..");
const baseUrl = (process.env.PUBLIC_VERIFY_URL || "http://127.0.0.1:3001")
  .replace(/\/+$/, "");
const databasePath = path.resolve(
  root,
  process.env.SQLITE_PATH || "data/ephikorea.sqlite",
);

function getFirstProductPath() {
  try {
    const db = new Database(databasePath, { readonly: true });
    const row = db
      .prepare(
        "select handle, id from products where deleted_at is null order by created_at desc limit 1",
      )
      .get();
    db.close();

    if (!row) {
      return null;
    }

    return `/en/products/${row.handle || row.id}`;
  } catch {
    return null;
  }
}

function normalizePath(value) {
  try {
    const url = new URL(value, baseUrl);

    if (url.origin !== new URL(baseUrl).origin) {
      return null;
    }

    if (
      url.pathname.startsWith("/api") ||
      url.pathname.startsWith("/media") ||
      url.pathname.startsWith("/uploads") ||
      url.pathname.includes("/admin")
    ) {
      return null;
    }

    const pathname = url.pathname.replace(/\/+$/, "") || "/";
    return pathname.startsWith("/en") ? pathname : null;
  } catch {
    return null;
  }
}

async function checkPage(browser, pathname) {
  const page = await browser.newPage();
  const errors = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => errors.push(error.message));

  const response = await page.goto(`${baseUrl}${pathname}`, {
    waitUntil: "networkidle",
    timeout: 30_000,
  });
  const status = response?.status() || 0;
  const h1Count = await page.locator("h1").count();
  const title = await page.title();
  const hrefs = await page.locator("a[href]").evaluateAll((links) =>
    links.map((link) => link.getAttribute("href")).filter(Boolean),
  );

  await page.close();

  return {
    pathname,
    status,
    title,
    h1Count,
    errors,
    links: hrefs.map(normalizePath).filter(Boolean),
  };
}

async function main() {
  const productPath = getFirstProductPath();
  const requiredPages = [
    "/en",
    "/en/products",
    "/en/collections",
    "/en/collections/audio",
    "/en/collections/computing",
    "/en/collections/wearables",
    "/en/about",
    "/en/contact",
    "/en/privacy",
    "/en/sustainability",
    "/en/support/returns",
    "/en/support/shipping",
    "/en/cart",
    "/en/search",
    ...(productPath ? [productPath] : []),
  ];
  const linkRequiredPages = requiredPages.filter((page) => page !== "/en/search");
  const browser = await chromium.launch({ headless: true });
  const visited = new Set();
  const discovered = new Set(["/en"]);
  const queue = ["/en"];
  const failures = [];

  for (const pathname of requiredPages) {
    const result = await checkPage(browser, pathname);

    if (result.status >= 400 || result.status === 0) {
      failures.push(`${pathname} returned HTTP ${result.status}`);
    }

    if (result.h1Count !== 1) {
      failures.push(`${pathname} has ${result.h1Count} h1 elements`);
    }

    if (result.errors.length > 0) {
      failures.push(`${pathname} console errors: ${result.errors.join(" | ")}`);
    }
  }

  while (queue.length > 0 && visited.size < 80) {
    const pathname = queue.shift();

    if (!pathname || visited.has(pathname)) {
      continue;
    }

    visited.add(pathname);
    const result = await checkPage(browser, pathname);

    for (const link of result.links) {
      if (!discovered.has(link)) {
        discovered.add(link);
        queue.push(link);
      }
    }
  }

  await browser.close();

  for (const pathname of linkRequiredPages) {
    if (!discovered.has(pathname)) {
      failures.push(`${pathname} is not reachable from public internal links`);
    }
  }

  if (failures.length > 0) {
    console.error("Public verification failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log(`Verified ${requiredPages.length} key public pages.`);
  console.log(`Discovered ${discovered.size} internal public links.`);
  console.log("Heading structure and internal reachability checks passed.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
