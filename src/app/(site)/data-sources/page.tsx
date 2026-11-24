import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { Database, ExternalLink } from 'lucide-react';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd } from '@/lib/structured-data';
import { SITE_URL, CONTENT_REVISED, formatRevised, NMVTIS_DISCLAIMER_URL, NMVTIS_DISCLAIMER_SUMMARY_URL } from '@/lib/site';

export const runtime = 'edge';

export const metadata: Metadata = pageMetadata({
  title: 'Data Sources & Methodology',
  description:
    'Where CarVinLookup report data comes from — NMVTIS title records, insurance and salvage data, NHTSA recalls — and the honest limits of any VIN check.',
  path: '/data-sources',
});

// What the report provider actually supplies (verified against the provider's
// published terms, 2026-11-24). NICB is NOT a source of our reports — it's
// listed separately below as a free, independent tool. Update this page
// whenever the data provider changes (e.g. the upcoming ClearVin integration).
const SOURCES = [
  {
    name: 'NMVTIS',
    full: 'National Motor Vehicle Title Information System',
    href: 'https://vehiclehistory.bja.ojp.gov/nmvtis_consumers',
    provides:
      'Title status and title-brand history (salvage, junk, flood, rebuilt) reported by state titling agencies, plus the most recent odometer reading on the title record. A brand recorded in one state stays attached to the VIN even if the car is later retitled elsewhere — the core defense against title washing. We access NMVTIS through an approved NMVTIS data provider.',
    overseenBy: 'U.S. Department of Justice; operated by the American Association of Motor Vehicle Administrators (AAMVA).',
  },
  {
    name: 'Insurers & salvage yards',
    full: 'Total-loss and junk/salvage reports',
    href: null,
    provides:
      'Insurers, auto recyclers, and junk and salvage yards are required by federal law to report total-loss and salvage vehicles to NMVTIS. These reports flag cars that were totaled or sent to a salvage yard, even when the title was never branded.',
    overseenBy: 'Reported under federal NMVTIS rules.',
  },
  {
    name: 'Salvage auctions',
    full: 'Auction sale records',
    href: null,
    provides:
      'Where available, records of the vehicle being sold at a salvage or insurance auction, including the listed damage type and auction photos — a strong signal that the car was wrecked, flooded, or recovered after theft.',
    overseenBy: 'Compiled from auction listings by our data provider.',
  },
  {
    name: 'NHTSA',
    full: 'National Highway Traffic Safety Administration',
    href: 'https://www.nhtsa.gov/recalls',
    provides:
      'Open manufacturer safety recalls tied to the vehicle, and the factory specifications decoded from the VIN (year, make, model, body, and engine) via NHTSA’s public vPIC decoder.',
    overseenBy: 'U.S. Department of Transportation.',
  },
];

