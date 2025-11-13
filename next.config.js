/**
 * Next.js Configuration for Gabriel Family Clinic MVP
 * Optimized for simplicity, security, and a senior-friendly experience.
 */

const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // We use the Pages Router, not App Router, for MVP simplicity.
  // (App Router can be introduced later if needed.)

  typescript: {
    ignoreBuildErrors: false
  },
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src']
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh', 'ms', 'ta'],
    // Use a proper boolean as required by Next.js. This also silences the
    // "Invalid literal value, expected false at i18n.localeDetection" warning.
    localeDetection: false
  },

  images: {
    domains: ['localhost', 'supabase.co', 'images.unsplash.com'],
    formats: ['image/avif', 'image/webp']
  },

  async headers() {
    const csp = [
      "default-src 'self';",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.supabase.co;",
      "style-src 'self' 'unsafe-inline';",
      "img-src 'self' data: blob: *.supabase.co;",
      "font-src 'self' data:;",
      "connect-src 'self' *.supabase.co *.twilio.com;",
      "frame-ancestors 'none';",
      "base-uri 'self';",
      "form-action 'self';"
    ]
      .join(' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: csp }
        ]
      },
      {
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }]
      }
    ];
  },

  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true
      },
      {
        source: '/appointments',
        destination: '/book',
        permanent: false
      },
      {
        source: '/admin',
        destination: '/staff/appointments',
        permanent: false
      }
    ];
  },

  env: {
    NEXT_PUBLIC_APP_NAME: 'Gabriel Family Clinic',
    NEXT_PUBLIC_CLINIC_PHONE: '+6560000000',
    NEXT_PUBLIC_CLINIC_ADDRESS: '123 Sample Street, #01-234, Singapore',
    NEXT_PUBLIC_TIMEZONE: 'Asia/Singapore'
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
      '@/styles': path.resolve(__dirname, 'src/styles'),
      '@/types': path.resolve(__dirname, 'src/types')
    };
    return config;
  },

  output: 'standalone',
  distDir: '.next'
};

module.exports = nextConfig;
