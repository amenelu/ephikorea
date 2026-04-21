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
