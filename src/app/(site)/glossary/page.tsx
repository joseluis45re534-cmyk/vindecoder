import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpenText } from 'lucide-react';
import JsonLd from '@/components/JsonLd';
import { definedTermSetLd, breadcrumbLd } from '@/lib/structured-data';
import { SITE_URL } from '@/lib/site';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'VIN & Vehicle Title Glossary',
  description:
    'Plain-English definitions of VIN and vehicle-title terms: salvage title, rebuilt title, title washing, odometer rollback, NMVTIS, NICB, liens, recalls, and more.',
  alternates: { canonical: '/glossary' },
};

// One source of truth for the glossary — rendered visibly AND emitted as
// DefinedTermSet JSON-LD, so the structured data always mirrors the on-page
// text. `related` is an optional internal link to the page that goes deeper.
interface Term {
  term: string;
  definition: string;
  related?: { label: string; href: string };
}

const TERMS: Term[] = [
  {
    term: 'VIN (Vehicle Identification Number)',
    definition:
      'A unique 17-character code assigned to every vehicle built for the U.S. market since 1981. It encodes the manufacturer, vehicle attributes, and a serial number, and is the key used to look up a vehicle’s title, registration, and history records.',
    related: { label: 'How to read a VIN', href: '/blog/how-to-read-a-vin-number' },
  },
  {
    term: 'Check digit',
    definition:
      'The 9th character of a VIN — a digit or "X" calculated from the other 16 characters using a formula set out in federal regulation (49 CFR 565). It lets systems verify a VIN was transcribed correctly and helps catch certain kinds of tampering.',
    related: { label: 'How to read a VIN', href: '/blog/how-to-read-a-vin-number' },
  },
  {
    term: 'WMI (World Manufacturer Identifier)',
    definition:
      'The first three characters of a VIN, identifying the country, manufacturer, and vehicle type. VINs starting with "1", "4", or "5" typically indicate a vehicle built in the United States.',
    related: { label: 'How to read a VIN', href: '/blog/how-to-read-a-vin-number' },
  },
  {
    term: 'NMVTIS (National Motor Vehicle Title Information System)',
    definition:
      'A national database, overseen by the U.S. Department of Justice, that lets states, law enforcement, and consumers verify a vehicle’s title status, most recent odometer reading, and brand history — designed to prevent title fraud and stop stolen vehicles from being resold.',
    related: { label: 'Our data sources', href: '/data-sources' },
  },
  {
    term: 'NICB (National Insurance Crime Bureau)',
    definition:
      'A nonprofit funded by insurance companies that tracks vehicle theft and insurance fraud. Its VINCheck tool lets consumers check whether a VIN has an unresolved theft record or has been reported as a salvage vehicle by a participating member insurer.',
    related: { label: 'Our data sources', href: '/data-sources' },
  },
  {
    term: 'NHTSA (National Highway Traffic Safety Administration)',
    definition:
      'The U.S. Department of Transportation agency that sets vehicle safety standards and maintains the federal database of manufacturer safety recalls, searchable by VIN.',
    related: { label: 'Our data sources', href: '/data-sources' },
  },
  {
    term: 'Salvage title',
    definition:
      'A title brand applied when an insurer declares a vehicle a total loss, usually because repair costs would exceed a set percentage of its value. A salvage-titled vehicle generally cannot be legally driven or registered until it’s repaired and passes a state inspection.',
    related: { label: 'Salvage vs. rebuilt title', href: '/blog/salvage-title-vs-rebuilt-title' },
  },
  {
    term: 'Rebuilt / reconstructed title',
    definition:
      'The title a salvage vehicle receives after it’s been repaired and passed the state’s required safety inspection. It discloses that the vehicle was once salvage — a fact that follows it for the rest of its life and typically lowers resale value.',
    related: { label: 'Salvage vs. rebuilt title', href: '/blog/salvage-title-vs-rebuilt-title' },
  },
  {
    term: 'Junk title',
    definition:
      'A title brand indicating a vehicle has been declared unfit for road use and is intended for parts or scrap. Junk-titled vehicles generally cannot be re-registered for road use.',
    related: { label: 'Salvage vs. rebuilt title', href: '/blog/salvage-title-vs-rebuilt-title' },
  },
  {
    term: 'Flood / water damage title',
    definition:
      'A title brand applied when a vehicle was submerged in water badly enough to be declared a total loss. Flood damage can cause electrical and corrosion problems that only surface months or years after a cursory repair.',
    related: { label: 'How to check for flood damage', href: '/blog/check-car-for-flood-damage' },
  },
  {
    term: 'Lemon-law buyback',
    definition:
      'A vehicle a manufacturer repurchased from an owner because it had a substantial, unfixable defect under a state’s lemon law. Most states require a buyback to be re-titled with a brand disclosing that history before resale.',
  },
  {
    term: 'Title washing',
    definition:
      'The illegal practice of re-registering a branded vehicle (salvage, flood, etc.) in a state with weaker title-brand rules to obtain a "clean" title that hides its history. Cross-state systems like NMVTIS exist specifically to make title washing harder to pull off.',
    related: { label: 'Salvage vs. rebuilt title', href: '/blog/salvage-title-vs-rebuilt-title' },
  },
  {
    term: 'Odometer rollback',
    definition:
      'Illegally setting a vehicle’s odometer back to show fewer miles than it has actually traveled, inflating its perceived value. Federal law (the Truth in Mileage Act) requires accurate mileage disclosure at every title transfer.',
  },
  {
    term: 'Lien',
    definition:
      'A lender’s legal claim against a vehicle, usually because the owner still owes money on an auto loan. A vehicle with an open lien cannot be legally sold with a clear title until the lien is released.',
  },
  {
    term: 'Total loss / ACV (actual cash value)',
    definition:
      'An insurer’s determination that repairing a damaged vehicle would cost more than a set percentage of its actual cash value — its pre-damage market worth — which triggers a salvage title in most states.',
  },
  {
    term: 'Recall',
    definition:
      'A manufacturer- or NHTSA-ordered correction for a safety defect or non-compliance issue, offered to owners at no cost. Open recalls are searchable by VIN at NHTSA.gov/Recalls.',
    related: { label: 'Our data sources', href: '/data-sources' },
  },
  {
    term: 'VIN cloning',
    definition:
      'Copying a legitimate VIN from another vehicle — often the same make, model, and year — onto a stolen vehicle to disguise its true identity and give it a clean-looking paper trail.',
  },
  {
    term: 'Branded title',
    definition:
      'An umbrella term for any title marked with a permanent history flag — salvage, rebuilt, junk, flood, or lemon-law buyback — that a state DMV records and discloses on future title transfers.',
    related: { label: 'Salvage vs. rebuilt title', href: '/blog/salvage-title-vs-rebuilt-title' },
  },
  {
    term: 'DMV (Department of Motor Vehicles)',
    definition:
      'The state agency responsible for vehicle titling, registration, and driver licensing. Each state’s DMV reports title-brand and odometer data to NMVTIS.',
    related: { label: 'Our data sources', href: '/data-sources' },
  },
];

