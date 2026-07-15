import { DollarSign, Percent, ReceiptText, TrendingUp } from "lucide-react";

import { AdminToast } from "@/components/admin/admin-toast";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { EXPENSE_CATEGORIES, getAdminFinanceData } from "@/lib/finance-data";
import { addFinanceExpenseAction, deleteFinanceExpenseAction } from "./actions";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

const statIcons = [
  DollarSign,
  DollarSign,
  ReceiptText,
  TrendingUp,
  ReceiptText,
  TrendingUp,
  Percent,
  DollarSign,
];

export default async function AdminFinancePage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { status?: string; message?: string };
}) {
  await requireAdminPageAccess(locale);

  const finance = await getAdminFinanceData();

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900 sm:text-3xl">
            Finance <span className="text-yellow-500">Management</span>
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
            Track sales, product costs, gross profit, and operating expenses.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
            Orders counted
          </p>
          <p className="mt-1 text-lg font-black text-gray-900">
            {finance.summary.orderCount}
          </p>
        </div>
      </div>

      <AdminToast status={searchParams.status} message={searchParams.message} />

      {finance.errorMessage ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-900 sm:p-5">
          <span className="font-black">Finance warning:</span>{" "}
          {finance.errorMessage}
        </div>
      ) : null}

      {finance.summary.missingCostItems > 0 ? (
        <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-6 text-yellow-900 sm:p-5">
          <span className="font-black">Cost data missing:</span>{" "}
          {finance.summary.missingCostItems} sold item
          {finance.summary.missingCostItems === 1 ? "" : "s"} do not have
          product cost values yet, so profit is estimated.
        </div>
      ) : null}

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {finance.stats.map((stat, index) => {
          const Icon = statIcons[index] || DollarSign;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                {stat.label}
              </p>
              <p className="mt-1 text-lg font-black text-gray-900">
                {stat.value}
              </p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-black uppercase tracking-tight text-gray-900">
            Recent Order Profit
          </h2>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead>
                <tr className="text-left text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                  <th className="py-3 pr-4">Order</th>
                  <th className="py-3 pr-4">Items</th>
                  <th className="py-3 pr-4">Revenue</th>
                  <th className="py-3 pr-4">Cost</th>
                  <th className="py-3 pr-4">Profit</th>
                  <th className="py-3">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {finance.recentOrders.map((order) => (
                  <tr key={order.id} className="align-top">
                    <td className="py-3 pr-4 font-bold text-gray-900">
                      {order.displayId}
                      <span className="block text-xs font-medium text-gray-400">
                        {order.date}
                      </span>
                    </td>
                    <td className="max-w-xs py-3 pr-4 text-gray-600">
                      {order.itemSummary}
                    </td>
                    <td className="py-3 pr-4 font-bold text-gray-900">
                      {order.revenueLabel}
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      {order.costLabel}
                    </td>
                    <td className="py-3 pr-4 font-black text-gray-900">
                      {order.profitLabel}
                    </td>
                    <td className="py-3 text-gray-500">
                      {order.paymentStatus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <form
            action={addFinanceExpenseAction}
            className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
          >
            <input type="hidden" name="locale" value={locale} />
            <h2 className="text-lg font-black uppercase tracking-tight text-gray-900">
              Add Expense
            </h2>
            <div className="mt-5 grid gap-4">
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
                  Date
                </span>
                <input
                  type="date"
                  name="expenseDate"
                  required
                  defaultValue={todayIsoDate()}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-yellow-400"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
                  Category
                </span>
                <select
                  name="category"
                  required
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-yellow-400"
                >
                  {EXPENSE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category.replace(/^\w/, (letter) =>
                        letter.toUpperCase(),
                      )}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
                    Amount
                  </span>
                  <input
                    type="number"
                    name="amount"
                    required
                    min="0"
                    step="0.01"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-yellow-400"
                    placeholder="25.00"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
                    Currency
                  </span>
                  <select
                    name="currencyCode"
                    defaultValue="usd"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-yellow-400"
                  >
                    <option value="usd">USD</option>
                    <option value="krw">KRW</option>
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
                  Note
                </span>
                <input
                  type="text"
                  name="note"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-yellow-400"
                  placeholder="Optional detail"
                />
              </label>
              <button
                type="submit"
                className="rounded-full bg-yellow-500 px-6 py-3 text-sm font-black uppercase tracking-widest text-black transition hover:bg-yellow-400"
              >
                Add Expense
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-black uppercase tracking-tight text-gray-900">
          Expense Tracking
        </h2>
        {finance.expenses.length > 0 ? (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead>
                <tr className="text-left text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                  <th className="py-3 pr-4">Date</th>
                  <th className="py-3 pr-4">Category</th>
                  <th className="py-3 pr-4">Note</th>
                  <th className="py-3 pr-4">Amount</th>
                  <th className="py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {finance.expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="py-3 pr-4 font-medium text-gray-600">
                      {expense.date}
                    </td>
                    <td className="py-3 pr-4 font-bold text-gray-900">
                      {expense.category}
                    </td>
                    <td className="max-w-sm py-3 pr-4 text-gray-500">
                      {expense.note || "N/A"}
                    </td>
                    <td className="py-3 pr-4 font-black text-gray-900">
                      {expense.amount}
                    </td>
                    <td className="py-3">
                      <form action={deleteFinanceExpenseAction}>
                        <input type="hidden" name="locale" value={locale} />
                        <input
                          type="hidden"
                          name="expenseId"
                          value={expense.id}
                        />
                        <button
                          type="submit"
                          className="rounded-full border border-red-200 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-red-600 transition hover:border-red-300 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-5 rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-gray-500">
            No expenses have been added yet.
          </div>
        )}
      </section>
    </div>
  );
}
