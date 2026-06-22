import { NextResponse } from 'next/server';
import { eq, asc } from 'drizzle-orm';
import { getEnv } from '@/lib/cf';
import { requireAdmin } from '@/lib/auth';
import { getDb } from '@/db';
import { chatSessions, chatMessages } from '@/db/schema';

export const runtime = 'edge';

// GET: full thread for one session. POST: agent reply (role 'agent', moves the
// session to 'live') or a status change such as { status: 'closed' }.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const env = await getEnv();
  if (!(await requireAdmin(request, env))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!env.DB) return NextResponse.json({ error: 'D1 not configured' }, { status: 503 });

  const { id } = await params;
  const db = getDb(env as { DB: D1Database });
  const session = await db.select().from(chatSessions).where(eq(chatSessions.id, id)).limit(1);
  if (!session.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const messages = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.session_id, id))
    .orderBy(asc(chatMessages.created_at));

  return NextResponse.json({ session: session[0], messages });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const env = await getEnv();
  if (!(await requireAdmin(request, env))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!env.DB) return NextResponse.json({ error: 'D1 not configured' }, { status: 503 });

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { content?: string; status?: string };
  const db = getDb(env as { DB: D1Database });

  if (body.status === 'closed') {
    await db.update(chatSessions).set({ status: 'closed' }).where(eq(chatSessions.id, id));
    return NextResponse.json({ ok: true, status: 'closed' });
  }

  const content = (body.content || '').trim().slice(0, 4000);
  if (!content) return NextResponse.json({ error: 'Empty reply' }, { status: 400 });

  const msg = { id: crypto.randomUUID(), session_id: id, role: 'agent' as const, content };
  await db.insert(chatMessages).values(msg);
  await db
    .update(chatSessions)
    .set({ status: 'live', last_message_at: new Date().toISOString() })
    .where(eq(chatSessions.id, id));

  return NextResponse.json({ ok: true, message: { ...msg, created_at: new Date().toISOString() } });
}
