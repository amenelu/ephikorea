import { Mail, Phone } from "lucide-react";
import Link from "next/link";
import { getAdminCustomers } from "@/lib/admin-data";

export default async function AdminCustomersPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const customers = await getAdminCustomers();

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900 sm:text-3xl">
          Customer <span className="text-yellow-500">Directory</span>
        </h1>
        <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
          Customer records pulled directly from the database.
        </p>
      </div>

      {customers.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-lg font-black text-yellow-500 shadow-lg">
                {customer.initials}
              </div>

              <h3 className="text-lg font-black text-gray-900 sm:text-xl">
                {customer.name}
              </h3>
              <p className="mb-6 break-all text-sm font-medium text-gray-400">
                {customer.email}
              </p>
              {customer.phone ? (
                <p className="mb-6 text-sm font-medium text-gray-400">
                  {customer.phone}
                </p>
              ) : null}

              <div className="grid grid-cols-2 gap-3 border-t border-gray-50 pt-6 sm:gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Orders
                  </p>
                  <p className="text-lg font-black text-gray-900">
                    {customer.orders}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Checkout Requests
                  </p>
                  <p className="text-lg font-black text-gray-900">
                    {customer.checkoutSubmissions}
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
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Last Checkout
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {customer.lastCheckout}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-50 pt-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Purchase History
                  </p>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">
                    Last 3 orders
                  </span>
                </div>

                {customer.purchaseHistory.length > 0 ? (
                  <div className="space-y-3">
                    {customer.purchaseHistory.map((order) => (
                      <Link
                        key={order.orderId}
                        href={`/${locale}/admin/orders/${order.orderId}`}
                        className="block rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 transition-colors hover:bg-gray-100"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-bold text-gray-900">
                              {order.displayId}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              {order.date}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-gray-900">
                              {order.total}
                            </p>
                            <span
                              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${order.statusTone}`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-500">
                    No purchase history yet.
                  </div>
                )}
              </div>

              <div className="mt-6 grid gap-3">
                <a
                  href={`mailto:${customer.email}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-50 py-3 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-100"
                >
                  <Mail className="h-3 w-3" /> Email Customer
                </a>
                {customer.phone ? (
                  <a
                    href={`tel:${customer.phone}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-50 py-3 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-100"
                  >
                    <Phone className="h-3 w-3" /> Call Customer
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm leading-6 text-gray-500 sm:p-12 sm:text-base">
          No customers have been created yet.
        </div>
      )}
    </div>
  );
}
