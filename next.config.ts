import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/svg-cleaner",
        destination: "/",
        permanent: true,
      },
      {
        source: "/svg-optimizer",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
