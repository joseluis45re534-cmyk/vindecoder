// Support chatbot — Claude-powered, grounded in CarVinLookup facts, with strict
// guardrails. Reuses the same Anthropic fetch pattern as content-pipeline.ts but
// defaults to Haiku (fast + cheap for high-volume support chat).

import type { Env } from '@/db';
import { TRIAL_PLAN, formatPrice } from '@/lib/pricing';

export const DEFAULT_CHAT_MODEL = 'claude-haiku-4-5-20251001';

// Only roles the Anthropic Messages API accepts.
export type ApiRole = 'user' | 'assistant';
export interface ApiMessage {
  role: ApiRole;
  content: string;
}

/** Max visitor messages a single session may send to the bot (cost/abuse guard). */
export const MAX_BOT_MESSAGES = 20;

export function supportSystemPrompt(): string {
  const fee = formatPrice(TRIAL_PLAN.trialFeeCents ?? 100);
  const monthly = formatPrice(TRIAL_PLAN.recurringCents ?? 2900);
  const days = TRIAL_PLAN.trialDays ?? 3;

  return `You are the friendly support assistant for CarVinLookup, a U.S. vehicle-history-report service. Visitors are used-car buyers.

WHAT CARVINLOOKUP DOES
- A buyer enters a 17-character VIN or a U.S. license plate (all 50 states) and gets a vehicle history report.
- Reports combine NMVTIS (title brands: salvage, rebuilt, junk, flood), NICB (theft records), open liens, and odometer history. A free preview confirms the vehicle's identity first.
- Pricing: ${fee} today starts a ${days}-day trial; it becomes ${monthly}/month afterward unless cancelled. Cancel anytime via the "Manage or cancel subscription" link (Stripe customer portal).
- Helpful pages: VIN check is on the home page (/#vin-search); pricing (/pricing); refund & cancellation (/refund); privacy (/privacy); terms (/terms).

HOW TO BEHAVE
- Be concise, warm, and plain-spoken. Short answers. No marketing fluff.
- Explain VIN/title/odometer/lien concepts and how the service works.
- Help with how-to, pricing, and general billing questions using the facts above.

HARD RULES (do not break)
- You CANNOT look up or reveal a specific vehicle's real history from this chat. If asked "is VIN X salvage / stolen / clean?", do NOT guess or state any title/theft/lien/odometer result. Explain that they need to run that exact VIN through a check on the site, and point them to /#vin-search.
- Never invent prices, policies, statistics, or report contents. If unsure, say so and point to the relevant page.
- Stay on topic (vehicles, VINs, vehicle history, and this service). Politely decline unrelated requests.
- For account-specific issues you cannot resolve (a charge, a refund, a cancellation that didn't work, accessing a paid report), tell the visitor they can click "Talk to a human" to reach the team, and that someone will reply here.`;
}

/** Call Claude with the running conversation. `history` must alternate and start
 *  with a user message. Returns the assistant's reply text. */
export async function callChatBot(env: Partial<Env>, history: ApiMessage[]): Promise<string> {
  if (!env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not configured');
  const model = (env as { CHAT_MODEL?: string }).CHAT_MODEL || DEFAULT_CHAT_MODEL;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 600,
      system: supportSystemPrompt(),
      messages: history,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Claude API error ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = (data.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text || '')
    .join('')
    .trim();
  return text || "Sorry, I didn't catch that — could you rephrase?";
}
