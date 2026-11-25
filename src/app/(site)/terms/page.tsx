import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';
import { formatRevised, SUPPORT_EMAIL } from '@/lib/site';
import { reportPriceLine, PER_VEHICLE_NOTE } from '@/lib/pricing';

export const runtime = 'edge';

// Set by hand when these terms change — never computed at render time.
const UPDATED = '2026-11-25';

export const metadata: Metadata = pageMetadata({
  title: 'Terms of Service',
  description:
    'The terms governing your use of CarVinLookup vehicle history reports and website.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 prose-content">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">Terms of Service</h1>
        <p>
          Last updated: <time dateTime={UPDATED}>{formatRevised(UPDATED)}</time>
        </p>
        <h2>Use of the service</h2>
        <p>
          CarVinLookup provides vehicle history information for your personal, non-commercial use. You agree not to
          resell, scrape, or misuse reports, and to comply with the Driver&apos;s Privacy Protection Act (DPPA) and all
          applicable laws.
        </p>
        <h2>Accuracy &amp; data sources</h2>
        <p>
          Reports are compiled from NMVTIS title data and the other record sources listed on our{' '}
          <Link href="/data-sources">Data Sources</Link> page. While we strive for accuracy, records depend on third-party
          reporting and may be incomplete. Reports are provided &ldquo;as is&rdquo; without warranty, and are not a
          substitute for a professional pre-purchase inspection.
        </p>
        <h2>Payments, renewals &amp; refunds</h2>
        <p>
          Unlocking a vehicle&apos;s full report costs {reportPriceLine('long')}. {PER_VEHICLE_NOTE} You can cancel at any
          time, and cancelling before the trial ends means you pay only the trial fee. Cancellations and refunds follow our{' '}
          <Link href="/refund">refund &amp; cancellation policy</Link>. Contact{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> if a report failed to generate.
        </p>
        <h2>Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, CarVinLookup is not liable for decisions made based on a report. Always
          verify critical details independently before purchasing a vehicle.
        </p>
      </article>
    </main>
  );
}
