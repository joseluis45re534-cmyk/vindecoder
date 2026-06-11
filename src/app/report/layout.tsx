import type { Metadata } from "next";

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
