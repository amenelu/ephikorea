import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="text-xl font-black tracking-tighter text-yellow-500"
            >
              AMAN<span className="text-black">MOBILE</span>
            </Link>
            <p className="mt-4 text-sm text-gray-500 max-w-xs leading-relaxed">
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
                  href="/en/products"
                  className="text-sm text-gray-500 hover:text-yellow-600 transition-colors"
                >
                  Audio
                </Link>
              </li>
              <li>
                <Link
                  href="/en/products"
                  className="text-sm text-gray-500 hover:text-yellow-600 transition-colors"
                >
                  Computing
                </Link>
              </li>
              <li>
                <Link
                  href="/en/products"
                  className="text-sm text-gray-500 hover:text-yellow-600 transition-colors"
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
                  href="#"
                  className="text-sm text-gray-500 hover:text-yellow-600 transition-colors"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-500 hover:text-yellow-600 transition-colors"
                >
                  Returns
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-500 hover:text-yellow-600 transition-colors"
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
                  href="#"
                  className="text-sm text-gray-500 hover:text-yellow-600 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-500 hover:text-yellow-600 transition-colors"
                >
                  Sustainability
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-500 hover:text-yellow-600 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            © {new Date().getFullYear()} Aman mobile. Engineered for the future.
          </p>
          <div className="flex gap-6">
            <span className="text-[10px] font-black uppercase text-gray-300 tracking-tighter">
              SEOUL / GLOBAL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
