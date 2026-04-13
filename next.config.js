/** @type {import('next').Next.jsConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http", hostname: "localhost" },
      // Add your Medusa production storage bucket URL here later
    ],
  },
};

module.exports = nextConfig;
