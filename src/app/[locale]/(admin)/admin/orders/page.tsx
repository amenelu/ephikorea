import Link from "next/link";
import { AdminToast } from "@/components/admin/admin-toast";
import { AdminLiveSearch } from "@/components/admin/admin-live-search";
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
  const paidOrders = orders.filter(
    (order) => order.paymentStatus === "captured" || order.paymentStatus === "paid",
  ).length;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900 sm:text-3xl">
            Order <span className="text-yellow-500">Management</span>
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
            Track and manage orders stored in the database.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                Orders
              </p>
              <p className="mt-1 text-lg font-black text-gray-900">{orders.length}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                Paid
              </p>
              <p className="mt-1 text-lg font-black text-gray-900">{paidOrders}</p>
            </div>
          </div>
          <AdminLiveSearch
            defaultValue={query}
            placeholder="Search orders..."
            className="w-full sm:w-64"
          />
        </div>
      </div>
      <AdminToast status={searchParams.status} message={searchParams.message} />

      {orders.length > 0 ? (
        <>
          <div className="grid gap-4 md:hidden">
            {orders.map((order) => (
              <section
                key={`${order.orderId}-${order.date}`}
                className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/${locale}/admin/orders/${order.orderId}`}
                      className="text-base font-black text-gray-900"
                    >
                      {order.productSummary}
                    </Link>
                    <p className="mt-1 text-sm font-medium text-gray-500">
                      {order.customer}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-gray-400">
                      {order.id}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-gray-400">
                      {order.date}
                    </p>
                  </div>
                  <p className="text-lg font-black text-gray-900">{order.total}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${order.statusTone}`}
                  >
                    {order.status}
                  </span>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${order.paymentStatusTone}`}
                  >
                    {order.paymentStatus === "captured" || order.paymentStatus === "paid"
                      ? "Paid"
                      : "Not Paid"}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Link
                    href={`/${locale}/admin/orders/${order.orderId}`}
                    className="flex items-center justify-center rounded-full border border-gray-200 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.14em] text-gray-700 transition hover:bg-gray-50"
                  >
                    View Order
                  </Link>
                  <form action={toggleOrderPaymentStatusAction}>
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="orderId" value={order.orderId} />
                    <button
                      type="submit"
                      className="w-full rounded-full border border-gray-200 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.14em] text-gray-700 transition hover:bg-gray-50"
                    >
                      {order.paymentStatus === "captured" || order.paymentStatus === "paid"
                        ? "Mark as Not Paid"
                        : "Mark as Paid"}
                    </button>
                  </form>
                </div>
              </section>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-3xl border border-gray-200 bg-white shadow-sm md:block">
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
                      <span className="block font-black text-gray-900">
                        {order.productSummary}
                      </span>
                      <span className="mt-1 block text-xs uppercase tracking-[0.14em] text-gray-400">
                        {order.id}
                      </span>
                    </Link>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-600">
                    <Link
                      href={`/${locale}/admin/orders/${order.orderId}`}
                      className="block"
                    >
                      <span className="block font-medium text-gray-700">
                        {order.customer}
                      </span>
                      <span className="mt-1 block text-xs text-gray-400">
                        {order.date}
                      </span>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <Link
                      href={`/${locale}/admin/orders/${order.orderId}`}
                      className="block"
                    >
                      {order.customer}
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
        </>
      ) : (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm leading-6 text-gray-500 sm:p-12 sm:text-base">
          {query
            ? "No orders matched your search."
            : "No orders are in the database yet."}
        </div>
      )}
    </div>
  );
}
