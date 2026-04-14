"use client";

import { Eye, Search, Filter } from "lucide-react";

export default function AdminOrdersPage() {
  const orders = [
    {
      id: "#1001",
      customer: "Kim Min-su",
      date: "Oct 24, 2023",
      total: "$350.00",
      status: "Processing",
      statusColor: "text-yellow-700 bg-yellow-100",
    },
    {
      id: "#1002",
      customer: "Lee Sae-rom",
      date: "Oct 23, 2023",
      total: "$450.00",
      status: "Delivered",
      statusColor: "text-green-700 bg-green-100",
    },
    {
      id: "#1003",
      customer: "Park Ji-won",
      date: "Oct 22, 2023",
      total: "$1,350.00",
      status: "Shipped",
      statusColor: "text-blue-700 bg-blue-100",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">
            Order <span className="text-yellow-500">Management</span>
          </h1>
          <p className="mt-2 text-gray-500">
            Track and manage customer orders.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              className="rounded-full border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-yellow-500/20"
            />
          </div>
        </div>
      </div>

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
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="group hover:bg-gray-50/50 transition-colors"
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
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${order.statusColor}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-gray-400 hover:text-black transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
