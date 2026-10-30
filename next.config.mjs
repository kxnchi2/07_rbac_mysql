/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options เดิมของคุณ */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  // 🔴 เพิ่มส่วนนี้เข้าไปเพื่อให้ Redirect จากหน้าแรกไปหน้า /cars
  async redirects() {
    return [
      {
        source: '/',
        destination: '/cars',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;