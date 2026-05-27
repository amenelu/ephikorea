import "server-only";

import { randomUUID } from "crypto";
import {
  sendAdminOrderNotification,
  sendAdminOrderTelegramNotification,
} from "@/lib/email";
import { getDb, parseJsonObject, stringifyJson } from "@/lib/db";

type CheckoutItem = {
  variantId: string;
  quantity: number;
};

function createEntityId(prefix: string) {
  return `${prefix}_${randomUUID().replace(/-/g, "").toUpperCase().slice(0, 26)}`;
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] || null,
    lastName: parts.slice(1).join(" ") || null,
  };
}

async function getDefaultCurrencyCode() {
  const db = await getDb();
  const row = await db
    .prepare("select value from settings where key = 'default_currency_code'")
    .get<{ value: string }>();

  return row?.value?.toLowerCase() || "usd";
}

export async function getCheckoutCountries() {
  const db = await getDb();

  return db
    .prepare(
      `
        select iso_2, display_name
        from countries
        order by
          case when iso_2 in ('kr', 'us', 'gb', 'ae') then 0 else 1 end,
          display_name asc
      `,
    )
    .all<{ iso_2: string; display_name: string }>();
}

async function getOrCreateCustomer(
  db: Awaited<ReturnType<typeof getDb>>,
  input: {
    name: string;
    email: string;
    phone?: string;
    addressSummary: Record<string, unknown>;
    total: number;
  },
) {
  const { firstName, lastName } = splitName(input.name);
  const email = input.email.trim().toLowerCase();
  const phone = input.phone?.trim() || null;
  const latestOrder = {
    submitted_at: new Date().toISOString(),
    total: input.total,
    delivery: input.addressSummary,
  };

  const existingCustomer = await db
    .prepare(
      `
        select id, metadata_json
        from customers
        where lower(email) = ?
          and deleted_at is null
        limit 1
      `,
    )
    .get<{ id: string; metadata_json: string | null }>([email]);

  if (existingCustomer) {
    const metadata = parseJsonObject(existingCustomer.metadata_json) || {};
    const priorCount =
      typeof metadata.checkout_submissions === "number"
        ? metadata.checkout_submissions
        : 0;

    await db.prepare(
      `
        update customers
        set first_name = ?,
            last_name = ?,
            phone = ?,
            metadata_json = ?,
            updated_at = datetime('now')
        where id = ?
      `,
    ).run([
      firstName,
      lastName,
      phone,
      stringifyJson({
        ...metadata,
        checkout_submissions: priorCount + 1,
        latest_checkout: latestOrder,
      }),
      existingCustomer.id,
    ]);

    return existingCustomer.id;
  }

  const customerId = createEntityId("cus");

  await db.prepare(
    `
      insert into customers (
        id, email, first_name, last_name, phone, metadata_json, created_at, updated_at
      )
      values (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `,
  ).run([
    customerId,
    email,
    firstName,
    lastName,
    phone,
    stringifyJson({
      checkout_submissions: 1,
      latest_checkout: latestOrder,
    }),
  ]);

  return customerId;
}

