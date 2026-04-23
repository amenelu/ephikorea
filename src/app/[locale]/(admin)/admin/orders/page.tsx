import Link from "next/link";
import { Search } from "lucide-react";
import { getAdminOrders } from "@/lib/admin-data";
import { toggleOrderPaymentStatusAction } from "./actions";

export default async function AdminOrdersPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { q?: string; status?: string; message?: string };
}) {
  const query = searchParams.q?.trim() || "";
  const orders = await getAdminOrders(query);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900 sm:text-3xl">
            Order <span className="text-yellow-500">Management</span>
          </h1>
          <p className="mt-2 text-gray-500">
            Track and manage orders stored in the database.
          </p>
        </div>
        <form className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search orders..."
            className="w-full rounded-full border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-yellow-500/20 sm:w-64"
          />
        </form>
      </div>

      {searchParams.message ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
            searchParams.status === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {searchParams.message}
        </div>
      ) : null}

      {orders.length > 0 ? (
        <div className="overflow-x-auto rounded-3xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-[920px] w-full text-left">
            <thead className="border-b border-gray-100 bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Order
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Customer
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Date
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Total
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Status
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Payment
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr
                  key={`${order.orderId}-${order.date}`}
                  className="transition-colors hover:bg-gray-50/50"
                >
                  <td className="px-6 py-4 font-bold text-gray-900">
                    <Link
                      href={`/${locale}/admin/orders/${order.orderId}`}
                      className="block"
                    >
                      {order.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-600">
                    <Link
                      href={`/${locale}/admin/orders/${order.orderId}`}
                      className="block"
                    >
                      {order.customer}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <Link
                      href={`/${locale}/admin/orders/${order.orderId}`}
                      className="block"
                    >
                      {order.date}
                    </Link>
                  </td>
                  <td className="px-6 py-4 font-black text-gray-900">
                    <Link
                      href={`/${locale}/admin/orders/${order.orderId}`}
                      className="block"
                    >
                      {order.total}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/${locale}/admin/orders/${order.orderId}`}
                      className="block"
                    >
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${order.statusTone}`}
                      >
                        {order.status}
                      </span>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${order.paymentStatusTone}`}
                      >
                        {order.paymentStatus === "captured" || order.paymentStatus === "paid"
                          ? "Paid"
                          : "Not Paid"}
                      </span>
                      <form action={toggleOrderPaymentStatusAction}>
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="orderId" value={order.orderId} />
                        <button
                          type="submit"
                          className="rounded-full border border-gray-200 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-gray-700 transition hover:bg-gray-50"
                        >
                          {order.paymentStatus === "captured" || order.paymentStatus === "paid"
                            ? "Mark as Not Paid"
                            : "Mark as Paid"}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center text-gray-500">
          {query
            ? "No orders matched your search."
            : "No orders are in the database yet."}
        </div>
      )}
    </div>
  );
}
