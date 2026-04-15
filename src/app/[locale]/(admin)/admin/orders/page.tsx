import { Search } from "lucide-react";
import { getAdminOrders } from "@/lib/admin-data";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q?.trim() || "";
  const orders = await getAdminOrders(query);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">
            Order <span className="text-yellow-500">Management</span>
          </h1>
          <p className="mt-2 text-gray-500">
            Track and manage orders stored in the database.
          </p>
        </div>
        <form className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search orders..."
            className="rounded-full border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-yellow-500/20"
          />
        </form>
      </div>

      {orders.length > 0 ? (
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left">
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr
                  key={`${order.id}-${order.date}`}
                  className="transition-colors hover:bg-gray-50/50"
                >
                  <td className="px-6 py-4 font-bold text-gray-900">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-600">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {order.date}
                  </td>
                  <td className="px-6 py-4 font-black text-gray-900">
                    {order.total}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${order.statusTone}`}
                    >
                      {order.status}
                    </span>
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
