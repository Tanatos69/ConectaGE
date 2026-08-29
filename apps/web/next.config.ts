import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Workspace package published as raw TypeScript (packages/shared) — Next has
  // to transpile it rather than expect pre-built JS.
  transpilePackages: ["@gemarket/shared"],
  images: {
    // Real listing photos & avatars live in Supabase Storage. Cloudinary /
    // Unsplash remain for legacy demo imagery.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default withSerwist(nextConfig);
