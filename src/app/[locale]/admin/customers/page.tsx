"use client";

import { Mail, MoreVertical } from "lucide-react";

export default function AdminCustomersPage() {
  const customers = [
    {
      name: "Kim Min-su",
      email: "minsu.kim@example.com",
      orders: 12,
      spent: "$4,250.00",
      initials: "KM",
    },
    {
      name: "Lee Sae-rom",
      email: "saerom.lee@example.com",
      orders: 5,
      spent: "$1,120.00",
      initials: "LS",
    },
    {
      name: "Park Ji-won",
      email: "jiwon.park@example.com",
      orders: 8,
      spent: "$2,890.00",
      initials: "PJ",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">
          Customer <span className="text-yellow-500">Directory</span>
        </h1>
        <p className="mt-2 text-gray-500">
          Manage your relationships and view customer data.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {customers.map((customer) => (
          <div
            key={customer.email}
            className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="h-14 w-14 rounded-2xl bg-black flex items-center justify-center text-lg font-black text-yellow-500 shadow-lg">
                {customer.initials}
              </div>
              <button className="text-gray-400 hover:text-black">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>

            <h3 className="text-xl font-black text-gray-900">
              {customer.name}
            </h3>
            <p className="text-sm font-medium text-gray-400 mb-6">
              {customer.email}
            </p>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Total Orders
                </p>
                <p className="text-lg font-black text-gray-900">
                  {customer.orders}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Total Spent
                </p>
                <p className="text-lg font-black text-gray-900">
                  {customer.spent}
                </p>
              </div>
            </div>

            <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-50 py-3 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors">
              <Mail className="h-3 w-3" /> Send Message
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
