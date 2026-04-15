export default function AccountPage({
}: {
  params: { locale: string };
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">
          Sign in to Aman<span className="text-yellow-500">Mobile</span>
        </h1>
        <p className="mt-4 text-gray-500 text-sm">
          Manage your orders, technical support, and premium benefits.
        </p>
      </div>

      <div className="mt-12 space-y-4">
        <button className="w-full rounded-2xl bg-black py-4 text-sm font-bold text-white transition-opacity hover:opacity-90">
          Continue with Email
        </button>
        <button className="w-full rounded-2xl border border-gray-200 py-4 text-sm font-bold text-gray-900 transition-colors hover:bg-gray-50">
          Create Account
        </button>
      </div>

      <p className="mt-8 text-center text-xs text-gray-400">
        By continuing, you agree to our Terms of Service.
      </p>
    </div>
  );
}
