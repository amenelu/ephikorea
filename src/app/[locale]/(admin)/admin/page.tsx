import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { getAdminDashboardData } from "@/lib/admin-data";

const statIcons = [DollarSign, ShoppingCart, Package, Users];
const statColors = [
  "text-green-600 bg-green-100",
  "text-blue-600 bg-blue-100",
  "text-yellow-600 bg-yellow-100",
  "text-purple-600 bg-purple-100",
];

export default async function AdminDashboardPage() {
  const { stats, recentOrders } = await getAdminDashboardData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">
          Dashboard <span className="text-yellow-500">Overview</span>
        </h1>
        <p className="mt-2 text-gray-500">
          Live store data from the current database.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = statIcons[index];
          const [iconColor, bgColor] = statColors[index].split(" ");

          return (
            <div
              key={stat.label}
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className={`rounded-2xl ${bgColor} p-3`}>
                  <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-black text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <h3 className="mb-6 text-lg font-black uppercase tracking-tight text-gray-900">
          Recent Orders
        </h3>

        {recentOrders.length > 0 ? (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={`${order.id}-${order.date}`}
                className="flex items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-400">
                    #
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{order.id}</p>
                    <p className="text-xs text-gray-400">
                      {order.date} | {order.customer}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{order.total}</p>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${order.statusTone}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-gray-500">
            No orders have been placed yet.
          </div>
        )}
      </div>
    </div>
  );
}
