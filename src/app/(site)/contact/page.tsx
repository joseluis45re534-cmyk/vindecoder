import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { Mail, Clock, ShieldCheck, MapPin, Phone } from 'lucide-react';
import ContactForm from '@/components/ContactForm';
import { SUPPORT_EMAIL, SUPPORT_PHONE, SITE_ADDRESS } from '@/lib/site';

export const runtime = 'edge';

export const metadata: Metadata = pageMetadata({
  title: 'Contact Us',
  description:
    'Contact CarVinLookup support about a vehicle history report, billing, a refund, or a dealer or partnership enquiry. Email support@carvinlookup.us.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Contact us</h1>
        <p className="text-slate-500 mb-10 text-lg">
          Questions about a report, billing, or a dealer plan? We&apos;re happy to help.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {[
            { icon: Mail, t: 'Email', d: SUPPORT_EMAIL },
            ...(SUPPORT_PHONE ? [{ icon: Phone, t: 'Phone', d: SUPPORT_PHONE }] : []),
            { icon: Clock, t: 'VIN checks', d: 'Run a report online anytime, 24/7' },
            { icon: ShieldCheck, t: 'Dealers', d: 'dealers@carvinlookup.us' },
            {
              icon: MapPin,
              t: 'Address',
              d: `${SITE_ADDRESS.line1}, ${SITE_ADDRESS.line2}, ${SITE_ADDRESS.city}, ${SITE_ADDRESS.region} ${SITE_ADDRESS.postalCode} ${SITE_ADDRESS.country}`,
            },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="bg-white rounded-2xl border border-slate-100 p-6 card-lift">
              <span className="inline-flex w-11 h-11 rounded-xl bg-blue-50 text-blue-600 items-center justify-center mb-4">
                <Icon className="w-5 h-5" aria-hidden="true" />
              </span>
              <h2 className="font-bold text-slate-900 mb-1">{t}</h2>
              <p className="text-slate-500 text-sm break-words">{d}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-10">
          <h2 className="font-bold text-slate-900 mb-3">Before you write — quick answers</h2>
          <ul className="space-y-2 text-sm text-slate-600 list-disc pl-5">
            <li>
              <strong>Cancel or manage your plan:</strong> sign in to your{' '}
              <Link href="/account" className="text-blue-600 font-semibold hover:underline">account</Link>. Billing terms are in our{' '}
              <Link href="/refund" className="text-blue-600 font-semibold hover:underline">refund &amp; cancellation policy</Link>.
            </li>
            <li>
              <strong>Understanding a report:</strong> see{' '}
              <Link href="/how-to/read-vin-report" className="text-blue-600 font-semibold hover:underline">how to read a VIN report</Link> and the{' '}
              <Link href="/glossary" className="text-blue-600 font-semibold hover:underline">VIN &amp; title glossary</Link>.
            </li>
            <li>
              <strong>Where the data comes from:</strong>{' '}
              <Link href="/data-sources" className="text-blue-600 font-semibold hover:underline">data sources &amp; methodology</Link>.
            </li>
            <li>
              <strong>Report question?</strong> Include the VIN and the email you used at checkout so we can find it fast.
            </li>
          </ul>
        </div>

        <ContactForm />
      </section>
    </main>
  );
}
