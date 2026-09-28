import type { NextConfig } from "next";

// Baseline security headers. A full script-src CSP is still to do: it needs testing
// against Sandpack (custom blocks) and the image hosts before it can be enforced.
const securityHeaders = [
  // No framing (clickjacking on /admin), no plugins, no <base> hijacking, forms post only to us.
  {
    key: 'Content-Security-Policy',
    value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'",
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Don't tell third-party hosts (images, embeds) which lesson a learner is reading.
  { key: 'Referrer-Policy', value: 'no-referrer' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
];

const nextConfig: NextConfig = {
  // Mark Prisma and pg as external to avoid bundling issues
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg', 'pg'],
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
