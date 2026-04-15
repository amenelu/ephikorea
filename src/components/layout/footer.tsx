import Link from "next/link";

export const Footer = ({ locale }: { locale: string }) => {
  return (
    <footer className="mt-auto border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link
              href={`/${locale}`}
              className="text-xl font-black tracking-tighter text-yellow-500"
            >
              AMAN<span className="text-black">MOBILE</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-500">
              Redefining the standard of premium electronics with South Korean
              engineering excellence.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">
              Collections
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href={`/${locale}/products`}
                  className="text-sm text-gray-500 transition-colors hover:text-yellow-600"
                >
                  Audio
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/products`}
                  className="text-sm text-gray-500 transition-colors hover:text-yellow-600"
                >
                  Computing
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/products`}
                  className="text-sm text-gray-500 transition-colors hover:text-yellow-600"
                >
                  Wearables
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">
              Support
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href={`/${locale}/support/shipping`}
                  className="text-sm text-gray-500 transition-colors hover:text-yellow-600"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/support/returns`}
                  className="text-sm text-gray-500 transition-colors hover:text-yellow-600"
                >
                  Returns
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/contact`}
                  className="text-sm text-gray-500 transition-colors hover:text-yellow-600"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">
              Company
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href={`/${locale}/about`}
                  className="text-sm text-gray-500 transition-colors hover:text-yellow-600"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/admin/settings`}
                  className="text-sm text-gray-500 transition-colors hover:text-yellow-600"
                >
                  Sustainability
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/privacy`}
                  className="text-sm text-gray-500 transition-colors hover:text-yellow-600"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 md:flex-row">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            &copy; {new Date().getFullYear()} Aman mobile. Engineered for the
            future.
          </p>
          <div className="flex gap-6">
            <span className="text-[10px] font-black uppercase tracking-tighter text-gray-300">
              SEOUL / GLOBAL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
