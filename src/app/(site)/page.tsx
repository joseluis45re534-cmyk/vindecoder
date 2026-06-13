
import Link from 'next/link';
import SearchForm from '@/components/SearchForm';
import PaymentCalculator from '@/components/PaymentCalculator';
import { BRANDS } from '@/lib/brands';
import {
  ShieldCheck,
  FileText,
  Lock,
  Gauge,
  AlertTriangle,
  BadgeDollarSign,
  CheckCircle2,
  Star,
  Database,
  Zap,
  Car,
  DollarSign,
  Clock,
  MapPin,
} from 'lucide-react';

export const runtime = 'edge';

const STATS = [
  { value: '268M+', label: 'Vehicle records indexed' },
  { value: '50', label: 'States covered' },
  { value: '< 60s', label: 'Average report time' },
  { value: '4.8/5', label: 'Buyer rating' },
];

const CHECKS = [
  {
    icon: AlertTriangle,
    color: 'text-amber-600 bg-amber-50',
    title: 'Title brands',
    desc: 'Salvage, rebuilt, junk, and flood-damage titles across all 50 states.',
  },
  {
    icon: Gauge,
    color: 'text-blue-600 bg-blue-50',
    title: 'Odometer history',
    desc: 'Reported mileage readings with rollback and tampering alerts.',
  },
  {
    icon: ShieldCheck,
    color: 'text-emerald-600 bg-emerald-50',
    title: 'Theft records',
    desc: 'Active theft records reported to the NICB and law enforcement.',
  },
  {
    icon: BadgeDollarSign,
    color: 'text-violet-600 bg-violet-50',
    title: 'Open liens',
    desc: 'Outstanding loans or liens recorded against the vehicle.',
  },
  {
    icon: Database,
    color: 'text-sky-600 bg-sky-50',
    title: 'Title & registration',
    desc: 'Current title state, registration status, and ownership timeline.',
  },
  {
    icon: FileText,
    color: 'text-rose-600 bg-rose-50',
    title: 'Vehicle identity',
    desc: 'Make, model, year, body type, engine, and factory specifications.',
  },
];

