import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Render <title>, description, canonical, robots and OG tags in <head> for
  // EVERY user agent. Next 15.2+ streams metadata into <body> for clients not on
  // its "HTML-limited bot" list — which includes Googlebot and AI crawlers like
  // GPTBot, ClaudeBot and PerplexityBot that don't run JavaScript.
  htmlLimitedBots: /.*/,
  poweredByHeader: false,
  // Security headers for every response the app (Pages Function) serves. The
  // static public/_headers file only reaches static assets, never HTML pages.
  // No HSTS "preload": submitting the domain to browser preload lists is a
  // deliberate, hard-to-undo owner decision.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
        ],
      },
    ];
  },
  images: {
    // AutoSEO serves article/OG images from its own domain — allow it (also for
    // any <img> usage; next/image would otherwise throw at runtime).
    remotePatterns: [{ protocol: "https", hostname: "autoseo.it.com" }],
  },
  async redirects() {
    return [
      // Retired demo blog posts → their live topical pages (blog is now AutoSEO).
      // Keeps old links + any indexed URLs on a permanent redirect, no 404.
      { source: "/blog/how-to-read-a-vin-number", destination: "/how-to/read-vin-report", permanent: true },
      { source: "/blog/salvage-title-vs-rebuilt-title", destination: "/salvage-check", permanent: true },
      { source: "/blog/check-car-for-flood-damage", destination: "/flood-damage-check", permanent: true },
      { source: "/blog/what-is-a-vehicle-history-report", destination: "/how-to/read-vin-report", permanent: true },
      { source: "/blog/how-to-check-accident-history", destination: "/accident-check", permanent: true },
      { source: "/blog/car-information-by-license-plate", destination: "/license-plate-lookup", permanent: true },
      { source: "/blog/how-to-spot-odometer-rollback", destination: "/odometer-check", permanent: true },
      { source: "/blog/how-to-buy-a-salvage-car", destination: "/auctions", permanent: true },
      { source: "/blog/travel-trailer-vin-decoder", destination: "/vin-decoder", permanent: true },
      { source: "/blog/chassis-number-vs-vin", destination: "/vin-decoder", permanent: true },
      { source: "/blog/vin-cloning-explained", destination: "/stolen-vehicle-check", permanent: true },
      { source: "/blog/what-is-a-bid-car-salvage-auction", destination: "/auctions", permanent: true },
      { source: "/blog/common-used-car-scams", destination: "/how-to/avoid-curbstoner", permanent: true },
      // Canonicalize www → apex. The site's canonical host is carvinlookup.us;
      // www currently serves the app (a duplicate host) and 404s stray paths.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.carvinlookup.us" }],
        destination: "https://carvinlookup.us/:path*",
        permanent: true,
      },
      // Legacy/alias paths Google discovered → real pages (reclaim link equity,
      // avoid a hard 404). Other 404s (old .html cruft from a prior site) are
      // left to 404 correctly — they should not resolve.
      { source: "/refund-policy", destination: "/refund", permanent: true },
      { source: "/index.html", destination: "/", permanent: true },
      // ClearVin became a data partner (Nov 2026): its competitor pages are
      // retired. (The AutoSEO comparison post redirects via CONSOLIDATED_POSTS.)
      { source: "/clearvin-alternative", destination: "/compare", permanent: true },
      { source: "/compare/carvinlookup-vs-clearvin", destination: "/compare", permanent: true },
    ];
  },
};

export default nextConfig;
