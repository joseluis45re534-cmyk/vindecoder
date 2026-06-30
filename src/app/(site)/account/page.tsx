import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Stripe from 'stripe';
import { FileText, Car, ArrowRight, CheckCircle2, CreditCard, Clock } from 'lucide-react';
import { getEnv } from '@/lib/cf';
import { getPaymentConfig } from '@/lib/settings';
import { createClient } from '@/lib/supabase/server';
import { listReportsForEmail } from '@/lib/account';
import { TRIAL_PLAN, formatPrice } from '@/lib/pricing';
import LogoutButton from '@/components/account/LogoutButton';
import ManageSubscriptionButton from '@/components/checkout/ManageSubscriptionButton';

export const runtime = 'edge';

export const metadata: Metadata = {
    title: 'My account · CarVinLookup',
    robots: { index: false, follow: false },
};

const SUB_LABELS: Record<string, { label: string; cls: string }> = {
    trialing: { label: 'Trial active', cls: 'text-emerald-700 bg-emerald-50' },
    active: { label: 'Active', cls: 'text-emerald-700 bg-emerald-50' },
    past_due: { label: 'Payment due', cls: 'text-amber-700 bg-amber-50' },
    canceled: { label: 'Canceled', cls: 'text-slate-600 bg-slate-100' },
    unpaid: { label: 'Unpaid', cls: 'text-rose-700 bg-rose-50' },
    incomplete: { label: 'Incomplete', cls: 'text-amber-700 bg-amber-50' },
};

export default async function AccountPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) redirect('/login?next=/account');

    const email = user.email;
    const name = (user.user_metadata?.name as string) || '';

    const env = await getEnv();
    const reports = await listReportsForEmail(env, email);

    // Best-effort live subscription status from Stripe, resolved by email.
    let sub: { status: string; renews: number | null } | null = null;
    try {
        const cfg = await getPaymentConfig(env);
        if (cfg.stripeSecret) {
            const stripe = new Stripe(cfg.stripeSecret, { httpClient: Stripe.createFetchHttpClient() });
            const customers = await stripe.customers.list({ email, limit: 1 });
            const customer = customers.data[0];
            if (customer) {
                const subs = await stripe.subscriptions.list({ customer: customer.id, status: 'all', limit: 1 });
                const s = subs.data[0];
                if (s) {
                    const renewsAt = (s as unknown as { current_period_end?: number }).current_period_end;
                    sub = { status: s.status, renews: renewsAt ? renewsAt * 1000 : null };
                }
            }
        }
    } catch {
        /* best-effort — dashboard still renders without live status */
    }

    const memberSince = user.created_at ? new Date(user.created_at) : null;
    const subMeta = sub ? SUB_LABELS[sub.status] ?? { label: sub.status, cls: 'text-slate-600 bg-slate-100' } : null;

    return (
        <div className="min-h-[70vh] bg-slate-50 py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                            {name ? `Hi, ${name}` : 'Your account'}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">{email}</p>
                    </div>
                    <LogoutButton />
                </div>

                <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
                    {/* Reports */}
                    <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-7">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-display font-bold text-slate-900">Your reports</h2>
                            <span className="text-xs font-semibold text-slate-400">{reports.length} total</span>
                        </div>

                        {reports.length === 0 ? (
                            <div className="text-center py-10">
                                <span className="inline-flex w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 items-center justify-center mb-3">
                                    <FileText className="w-6 h-6" aria-hidden="true" />
                                </span>
                                <p className="font-semibold text-slate-700">No reports yet</p>
                                <p className="text-sm text-slate-500 mt-1 mb-5">Run a VIN to pull a full vehicle history report.</p>
                                <Link
                                    href="/#vin-search"
                                    className="inline-flex items-center gap-2 bg-accent text-white font-bold px-5 py-3 rounded-full shadow-md shadow-accent/25 hover:brightness-110 transition"
                                >
                                    Check a VIN <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                </Link>
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {reports.map((r) => {
                                    const title = [r.year || '', r.make || '', r.model || ''].filter(Boolean).join(' ') || 'Vehicle report';
                                    return (
                                        <li key={r.vin}>
                                            <Link
                                                href={`/report/${r.vin}?paid=1`}
                                                className="group flex items-center gap-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 p-4 transition-colors"
                                            >
                                                <span className="inline-flex w-11 h-11 rounded-xl bg-primary/10 text-primary items-center justify-center shrink-0">
                                                    <Car className="w-5 h-5" aria-hidden="true" />
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold text-slate-900 text-sm truncate">{title}</p>
                                                    <p className="font-mono text-[11px] text-slate-400">VIN {r.vin}</p>
                                                </div>
                                                {r.isUnlocked && (
                                                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                                                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> Unlocked
                                                    </span>
                                                )}
                                                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" aria-hidden="true" />
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>

                    {/* Subscription + account */}
                    <aside className="space-y-6">
                        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <CreditCard className="w-4 h-4 text-primary" aria-hidden="true" />
                                <h2 className="font-display font-bold text-slate-900 text-sm">Subscription</h2>
                            </div>

                            {subMeta ? (
                                <>
                                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${subMeta.cls}`}>
                                        {subMeta.label}
                                    </span>
                                    <p className="text-sm text-slate-500 mt-3">
                                        {formatPrice(TRIAL_PLAN.recurringCents ?? 2900)}/month membership.
                                    </p>
                                    {sub?.renews && (
                                        <p className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                                            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                                            {sub.status === 'canceled' ? 'Ends' : 'Renews'} {new Date(sub.renews).toLocaleDateString()}
                                        </p>
                                    )}
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <ManageSubscriptionButton />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm text-slate-500">No active subscription.</p>
                                    <Link href="/#vin-search" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-3">
                                        Run a VIN check <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                    </Link>
                                </>
                            )}
                        </section>

                        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                            <h2 className="font-display font-bold text-slate-900 text-sm mb-4">Account</h2>
                            <dl className="space-y-3 text-sm">
                                <div>
                                    <dt className="text-[11px] text-slate-400 uppercase tracking-wide">Email</dt>
                                    <dd className="text-slate-800 font-medium truncate">{email}</dd>
                                </div>
                                {memberSince && (
                                    <div>
                                        <dt className="text-[11px] text-slate-400 uppercase tracking-wide">Member since</dt>
                                        <dd className="text-slate-800 font-medium">{memberSince.toLocaleDateString()}</dd>
                                    </div>
                                )}
                            </dl>
                        </section>
                    </aside>
                </div>
            </div>
        </div>
    );
}
