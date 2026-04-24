import { Bell, CreditCard, Globe } from "lucide-react";
import { getAdminSettingsData } from "@/lib/admin-data";

export default async function AdminSettingsPage() {
  const { store, salesChannels, productCount } = await getAdminSettingsData();

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900 sm:text-3xl">
          Store <span className="text-yellow-500">Settings</span>
        </h1>
        <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
          Store configuration currently saved in the database.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
        <div className="space-y-6 sm:space-y-8 lg:col-span-2">
          <section className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-8">
            <div className="mb-8 flex items-center gap-3">
              <Globe className="h-5 w-5 text-yellow-500" />
              <h3 className="text-base font-black uppercase tracking-tight sm:text-lg">
                General Information
              </h3>
            </div>

            {store ? (
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Store Name
                  </p>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-900">
                    {store.name || "Unnamed Store"}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Default Currency
                  </p>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold uppercase text-gray-900">
                    {store.default_currency_code || "N/A"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
                No store row is available in the database.
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-8">
            <div className="mb-8 flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-yellow-500" />
              <h3 className="text-base font-black uppercase tracking-tight sm:text-lg">
                Sales Channels
              </h3>
            </div>

            {salesChannels.length > 0 ? (
              <div className="space-y-4">
                {salesChannels.map((channel) => (
                  <div
                    key={channel.id}
                    className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-black text-gray-900">{channel.name}</p>
                      <p className="break-words text-xs text-gray-400">
                        {channel.description || "No description"}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
                        channel.is_disabled
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {channel.is_disabled ? "Disabled" : "Active"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
                No sales channels are configured yet.
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6 sm:space-y-8">
          <div className="rounded-3xl bg-black p-6 text-white shadow-2xl sm:p-8">
            <Bell className="mb-6 h-8 w-8 text-yellow-500" />
            <h4 className="mb-2 text-xl font-black uppercase tracking-tighter">
              Platform Snapshot
            </h4>
            <p className="mb-6 text-sm leading-relaxed text-gray-400">
              {productCount} product{productCount === 1 ? "" : "s"} currently
              available in the database.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-green-400">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Database Connected
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
