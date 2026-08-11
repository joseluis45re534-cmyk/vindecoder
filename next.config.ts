import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
