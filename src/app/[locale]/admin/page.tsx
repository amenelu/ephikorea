"use client";

import { ShoppingCart, Package, Users, DollarSign } from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    {
      label: "Total Revenue",
      value: "$12,450.00",
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "Orders",
      value: "48",
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Products",
      value: "9",
      icon: Package,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    {
      label: "Customers",
      value: "124",
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">
          Dashboard <span className="text-yellow-500">Overview</span>
        </h1>
        <p className="mt-2 text-gray-500">
          Welcome back to the management console.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={`rounded-2xl ${stat.bg} p-3`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
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
        ))}
      </div>

      {/* Recent Activity Mockup */}
      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 mb-6">
          Recent Orders (Demo)
        </h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-400">
                  #
                </div>
                <div>
                  <p className="font-bold text-gray-900">Order #100{i}</p>
                  <p className="text-xs text-gray-400">
                    2 minutes ago • Ultra Wireless
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">$350.00</p>
                <span className="inline-block rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-bold text-yellow-700 uppercase">
                  Processing
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
