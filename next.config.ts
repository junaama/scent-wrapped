import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.vogue.com',
        pathname: '/photos/**',
      },
      {
        protocol: 'https',
        hostname: 'wwd.com',
        pathname: '/wp-content/**',
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
        pathname: '/image/**',
      },
      {
        protocol: 'https',
        hostname: 'media.parfumo.com',
        pathname: '/perfumes/**',
      },
      {
        protocol: 'https',
        hostname: 'images.parfumo.de',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
