import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { getEnv } from '@/lib/cf';
import { requireAdmin } from '@/lib/auth';
import { getDb } from '@/db';
import { keywords } from '@/db/schema';

export const runtime = 'edge';

export async function GET(request: Request) {
  const env = await getEnv();
  if (!(await requireAdmin(request, env))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!env.DB) return NextResponse.json({ live: false, rows: [], counts: { queued: 0, drafting: 0, done: 0 } });

  const db = getDb(env as { DB: D1Database });
  const rows = await db.select().from(keywords).orderBy(desc(keywords.created_at)).limit(200);
  const counts = rows.reduce<Record<string, number>>((acc, r) => {
    const k = r.status || 'queued';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  return NextResponse.json({ live: true, rows, counts });
}

// Add one keyword or a bulk list (newline/comma separated). Skips duplicates.
export async function POST(request: Request) {
  const env = await getEnv();
  if (!(await requireAdmin(request, env))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!env.DB) return NextResponse.json({ error: 'D1 database not bound.' }, { status: 503 });

  const body = (await request.json().catch(() => ({}))) as { text?: string };
  const raw = String(body.text || '')
    .split(/[\n,]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => t.slice(0, 160));
  if (!raw.length) return NextResponse.json({ error: 'No keywords provided.' }, { status: 400 });

  // Dedupe within the input (case-insensitive).
  const seen = new Set<string>();
  const uniq = raw.filter((t) => {
    const k = t.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const db = getDb(env as { DB: D1Database });
  const existing = await db.select({ term: keywords.term }).from(keywords);
  const existingSet = new Set(existing.map((e) => e.term.toLowerCase()));
  const toAdd = uniq.filter((t) => !existingSet.has(t.toLowerCase()));

  if (toAdd.length) {
    await db
      .insert(keywords)
      .values(toAdd.map((term) => ({ id: crypto.randomUUID(), term, intent: 'informational' as const, status: 'queued' as const })))
      .onConflictDoNothing();
  }

  return NextResponse.json({ ok: true, added: toAdd.length, skipped: uniq.length - toAdd.length });
}

export async function DELETE(request: Request) {
  const env = await getEnv();
  if (!(await requireAdmin(request, env))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!env.DB) return NextResponse.json({ error: 'D1 database not bound.' }, { status: 503 });

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const db = getDb(env as { DB: D1Database });
  await db.delete(keywords).where(eq(keywords.id, id));
  return NextResponse.json({ ok: true });
}