export default function DataSourcesPage() {
  return (
    <main className="min-h-screen bg-white">
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            '@id': `${SITE_URL}/data-sources`,
            name: 'Data sources & methodology',
            url: `${SITE_URL}/data-sources`,
            dateModified: CONTENT_REVISED,
            isPartOf: { '@id': `${SITE_URL}/#website` },
            publisher: { '@id': `${SITE_URL}/#organization` },
          },
          breadcrumbLd([
            { name: 'Home', url: SITE_URL },
            { name: 'Data Sources', url: `${SITE_URL}/data-sources` },
          ]),
        ]}
      />

      <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-4 sm:px-6 lg:px-8 pt-14 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center justify-center gap-1.5 text-xs sm:text-sm text-blue-200/70">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-blue-100 font-medium">Data Sources</li>
            </ol>
          </nav>
          <span className="inline-flex w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-300 items-center justify-center mb-5">
            <Database className="w-6 h-6" aria-hidden="true" />
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">Data sources &amp; methodology</h1>
          <p className="text-slate-300 mt-4 max-w-xl mx-auto">
            A CarVinLookup report combines NMVTIS title data with insurance, salvage, auction, and recall records —
            here&apos;s exactly what each source contributes, and what a report can&apos;t tell you.
          </p>
          <p className="text-xs text-slate-400 mt-4">Last reviewed {formatRevised()}</p>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 prose-content">
        <h2>What each source provides</h2>
        <p>
          Every CarVinLookup report cross-references the record types below. We don&apos;t generate any of this data
          ourselves — we access it through a vehicle-data provider (whose NMVTIS data comes from an approved NMVTIS data
          provider) and present it in one place.
        </p>

        <div className="not-prose grid sm:grid-cols-2 gap-4 my-8">
          {SOURCES.map((s) => (
            <div key={s.name} className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
              <h3 className="font-display font-bold text-slate-900">
                {s.name}
                <span className="block text-xs font-normal text-slate-400 mt-0.5">{s.full}</span>
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mt-3">{s.provides}</p>
              <p className="text-xs text-slate-400 mt-3">{s.overseenBy}</p>
              {s.href && (
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-blue-600 hover:underline"
                >
                  Visit official site <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              )}
            </div>
          ))}
        </div>

        <h2>How a report is built</h2>
        <p>
          When you run a VIN, we look it up against each of these sources and combine what comes back into a single
          report: title status and brand history, the most recent reported odometer reading, theft and total-loss
          records, open liens, auction and sale history where available, and open safety recalls. The free preview
          confirms the vehicle&apos;s identity — year, make, model — before you pay for the full report.
        </p>

        <h2>Honest limitations</h2>
        <p>
          No VIN check, from any provider, is a substitute for a professional pre-purchase inspection. A few honest
          limits worth knowing:
        </p>
        <ul>
          <li>
            <strong>Reporting is not universal.</strong> Not every state reports complete title data to NMVTIS, and an
            insurance or salvage event that was never reported won&apos;t appear in any database.
          </li>
          <li>
            <strong>Records can lag.</strong> A very recent accident, sale, or title change may not have been reported
            to the underlying database yet.
          </li>
          <li>
            <strong>A clean report isn&apos;t a guarantee.</strong> It means no problems were reported to these
            databases — it doesn&apos;t rule out issues that were never reported anywhere, such as unreported minor
            damage.
          </li>
          <li>
            <strong>We report what the sources report.</strong> We don&apos;t independently verify or inspect vehicles;
            we surface the records these agencies and insurers have on file.
          </li>
        </ul>

        <h2>Free tool: NICB VINCheck</h2>
        <p>
          The National Insurance Crime Bureau runs a free{' '}
          <a href="https://www.nicb.org/vincheck" target="_blank" rel="noopener noreferrer nofollow">VINCheck</a>{' '}
          service that screens a VIN for unrecovered theft and salvage reports from participating insurance companies.
          It&apos;s a separate service — CarVinLookup reports don&apos;t include NICB data — but it&apos;s a smart extra
          check, especially if you suspect a car was stolen.
        </p>

        <h2 id="nmvtis-disclaimer">NMVTIS consumer access disclaimer</h2>
        <p>
          The U.S. Department of Justice publishes a consumer disclaimer that applies to every product containing NMVTIS
          data. In short:
        </p>
        <ul>
          <li>
            NMVTIS holds title and brand information reported by state titling agencies, plus total-loss and salvage
            reports from insurers and junk and salvage yards. Some states don&apos;t yet provide complete data, so
            NMVTIS doesn&apos;t contain information on every vehicle.
          </li>
          <li>NMVTIS does not contain a vehicle&apos;s detailed repair history.</li>
          <li>
            A vehicle history report is <strong>not</strong> a substitute for an independent vehicle inspection. Get a
            pre-purchase inspection before you buy.
          </li>
        </ul>
        <p>
          Read the official{' '}
          <a href={NMVTIS_DISCLAIMER_URL} target="_blank" rel="noopener noreferrer nofollow">NMVTIS Consumer Access Product Disclaimer (PDF)</a>{' '}
          and its{' '}
          <a href={NMVTIS_DISCLAIMER_SUMMARY_URL} target="_blank" rel="noopener noreferrer nofollow">summary notice (PDF)</a>, or learn more on the{' '}
          <a href="https://vehiclehistory.bja.ojp.gov/nmvtis_consumers" target="_blank" rel="noopener noreferrer nofollow">NMVTIS consumer site</a>.
        </p>

        <p>
          For the terms used throughout a report, see the <Link href="/glossary" className="text-blue-600 font-semibold">VIN &amp; title glossary</Link>.
          Ready to check a vehicle? <Link href="/#vin-search" className="text-blue-600 font-semibold">Run a VIN check</Link>.
        </p>
      </article>
    </main>
  );
}
