import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        // ロゴのキャッシュバスター付きURL（/logo.png?v=...）を許可する
        pathname: "/logo.png",
      },
    ],
  },
};

export default nextConfig;
