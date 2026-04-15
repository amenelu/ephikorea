import { Mail } from "lucide-react";
import { getAdminCustomers } from "@/lib/admin-data";

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomers();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">
          Customer <span className="text-yellow-500">Directory</span>
        </h1>
        <p className="mt-2 text-gray-500">
          Customer records pulled directly from the database.
        </p>
      </div>

      {customers.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-lg font-black text-yellow-500 shadow-lg">
                {customer.initials}
              </div>

              <h3 className="text-xl font-black text-gray-900">
                {customer.name}
              </h3>
              <p className="mb-6 text-sm font-medium text-gray-400">
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

              <a
                href={`mailto:${customer.email}`}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-50 py-3 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-100"
              >
                <Mail className="h-3 w-3" /> Email Customer
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center text-gray-500">
          No customers have been created yet.
        </div>
      )}
    </div>
  );
}
