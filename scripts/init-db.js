const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
const Database = require("better-sqlite3");

const root = process.cwd();
const databasePath = path.resolve(root, process.env.SQLITE_PATH || "data/ephikorea.sqlite");
const schemaPath = path.join(root, "data", "schema.sql");
const seedPath = path.join(root, "data", "seed.json");

function createEntityId(prefix) {
  return `${prefix}_${randomUUID().replace(/-/g, "").toUpperCase().slice(0, 26)}`;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function inferBrand(title) {
  const normalized = String(title || "").toLowerCase();
  if (normalized.includes("iphone") || normalized.includes("apple")) return "Apple";
  if (normalized.includes("galaxy") || normalized.includes("samsung")) return "Samsung";
  if (normalized.includes("pixel") || normalized.includes("google")) return "Google";
  return String(title || "").split(/\s+/).slice(0, 1).join(" ") || null;
}

function inferModel(title, brand) {
  const value = String(title || "").trim();
  if (!brand) return value;
  return value.replace(new RegExp(`^${brand}\\s+`, "i"), "").trim() || value;
}

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new Database(databasePath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(fs.readFileSync(schemaPath, "utf8"));

const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
const now = new Date().toISOString();

const transaction = db.transaction(() => {
  db.prepare(
    "insert or replace into settings (key, value) values (?, ?)",
  ).run("store_name", seed.store?.name || "Aman Mobile");
  db.prepare(
    "insert or replace into settings (key, value) values (?, ?)",
  ).run(
    "default_currency_code",
    (process.env.DEFAULT_CURRENCY || seed.store?.default_currency_code || "usd").toLowerCase(),
  );

  const insertChannel = db.prepare(`
    insert or ignore into sales_channels (id, name, description, is_disabled, created_at)
    values (?, ?, ?, ?, ?)
  `);
  for (const channel of seed.sales_channels || []) {
    insertChannel.run(
      createEntityId("sc"),
      channel.name,
      channel.description || null,
      channel.is_disabled ? 1 : 0,
      now,
    );
  }

  const countries = [
    ["kr", "South Korea"],
    ["us", "United States"],
    ["gb", "United Kingdom"],
    ["ae", "United Arab Emirates"],
    ["ke", "Kenya"],
    ["et", "Ethiopia"],
  ];
  const insertCountry = db.prepare(
    "insert or ignore into countries (iso_2, display_name) values (?, ?)",
  );
  for (const country of countries) {
    insertCountry.run(country[0], country[1]);
  }

  const existingProducts = db.prepare(
    "select count(*) as count from products where deleted_at is null",
  ).get().count;

  if (existingProducts > 0) {
    return;
  }

  const insertProduct = db.prepare(`
    insert into products (
      id, title, subtitle, description, handle, thumbnail, status,
      brand_name, model_name, color, storage, imei, grading_data,
      battery_health, is_certified_pre_owned, metadata_json, created_at, updated_at
    )
    values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertVariant = db.prepare(`
    insert into product_variants (
      id, product_id, title, inventory_quantity, price_amount,
      currency_code, created_at, updated_at
    )
    values (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const product of seed.products || []) {
    const productId = createEntityId("prod");
    const variant = product.variants?.[0] || {};
    const price = variant.prices?.[0] || {};
    const brandName = inferBrand(product.title);
    const modelName = inferModel(product.title, brandName);
    const metadata = {
      brand_name: brandName,
      model_name: modelName,
      product_profile: null,
      reference_url: null,
      reference_specs: null,
      reference_spec_sections: null,
      spec_facts: {
        color: null,
        storage: null,
        imei: null,
      },
    };

    insertProduct.run(
      productId,
      product.title,
      product.subtitle || null,
      product.description || null,
      product.handle || slugify(product.title),
      product.thumbnail || null,
      "published",
      brandName,
      modelName,
      null,
      null,
      null,
      null,
      null,
      1,
      JSON.stringify(metadata),
      now,
      now,
    );

    insertVariant.run(
      createEntityId("variant"),
      productId,
      variant.title || "Default",
      Number.isFinite(variant.inventory_quantity) ? variant.inventory_quantity : 0,
      Number.isFinite(price.amount) ? price.amount : 0,
      price.currency_code || seed.store?.default_currency_code || "usd",
      now,
      now,
    );
  }
});

transaction();
db.close();

console.log(`SQLite database is ready at ${databasePath}`);
