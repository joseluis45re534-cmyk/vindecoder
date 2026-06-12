// Keyword-driven blog content pipeline.
//
// Philosophy: this does NOT try to evade AI-content detectors. It produces
// genuinely useful, original, E-E-A-T-rich drafts and gates them behind a
// quality scorer + human review. That is what Google's "scaled content abuse"
// policy rewards and what gets a page cited by LLMs — the durable strategy.
//
// Calls Claude via fetch (edge/Workers compatible). Default model is configurable.

import type { Env } from '@/db';

export const DEFAULT_MODEL = 'claude-opus-4-8';

export interface ContentBrief {
  keyword: string;
  title: string;
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  outline: string[];
  description: string;
}

export interface GeneratedPost {
  title: string;
  slug: string;
  description: string;
  keyword: string;
  body: string; // markdown
  qualityScore: number;
  qualityNotes: string[];
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 70);
}

const SYSTEM_PROMPT = `You are the editorial writer for CarVinLookup, a U.S. vehicle-history-report service (VIN checks sourced from NMVTIS, NICB, and state DMV records).

Write genuinely helpful articles for used-car buyers. Requirements:
- Original, specific, and accurate. Cite the real U.S. systems by name (NMVTIS, NICB, DMV, title brands like salvage/rebuilt/flood/junk).
- First-hand, practical guidance a buyer can act on. Concrete steps, real numbers, real edge cases.
- Plain, direct American English. No fluff, no keyword stuffing, no "in today's world" filler.
- Demonstrate experience and expertise (E-E-A-T). Be honest about limitations.
- Output GitHub-flavored Markdown. Use ## and ### headings, short paragraphs, bullet lists, and at most one comparison table when it genuinely helps.
- Naturally link to "/#vin-search" once where a VIN check is the obvious next step. Do not over-link.
- Do NOT fabricate statistics or cite sources you are unsure of. Prefer durable, verifiable claims.`;

async function callClaude(
  env: Partial<Env>,
  opts: { system: string; user: string; maxTokens: number }
): Promise<string> {
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }
  const model = (env as { ANTHROPIC_MODEL?: string }).ANTHROPIC_MODEL || DEFAULT_MODEL;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: opts.maxTokens,
      system: opts.system,
      messages: [{ role: 'user', content: opts.user }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Claude API error ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
    stop_reason?: string;
  };
  const text = (data.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text || '')
    .join('');
  if (!text) throw new Error('Claude returned no text content');
  return text;
}

/** Generate a draft article from a keyword. */
export async function generatePost(
  env: Partial<Env>,
  keyword: string,
  intent: ContentBrief['intent'] = 'informational'
): Promise<GeneratedPost> {
  const user = `Write a complete, publish-ready article targeting the search intent of: "${keyword}".

Audience: U.S. used-car buyers. Intent: ${intent}.

Return your answer as JSON with exactly these keys and nothing else:
{
  "title": "compelling, specific H1 (50-60 chars, includes the topic naturally)",
  "description": "meta description, 150-160 chars, compelling, includes the keyword naturally",
  "body": "the full article in GitHub-flavored Markdown, 700-1100 words, starting at ## (no H1 in the body)"
}`;

  const raw = await callClaude(env, { system: SYSTEM_PROMPT, user, maxTokens: 4096 });

  // Tolerant JSON extraction (model may wrap in prose or fences).
  const jsonStart = raw.indexOf('{');
  const jsonEnd = raw.lastIndexOf('}');
  let parsed: { title: string; description: string; body: string };
  try {
    parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
  } catch {
    // Fallback: treat the whole thing as the body.
    parsed = { title: keyword, description: '', body: raw };
  }

  const { score, notes } = scoreQuality(parsed.body, keyword);

  return {
    title: parsed.title || keyword,
    slug: slugify(parsed.title || keyword),
    description: parsed.description || '',
    keyword,
    body: parsed.body || '',
    qualityScore: score,
    qualityNotes: notes,
  };
}

/**
 * Heuristic quality gate (QRG-aligned). Not a detector-evasion tool — it checks
 * whether a draft is substantive enough to publish, and flags thin/spammy output
 * for human revision. Score 0-100; we recommend human review below ~75.
 */
export function scoreQuality(body: string, keyword: string): { score: number; notes: string[] } {
  const notes: string[] = [];
  let score = 100;

  const words = body.trim().split(/\s+/).filter(Boolean).length;
  if (words < 600) {
    score -= 25;
    notes.push(`Thin: ${words} words (aim for 700+).`);
  } else if (words > 1600) {
    score -= 8;
    notes.push(`Long: ${words} words — tighten.`);
  }

  const headings = (body.match(/^#{2,3}\s/gm) || []).length;
  if (headings < 3) {
    score -= 12;
    notes.push('Few subheadings — add structure (H2/H3).');
  }

  // Keyword should appear, but not be stuffed.
  const kw = keyword.toLowerCase();
  const density =
    (body.toLowerCase().split(kw).length - 1) / Math.max(words / 100, 1);
  if (density === 0) {
    score -= 10;
    notes.push('Primary keyword never appears.');
  } else if (density > 3) {
    score -= 15;
    notes.push('Keyword stuffing — reduce repetition.');
  }

  // Reward domain authority signals.
  const authority = /(NMVTIS|NICB|DMV|salvage|odometer|lien|title brand)/i.test(body);
  if (!authority) {
    score -= 12;
    notes.push('Missing authoritative U.S. data references (NMVTIS/NICB/DMV).');
  }

  // Penalize obvious filler.
  if (/in today'?s world|in this day and age|when it comes to/i.test(body)) {
    score -= 6;
    notes.push('Contains filler phrasing.');
  }

  score = Math.max(0, Math.min(100, score));
  if (score >= 75 && notes.length === 0) notes.push('Passes quality gate.');
  return { score, notes };
}
