import type { NextConfig } from "next";
import { readRedirects } from "./src/content/redirects";
// Validates env at config load, so `next build` fails fast on bad config.
import { env } from "./src/env";

const isDev = process.env.NODE_ENV === "development";
// GA4 hosts are allowed only in production builds with GA configured.
const ga =
  !isDev && env.NEXT_PUBLIC_GA_ID
    ? {
        script: " https://www.googletagmanager.com",
        connect:
          " https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
        img: " https://*.google-analytics.com https://www.googletagmanager.com",
      }
    : { script: "", connect: "", img: "" };

// Static CSP, no nonces: nonces force every page to render dynamically,
// which would break SSG/ISR (CLAUDE.md rule 1). 'unsafe-inline' is needed
// for Next's inline bootstrap scripts. Upgrade path: experimental.sri hashes.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}${ga.script}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' blob: data:${ga.img}`,
  "font-src 'self'",
  `connect-src 'self'${ga.connect}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Articles are read from disk at build; also ship them with the standalone
  // server so a not-yet-prerendered URL can still render (or 404) at runtime.
  outputFileTracingIncludes: { "/**": [`./${env.CONTENT_DIR}/**/*`] },
  async headers() {
    // llms.txt files are for AI tools, not search results: llms-full.txt
    // repeats every article, so keep both out of Google's index.
    const noindex = [{ key: "X-Robots-Tag", value: "noindex" }];
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/llms.txt", headers: noindex },
      { source: "/llms-full.txt", headers: noindex },
    ];
  },
  async redirects() {
    return readRedirects(env.CONTENT_DIR);
  },
};

export default nextConfig;
