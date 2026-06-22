import type { Metadata } from 'next';
import Link from 'next/link';
import { TRIAL_PLAN, formatPrice } from '@/lib/pricing';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy',
  description:
    'How CarVinLookup billing works — the $1 trial, the recurring monthly subscription, how to cancel anytime, and our refund terms.',
  alternates: { canonical: '/refund' },
};

const FEE = formatPrice(TRIAL_PLAN.trialFeeCents ?? 100);
const MONTHLY = formatPrice(TRIAL_PLAN.recurringCents ?? 2900);
const DAYS = TRIAL_PLAN.trialDays ?? 3;

export default function RefundPage() {
  return (
    <main className="min-h-screen bg-white">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 prose-content">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">Refund &amp; Cancellation Policy</h1>
        <p>Last updated: {new Date().getFullYear()}</p>
        <p>
          This policy explains exactly how billing works for a CarVinLookup report, how to cancel, and when refunds apply.
          We aim to be completely transparent so there are no surprises.
        </p>

        <h2>How billing works</h2>
        <ul>
          <li>You are charged <strong>{FEE} today</strong> to start full report access. This begins a <strong>{DAYS}-day trial</strong>.</li>
          <li>If you do <strong>not</strong> cancel within {DAYS} days, your subscription automatically renews at <strong>{MONTHLY} per month</strong>, and continues monthly on the same date until you cancel.</li>
          <li>You always see a free preview of the vehicle&apos;s identity before any charge.</li>
        </ul>

        <h2>How to cancel</h2>
        <p>
          You can cancel at any time — there are no cancellation fees. Use the <strong>&quot;Manage or cancel subscription&quot;</strong>
          link shown after checkout (it opens the secure Stripe customer portal), or email us and we will cancel it for you.
          Cancelling before the {DAYS}-day trial ends means you are only ever charged the {FEE} trial fee and never the {MONTHLY} monthly amount.
        </p>

        <h2>Refunds</h2>
        <ul>
          <li>The {FEE} trial fee is non-refundable, as it unlocks immediate access to your report.</li>
          <li>Cancelling stops all <em>future</em> monthly charges; we do not bill you again once cancelled.</li>
          <li>If you were charged in error, charged after cancelling, or could not access your report, contact us within <strong>30 days</strong> of the charge and we will review it in good faith and issue a refund where warranted.</li>
        </ul>

        <h2>Failed payments</h2>
        <p>
          If a monthly payment fails, our payment processor (Stripe) automatically retries it over several days. If it cannot
          be collected, access is paused until billing is updated.
        </p>

        <h2>Questions</h2>
        <p>
          For any billing or cancellation question, reach us at <a href="mailto:support@carvinlookup.us">support@carvinlookup.us</a> or
          through our <Link href="/contact">contact page</Link>. See also our <Link href="/terms">Terms of Service</Link>.
        </p>
      </article>
    </main>
  );
}
