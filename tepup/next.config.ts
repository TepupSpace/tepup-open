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

// Let Cloudflare cache the public pages for 5 minutes (they all use `revalidate = 300` and read
// no cookies). Cloudflare reads this header and strips it, so browsers still get max-age=0.
// It only takes effect together with the "Public pages, anonymous only" Cache Rule in Cloudflare.
//
// Anonymous page loads only: proxy.ts serves signed-in requests the staff view (hidden lessons)
// at the same URL, and Cloudflare's cache key ignores cookies, so a cached staff response would
// be shown to every learner. Client-side navigations (RSC header) return a different payload at
// the same URL and must not be cached either. The Cache Rule repeats both exclusions.
const edgeCacheHeaders = [
  { key: 'Cloudflare-CDN-Cache-Control', value: 'public, max-age=300, stale-while-revalidate=600' },
];
const anonymousPageLoad = [
  { type: 'cookie' as const, key: 'authjs.session-token' },
  { type: 'cookie' as const, key: '__Secure-authjs.session-token' },
  { type: 'header' as const, key: 'rsc' },
];
const publicPages = [
  '/',
  '/courses',
  '/courses/:slug',
  '/courses/:slug/:lessonSlug',
  '/library',
  '/story/:path*',
  '/contributor-guide',
];

const nextConfig: NextConfig = {
  // Mark Prisma and pg as external to avoid bundling issues
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg', 'pg'],
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      ...publicPages.map((source) => ({ source, missing: anonymousPageLoad, headers: edgeCacheHeaders })),
    ];
  },
};

export default nextConfig;
