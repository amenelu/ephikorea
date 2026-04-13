export default function CartPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 text-center">
      <h1 className="text-3xl font-bold text-gray-900">Shopping Bag</h1>
      <div className="mt-12 rounded-3xl border-2 border-dashed border-gray-100 p-20 text-gray-400">
        Your shopping bag is empty.
      </div>
    </div>
  );
}
