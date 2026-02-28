import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@halacha-ai/db", "@halacha-ai/lib"],
};

export default nextConfig;
