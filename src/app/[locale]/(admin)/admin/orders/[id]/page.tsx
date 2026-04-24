import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { AdminToast } from "@/components/admin/admin-toast";
import { getAdminOrderDetails } from "@/lib/admin-data";
import { canUseNextImage, isLikelyImageUrl } from "@/lib/media";
import { completeOrderAction } from "./actions";

export default async function AdminOrderDetailsPage({
  params: { locale, id },
  searchParams,
}: {
  params: { locale: string; id: string };
  searchParams: { status?: string; message?: string };
}) {
  const order = await getAdminOrderDetails(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <Link
          href={`/${locale}/admin/orders`}
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 transition-colors hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </Link>
      </div>
      <AdminToast status={searchParams.status} message={searchParams.message} />

      <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900 sm:text-3xl">
              Order <span className="text-yellow-500">{order.displayId}</span>
            </h1>
            <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
              Placed {order.date} by {order.customer.name}
            </p>
          </div>
          <div className="w-full sm:w-auto sm:text-right">
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <span
                className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${order.statusTone}`}
              >
                {order.status}
              </span>
              <span
                className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${order.paymentStatusTone}`}
              >
                {order.paymentStatus === "captured" || order.paymentStatus === "paid"
                  ? "Paid"
                  : "Not Paid"}
              </span>
            </div>
            <p className="mt-3 text-2xl font-black text-gray-900">
              {order.total}
            </p>
            {order.status !== "completed" ? (
              <form action={completeOrderAction} className="mt-4">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="orderId" value={order.orderId} />
                <button
                  type="submit"
                  className="w-full rounded-full bg-black px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-gray-800 sm:w-auto"
                >
                  Mark as Completed
                </button>
              </form>
            ) : (
              <p className="mt-4 text-xs font-black uppercase tracking-widest text-green-600">
                Completed
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-8">
          <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">
            Ordered Products
          </h2>
          <div className="mt-5 space-y-4 sm:mt-6">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-2xl border border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-100 text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                    {item.thumbnail && isLikelyImageUrl(item.thumbnail) ? (
                      canUseNextImage(item.thumbnail) ? (
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      )
                    ) : (
                      "PKG"
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900">{item.title}</p>
                    <p className="break-words text-sm text-gray-500">{item.description}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-widest text-gray-400">
                      Qty {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="sm:text-right">
                  <p className="text-sm font-bold text-gray-500">
                    {item.unitPrice} each
                  </p>
                  <p className="text-lg font-black text-gray-900">
                    {item.lineTotal}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-6 sm:space-y-8">
          <section className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-8">
            <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">
              Buyer Details
            </h2>
            <div className="mt-6 space-y-4 text-sm">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Name
                </p>
                <p className="mt-1 font-bold text-gray-900">{order.customer.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Email
                </p>
                <p className="mt-1 break-all font-bold text-gray-900">{order.customer.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Phone
                </p>
                <p className="mt-1 font-bold text-gray-900">{order.customer.phone}</p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-8">
            <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">
              Delivery Details
            </h2>
            <div className="mt-6 space-y-4 text-sm">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Recipient
                </p>
                <p className="mt-1 font-bold text-gray-900">{order.delivery.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Address
                </p>
                <p className="mt-1 font-bold text-gray-900">{order.delivery.address1}</p>
                {order.delivery.address2 ? (
                  <p className="mt-1 font-bold text-gray-900">{order.delivery.address2}</p>
                ) : null}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  City / Region
                </p>
                <p className="mt-1 font-bold text-gray-900">
                  {[order.delivery.city, order.delivery.province]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Postal / Country
                </p>
                <p className="mt-1 font-bold text-gray-900">
                  {[order.delivery.postalCode, order.delivery.countryCode]
                    .filter(Boolean)
                    .join(" ")}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Delivery Phone
                </p>
                <p className="mt-1 font-bold text-gray-900">{order.delivery.phone}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