// Sample VINs wired to the demo API: last char S = theft, W = salvage, F = lien.
const EXAMPLES = [
  {
    vin: '4T1G11AK5MU546321',
    title: '2021 Toyota Camry',
    status: 'Clean history',
    badge: 'bg-emerald-600',
    finding: 'No brands, liens, or theft records found. Verified odometer.',
    img: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=60',
    alt: 'White Toyota sedan parked outdoors',
  },
  {
    vin: 'JF1VA2M62K980015S',
    title: '2019 Subaru WRX',
    status: 'Theft record',
    badge: 'bg-red-600',
    finding: 'Active theft record reported to the NICB. Walk away or verify recovery.',
    img: 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?auto=format&fit=crop&w=800&q=60',
    alt: 'Blue Subaru sports sedan on a road',
  },
  {
    vin: '1G1ZE5ST5FF21984W',
    title: '2015 Chevrolet Malibu',
    status: 'Salvage title',
    badge: 'bg-amber-600',
    finding: 'Branded salvage after an insurance total loss. Expect heavy repairs.',
    img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=60',
    alt: 'Red Chevrolet coupe in a studio',
  },
  {
    vin: '1FTFW1ED5PFA1234F',
    title: '2023 Ford F-150',
    status: 'Active lien',
    badge: 'bg-violet-600',
    finding: 'A lender still holds a lien — the seller cannot transfer a clean title yet.',
    img: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=60',
    alt: 'Black Ford pickup truck on a desert road',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'The report flagged a salvage title the seller never mentioned. Saved me from a $14,000 mistake.',
    name: 'Marcus T.',
    role: 'Bought a used F-150 · Texas',
  },
  {
    quote:
      'Ran the VIN in the dealer parking lot, had the full history before the test drive was over.',
    name: 'Alyssa R.',
    role: 'First-time buyer · Ohio',
  },
  {
    quote:
      'I check every trade-in with it now. Faster and cheaper than what we used before.',
    name: 'Dan K.',
    role: 'Independent dealer · Florida',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* ===== Hero — dark trust gradient, search front & center ===== */}
      <section
        id="vin-search"
        className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 pt-16 sm:pt-20 pb-24 sm:pb-28 px-4 sm:px-6 lg:px-8"
      >
        {/* Decorative glow */}
        <div
          aria-hidden="true"
          className="animate-float pointer-events-none absolute -top-40 left-1/2 w-[600px] sm:w-[800px] h-[400px] sm:h-[500px] rounded-full bg-blue-600/20 blur-3xl"
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <p className="animate-rise inline-flex items-center gap-2 bg-white/10 border border-white/15 text-blue-100 text-xs sm:text-sm font-medium px-4 py-1.5 rounded-full mb-8 backdrop-blur">
            <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            Official NMVTIS, NICB &amp; DMV data · All 50 states
          </p>
          <h1 className="animate-rise text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.08]">
            Know the car&apos;s past
            <span className="block bg-gradient-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent mt-1">
              before you pay for it.
            </span>
          </h1>
          <p className="animate-rise-delay-1 max-w-2xl mx-auto text-lg sm:text-xl text-slate-300 mb-10">
            Enter any VIN or U.S. license plate and get an instant vehicle history report — title brands, salvage &amp; flood damage, theft records, liens, and odometer rollback.
          </p>

          <div className="animate-rise-delay-2">
            <SearchForm />
          </div>

          <ul className="animate-rise-delay-2 mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" aria-hidden="true" /> Free vehicle preview
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" aria-hidden="true" /> Instant delivery
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" aria-hidden="true" /> Secure checkout
            </li>
          </ul>
        </div>
      </section>

      {/* ===== Trust bar — metric cards ===== */}
      <section aria-label="Key statistics" className="relative -mt-12 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-100 grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100">
          {STATS.map((s) => (
            <div key={s.label} className="p-6 text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{s.value}</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Inside your report — visual showcase ===== */}
      <section id="report" className="py-16 sm:py-24 bg-white px-4 sm:px-6 lg:px-8" aria-labelledby="report-heading">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center scroll-reveal">
          {/* Visual: photo + floating animated report card */}
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/report-hero.jpg"
              alt="A couple at a dealership checking a used car's history report on a phone"
              width={1600}
              height={905}
              loading="lazy"
              className="w-full rounded-3xl shadow-xl shadow-slate-900/10 object-cover aspect-[16/10]"
            />
            {/* Floating report summary (desktop) */}
            <div className="hidden sm:block absolute -bottom-6 -right-4 lg:-right-8 w-64 bg-white rounded-2xl shadow-2xl shadow-slate-900/15 border border-slate-100 p-5 animate-rise">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
                <ShieldCheck className="w-4 h-4 text-blue-600" aria-hidden="true" />
                <span className="text-xs font-bold text-slate-900">2021 Toyota Camry — Report</span>
              </div>
              {[
                { label: 'Title', value: 'Clean', ok: true },
                { label: 'Theft record', value: 'None found', ok: true },
                { label: 'Odometer', value: 'Verified', ok: true },
                { label: 'Open liens', value: 'None', ok: true },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between py-1.5 text-xs">
                  <span className="text-slate-500">{r.label}</span>
                  <span className="flex items-center gap-1 font-bold text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> {r.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Content: what's in the report */}
          <div>
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Inside your report</p>
            <h2 id="report-heading" className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              See exactly what you&apos;ll get
            </h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Every CarVinLookup report turns a VIN into a clear, complete picture of a vehicle&apos;s past — so you can negotiate hard and buy with confidence.
            </p>
            <ul className="space-y-4">
              {[
                { icon: AlertTriangle, c: 'text-amber-600 bg-amber-50', t: 'Title & brand history', d: 'Salvage, rebuilt, junk & flood titles across all 50 states.' },
                { icon: ShieldCheck, c: 'text-emerald-600 bg-emerald-50', t: 'Theft records', d: 'Active theft & recovery reports from the NICB.' },
                { icon: Gauge, c: 'text-blue-600 bg-blue-50', t: 'Odometer readings', d: 'Reported mileage with rollback & tampering alerts.' },
                { icon: BadgeDollarSign, c: 'text-violet-600 bg-violet-50', t: 'Liens & specs', d: 'Open loans, plus full make/model/engine decode & recalls.' },
              ].map(({ icon: Icon, c, t, d }) => (
                <li key={t} className="flex items-start gap-4">
                  <span className={`inline-flex w-10 h-10 rounded-xl items-center justify-center shrink-0 ${c}`}>
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-bold text-slate-900">{t}</span>
                    <span className="block text-sm text-slate-500">{d}</span>
                  </span>
                </li>
              ))}
            </ul>
            <a
              href="#vin-search"
              className="mt-8 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-full shadow-md shadow-blue-600/25 active:scale-[0.98] transition-all"
            >
              <FileText className="w-4 h-4" aria-hidden="true" /> See your report
            </a>
          </div>
        </div>
      </section>

      {/* ===== How it works — 3-step funnel ===== */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8" aria-labelledby="how-heading">
        <div className="max-w-5xl mx-auto scroll-reveal">
          <p className="text-center text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">How it works</p>
          <h2 id="how-heading" className="text-3xl sm:text-4xl font-extrabold text-slate-900 text-center mb-16 tracking-tight">
            Three steps to the full story
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {[
              {
                step: '1',
                title: 'Enter the VIN or plate',
                desc: 'Type the 17-character VIN or a U.S. license plate and state — from the windshield, door jamb, or the listing.',
                icon: FileText,
              },
              {
                step: '2',
                title: 'We pull the records',
                desc: 'We query NMVTIS title data, NICB theft records, and state DMV databases in real time.',
                icon: Database,
              },
              {
                step: '3',
                title: 'Read your report',
                desc: 'Get a clear, complete history report in under a minute — and negotiate with confidence.',
                icon: Zap,
              },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div
                key={step}
                className="relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-lg shadow-md shadow-blue-600/25">
                    {step}
                  </span>
                  <Icon className="w-6 h-6 text-slate-300" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Coverage grid ===== */}
      <section id="coverage" className="py-16 sm:py-24 bg-white px-4 sm:px-6 lg:px-8" aria-labelledby="coverage-heading">
        <div className="max-w-6xl mx-auto scroll-reveal">
          <p className="text-center text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Report coverage</p>
          <h2 id="coverage-heading" className="text-3xl sm:text-4xl font-extrabold text-slate-900 text-center mb-4 tracking-tight">
            What we check on every vehicle
          </h2>
          <p className="text-center text-slate-500 max-w-2xl mx-auto mb-16">
            Every report cross-references federal and state databases so nothing the seller forgot to mention slips through.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CHECKS.map(({ icon: Icon, color, title, desc }) => (
              <div
                key={title}
                className="group bg-slate-50 hover:bg-white rounded-2xl border border-slate-100 hover:border-blue-100 hover:shadow-lg transition-all p-7"
              >
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
          <h2 id="brands-heading" className="text-3xl sm:text-4xl font-extrabold text-slate-900 text-center mb-4 tracking-tight">
            Popular VIN checks by car brand
          </h2>
          <p className="text-center text-slate-500 max-w-2xl mx-auto mb-12">
            Run a brand-specific report with the common issues and VIN patterns for your make.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {BRANDS.slice(0, 18).map((b) => (
              <Link
                key={b.slug}
                href={`/vin-check/${b.slug}`}
                className="group bg-slate-50 hover:bg-white rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md card-lift px-4 py-3 flex items-center gap-2.5"
              >
                <Car className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />
                <span className="font-semibold text-slate-700 group-hover:text-slate-900 text-sm truncate">{b.name}</span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/vin-check"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-full shadow-md shadow-blue-600/25 active:scale-[0.98] transition-all"
            >
              View all {BRANDS.length} brands →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Sample reports — real demo links with imagery ===== */}
      <section id="examples" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50" aria-labelledby="examples-heading">
        <div className="max-w-6xl mx-auto scroll-reveal">
          <p className="text-center text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Sample reports</p>
          <h2 id="examples-heading" className="text-3xl sm:text-4xl font-extrabold text-slate-900 text-center mb-4 tracking-tight">
            See what a report catches
          </h2>
          <p className="text-center text-slate-500 max-w-2xl mx-auto mb-16">
            Four real-world scenarios. Open any sample report to see exactly what you&apos;d get before buying.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {EXAMPLES.map((ex) => (
              <a
                key={ex.vin}
                href={`/report/${ex.vin}`}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden flex flex-col"
              >
                <div className="relative h-40 overflow-hidden bg-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ex.img}
                    alt={ex.alt}
                    width={800}
                    height={450}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className={`absolute top-3 left-3 ${ex.badge} text-white text-xs font-bold px-3 py-1 rounded-full shadow-md`}>
                    {ex.status}
                  </span>
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

      {/* ===== Monthly payment simulator ===== */}
      <section id="calculator" className="py-16 sm:py-24 bg-white px-4 sm:px-6 lg:px-8" aria-labelledby="calc-heading">
        <div className="max-w-5xl mx-auto scroll-reveal">
          <p className="text-center text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Payment simulator</p>
          <h2 id="calc-heading" className="text-3xl sm:text-4xl font-extrabold text-slate-900 text-center mb-4 tracking-tight">
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
          <h2 id="why-heading" className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-14 tracking-tight">
            Full history, fair price, no surprises
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: DollarSign, t: 'One flat price', d: 'A full report is $24.99 — far less than legacy providers, with no subscription required.' },
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
          <h2 id="reviews-heading" className="text-3xl sm:text-4xl font-extrabold text-slate-900 text-center mb-16 tracking-tight">
            Real checks. Real saves.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex flex-col">
                <div className="flex gap-1 mb-4" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="text-slate-700 leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-6 pt-5 border-t border-slate-100">
                  <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{t.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ — plain content (no FAQ schema; restricted to gov/health per Google) ===== */}
      <section id="faq" className="py-16 sm:py-24 bg-white px-4 sm:px-6 lg:px-8" aria-labelledby="faq-heading">
        <div className="max-w-3xl mx-auto scroll-reveal">
          <p className="text-center text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">FAQ</p>
          <h2 id="faq-heading" className="text-3xl sm:text-4xl font-extrabold text-slate-900 text-center mb-14 tracking-tight">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {[
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
                a: 'A full report is $24.99. You always get a free preview of the vehicle’s identity first, so you know we found the right car before you pay.',
              },
            ].map(({ q, a }) => (
              <details
                key={q}
                className="group bg-slate-50 rounded-2xl border border-slate-100 open:bg-white open:shadow-md transition-all"
              >
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

      {/* ===== Final CTA ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 to-blue-900 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div
          aria-hidden="true"
          className="animate-float pointer-events-none absolute -bottom-32 right-0 w-[400px] sm:w-[500px] h-[300px] sm:h-[400px] rounded-full bg-sky-400/20 blur-3xl"
        />
        <div className="relative max-w-3xl mx-auto text-center scroll-reveal">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
            Don&apos;t buy a $20,000 problem.
          </h2>
          <p className="text-blue-100 text-base sm:text-lg mb-8">
            Run the VIN now — the preview is free, and the full report takes less than a minute.
          </p>
          <a
            href="#vin-search"
            className="shimmer inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-[1.03] active:scale-100 transition-all"
          >
            <Lock className="w-4 h-4" aria-hidden="true" />
            Check a VIN now
          </a>
        </div>
      </section>
    </main>
  );
}
