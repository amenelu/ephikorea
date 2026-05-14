/** @type {import('next').Next.jsConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http", hostname: "localhost" },
      // Add your production storage bucket URL here later
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3"],
    outputFileTracingExcludes: {
      "*": [
        ".cache/**/*",
        "battery-report.html",
        "uploads/**/*",
        "data/*.sqlite",
        "data/*.sqlite-*",
      ],
    },
  },
};

module.exports = nextConfig;
