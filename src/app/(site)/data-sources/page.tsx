import type { Metadata } from 'next';
import Link from 'next/link';
import { Database, ExternalLink } from 'lucide-react';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd } from '@/lib/structured-data';
import { SITE_URL } from '@/lib/site';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Data Sources & Methodology',
  description:
    'What NMVTIS, NICB, NHTSA, and state DMVs each contribute to a CarVinLookup report, how the data is combined, and the honest limits of any VIN-based history check.',
  alternates: { canonical: '/data-sources' },
};

const SOURCES = [
  {
    name: 'NMVTIS',
    full: 'National Motor Vehicle Title Information System',
    href: 'https://vehiclehistory.gov',
    provides:
      'Title status and title-brand history (salvage, junk, flood, rebuilt) reported by state DMVs, insurance carriers, and salvage yards nationwide, plus the most recent reported odometer reading. NMVTIS is the primary cross-state check for title washing — a brand recorded in one state stays attached to the VIN even if the car is later retitled elsewhere.',
    overseenBy: 'U.S. Department of Justice, operated by the American Association of Motor Vehicle Administrators (AAMVA).',
  },
  {
    name: 'NICB',
    full: 'National Insurance Crime Bureau',
    href: 'https://www.nicb.org/vincheck',
    provides:
      'Theft records and total-loss (salvage) records reported by participating member insurance companies. This catches vehicles that were reported stolen and not recovered, or totaled by an insurer, at the time of the claim.',
    overseenBy: 'A nonprofit funded by insurance companies; participation is voluntary, so coverage depends on which insurers report.',
  },
  {
    name: 'NHTSA',
    full: 'National Highway Traffic Safety Administration',
    href: 'https://www.nhtsa.gov/recalls',
    provides:
      'Open manufacturer safety recalls tied to the vehicle, sourced from the federal recall database maintained by the U.S. Department of Transportation.',
    overseenBy: 'U.S. Department of Transportation.',
  },
  {
    name: 'State DMVs',
    full: 'State Departments of Motor Vehicles',
    href: null,
    provides:
      'Current title state, registration status, and ownership-timeline data, reported into NMVTIS by each state’s titling agency.',
    overseenBy: 'Individual state governments.',
  },
];

export default function DataSourcesPage() {
  return (
    <main className="min-h-screen bg-white">
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', url: SITE_URL },
          { name: 'Data Sources', url: `${SITE_URL}/data-sources` },
        ])}
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
            A CarVinLookup report is a combination of federal and state records — here&apos;s exactly what each source
            contributes, and what a report can&apos;t tell you.
          </p>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 prose-content">
        <h2>What each source provides</h2>
        <p>
          Every CarVinLookup report cross-references four kinds of records. We don&apos;t generate any of this data
          ourselves — we query the same official and industry sources a dealer or insurer would use, and present them in
          one place.
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
            <strong>Reporting is not universal.</strong> NICB&apos;s theft and salvage data depends on which insurers
            participate; a claim with a non-participating insurer won&apos;t appear.
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

        <p>
          For the terms used throughout a report, see the <Link href="/glossary" className="text-blue-600 font-semibold">VIN &amp; title glossary</Link>.
          Ready to check a vehicle? <Link href="/#vin-search" className="text-blue-600 font-semibold">Run a VIN check</Link>.
        </p>
      </article>
    </main>
  );
}
