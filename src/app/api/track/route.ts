import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/cf';
import { getDb } from '@/db';
import { events } from '@/db/schema';

export const runtime = 'edge';

// First-party analytics: store privacy-friendly events (no cookies, no PII).
export async function POST(request: Request) {
  const env = await getEnv();
  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    path?: string;
    referrer?: string;
    meta?: unknown;
  };

  if (!body.name) return NextResponse.json({ error: 'name required' }, { status: 400 });

  // Best-effort write; never block the client on analytics.
  try {
    if (env.DB) {
      const db = getDb(env as { DB: D1Database });
      const country = request.headers.get('cf-ipcountry') || null;
      await db.insert(events).values({
        id: crypto.randomUUID(),
        name: body.name,
        path: body.path || null,
        referrer: body.referrer || null,
        country,
        meta: body.meta ?? null,
      });
    }
  } catch (err) {
    console.error('track error:', err);
  }

  return NextResponse.json({ ok: true });
}
