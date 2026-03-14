import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    domains: ["localhost", "capalyse-api-v1.apps.ikem.dev"],
  },
};

export default nextConfig;
