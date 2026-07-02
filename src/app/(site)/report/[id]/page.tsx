import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import JsonLd from '@/components/JsonLd';
import ReportView from '@/components/report/ReportView';
import { getSampleReport } from '@/lib/sample-reports';
import { sampleReportLd } from '@/lib/structured-data';
import { SITE_URL, SITE_NAME } from '@/lib/site';

export const runtime = 'edge';

// Sample reports (curated, fictional VINs — see lib/sample-reports.ts) are
// indexable, labeled educational content. Every other VIN is a real or
// potential customer's report and must never be indexed or leak vehicle
// identity into crawlable metadata — see robots.ts for the matching allow
// carve-out that opens exactly these sample paths and nothing else under
// /report/.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const sample = getSampleReport(id);

  if (sample) {
    // title.absolute guarantees the exact string is used with no ambiguity
    // around whether the root layout's title.template gets applied to a
    // dynamic-route generateMetadata result — keep the site's "X | CarVinLookup"
    // convention explicit here rather than relying on template inheritance.
    const title = `Sample report: ${sample.title} | ${SITE_NAME}`;
    const description = `See a sample CarVinLookup vehicle history report for a ${sample.title} — title status, accidents, odometer, theft, liens, and recalls. Illustrative example; run your own VIN for a real report.`;
    const url = `${SITE_URL}/report/${sample.vin}`;
    return {
      title: { absolute: title },
      description,
      alternates: { canonical: `/report/${sample.vin}` },
      robots: { index: true, follow: true },
      openGraph: {
        type: 'website',
        siteName: SITE_NAME,
        title,
        description,
        url,
        locale: 'en_US',
        images: [{ url: sample.img, width: 800, height: 450, alt: sample.alt }],
      },
      twitter: { card: 'summary_large_image', title, description, images: [sample.img] },
    };
  }

  // Real report — generic, non-identifying metadata; never indexed.
  return {
    title: { absolute: `Vehicle history report | ${SITE_NAME}` },
    description: 'Your CarVinLookup vehicle history report.',
    robots: { index: false, follow: false },
  };
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sample = getSampleReport(id);

  return (
    <>
      {sample && (
        <JsonLd data={sampleReportLd({ vin: sample.vin, title: sample.title, url: `${SITE_URL}/report/${sample.vin}` })} />
      )}
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
        <ReportView id={id} sample={sample} />
      </Suspense>
    </>
  );
}
