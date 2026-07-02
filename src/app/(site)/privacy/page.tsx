import type { Metadata } from 'next';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How CarVinLookup collects, uses, and protects your information when you run a vehicle history report.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 prose-content">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">Privacy Policy</h1>
        <p>Last updated: {new Date().getFullYear()}</p>
        <p>
          CarVinLookup respects your privacy. This policy explains what we collect and how we use it. By using the site you
          agree to the practices described here.
        </p>
        <h2>Information we collect</h2>
        <ul>
          <li><strong>VIN / plate lookups</strong> you enter to generate a report.</li>
          <li><strong>Account &amp; billing details</strong> (email, payment confirmation) when you purchase a report.</li>
          <li><strong>Usage data</strong> such as pages viewed, collected via privacy-friendly first-party analytics.</li>
        </ul>
        <h2>How we use it</h2>
        <p>To generate your reports, process payments, provide support, prevent fraud, and improve the service. We do not sell your personal information.</p>
        <h2>Payment processing</h2>
        <p>Payments are handled by Stripe and PayPal. We never store full card numbers on our servers.</p>
        <h2>Data sources</h2>
        <p>Vehicle records originate from NMVTIS, NICB, and state DMV databases and are governed by their respective terms.</p>
        <h2>Your choices</h2>
        <p>You can request access to or deletion of your account data by contacting support@carvinlookup.us.</p>
      </article>
    </main>
  );
}
