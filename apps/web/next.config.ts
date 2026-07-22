import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Cloudflare Workers can't run the sharp-based optimizer (no native
    // addons in that runtime) — CF_PAGES is set automatically by Cloudflare
    // builds, so only Netlify (which supports it via @netlify/plugin-nextjs)
    // gets real on-the-fly optimization. Images are served as-is on
    // Cloudflare instead.
    unoptimized: !!process.env.CF_PAGES,
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
