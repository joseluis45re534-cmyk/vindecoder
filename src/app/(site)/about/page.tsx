import type { Metadata } from 'next';
import Link from 'next/link';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'CarVinLookup provides instant U.S. vehicle history reports from NMVTIS, NICB, and state DMV records to help used-car buyers avoid costly mistakes.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 prose-content">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">About CarVinLookup</h1>
        <p>
          CarVinLookup helps used-car buyers in the United States make confident decisions. We turn a VIN or license plate
          into a clear vehicle history report — title brands, salvage and flood damage, theft records, open liens, and
          odometer readings — in under a minute.
        </p>
        <h2>Where our data comes from</h2>
        <p>
          Every report combines the National Motor Vehicle Title Information System (NMVTIS), the National Insurance Crime
          Bureau (NICB), and state DMV title and registration databases. Because we cross-reference records from all 50
          states, problems that were retitled across state lines to hide a brand still show up.
        </p>
        <h2>Why we built it</h2>
        <p>
          A clean-looking listing can hide a salvage title, a rolled-back odometer, or an open loan. We built CarVinLookup
          so that anyone — not just dealers — can check a car&apos;s real history before handing over thousands of dollars.
        </p>
        <p>
          Ready to check a vehicle? <Link href="/#vin-search" className="text-blue-600 font-semibold">Run a VIN check</Link>{' '}
          or browse our <Link href="/vin-check" className="text-blue-600 font-semibold">brand guides</Link>.
        </p>
      </article>
    </main>
  );
}
