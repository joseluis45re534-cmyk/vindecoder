import type { Metadata } from 'next';
import { Mail, Clock, ShieldCheck } from 'lucide-react';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the CarVinLookup support team about VIN reports, billing, or partnership and dealer enquiries.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Contact us</h1>
        <p className="text-slate-500 mb-10 text-lg">
          Questions about a report, billing, or a dealer plan? We&apos;re happy to help.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { icon: Mail, t: 'Email', d: 'support@carvinlookup.com' },
            { icon: Clock, t: 'Hours', d: 'Mon–Fri, 9am–6pm ET' },
            { icon: ShieldCheck, t: 'Dealers', d: 'dealers@carvinlookup.com' },
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
      </section>
    </main>
  );
}
