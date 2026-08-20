
import Link from 'next/link';
import PaymentCalculator from '@/components/PaymentCalculator';
import JsonLd from '@/components/JsonLd';
import Hero from '@/components/home/Hero';
import TrustStrip from '@/components/home/TrustStrip';
import ReportTabs from '@/components/home/ReportTabs';
import SupportBand from '@/components/home/SupportBand';
import ProblemBlock from '@/components/home/ProblemBlock';
import { BRANDS } from '@/lib/brands';
import { SAMPLE_REPORTS } from '@/lib/sample-reports';
import { TRIAL_PLAN, formatPrice } from '@/lib/pricing';
import { faqPageLd, vinCheckHowToLd } from '@/lib/structured-data';
import {
  ShieldCheck, FileText, Lock, Gauge, AlertTriangle, BadgeDollarSign, Star, Database, Zap, Car, DollarSign, Clock, MapPin, Heart, Utensils, Globe,
} from 'lucide-react';

export const runtime = 'edge';

// Report pricing line, sourced from pricing.ts so it never goes stale.
const REPORT_PRICE_LINE = `${formatPrice(TRIAL_PLAN.trialFeeCents ?? 100)} today, then ${formatPrice(
  TRIAL_PLAN.recurringCents ?? 2900,
)}/month after a ${TRIAL_PLAN.trialDays ?? 3}-day trial`;

// Single source for the FAQ — rendered visibly AND emitted as FAQPage JSON-LD,
// so the structured data always mirrors the on-page text.
const FAQ = [
  {
    q: 'What is a VIN?',
    a: 'A Vehicle Identification Number is a unique 17-character code stamped on every car sold in the United States. It encodes the manufacturer, model year, and a serial number used to look up the vehicle’s history.',
  },
  {
    q: 'Where do you get your data?',
    a: 'Reports combine records from the National Motor Vehicle Title Information System (NMVTIS), the National Insurance Crime Bureau (NICB), and state DMV title and registration databases.',
  },
  {
    q: 'Can I run a report with just a license plate?',
    a: 'Yes. Enter a U.S. license plate and we will resolve it to the VIN, then pull the full vehicle history report.',
  },
  {
    q: 'How much does a full report cost?',
    a: `Full report access starts at ${REPORT_PRICE_LINE}, and you can cancel anytime. You always get a free preview of the vehicle’s identity first, so you know we found the right car before you pay.`,
  },
];

