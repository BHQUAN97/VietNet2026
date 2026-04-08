/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'bhquan.site',
      },
      {
        protocol: 'https',
        hostname: 'bhquan.store',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: 'backend',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [375, 640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache image da optimize 7 ngay — giam re-process
    minimumCacheTTL: 604800,
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-accordion',
    ],
  },
  // Enable standalone output for smaller Docker images
  output: 'standalone',
  // Compression handled by Nginx
  compress: false,
  // Proxy API requests to backend (local dev without Nginx)
  rewrites: async () => [
    {
      source: '/api/:path*',
      destination: `${process.env.INTERNAL_API_URL || 'http://localhost:4000/api'}/:path*`,
    },
    {
      source: '/uploads/:path*',
      destination: `${process.env.INTERNAL_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:4000'}/uploads/:path*`,
    },
  ],
  // Security headers
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        // CSP — chong XSS, chi cho phep script/style tu self va inline (Next.js can)
        { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https://*.cloudflarestorage.com https://*.r2.dev https://bhquan.site https://bhquan.store https://images.unsplash.com; font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com; media-src 'self' data: blob: https://*.r2.dev https://*.cloudflarestorage.com; connect-src 'self' https://bhquan.site https://bhquan.store wss://bhquan.site wss://bhquan.store; object-src 'none'; base-uri 'self'; frame-ancestors 'self'" },
      ],
    },
    {
      source: '/_next/static/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
  ],
}

module.exports = nextConfig