export async function submitGuestOrder(input: {
  name: string;
  email: string;
  phone?: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  postalCode?: string;
  countryCode: string;
  items: CheckoutItem[];
}) {
  const fullName = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone?.trim() || null;
  const address1 = input.address1.trim();
  const address2 = input.address2?.trim() || null;
  const city = input.city.trim();
  const province = input.province?.trim() || null;
  const postalCode = input.postalCode?.trim() || null;
  const countryCode = input.countryCode.trim().toLowerCase();
  const items = input.items
    .filter((item) => item.variantId && item.quantity > 0)
    .map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
    }));

  if (!fullName) throw new Error("Full name is required.");
  if (!email) throw new Error("Email address is required.");
  if (!address1 || !city || !countryCode) {
    throw new Error("Delivery address is incomplete.");
  }
  if (items.length === 0) {
    throw new Error("Add at least one item before placing an order.");
  }

  const db = await getDb();
  const { orderId, notificationPayload } = await db.transaction(async (transactionDb) => {
    const currencyCode = await getDefaultCurrencyCode();
    const country = await transactionDb
      .prepare("select iso_2 from countries where iso_2 = ? limit 1")
      .get<{ iso_2: string }>([countryCode]);

    if (!country) {
      throw new Error("Selected delivery country is not supported.");
    }

    const variantRows = await transactionDb
      .prepare(
        `
          select
            pv.id as variant_id,
            pv.product_id,
            p.title,
            pv.title as variant_title,
            p.thumbnail,
            pv.price_amount as unit_price,
            pv.inventory_quantity
          from product_variants pv
          join products p on p.id = pv.product_id and p.deleted_at is null
          where pv.deleted_at is null
            and pv.id in (${items.map(() => "?").join(",")})
        `,
      )
      .all<{
      variant_id: string;
      product_id: string;
      title: string;
      variant_title: string;
      thumbnail: string | null;
      unit_price: number;
      inventory_quantity: number;
    }>(items.map((item) => item.variantId));

    const variants = new Map(variantRows.map((row) => [row.variant_id, row] as const));
    let total = 0;

    for (const item of items) {
      const variant = variants.get(item.variantId);

      if (!variant) {
        throw new Error("One of the cart items is no longer available.");
      }

      if (variant.inventory_quantity < item.quantity) {
        throw new Error(`Not enough stock for ${variant.title}.`);
      }

      total += variant.unit_price * item.quantity;
    }

    const customerId = await getOrCreateCustomer(transactionDb, {
      name: fullName,
      email,
      phone: phone || undefined,
      addressSummary: {
        address1,
        address2,
        city,
        province,
        postalCode,
        countryCode,
      },
      total,
    });
    const { firstName, lastName } = splitName(fullName);
    const addressId = createEntityId("addr");

    await transactionDb.prepare(
      `
        insert into addresses (
          id, customer_id, first_name, last_name, address_1, address_2,
          city, province, postal_code, country_code, phone, created_at, updated_at
        )
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `,
    ).run([
      addressId,
      customerId,
      firstName,
      lastName,
      address1,
      address2,
      city,
      province,
      postalCode,
      countryCode,
      phone,
    ]);

    const orderId = createEntityId("order");
    const displayRow = await transactionDb
      .prepare("select coalesce(max(display_id), 0) as max_display_id from orders")
      .get<{ max_display_id: number }>();
    const displayId = (displayRow?.max_display_id || 0) + 1;

    await transactionDb.prepare(
      `
        insert into orders (
          id, display_id, customer_id, email, shipping_address_id,
          total_amount, currency_code, metadata_json, created_at, updated_at
        )
        values (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `,
    ).run([
      orderId,
      displayId,
      customerId,
      email,
      addressId,
      total,
      currencyCode,
      stringifyJson({ checkout_source: "guest_checkout" }),
    ]);

    const notificationItems: {
      title: string;
      variantTitle: string | null;
      quantity: number;
      unitPrice: number;
    }[] = [];

    for (const item of items) {
      const variant = variants.get(item.variantId)!;

      notificationItems.push({
        title: variant.title,
        variantTitle: variant.variant_title || null,
        quantity: item.quantity,
        unitPrice: variant.unit_price,
      });

      await transactionDb.prepare(
        `
          insert into order_items (
            id, order_id, product_id, variant_id, title, description,
            thumbnail, unit_price, quantity, created_at
          )
          values (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `,
      ).run([
        createEntityId("item"),
        orderId,
        variant.product_id,
        variant.variant_id,
        variant.title,
        variant.variant_title,
        variant.thumbnail,
        variant.unit_price,
        item.quantity,
      ]);

      await transactionDb.prepare(
        `
          update product_variants
          set inventory_quantity = inventory_quantity - ?,
              updated_at = datetime('now')
          where id = ?
        `,
      ).run([item.quantity, variant.variant_id]);
    }

    return {
      orderId,
      notificationPayload: {
        orderId,
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        deliveryAddress: {
          address1,
          address2,
          city,
          province,
          postalCode,
          countryCode,
        },
        currencyCode,
        total,
        items: notificationItems,
      },
    };
  });

  const [emailResult, telegramResult] = await Promise.allSettled([
    sendAdminOrderNotification(notificationPayload),
    sendAdminOrderTelegramNotification(notificationPayload),
  ]);

  if (emailResult.status === "rejected") {
    console.error(
      "Unable to send admin order notification email.",
      emailResult.reason,
    );
  }

  if (telegramResult.status === "rejected") {
    console.error(
      "Unable to send admin Telegram order notification.",
      telegramResult.reason,
    );
  }

  return orderId;
}
