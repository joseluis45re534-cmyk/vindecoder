// Trial-subscription billing helpers — the single source of truth for the
// "$1 today → 3-day window → $29/month" model. Shared by the checkout route,
// the Stripe webhook, and the UI disclosure copy so the numbers never drift.
//
// Why a Subscription Schedule? Hosted Checkout cannot charge $1 today AND defer
// the $29 via a plain free trial in one line-item session (Stripe attaches
// one-time fees to the trial-end invoice). Instead we charge $1 on-session via a
// "$1 every 3 days" price, then convert the resulting subscription into a
// two-phase schedule: Phase 1 = the $1/3-day cycle the customer just paid,
// Phase 2 = $29/month ongoing. Cancel before day 3 → only $1 ever charged.

import type Stripe from 'stripe';
import { TRIAL_PLAN, formatPrice } from '@/lib/pricing';

export const TRIAL = {
    feeCents: TRIAL_PLAN.trialFeeCents ?? 100,
    days: TRIAL_PLAN.trialDays ?? 3,
    recurringCents: TRIAL_PLAN.recurringCents ?? 2900,
    currency: TRIAL_PLAN.currency,
};

// Stable lookup key so the $29/month Price is created once and reused across
// requests without needing D1 persistence.
const MONTHLY_LOOKUP_KEY = 'carvin_report_monthly';

/** Plain-text consent/disclosure shown next to the pay button (FTC / processor
 *  compliance). Numbers come from TRIAL so copy and billing stay in lockstep. */
export function trialDisclosure(): string {
    return (
        `You'll be charged ${formatPrice(TRIAL.feeCents, TRIAL.currency)} today. ` +
        `After ${TRIAL.days} days you'll be charged ${formatPrice(TRIAL.recurringCents, TRIAL.currency)}/month ` +
        `unless you cancel. Cancel anytime.`
    );
}

/** Inline price for the on-session $1 charge: $1 billed once every 3 days. The
 *  schedule (below) caps it at a single cycle, so the customer is only ever
 *  charged this $1 once before Phase 2 ($29/mo) takes over. */
export function trialPhaseOnePriceData(): Stripe.Checkout.SessionCreateParams.LineItem.PriceData {
    return {
        currency: TRIAL.currency,
        unit_amount: TRIAL.feeCents,
        recurring: { interval: 'day', interval_count: TRIAL.days },
        product_data: { name: `CarVinLookup — Full Vehicle History (${TRIAL.days}-day access)` },
    };
}

/** Find-or-create the reusable $29/month Price, keyed by lookup_key. */
export async function ensureMonthlyPrice(stripe: Stripe): Promise<string> {
    const existing = await stripe.prices.list({ lookup_keys: [MONTHLY_LOOKUP_KEY], active: true, limit: 1 });
    if (existing.data[0]) return existing.data[0].id;

    const price = await stripe.prices.create({
        currency: TRIAL.currency,
        unit_amount: TRIAL.recurringCents,
        recurring: { interval: 'month' },
        lookup_key: MONTHLY_LOOKUP_KEY,
        product_data: { name: 'CarVinLookup — Full Vehicle History (monthly)' },
    });
    return price.id;
}

/**
 * Convert the just-created $1/3-day subscription into a two-phase schedule so it
 * flips to $29/month after the 3-day window instead of re-billing $1. Idempotent:
 * a no-op if the subscription is already attached to a schedule (webhook retries).
 */
export async function convertToTrialSchedule(stripe: Stripe, subscriptionId: string): Promise<void> {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    if (sub.schedule) return; // already converted

    const monthlyPriceId = await ensureMonthlyPrice(stripe);

    // Creating from_subscription pre-fills phase[0] with the current ($1/3-day)
    // cycle and its exact start/end timestamps — reuse them verbatim so we don't
    // depend on where current_period_* lives in this API version.
    const schedule = await stripe.subscriptionSchedules.create({ from_subscription: subscriptionId });
    const phase0 = schedule.phases[0];
    const phase0Price =
        typeof phase0.items[0].price === 'string' ? phase0.items[0].price : phase0.items[0].price.id;

    await stripe.subscriptionSchedules.update(schedule.id, {
        end_behavior: 'release', // after the schedule ends, leave a normal subscription
        phases: [
            {
                items: [{ price: phase0Price, quantity: 1 }],
                start_date: phase0.start_date,
                end_date: phase0.end_date, // ends after one 3-day cycle
            },
            {
                items: [{ price: monthlyPriceId, quantity: 1 }], // $29/mo, ongoing
            },
        ],
    });
}
