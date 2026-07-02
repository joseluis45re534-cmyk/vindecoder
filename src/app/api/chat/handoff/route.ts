import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getEnv } from '@/lib/cf';
import { getDb } from '@/db';
import { chatSessions, chatMessages } from '@/db/schema';

export const runtime = 'edge';

// Visitor requests a human. Requires D1 (the agent reads/answers from the admin
// inbox). Without a DB there is no inbox, so we report it's unavailable and the
// widget keeps the bot-only experience.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { sessionId?: string; visitorId?: string };
  const sid = body.sessionId || crypto.randomUUID();
  const visitorId = (body.visitorId || '').slice(0, 80) || crypto.randomUUID();

  const env = await getEnv();
  if (!env.DB) {
    return NextResponse.json({ ok: false, available: false }, { status: 503 });
  }

  const db = getDb(env as { DB: D1Database });
  try {
    const existing = await db.select().from(chatSessions).where(eq(chatSessions.id, sid)).limit(1);
    if (existing.length) {
      // Ownership: only the owning visitor can escalate a session to a human.
      if (existing[0].visitor_id !== visitorId) {
        return NextResponse.json({ error: 'Session not found' }, { status: 403 });
      }
      await db.update(chatSessions).set({ status: 'waiting', last_message_at: new Date().toISOString() }).where(eq(chatSessions.id, sid));
    } else {
      await db.insert(chatSessions).values({ id: sid, visitor_id: visitorId, status: 'waiting' });
    }
    await db.insert(chatMessages).values({
      id: crypto.randomUUID(),
      session_id: sid,
      role: 'system',
      content: 'Visitor requested a human agent.',
    });
    return NextResponse.json({ ok: true, sessionId: sid, status: 'waiting' });
  } catch (err) {
    console.error('chat handoff error:', err);
    return NextResponse.json({ ok: false, error: 'Could not request an agent right now.' }, { status: 500 });
  }
}