export default function GlossaryPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd
        data={[
          definedTermSetLd(TERMS.map(({ term, definition }) => ({ term, definition }))),
          breadcrumbLd([
            { name: 'Home', url: SITE_URL },
            { name: 'Glossary', url: `${SITE_URL}/glossary` },
          ]),
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-4 sm:px-6 lg:px-8 pt-14 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center justify-center gap-1.5 text-xs sm:text-sm text-blue-200/70">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-blue-100 font-medium">Glossary</li>
            </ol>
          </nav>
          <span className="inline-flex w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-300 items-center justify-center mb-5">
            <BookOpenText className="w-6 h-6" aria-hidden="true" />
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">VIN &amp; vehicle title glossary</h1>
          <p className="text-slate-300 mt-4 max-w-xl mx-auto">
            Plain-English definitions of the terms you&apos;ll see on a vehicle history report — from VIN structure to title
            brands and the agencies behind the data.
          </p>
        </div>
      </section>

      {/* Terms */}
      <section className="px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="max-w-3xl mx-auto">
          <dl className="space-y-4">
            {TERMS.map(({ term, definition, related }) => (
              <div key={term} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-7">
                <dt className="font-display font-bold text-slate-900 text-lg">{term}</dt>
                <dd className="text-slate-600 leading-relaxed mt-2">{definition}</dd>
                {related && (
                  <Link href={related.href} className="inline-block mt-3 text-sm font-semibold text-blue-600 hover:underline">
                    {related.label} →
                  </Link>
                )}
              </div>
            ))}
          </dl>

          <div className="mt-12 text-center bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
            <p className="text-slate-600">Ready to see these terms on a real report?</p>
            <Link
              href="/#vin-search"
              className="inline-flex items-center gap-2 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-full shadow-md shadow-blue-600/25 transition-all"
            >
              Check a VIN now
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
