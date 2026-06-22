import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";
import { AdminLiveSearch } from "@/components/admin/admin-live-search";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { getAdminDashboardData } from "@/lib/admin-data";

const statIcons = [DollarSign, ShoppingCart, Package, Users];
const statColors = [
  "text-green-600 bg-green-100",
  "text-blue-600 bg-blue-100",
  "text-yellow-600 bg-yellow-100",
  "text-purple-600 bg-purple-100",
];
const notificationStyles = {
  green: {
    icon: CheckCircle2,
    iconClass: "bg-green-100 text-green-600",
    borderClass: "border-green-100",
  },
  red: {
    icon: AlertTriangle,
    iconClass: "bg-red-100 text-red-600",
    borderClass: "border-red-100",
  },
  yellow: {
    icon: Bell,
    iconClass: "bg-yellow-100 text-yellow-700",
    borderClass: "border-yellow-100",
  },
};

export default async function AdminDashboardPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { q?: string };
}) {
  await requireAdminPageAccess(locale);

  const { stats, recentOrders, notifications } = await getAdminDashboardData();
  const query = searchParams.q?.trim().toLowerCase() || "";
  const filteredOrders = query
    ? recentOrders.filter((order) =>
        [
          order.id,
          order.customer,
          order.date,
          order.total,
          order.status,
          order.productSummary,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
    : recentOrders;
  const filteredNotifications = query
    ? notifications.filter((notification) =>
        [notification.title, notification.body, notification.action]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
    : notifications;

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden sm:space-y-8">
      <div className="min-w-0">
        <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900 sm:text-3xl">
          Dashboard <span className="text-yellow-500">Overview</span>
        </h1>
        <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
          Live store data from the current database.
        </p>
      </div>

      <div className="grid min-w-0 grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = statIcons[index];
          const [iconColor, bgColor] = statColors[index].split(" ");

          return (
            <div
              key={stat.label}
              className="min-w-0 rounded-2xl border border-gray-200 bg-white p-2.5 shadow-sm sm:p-3"
            >
              <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                <div className={`shrink-0 rounded-xl ${bgColor} p-2 sm:p-2.5`}>
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${iconColor}`} />
                </div>
                <div className="min-w-0">
                  <p className="break-words text-[9px] font-medium uppercase tracking-[0.06em] text-gray-500 sm:text-xs sm:tracking-[0.1em]">
                    {stat.label}
                  </p>
                  <p className="break-words text-sm font-black text-gray-900 sm:text-lg">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid min-w-0 gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <aside className="order-1 min-w-0 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 xl:order-2">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-black uppercase tracking-tight text-gray-900">
              Notifications
            </h3>
            <div className="rounded-full bg-gray-100 p-2 text-gray-500">
              <Bell className="h-4 w-4" />
            </div>
          </div>

          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const style =
                notificationStyles[
                  notification.tone as keyof typeof notificationStyles
                ] || notificationStyles.yellow;
              const Icon = style.icon;

              return (
                <div
                  key={notification.id}
                  className={`min-w-0 rounded-2xl border ${style.borderClass} bg-gray-50/60 p-4`}
                >
                  <div className="flex min-w-0 gap-3">
                    <div className={`h-fit rounded-xl p-2 ${style.iconClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="break-words font-bold text-gray-900">
                        {notification.title}
                      </p>
                      <p className="mt-1 break-words text-sm leading-6 text-gray-500">
                        {notification.body}
                      </p>
                      <Link
                        href={`/${locale}${notification.href}`}
                        className="mt-3 inline-flex max-w-full items-center rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-gray-700 transition hover:border-gray-300 hover:text-gray-900"
                      >
                        <span className="truncate">{notification.action}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredNotifications.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
                No notifications matched your search.
              </div>
            ) : null}
          </div>
        </aside>

        <div className="order-2 min-w-0 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-8 xl:order-1">
          <div className="mb-5 sm:mb-6">
            <AdminLiveSearch
              defaultValue={searchParams.q || ""}
              placeholder="Search orders..."
              className="min-w-0 w-full sm:max-w-sm"
            />
          </div>
          <h3 className="mb-5 text-lg font-black uppercase tracking-tight text-gray-900 sm:mb-6">
            Recent Orders
          </h3>

          {filteredOrders.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={`${order.id}-${order.date}`}
                  className="flex min-w-0 flex-col gap-3 border-b border-gray-50 pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-400">
                      #
                    </div>
                    <div className="min-w-0">
                      <p className="break-words font-black text-gray-900 sm:truncate">
                        {order.productSummary}
                      </p>
                      <p className="mt-1 break-all text-xs uppercase tracking-[0.1em] text-gray-400 sm:tracking-[0.14em]">
                        {order.id}
                      </p>
                      <p className="break-words text-xs text-gray-400">
                        {order.date} <span aria-hidden="true">|</span> {order.customer}
                      </p>
                    </div>
                  </div>
                  <div className="min-w-0 sm:text-right">
                    <p className="font-bold text-gray-900">{order.total}</p>
                    <span
                      className={`inline-block max-w-full rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${order.statusTone}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-gray-500">
              {query ? "No dashboard orders matched your search." : "No orders have been placed yet."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
