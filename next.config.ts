import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack config (Next.js 16 uses Turbopack by default)
  turbopack: {},

  // Allow serving stockfish files
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Cross-Origin-Opener-Policy",
          value: "same-origin",
        },
        {
          key: "Cross-Origin-Embedder-Policy",
          value: "require-corp",
        },
      ],
    },
  ],
};

export default nextConfig;
