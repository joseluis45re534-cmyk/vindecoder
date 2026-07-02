import type { Metadata } from 'next';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms governing your use of CarVinLookup vehicle history reports and website.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 prose-content">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">Terms of Service</h1>
        <p>Last updated: {new Date().getFullYear()}</p>
        <h2>Use of the service</h2>
        <p>
          CarVinLookup provides vehicle history information for personal, non-commercial use unless you hold a dealer plan.
          You agree not to resell, scrape, or misuse reports, and to comply with the Driver&apos;s Privacy Protection Act
          (DPPA) and all applicable laws.
        </p>
        <h2>Accuracy &amp; data sources</h2>
        <p>
          Reports are compiled from NMVTIS, NICB, and state DMV records. While we strive for accuracy, records depend on
          third-party reporting and may be incomplete. Reports are provided &ldquo;as is&rdquo; without warranty, and are not
          a substitute for a professional pre-purchase inspection.
        </p>
        <h2>Payments &amp; refunds</h2>
        <p>
          Report prices are shown at checkout. Because reports are delivered instantly and digitally, refunds are handled per
          our refund policy — contact support@carvinlookup.us if a report failed to generate.
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
