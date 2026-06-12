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

export function formatPrice(cents: number, currency = 'usd'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
        minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    }).format(cents / 100);
}

export function getPlan(id: string, plans: Plan[] = DEFAULT_PLANS): Plan | undefined {
    return plans.find((p) => p.id === id);
}
