import Image from "next/image";
import { canUseNextImage, isLikelyImageUrl } from "@/lib/media";
import { getAdminProducts } from "@/lib/admin-data";
import {
  addProductAction,
  removeProductAction,
  updateProductAction,
} from "./actions";
import ProductFormFields from "./product-form-fields";

export default async function AdminProductsPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { status?: string; message?: string; edit?: string; reset?: string };
}) {
  const products = await getAdminProducts();
  const status = searchParams.status;
  const message = searchParams.message;
  const editingProduct = products.find(
    (product) => product.id === searchParams.edit,
  );
  const formAction = editingProduct ? updateProductAction : addProductAction;
  const batteryOptions = Array.from({ length: 11 }, (_, index) => 100 - index * 5);
  const storageOptions = [
    { value: "", label: "Select storage" },
    { value: "32", label: "32GB" },
    { value: "64", label: "64GB" },
    { value: "128", label: "128GB" },
    { value: "256", label: "256GB" },
    { value: "512", label: "512GB" },
    { value: "1024", label: "1TB" },
    { value: "2048", label: "2TB" },
  ];
  const gradeOptions = ["Grade A", "Grade B", "Grade C"];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">
          Inventory <span className="text-yellow-500">Management</span>
        </h1>
        <p className="mt-2 text-gray-500">
          Products and inventory pulled directly from the database.
        </p>
      </div>

      {message ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
            status === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {message}
        </div>
      ) : null}

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-black uppercase tracking-tight text-gray-900">
            {editingProduct ? "Edit Product" : "Add Product"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {editingProduct
              ? "Update the live database record for this product listing."
              : "Create a live product directly in the database with one default variant and price."}
          </p>
        </div>

        <form
          key={`${editingProduct?.id || "new"}-${searchParams.reset || "default"}`}
          action={formAction}
          className="grid gap-4 md:grid-cols-2"
        >
          <input type="hidden" name="locale" value={locale} />
          {editingProduct ? (
            <input type="hidden" name="productId" value={editingProduct.id} />
          ) : null}

          <ProductFormFields
            initialBrandName={editingProduct?.brandName}
            initialModelName={editingProduct?.modelName}
            initialHandle={editingProduct?.handle}
          />

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
              Price
            </span>
            <input
              type="number"
              name="price"
              required
              min="0"
              step="0.01"
              defaultValue={
                typeof editingProduct?.price === "number"
                  ? (editingProduct.price / 100).toFixed(2)
                  : undefined
              }
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-yellow-400"
              placeholder="199.99"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
              Inventory
            </span>
            <input
              type="number"
              name="inventory"
              required
              min="0"
              step="1"
              defaultValue={editingProduct?.inventory}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-yellow-400"
              placeholder="25"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
              Thumbnail URL
            </span>
            <input
              type="url"
              name="thumbnail"
              defaultValue={editingProduct?.thumbnail || ""}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-yellow-400"
              placeholder="https://example.com/product.jpg"
            />
            <span className="mt-2 block text-xs text-gray-400">
              Use a direct image URL here, not the manufacturer specs page.
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
              Spec Sheet URL
            </span>
            <input
              type="url"
              name="referenceUrl"
              defaultValue={editingProduct?.referenceUrl || ""}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-yellow-400"
              placeholder="https://www.samsung.com/.../specs/"
            />
            <span className="mt-2 block text-xs text-gray-400">
              Paste the official product detail or specs page and we&apos;ll use it
              to build the spec sheet automatically.
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
              Status
            </span>
            <select
              name="status"
              defaultValue={editingProduct?.status || "published"}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-yellow-400"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="proposed">Proposed</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
              Color
            </span>
            <input
              type="text"
              name="color"
              defaultValue={editingProduct?.color || ""}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-yellow-400"
              placeholder="Midnight Black"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
              Storage
            </span>
            <select
              name="storage"
              defaultValue={editingProduct?.storage || ""}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-yellow-400"
            >
              {storageOptions.map((option) => (
                <option key={option.value || "empty"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
              Battery Health
            </span>
            <select
              name="batteryHealth"
              defaultValue={
                editingProduct?.batteryHealth !== ""
                  ? String(editingProduct?.batteryHealth)
                  : ""
              }
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-yellow-400"
            >
              <option value="">Select battery health</option>
              {batteryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}%
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
              IMEI
            </span>
            <input
              type="text"
              name="imei"
              inputMode="numeric"
              defaultValue={editingProduct?.imei || ""}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-yellow-400"
              placeholder="357123456789012"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
              Grading
            </span>
            <select
              name="gradingData"
              defaultValue={editingProduct?.gradingData || ""}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-yellow-400"
            >
              <option value="">Select grade</option>
              {gradeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
              Description
            </span>
            <textarea
              name="description"
              rows={4}
              defaultValue={editingProduct?.description || ""}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-yellow-400"
              placeholder="Short description for the storefront product detail page."
            />
          </label>

          <div className="flex gap-3 md:col-span-2">
            <button
              type="submit"
              className="rounded-full bg-yellow-500 px-6 py-3 text-sm font-black uppercase tracking-widest text-black transition hover:bg-yellow-400"
            >
              {editingProduct ? "Save Changes" : "Add Product"}
            </button>
            {editingProduct ? (
              <a
                href={`/${locale}/admin/products`}
                className="rounded-full border border-gray-200 px-6 py-3 text-sm font-black uppercase tracking-widest text-gray-600 transition hover:bg-gray-50"
              >
                Cancel
              </a>
            ) : null}
          </div>
        </form>
      </div>

      {products.length > 0 ? (
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
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="transition-colors hover:bg-gray-50/50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-xs font-black uppercase tracking-[0.2em] text-gray-400 shadow-inner">
                        {product.thumbnail && isLikelyImageUrl(product.thumbnail) ? (
                          canUseNextImage(product.thumbnail) ? (
                            <Image
                              src={product.thumbnail}
                              alt={product.title}
                              width={48}
                              height={48}
                              className="rounded-xl object-cover"
                            />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.thumbnail}
                              alt={product.title}
                              className="h-12 w-12 rounded-xl object-cover"
                            />
                          )
                        ) : (
                          "PKG"
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{product.title}</p>
                        <p className="text-xs text-gray-400">{product.handle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase text-green-700">
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-600">
                    <div>{product.inventory} in stock</div>
                    <div className="text-xs text-gray-400">
                      ${(product.price / 100).toFixed(2)}
                    </div>
                    {product.color || product.storage ? (
                      <div className="mt-1 text-xs text-gray-400">
                        {[product.color, product.storage].filter(Boolean).join(" / ")}
                      </div>
                    ) : null}
                    {product.gradingData || product.batteryHealth !== "" ? (
                      <div className="mt-1 text-xs text-gray-400">
                        {[product.gradingData, product.batteryHealth !== "" ? `${product.batteryHealth}% battery` : ""]
                          .filter(Boolean)
                          .join(" / ")}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={`/${locale}/admin/products?edit=${product.id}`}
                        className="rounded-full border border-gray-200 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-gray-700 transition hover:bg-gray-50"
                      >
                        Edit
                      </a>
                      <form action={removeProductAction}>
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="productId" value={product.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-red-200 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-red-600 transition hover:border-red-300 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center text-gray-500">
          No products are in the database yet.
        </div>
      )}
    </div>
  );
}
