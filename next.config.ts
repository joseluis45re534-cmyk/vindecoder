import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
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
    ];
  },
};

export default nextConfig;
