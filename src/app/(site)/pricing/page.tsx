import type { Metadata } from 'next';
import { Check } from 'lucide-react';
import { formatPrice } from '@/lib/pricing';
import { getPricing } from '@/lib/settings';
import { SITE_URL } from '@/lib/site';
import CheckoutButtons from '@/components/CheckoutButtons';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Pricing — VIN Reports & Dealer Plans',
  description:
    'Simple pricing for U.S. vehicle history reports. Buy a single report, a 5-report bundle, or an unlimited dealer plan. NMVTIS title data, theft records, liens, and odometer history.',
  alternates: { canonical: '/pricing' },
};

export default async function PricingPage() {
  const plans = await getPricing();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'CarVinLookup Vehicle History Report',
    description: 'U.S. vehicle history report by VIN or license plate.',
    brand: { '@type': 'Brand', name: 'CarVinLookup' },
    offers: plans.map((p) => ({
      '@type': 'Offer',
      name: p.name,
      price: (p.priceCents / 100).toFixed(2),
      priceCurrency: 'USD',
      url: `${SITE_URL}/pricing`,
      availability: 'https://schema.org/InStock',
    })),
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 pt-20 pb-32 px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Simple, honest pricing
        </h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
          Every report pulls the same NMVTIS, NICB, and DMV data. Pay once, or save with a bundle.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`bg-white rounded-3xl border shadow-xl shadow-slate-900/5 p-8 flex flex-col ${
                p.highlighted ? 'border-blue-500 ring-2 ring-blue-100 md:-translate-y-2' : 'border-slate-100'
              }`}
            >
              {p.highlighted && (
                <span className="self-start text-xs font-bold text-white bg-blue-600 px-3 py-1 rounded-full mb-4">
                  Most popular
                </span>
              )}
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

        <p className="text-center text-sm text-slate-400 mt-10">
          Secure checkout via Stripe &amp; PayPal. Reports are delivered instantly and never expire.
        </p>
      </section>
    </main>
  );
}
