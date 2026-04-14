"use client";

import { Save, Globe, CreditCard, Bell } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">
            Store <span className="text-yellow-500">Settings</span>
          </h1>
          <p className="mt-2 text-gray-500">
            Configure your platform preferences.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95">
          <Save className="h-4 w-4 text-yellow-500" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* General Section */}
          <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <Globe className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-black uppercase tracking-tight">
                General Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Store Name
                </label>
                <input
                  type="text"
                  placeholder="Store Name"
                  className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-yellow-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Contact Email
                </label>
                <input
                  type="email"
                  placeholder="admin@example.com"
                  className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-yellow-500/20"
                />
              </div>
            </div>
          </section>

          {/* Payment Section */}
          <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <CreditCard className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-black uppercase tracking-tight">
                Payments & Currency
              </h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div>
                  <p className="font-black text-gray-900">Cash on Delivery</p>
                  <p className="text-xs text-gray-400">
                    Enable local delivery cash collection
                  </p>
                </div>
                <div className="h-6 w-11 rounded-full bg-yellow-500 relative">
                  <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm" />
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-8">
          <div className="rounded-3xl bg-black p-8 text-white shadow-2xl">
            <Bell className="h-8 w-8 text-yellow-500 mb-6" />
            <h4 className="text-xl font-black uppercase tracking-tighter mb-2">
              Platform Status
            </h4>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              System is running optimally. All local delivery zones in Seoul are
              active.
            </p>
            <div className="flex items-center gap-2 text-green-400 text-xs font-bold uppercase tracking-widest">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />{" "}
              Operational
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
