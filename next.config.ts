import type { NextConfig } from 'next';
import { legacyRedirects } from './src/content/legacy-redirects';
import { baseSecurityHeaders } from './src/lib/security/csp';

const prod = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    // Uploads are handled by route handlers excluded from the proxy matcher;
    // keep the buffered body small for anything that does pass through it.
    proxyClientMaxBodySize: '1mb',
    globalNotFound: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [70, 75, 80],
    deviceSizes: [640, 828, 1080, 1280, 1600, 1920],
    imageSizes: [64, 128, 256, 384],
  },
  async redirects() {
    return legacyRedirects();
  },
  async headers() {
    return [
      { source: '/:path*', headers: baseSecurityHeaders(prod).map(([key, value]) => ({ key, value })) },
      { source: '/api/:path*', headers: [{ key: 'Cache-Control', value: 'no-store' }] },
      {
        source: '/documents/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }],
      },
      {
        source: '/assets/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800' }],
      },
    ];
  },
};

export default nextConfig;