const CHECKS = [
  { icon: AlertTriangle, color: 'text-amber-600 bg-amber-50', title: 'Title brands', desc: 'Salvage, rebuilt, junk, and flood-damage titles across all 50 states.' },
  { icon: Gauge, color: 'text-blue-600 bg-blue-50', title: 'Odometer history', desc: 'Reported mileage readings with rollback and tampering alerts.' },
  { icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50', title: 'Theft records', desc: 'Active theft records reported to the NICB and law enforcement.' },
  { icon: BadgeDollarSign, color: 'text-violet-600 bg-violet-50', title: 'Open liens', desc: 'Outstanding loans or liens recorded against the vehicle.' },
  { icon: Database, color: 'text-sky-600 bg-sky-50', title: 'Title & registration', desc: 'Current title state, registration status, and ownership timeline.' },
  { icon: FileText, color: 'text-rose-600 bg-rose-50', title: 'Vehicle identity', desc: 'Make, model, year, body type, engine, and factory specifications.' },
];

// TODO: replace with REAL reviews + an aggregate rating before launch (fabricated
// testimonials/ratings are an FTC risk, especially with a subscription offer).
const RATING = '4.8';
const TESTIMONIALS = [
  { quote: 'The report flagged a salvage title the seller never mentioned. Saved me from a $14,000 mistake.', name: 'Marcus T.', role: 'Bought a used F-150 · Texas' },
  { quote: 'Ran the VIN in the dealer parking lot, had the full history before the test drive was over.', name: 'Alyssa R.', role: 'First-time buyer · Ohio' },
  { quote: 'I check every trade-in with it now. Faster and cheaper than what we used before.', name: 'Dan K.', role: 'Independent dealer · Florida' },
];

const initials = (name: string) => name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Hero />
      <TrustStrip />
      <ReportTabs />

      {/* ===== How it works — 3-step funnel ===== */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8" aria-labelledby="how-heading">
        <div className="max-w-5xl mx-auto scroll-reveal">
          <p className="text-center text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">How it works</p>
          <h2 id="how-heading" className="font-display text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-16 tracking-tight">
            Three steps to the full story
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {[
              { step: '1', title: 'Enter the VIN or plate', desc: 'Type the 17-character VIN or a U.S. license plate and state — from the windshield, door jamb, or the listing.', icon: FileText },
              { step: '2', title: 'We pull the records', desc: 'We query NMVTIS title data, NICB theft records, and state DMV databases in real time.', icon: Database },
              { step: '3', title: 'Read your report', desc: 'Get a clear, complete history report in under a minute — and negotiate with confidence.', icon: Zap },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all p-8">
                <div className="flex items-center justify-between mb-6">
                  <span className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-lg shadow-md shadow-blue-600/25">{step}</span>
                  <Icon className="w-6 h-6 text-slate-300" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProblemBlock />

      {/* ===== Coverage grid ===== */}
      <section id="coverage" className="py-16 sm:py-24 bg-white px-4 sm:px-6 lg:px-8" aria-labelledby="coverage-heading">
        <div className="max-w-6xl mx-auto scroll-reveal">
          <p className="text-center text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Report coverage</p>
          <h2 id="coverage-heading" className="font-display text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-4 tracking-tight">
            What we check on every vehicle
          </h2>
          <p className="text-center text-slate-500 max-w-2xl mx-auto mb-16">
            Every report cross-references federal and state databases so nothing the seller forgot to mention slips through.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CHECKS.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="group bg-slate-50 hover:bg-white rounded-2xl border border-slate-100 hover:border-blue-100 hover:shadow-lg transition-all p-7">
                <span className={`inline-flex w-11 h-11 rounded-xl items-center justify-center mb-5 ${color}`}>
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </span>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Popular brands — internal links to /vin-check/[brand] ===== */}
      <section id="brands" className="py-16 sm:py-24 bg-white px-4 sm:px-6 lg:px-8" aria-labelledby="brands-heading">
        <div className="max-w-6xl mx-auto scroll-reveal">
          <p className="text-center text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Check by brand</p>
          <h2 id="brands-heading" className="font-display text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-4 tracking-tight">
            Popular VIN checks by car brand
          </h2>
          <p className="text-center text-slate-500 max-w-2xl mx-auto mb-12">
            Run a brand-specific report with the common issues and VIN patterns for your make.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {BRANDS.slice(0, 18).map((b) => (
              <Link key={b.slug} href={`/vin-check/${b.slug}`} className="group bg-slate-50 hover:bg-white rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md card-lift px-4 py-3 flex items-center gap-2.5">
                <Car className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />
                <span className="font-semibold text-slate-700 group-hover:text-slate-900 text-sm truncate">{b.name}</span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/vin-check" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-full shadow-md shadow-blue-600/25 active:scale-[0.98] transition-all">
              View all {BRANDS.length} brands →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Sample reports — real demo links with imagery ===== */}
      <section id="examples" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50" aria-labelledby="examples-heading">
        <div className="max-w-6xl mx-auto scroll-reveal">
          <p className="text-center text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Sample reports</p>
          <h2 id="examples-heading" className="font-display text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-4 tracking-tight">
            See what a report catches
          </h2>
          <p className="text-center text-slate-500 max-w-2xl mx-auto mb-16">
            Four real-world scenarios. Open any sample report to see exactly what you&apos;d get before buying.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SAMPLE_REPORTS.map((ex) => (
              <a key={ex.vin} href={`/report/${ex.vin}`} className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden flex flex-col">
                <div className="relative h-40 overflow-hidden bg-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ex.img} alt={ex.alt} width={800} height={450} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className={`absolute top-3 left-3 ${ex.badgeClass} text-white text-xs font-bold px-3 py-1 rounded-full shadow-md`}>{ex.statusLabel}</span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-slate-900">{ex.title}</h3>
                  <p className="font-mono text-[11px] text-slate-400 mt-1 mb-3 truncate">{ex.vin}</p>
                  <p className="text-sm text-slate-500 leading-relaxed flex-1">{ex.finding}</p>
                  <span className="mt-4 text-sm font-bold text-blue-600 group-hover:text-blue-700 inline-flex items-center gap-1">
                    View sample report
                    <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <SupportBand />

      {/* ===== Monthly payment simulator ===== */}
      <section id="calculator" className="py-16 sm:py-24 bg-white px-4 sm:px-6 lg:px-8" aria-labelledby="calc-heading">
        <div className="max-w-5xl mx-auto scroll-reveal">
          <p className="text-center text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Payment simulator</p>
          <h2 id="calc-heading" className="font-display text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-4 tracking-tight">
            What would it cost per month?
          </h2>
          <p className="text-center text-slate-500 max-w-2xl mx-auto mb-14">
            Estimate your monthly loan payment before negotiating — then run the VIN so the car&apos;s history matches its price.
          </p>
          <PaymentCalculator />
        </div>
      </section>

      {/* ===== Why CarVinLookup — value band ===== */}
      <section className="py-16 sm:py-24 bg-slate-900 px-4 sm:px-6 lg:px-8" aria-labelledby="why-heading">
        <div className="max-w-6xl mx-auto scroll-reveal">
          <p className="text-center text-sm font-semibold text-blue-400 uppercase tracking-widest mb-3">Why CarVinLookup</p>
          <h2 id="why-heading" className="font-display text-3xl sm:text-4xl font-bold text-white text-center mb-14 tracking-tight">
            Full history, fair price, no surprises
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: DollarSign, t: 'Start for just $1', d: `Unlock your full vehicle history for ${REPORT_PRICE_LINE} — and cancel anytime.` },
              { icon: Clock, t: 'Under 60 seconds', d: 'Enter a VIN or plate and get a complete report almost instantly.' },
              { icon: Database, t: 'Official sources', d: 'Title, theft, lien & odometer data straight from NMVTIS, NICB, and state DMVs.' },
              { icon: MapPin, t: 'All 50 states', d: 'Cross-state records catch salvage and flood titles that were washed across state lines.' },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="bg-white/5 border border-white/10 rounded-2xl p-7 card-lift hover:bg-white/10">
                <span className="inline-flex w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 items-center justify-center mb-5">
                  <Icon className="w-6 h-6" aria-hidden="true" />
                </span>
                <h3 className="font-bold text-white mb-2">{t}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Social proof ===== */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50" aria-labelledby="reviews-heading">
        <div className="max-w-6xl mx-auto scroll-reveal">
          <p className="text-center text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Trusted by buyers</p>
          <h2 id="reviews-heading" className="font-display text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-6 tracking-tight">
            Real checks. Real saves.
          </h2>
          {/* Rating badge — TODO: wire to a real aggregate rating source. */}
          <div className="flex flex-col items-center gap-1.5 mb-14">
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-display text-2xl font-bold text-slate-900">{RATING}</span>
              <span className="text-slate-400 text-sm">/ 5</span>
            </div>
            <p className="text-xs text-slate-400">Average rating from used-car buyers across all 50 states</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex flex-col">
                <div className="flex gap-1 mb-4" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="text-slate-700 leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-3">
                  <span className="inline-flex w-9 h-9 rounded-full bg-blue-50 text-blue-700 items-center justify-center font-bold text-xs shrink-0">{initials(t.name)}</span>
                  <span>
                    <span className="block font-bold text-slate-900 text-sm">{t.name}</span>
                    <span className="block text-slate-400 text-xs mt-0.5">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ — visible Q&A + matching FAQPage/HowTo JSON-LD ===== */}
      <JsonLd data={[faqPageLd(FAQ), vinCheckHowToLd()]} />
      <section id="faq" className="py-16 sm:py-24 bg-white px-4 sm:px-6 lg:px-8" aria-labelledby="faq-heading">
        <div className="max-w-3xl mx-auto scroll-reveal">
          <p className="text-center text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">FAQ</p>
          <h2 id="faq-heading" className="font-display text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-14 tracking-tight">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group bg-slate-50 rounded-2xl border border-slate-100 open:bg-white open:shadow-md transition-all">
                <summary className="flex items-center justify-between cursor-pointer list-none px-7 py-5 font-bold text-slate-900">
                  {q}
                  <span className="ml-4 text-blue-600 transition-transform group-open:rotate-45 text-xl leading-none" aria-hidden="true">+</span>
                </summary>
                <p className="px-7 pb-6 text-slate-500 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Impact / mission — every purchase funds children's nutrition ===== */}
      <section id="impact" className="scroll-mt-24 py-16 sm:py-24 bg-emerald-50 px-4 sm:px-6 lg:px-8" aria-labelledby="impact-heading">
        <div className="max-w-5xl mx-auto scroll-reveal">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold px-4 py-1.5 mb-5">
              <Heart className="w-4 h-4 fill-emerald-600 text-emerald-600" aria-hidden="true" />
              Our mission
            </span>
            <h2 id="impact-heading" className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              Every report you buy helps feed a child
            </h2>
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl leading-relaxed">
              CarVinLookup is run for a cause. <strong className="text-emerald-700">100% of our profits</strong> go
              directly to funding nutritious meals for children in Africa. When you check a vehicle&apos;s history,
              you protect yourself from a bad car <em>and</em> put food on a child&apos;s plate — a purchase with purpose.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
            {[
              { icon: BadgeDollarSign, t: '100% of profits donated', d: 'Not a slice — every dollar of profit funds children’s nutrition programs.' },
              { icon: Utensils, t: 'Nutritious meals', d: 'Your report helps provide healthy meals to children who need them most.' },
              { icon: Globe, t: 'Children across Africa', d: 'Support reaches communities where a meal makes the biggest difference.' },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-7 text-center">
                <span className="inline-flex w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 items-center justify-center mb-5">
                  <Icon className="w-6 h-6" aria-hidden="true" />
                </span>
                <h3 className="font-bold text-slate-900 mb-2">{t}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Final CTA ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 to-blue-900 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div aria-hidden="true" className="animate-float pointer-events-none absolute -bottom-32 right-0 w-[400px] sm:w-[500px] h-[300px] sm:h-[400px] rounded-full bg-sky-400/20 blur-3xl" />
        <div className="relative max-w-3xl mx-auto text-center scroll-reveal">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            Don&apos;t buy a $20,000 problem.
          </h2>
          <p className="text-blue-100 text-base sm:text-lg mb-8">
            Run the VIN now — the preview is free, and the full report takes less than a minute.
          </p>
          <a href="#vin-search" className="shimmer inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-[1.03] active:scale-100 transition-all">
            <Lock className="w-4 h-4" aria-hidden="true" />
            Check a VIN now
          </a>
        </div>
      </section>
    </main>
  );
}
