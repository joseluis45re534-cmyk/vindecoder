// Central pricing source of truth. Admin can override these at runtime via the
// `settings` table (key: "pricing"); falls back to these defaults.

export interface Plan {
    id: string;
    name: string;
    tagline: string;
    priceCents: number;
    currency: 'usd';
    interval: 'one_time' | 'month';
    features: string[];
    highlighted?: boolean;
    cta: string;
    // Trial-subscription plans (e.g. the report unlock): charge `trialFeeCents`
    // today, then `recurringCents` every month starting `trialDays` later. When
    // present, the checkout route uses Stripe subscription mode (see
    // src/lib/stripe-billing.ts), not a one-time payment.
    trialFeeCents?: number;
    trialDays?: number;
    recurringCents?: number;
}

export const DEFAULT_PLANS: Plan[] = [
    {
        id: 'single',
        name: 'Single Report',
        tagline: 'One full vehicle history report',
        priceCents: 2499,
        currency: 'usd',
        interval: 'one_time',
        cta: 'Get this report',
        features: [
            'Full NMVTIS title & brand history',
            'Salvage, flood & junk records',
            'Theft records (NICB)',
            'Open lien check',
            'Odometer rollback alerts',
            'Instant PDF download',
        ],
    },
    {
        id: 'bundle5',
        name: '5-Report Bundle',
        tagline: 'Best for shopping around',
        priceCents: 4999,
        currency: 'usd',
        interval: 'one_time',
        highlighted: true,
        cta: 'Buy 5 reports',
        features: [
            'Everything in Single Report',
            '5 full reports ($10 each)',
            'Reports never expire',
            'Compare multiple vehicles',
            'Priority data refresh',
        ],
    },
    {
        id: 'dealer',
        name: 'Dealer Unlimited',
        tagline: 'For lots & independent dealers',
        priceCents: 9900,
        currency: 'usd',
        interval: 'month',
        cta: 'Start dealer plan',
        features: [
            'Unlimited reports / month',
            'Bulk VIN upload',
            'Team seats',
            'API access',
            'Dealer dashboard & exports',
        ],
    },
];

// The report unlock: $1 today starts a 3-day window, then $29/month unless the
// customer cancels. Kept OUT of DEFAULT_PLANS so it never appears in the
// marketing pricing grid — it's resolved on its own by getPlan('trial').
export const TRIAL_PLAN: Plan = {
    id: 'trial',
    name: 'Full Vehicle History',
    tagline: 'Unlock the complete report',
    priceCents: 100, // charged today; display fallback
    currency: 'usd',
    interval: 'month',
    trialFeeCents: 100, // $1 today
    trialDays: 3,
    recurringCents: 2900, // $29/month after the 3-day window
    highlighted: true,
    cta: 'Start for $1 today',
    features: [
        'NMVTIS title-brand history',
        'Salvage, junk & flood check',
        'Odometer rollback alerts',
        'Theft & recovery records',
        'Liens, loans & impound info',
        'Accident & auction history',
        'Real vehicle photos',
        'Open safety recalls',
        'Full specs & 40+ data points',
        'Downloadable PDF report',
    ],
};

export function isTrialPlan(plan: Plan): boolean {
    return plan.trialFeeCents != null && plan.recurringCents != null;
}

export function formatPrice(cents: number, currency = 'usd'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
        minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    }).format(cents / 100);
}

export function getPlan(id: string, plans: Plan[] = DEFAULT_PLANS): Plan | undefined {
    if (id === TRIAL_PLAN.id) return TRIAL_PLAN;
    return plans.find((p) => p.id === id);
}
