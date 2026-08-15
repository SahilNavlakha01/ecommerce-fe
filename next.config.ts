import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jwellerybackend-production.up.railway.app',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 3600,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@heroicons/react', 'antd'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  // Force browsers to revalidate Next.js chunks after every deploy.
  // Prevents "Failed to find Server Action" errors caused by stale cached
  // JS bundles from a previous Railway deployment hitting the new build.
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: "westaura-systems",
  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI or when debug is enabled
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/prerelease/ut/configuration/options/
  widenClientFileUpload: true,

  // Hides source maps from visitors
  hideSourceMaps: true,

  // Modern configuration structure for bundler/webpack plugins
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
    automaticVercelMonitors: true,
  },
});
