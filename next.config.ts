import type { NextConfig } from "next";

/*
  StudyOS is a local-first Next.js app — no backend, no database
  connections at request time (the /api/health probe only).
  These are conservative security headers that do not affect
  fonts, assets, client routing, or localStorage.
*/
const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
