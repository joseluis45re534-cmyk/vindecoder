import type { Metadata } from "next";

// The report page is a client component (can't export route config itself), so
// the segment's edge runtime is declared here — required by next-on-pages.
export const runtime = "edge";

// Reports are per-user, thin, and paywalled — keep them out of search indexes
// while still allowing crawlers to follow links back into the site.
export const metadata: Metadata = {
  title: "Vehicle History Report",
  robots: {
    index: false,
    follow: true,
  },
};

export default function ReportLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
