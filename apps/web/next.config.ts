import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // All listing photos & avatars are served from Cloudinary's CDN.
    // Placeholder/demo imagery is pulled from Unsplash during the
    // presentation phase only.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
