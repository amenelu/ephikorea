import Image from "next/image";
import { AdminToast } from "@/components/admin/admin-toast";
import { AdminLiveSearch } from "@/components/admin/admin-live-search";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { canUseNextImage, isLikelyImageUrl } from "@/lib/media";
import { getAdminProducts } from "@/lib/admin-data";
import { formatAdminPriceInput, formatAmount } from "@/lib/utils";
import {
  addProductAction,
  addInventoryAction,
  removeProductAction,
  updateProductAction,
} from "./actions";
import CategorySpecificFields, {
  CategoryFieldsProvider,
  ProductCategoryField,
} from "./category-specific-fields";
import ProductFormFields from "./product-form-fields";

export default async function AdminProductsPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: {
    status?: string;
    message?: string;
    edit?: string;
    reset?: string;
    q?: string;
  };
}) {
  await requireAdminPageAccess(locale);

  const allProducts = await getAdminProducts();
  const status = searchParams.status;
  const message = searchParams.message;
  const query = searchParams.q?.trim().toLowerCase() || "";
  const products = query
    ? allProducts.filter((product) =>
        [
          product.title,
          product.handle,
          product.brandName,
          product.modelName,
          product.color,
          product.storage,
          product.collectionId,
          product.compatibility,
          product.material,
          product.ram,
          product.processor,
          product.sizeVolume,
          product.skinType,
          product.ingredients,
          product.expirationDate,
          product.shoeSize,
          product.genderFit,
          product.gradingData,
          product.isCertifiedPreOwned ? "certified pre owned" : "new",
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
    : allProducts;
  const editingProduct = allProducts.find(
    (product) => product.id === searchParams.edit,
  );
  const formAction = editingProduct ? updateProductAction : addProductAction;
  const publishedCount = products.filter(
    (product) => product.status === "published",
  ).length;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900 sm:text-3xl">
          Inventory <span className="text-yellow-500">Management</span>
        </h1>
        <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
          Products and inventory pulled directly from the database.
        </p>
      </div>
      <AdminToast status={status} message={message} />

      <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
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
          encType="multipart/form-data"
          className="grid gap-4 md:grid-cols-2"
        >
          <input type="hidden" name="locale" value={locale} />
          {editingProduct ? (
            <input type="hidden" name="productId" value={editingProduct.id} />
          ) : null}
          {editingProduct?.images?.map((imageUrl) => (
            <input
              key={imageUrl}
              type="hidden"
              name="existingImageUrls"
              value={imageUrl}
            />
          ))}

          <CategoryFieldsProvider
            initialCategory={editingProduct?.collectionId}
          >
            <ProductCategoryField />

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
                    ? formatAdminPriceInput(
                        editingProduct.price,
                        editingProduct.currencyCode,
                      )
                    : undefined
                }
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-yellow-400"
                placeholder="199.99"
              />
              <span className="mt-2 block text-xs text-gray-400">
                Use decimals for USD, or whole won for KRW.
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
                Currency
              </span>
              <select
                name="currencyCode"
                defaultValue={editingProduct?.currencyCode || "usd"}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-yellow-400"
              >
                <option value="usd">US Dollars (USD)</option>
                <option value="krw">Korean Won (KRW)</option>
              </select>
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

            <CategorySpecificFields
              initialCondition={
                editingProduct?.isCertifiedPreOwned === false
                  ? "new"
                  : "certified_pre_owned"
              }
              initialColor={editingProduct?.color}
              initialStorage={editingProduct?.storage}
              initialBatteryHealth={
                editingProduct?.batteryHealth !== ""
                  ? String(editingProduct?.batteryHealth)
                  : ""
              }
              initialImei={editingProduct?.imei}
              initialGradingData={editingProduct?.gradingData}
              initialCompatibility={editingProduct?.compatibility}
              initialMaterial={editingProduct?.material}
              initialRam={editingProduct?.ram}
              initialProcessor={editingProduct?.processor}
              initialSizeVolume={editingProduct?.sizeVolume}
              initialSkinType={editingProduct?.skinType}
              initialIngredients={editingProduct?.ingredients}
              initialExpirationDate={editingProduct?.expirationDate}
              initialShoeSize={editingProduct?.shoeSize}
              initialGenderFit={editingProduct?.genderFit}
            />

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
                Upload Product Images
              </span>
              <input
                type="file"
                name="productImageFiles"
                accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                multiple
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-yellow-50 file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-widest file:text-yellow-700 focus:border-yellow-400"
              />
              <span className="mt-2 block text-xs text-gray-400">
                Upload one or more local images. The first image becomes the
                thumbnail. Max 5MB each.
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
                Leave this blank for supported iPhone and Galaxy models and
                we&apos;ll auto-fill it. You can still paste a Samsung specs
                page or an Apple Support tech specs page manually anytime.
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

            <label className="flex items-start gap-3 rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700 transition focus-within:border-yellow-400">
              <input
                type="checkbox"
                name="featuredOnHomepage"
                defaultChecked={Boolean(editingProduct?.featuredOnHomepage)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-400"
              />
              <span>
                <span className="block text-xs font-black uppercase tracking-widest text-gray-500">
                  Feature on homepage
                </span>
                <span className="mt-1 block text-xs leading-5 text-gray-400">
                  Show this product in Popular Right Now before the newest
                  fallback products.
                </span>
              </span>
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

            <div className="sticky bottom-3 z-10 -mx-1 flex flex-col gap-3 rounded-3xl bg-white/95 p-1 backdrop-blur sm:static sm:mx-0 sm:bg-transparent sm:p-0 sm:flex-row md:col-span-2">
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
          </CategoryFieldsProvider>
        </form>
      </div>

      <div className="w-full sm:w-64 lg:w-80">
        <AdminLiveSearch
          defaultValue={searchParams.q || ""}
          placeholder="Search products..."
        />
      </div>

      {products.length > 0 ? (
        <>
          <div className="grid gap-4 md:hidden">
            {products.map((product) => (
              <section
                key={product.id}
                className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-xs font-black uppercase tracking-[0.2em] text-gray-400 shadow-inner">
                    {product.thumbnail &&
                    isLikelyImageUrl(product.thumbnail) ? (
                      canUseNextImage(product.thumbnail) ? (
                        <Image
                          src={product.thumbnail}
                          alt={product.title}
                          width={64}
                          height={64}
                          className="h-16 w-16 rounded-2xl object-cover"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.thumbnail}
                          alt={product.title}
                          className="h-16 w-16 rounded-2xl object-cover"
                        />
                      )
                    ) : (
                      "PKG"
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-black text-gray-900">
                          {product.title}
                        </p>
                        <p className="mt-1 break-all text-xs text-gray-400">
                          {product.handle}
                        </p>
                      </div>
                      <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-green-700">
                        {product.status}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-gray-50 px-3 py-2.5">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-400">
                          Price
                        </p>
                        <p className="mt-1 font-black text-gray-900">
                          {formatAmount(product.price, product.currencyCode)}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-gray-50 px-3 py-2.5">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-400">
                          Inventory
                        </p>
                        <p className="mt-1 font-black text-gray-900">
                          {product.inventory} in stock
                        </p>
                      </div>
                    </div>
                    {(product.color ||
                      product.storage ||
                      product.collectionId ||
                      product.gradingData ||
                      (product.images?.length ?? 0) > 1 ||
                      product.batteryHealth !== "") && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {product.color ? (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold text-gray-700">
                            {product.color}
                          </span>
                        ) : null}
                        {product.storage ? (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold text-gray-700">
                            {product.storage}
                          </span>
                        ) : null}
                        {product.gradingData ? (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold text-gray-700">
                            {product.gradingData}
                          </span>
                        ) : null}
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold text-gray-700">
                          {product.isCertifiedPreOwned
                            ? "Certified Pre-Owned"
                            : "New"}
                        </span>
                        {product.collectionId ? (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold text-gray-700">
                            {product.collectionId}
                          </span>
                        ) : null}
                        {(product.images?.length ?? 0) > 1 ? (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold text-gray-700">
                            {product.images.length} images
                          </span>
                        ) : null}
                        {product.batteryHealth !== "" ? (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold text-gray-700">
                            {product.batteryHealth}% battery
                          </span>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-400">
                    Quick Stock Update
                  </p>
                  <form action={addInventoryAction} className="mt-3 flex gap-2">
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="productId" value={product.id} />
                    <input
                      type="number"
                      name="amount"
                      min="1"
                      step="1"
                      defaultValue="1"
                      aria-label={`Inventory amount for ${product.title}`}
                      className="w-20 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-700 outline-none transition focus:border-yellow-400"
                    />
                    <button
                      type="submit"
                      className="flex-1 rounded-full border border-yellow-300 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-yellow-700 transition hover:bg-yellow-50"
                    >
                      Add Stock
                    </button>
                  </form>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <a
                    href={`/${locale}/admin/products?edit=${product.id}`}
                    className="flex items-center justify-center rounded-full border border-gray-200 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.14em] text-gray-700 transition hover:bg-gray-50"
                  >
                    Edit Product
                  </a>
                  <form action={removeProductAction}>
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="productId" value={product.id} />
                    <button
                      type="submit"
                      className="w-full rounded-full border border-red-200 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.14em] text-red-600 transition hover:border-red-300 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </form>
                </div>
              </section>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-3xl border border-gray-200 bg-white shadow-sm md:block">
            <table className="min-w-[760px] w-full text-left">
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
                    <td className="px-4 py-4 sm:px-6">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-xs font-black uppercase tracking-[0.2em] text-gray-400 shadow-inner">
                          {product.thumbnail &&
                          isLikelyImageUrl(product.thumbnail) ? (
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
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900">
                            {product.title}
                          </p>
                          <p className="break-all text-xs text-gray-400">
                            {product.handle}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 sm:px-6">
                      <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase text-green-700">
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-600 sm:px-6">
                      <div>{product.inventory} in stock</div>
                      <div className="text-xs text-gray-400">
                        {formatAmount(product.price, product.currencyCode)}
                      </div>
                      {product.color || product.storage ? (
                        <div className="mt-1 text-xs text-gray-400">
                          {[product.color, product.storage]
                            .filter(Boolean)
                            .join(" / ")}
                        </div>
                      ) : null}
                      <div className="mt-1 text-xs text-gray-400">
                        {product.isCertifiedPreOwned
                          ? "Certified Pre-Owned"
                          : "New"}
                      </div>
                      {product.collectionId ? (
                        <div className="mt-1 text-xs text-gray-400">
                          Category: {product.collectionId}
                        </div>
                      ) : null}
                      {(product.images?.length ?? 0) > 1 ? (
                        <div className="mt-1 text-xs text-gray-400">
                          {product.images.length} images
                        </div>
                      ) : null}
                      {product.gradingData || product.batteryHealth !== "" ? (
                        <div className="mt-1 text-xs text-gray-400">
                          {[
                            product.gradingData,
                            product.batteryHealth !== ""
                              ? `${product.batteryHealth}% battery`
                              : "",
                          ]
                            .filter(Boolean)
                            .join(" / ")}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 sm:px-6">
                      <div className="flex min-w-[220px] flex-wrap gap-2">
                        <form
                          action={addInventoryAction}
                          className="flex flex-wrap items-center gap-2"
                        >
                          <input type="hidden" name="locale" value={locale} />
                          <input
                            type="hidden"
                            name="productId"
                            value={product.id}
                          />
                          <input
                            type="number"
                            name="amount"
                            min="1"
                            step="1"
                            defaultValue="1"
                            aria-label={`Inventory amount for ${product.title}`}
                            className="w-20 rounded-full border border-gray-200 px-3 py-1.5 text-[11px] font-bold text-gray-700 outline-none transition focus:border-yellow-400"
                          />
                          <button
                            type="submit"
                            className="rounded-full border border-yellow-300 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-yellow-700 transition hover:bg-yellow-50"
                          >
                            Add Stock
                          </button>
                        </form>
                        <a
                          href={`/${locale}/admin/products?edit=${product.id}`}
                          className="rounded-full border border-gray-200 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-gray-700 transition hover:bg-gray-50"
                        >
                          Edit
                        </a>
                        <form action={removeProductAction}>
                          <input type="hidden" name="locale" value={locale} />
                          <input
                            type="hidden"
                            name="productId"
                            value={product.id}
                          />
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
        </>
      ) : (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm leading-6 text-gray-500 sm:p-12 sm:text-base">
          {query
            ? "No products matched your search."
            : "No products are in the database yet."}
        </div>
      )}
    </div>
  );
}
