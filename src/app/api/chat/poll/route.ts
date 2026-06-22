import { NextResponse } from 'next/server';
import { eq, asc } from 'drizzle-orm';
import { getEnv } from '@/lib/cf';
import { getDb } from '@/db';
import { chatSessions, chatMessages } from '@/db/schema';

export const runtime = 'edge';

// Visitor polls this (~every few seconds while the widget is open) to receive
// human-agent replies and status changes. Returns the full thread; the client
// dedupes by message id. No-DB → nothing to poll.
export async function GET(request: Request) {
  const sid = new URL(request.url).searchParams.get('sessionId') || '';
  if (!sid) return NextResponse.json({ error: 'sessionId required' }, { status: 400 });

  const env = await getEnv();
  if (!env.DB) {
    return NextResponse.json({ sessionId: sid, persisted: false, status: 'bot', messages: [] });
  }

  const db = getDb(env as { DB: D1Database });
  try {
    const session = await db.select().from(chatSessions).where(eq(chatSessions.id, sid)).limit(1);
    if (!session.length) {
      return NextResponse.json({ sessionId: sid, persisted: true, status: 'closed', messages: [] });
    }
    const rows = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.session_id, sid))
      .orderBy(asc(chatMessages.created_at));

    return NextResponse.json({
      sessionId: sid,
      persisted: true,
      status: session[0].status || 'bot',
      messages: rows.map((m) => ({ id: m.id, role: m.role, content: m.content, created_at: m.created_at })),
    });
  } catch (err) {
    console.error('chat poll error:', err);
    return NextResponse.json({ sessionId: sid, persisted: true, status: 'bot', messages: [] });
  }
}
