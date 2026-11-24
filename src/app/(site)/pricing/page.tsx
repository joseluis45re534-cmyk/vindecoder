import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { Check, Search } from 'lucide-react';
import { formatPrice, TRIAL_PLAN, reportPriceLine, PER_VEHICLE_NOTE } from '@/lib/pricing';
import { getPricing } from '@/lib/settings';
import { SUPPORT_EMAIL } from '@/lib/site';
import { faqPageLd } from '@/lib/structured-data';
import JsonLd from '@/components/JsonLd';
import CheckoutButtons from '@/components/CheckoutButtons';

export const runtime = 'edge';

// The one-time Single / 5-Report Bundle / Dealer plans (DEFAULT_PLANS, editable
// in the admin) are HIDDEN. Checkout from this page carries no VIN, and report
// access is granted per VIN (lib/account.ts emailOwnsReport), so those purchases
// unlocked no report — and the dealer features they listed (API, team seats,
// bulk upload) don't exist. The offer customers can actually buy is TRIAL_PLAN,
// sold on each report page after the free preview. Re-enable the grid only
// after checkout can attach a VIN or credits (a billing-core change that needs
// the owner's sign-off).
const SHOW_LEGACY_PLANS = false;

const FEE = formatPrice(TRIAL_PLAN.trialFeeCents ?? 100);
const MONTHLY = formatPrice(TRIAL_PLAN.recurringCents ?? 2900);
const DAYS = TRIAL_PLAN.trialDays ?? 3;

export const metadata: Metadata = pageMetadata({
  title: `Pricing — Free Preview, ${FEE} Trial, Then ${MONTHLY}/mo`,
  description: `CarVinLookup pricing: a free vehicle preview, then the full history report for ${reportPriceLine()}. Billed per vehicle.`,
  path: '/pricing',
});

// Single source for the visible Q&A and its FAQPage JSON-LD.
const FAQ = [
  {
    q: 'What does the free preview include?',
    a: 'The year, make, model, and decoded factory details for the VIN you enter, so you can confirm it is the right car before you pay anything.',
  },
  {
    q: `What do I get for ${FEE}?`,
    a: `The full history report for that vehicle — title brands, salvage and flood records, a theft check, liens, odometer readings, accident and auction history (with photos when on file), and open recalls — plus a PDF download. The ${FEE} starts a ${DAYS}-day trial.`,
  },
  {
    q: 'What happens after the trial?',
    a: `Unless you cancel within the ${DAYS} days, that vehicle's subscription renews at ${MONTHLY}/month until you cancel.`,
  },
  {
    q: 'Is billing per vehicle?',
    a: `Yes. ${PER_VEHICLE_NOTE} To cancel, use "Manage or cancel subscription" in your account. If you unlocked more than one vehicle and don't see every subscription there, email support@carvinlookup.us with the VINs and we'll cancel them.`,
  },
  {
    q: 'How do I cancel or get a refund?',
    a: `Sign in to your account and use "Manage or cancel subscription", or email ${SUPPORT_EMAIL} with the VIN. Refund terms are in our refund & cancellation policy.`,
  },
];

export default async function PricingPage() {
  const plans = SHOW_LEGACY_PLANS ? await getPricing() : [];

  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd data={faqPageLd(FAQ)} />

      <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 pt-20 pb-32 px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Simple, honest pricing
        </h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
          See the vehicle for free. Unlock its full history for {reportPriceLine()}.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-16">
        {SHOW_LEGACY_PLANS ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => (
              <div
                key={p.id}
                className={`bg-white rounded-3xl border shadow-xl shadow-slate-900/5 p-8 flex flex-col ${
                  p.highlighted ? 'border-blue-500 ring-2 ring-blue-100 md:-translate-y-2' : 'border-slate-100'
                }`}
              >
                <h2 className="text-xl font-extrabold text-slate-900">{p.name}</h2>
                <p className="text-sm text-slate-500 mb-5">{p.tagline}</p>
                <p className="mb-6">
                  <span className="text-4xl font-extrabold text-slate-900">{formatPrice(p.priceCents)}</span>
                  <span className="text-slate-400 font-medium">/{p.interval === 'month' ? 'mo' : 'one-time'}</span>
                </p>
                <ul className="space-y-3 text-sm text-slate-600 mb-8 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
                <CheckoutButtons planId={p.id} highlighted={p.highlighted} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Step 1 — free */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-900/5 p-8 flex flex-col">
              <h2 className="text-xl font-extrabold text-slate-900">Vehicle preview</h2>
              <p className="text-sm text-slate-500 mb-5">Confirm it&apos;s the right car first</p>
              <p className="mb-6">
                <span className="text-4xl font-extrabold text-slate-900">Free</span>
              </p>
              <ul className="space-y-3 text-sm text-slate-600 mb-8 flex-1">
                {['Year, make, and model', 'Decoded factory details', 'Enter any 17-character VIN', 'Just your email — no card required'].map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/#vin-search"
                className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <Search className="w-4 h-4" aria-hidden="true" /> Check a VIN
              </Link>
            </div>

            {/* Step 2 — the real paid offer (TRIAL_PLAN) */}
            <div className="bg-white rounded-3xl border border-blue-500 ring-2 ring-blue-100 shadow-xl shadow-slate-900/5 p-8 flex flex-col">
              <h2 className="text-xl font-extrabold text-slate-900">{TRIAL_PLAN.name}</h2>
              <p className="text-sm text-slate-500 mb-5">Unlock the complete report for one vehicle</p>
              <p className="mb-1">
                <span className="text-4xl font-extrabold text-slate-900">{FEE}</span>
                <span className="text-slate-400 font-medium"> today</span>
              </p>
              <p className="text-sm text-slate-500 mb-6">
                {DAYS}-day trial, then {MONTHLY}/month unless you cancel. {PER_VEHICLE_NOTE}
              </p>
              <ul className="space-y-3 text-sm text-slate-600 mb-8 flex-1">
                {TRIAL_PLAN.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/#vin-search"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Search className="w-4 h-4" aria-hidden="true" /> Start with a free preview
              </Link>
            </div>
          </div>
        )}

        <p className="text-center text-sm text-slate-400 mt-10">
          Secure checkout via Stripe. Unlocked reports stay in your account. Cancel from your account or by emailing support.
        </p>
      </section>

      {/* What you get + Q&A — crawlable detail behind the cards */}
      <section className="bg-white border-t border-slate-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto prose-content">
          <h2>What every report includes</h2>
          <ul>
            <li><strong>Title brands</strong> — salvage, rebuilt, junk, and flood brands from NMVTIS, across every state</li>
            <li><strong>Total-loss and salvage records</strong> reported by insurers and salvage yards</li>
            <li><strong>Salvage-auction records</strong> with damage type and photos, where available</li>
            <li><strong>Theft check, open liens, and odometer readings</strong> over time</li>
            <li><strong>Open safety recalls</strong> and the decoded factory specs</li>
          </ul>
          <p>
            A report shows what was reported to these sources — see our <Link href="/data-sources">data sources</Link> for the
            honest limits, and get an independent inspection before you buy. Compare us with{' '}
            <Link href="/compare">other report providers</Link>.
          </p>

          <h2>Pricing questions</h2>
          {FAQ.map(({ q, a }) => (
            <div key={q}>
              <h3>{q}</h3>
              <p>{a}</p>
            </div>
          ))}
          <p>
            Read the full <Link href="/refund">refund &amp; cancellation policy</Link> or{' '}
            <Link href="/contact">contact support</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}
