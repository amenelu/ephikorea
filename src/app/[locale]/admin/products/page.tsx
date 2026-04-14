"use client";

// import { useAdminProducts } from "medusa-react";
import { Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";

export default function AdminProductsPage() {
  // Mock data for demo purposes - bypasses backend requirement
  // const { products, isLoading } = useAdminProducts();

  const products = [
    {
      id: "1",
      title: "Ultra Wireless",
      handle: "aman-mobile-ultra-wireless",
      status: "published",
      thumbnail: null,
      variants: [{ inventory_quantity: 100 }],
    },
    {
      id: "2",
      title: "Series 5 Smart Watch",
      handle: "series-5-smart-watch",
      status: "published",
      thumbnail: null,
      variants: [{ inventory_quantity: 50 }],
    },
    {
      id: "3",
      title: "Pro Laptop 14 M3",
      handle: "pro-laptop-14-m3",
      status: "published",
      thumbnail: null,
      variants: [{ inventory_quantity: 25 }],
    },
  ];

  const isLoading = false;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        Loading products...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">
            Inventory <span className="text-yellow-500">Management</span>
          </h1>
          <p className="mt-2 text-gray-500">
            View and update your product collection.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95">
          <Plus className="h-4 w-4 text-yellow-500" />
          New Product
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="border-b border-gray-100 bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                Product
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                Status
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                Inventory
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products?.map((product) => (
              <tr
                key={product.id}
                className="group hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl shadow-inner">
                      {product.thumbnail ? (
                        <img
                          src={product.thumbnail}
                          alt=""
                          className="rounded-xl"
                        />
                      ) : (
                        "📦"
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{product.title}</p>
                      <p className="text-xs text-gray-400">{product.handle}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 uppercase">
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-gray-600">
                  {product.variants.reduce(
                    (acc, v) => acc + (v.inventory_quantity || 0),
                    0,
                  )}{" "}
                  in stock
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-gray-400 hover:text-black transition-colors">
                    <Edit className="h-4 w-4" />
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
