import "server-only";

type OrderNotificationItem = {
  title: string;
  variantTitle: string | null;
  quantity: number;
  unitPrice: number;
};

export type AdminOrderNotification = {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  deliveryAddress: {
    address1: string;
    address2: string | null;
    city: string;
    province: string | null;
    postalCode: string | null;
    countryCode: string;
  };
  currencyCode: string;
  total: number;
  items: OrderNotificationItem[];
};

function getAdminNotificationEmail() {
  return (
    process.env.ADMIN_ORDER_NOTIFICATION_EMAIL?.trim() ||
    process.env.ADMIN_EMAIL?.trim() ||
    ""
  );
}

function getSenderEmail() {
  return process.env.ORDER_NOTIFICATION_FROM_EMAIL?.trim() || "";
}

function getTelegramBotToken() {
  return process.env.TELEGRAM_BOT_TOKEN?.trim() || "";
}

function getTelegramChatId() {
  return process.env.TELEGRAM_CHAT_ID?.trim() || "";
}

function formatAmount(amount: number, currencyCode: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
  }).format(amount / 100);
}

function formatAddress(order: AdminOrderNotification) {
  const { deliveryAddress } = order;

  return [
    deliveryAddress.address1,
    deliveryAddress.address2,
    [deliveryAddress.city, deliveryAddress.province].filter(Boolean).join(", "),
    [deliveryAddress.postalCode, deliveryAddress.countryCode.toUpperCase()]
      .filter(Boolean)
      .join(" "),
  ]
    .filter(Boolean)
    .join("\n");
}

function formatCompactAddress(order: AdminOrderNotification) {
  const { deliveryAddress } = order;

  return [
    deliveryAddress.address1,
    deliveryAddress.address2,
    deliveryAddress.city,
    deliveryAddress.province,
    deliveryAddress.postalCode,
    deliveryAddress.countryCode.toUpperCase(),
  ]
    .filter(Boolean)
    .join(", ");
}

function formatOrderReference(orderId: string) {
  const normalized = orderId.replace(/^order_/i, "");

  if (normalized.length <= 10) {
    return normalized;
  }

  return normalized.slice(-10);
}

function humanizeTitle(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map((part) =>
      part.length <= 3 && /\d/.test(part)
        ? part.toUpperCase()
        : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(" ");
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

function buildTextEmail(order: AdminOrderNotification) {
  const itemLines = order.items
    .map((item) => {
      const variant = item.variantTitle ? ` (${item.variantTitle})` : "";
      const lineTotal = item.unitPrice * item.quantity;

      return `- ${item.title}${variant} x ${item.quantity}: ${formatAmount(
        lineTotal,
        order.currencyCode,
      )}`;
    })
    .join("\n");

  return [
    "A new order has arrived.",
    "",
    `Order: ${order.orderId}`,
    `Customer: ${order.customerName}`,
    `Email: ${order.customerEmail}`,
    `Phone: ${order.customerPhone || "Not provided"}`,
    `Total: ${formatAmount(order.total, order.currencyCode)}`,
    "",
    "Items:",
    itemLines,
    "",
    "Delivery address:",
    formatAddress(order),
  ].join("\n");
}

function buildHtmlEmail(order: AdminOrderNotification) {
  const items = order.items
    .map((item) => {
      const variant = item.variantTitle ? ` (${item.variantTitle})` : "";
      const lineTotal = item.unitPrice * item.quantity;

      return `<li><strong>${escapeHtml(item.title + variant)}</strong> x ${
        item.quantity
      } - ${escapeHtml(formatAmount(lineTotal, order.currencyCode))}</li>`;
    })
    .join("");
  const address = escapeHtml(formatAddress(order)).replace(/\n/g, "<br />");

  return `
    <h1>New order received</h1>
    <p><strong>Order:</strong> ${escapeHtml(order.orderId)}</p>
    <p><strong>Customer:</strong> ${escapeHtml(order.customerName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(order.customerEmail)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(
      order.customerPhone || "Not provided",
    )}</p>
    <p><strong>Total:</strong> ${escapeHtml(
      formatAmount(order.total, order.currencyCode),
    )}</p>
    <h2>Items</h2>
    <ul>${items}</ul>
    <h2>Delivery address</h2>
    <p>${address}</p>
  `;
}

function buildTelegramMessage(order: AdminOrderNotification) {
  const itemLines = order.items
    .map((item) => {
      const variant =
        item.variantTitle && item.variantTitle.toLowerCase() !== "default"
          ? `, ${item.variantTitle}`
          : "";

      return `- ${humanizeTitle(item.title)} x${item.quantity}${variant}`;
    })
    .join("\n");

  const address = formatCompactAddress(order);
  const contactLine =
    order.customerPhone?.trim() || order.customerEmail
      ? `Contact: ${order.customerPhone?.trim() || order.customerEmail}`
      : null;

  return [
    "New order",
    "",
    `Ref: ${formatOrderReference(order.orderId)}`,
    `Customer: ${order.customerName}`,
    contactLine,
    `Total: ${formatAmount(order.total, order.currencyCode)}`,
    "",
    "Items:",
    itemLines,
    "",
    "Delivery:",
    address,
  ]
    .filter(Boolean)
    .join("\n");
}

async function sleep(milliseconds: number) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function sendAdminOrderTelegramNotification(
  order: AdminOrderNotification,
) {
  const botToken = getTelegramBotToken();
  const chatId = getTelegramChatId();

  if (!botToken || !chatId) {
    console.info(
      "Telegram order notification skipped. Configure TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID.",
    );
    return;
  }

  const telegramEndpoint = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const telegramBody = JSON.stringify({
    chat_id: chatId,
    text: buildTelegramMessage(order),
    disable_web_page_preview: true,
  });
  const timeouts = [15_000, 25_000];
  let lastError: unknown;

  for (let attempt = 0; attempt < timeouts.length; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeouts[attempt]);

    try {
      const response = await fetch(telegramEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: telegramBody,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Telegram sendMessage failed: ${response.status} ${body}`);
      }

      console.info(
        `Admin order notification sent to Telegram on attempt ${attempt + 1}.`,
      );
      return;
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;

      if (attempt < timeouts.length - 1) {
        console.warn(
          `Telegram send attempt ${attempt + 1} failed. Retrying...`,
          error,
        );
        await sleep(1500);
      }
    }
  }

  throw new Error(
    `Telegram notification failed after ${timeouts.length} attempts: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`,
  );
}

export async function sendAdminOrderNotification(
  order: AdminOrderNotification,
) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = getSenderEmail();
  const to = getAdminNotificationEmail();

  if (!apiKey || !from || !to) {
    console.info(
      "Order notification email skipped. Configure RESEND_API_KEY, ORDER_NOTIFICATION_FROM_EMAIL, and ADMIN_ORDER_NOTIFICATION_EMAIL or ADMIN_EMAIL.",
    );
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: `New order received: ${order.orderId}`,
      text: buildTextEmail(order),
      html: buildHtmlEmail(order),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend email request failed: ${response.status} ${body}`);
  }

  const body = (await response.json()) as { id?: string };
  console.info(
    `Admin order notification email accepted by Resend${body.id ? `: ${body.id}` : "."}`,
  );
}
