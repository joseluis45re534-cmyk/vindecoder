import { NextResponse } from 'next/server';
import { desc } from 'drizzle-orm';
import { getEnv } from '@/lib/cf';
import { requireAdmin } from '@/lib/auth';
import { getDb } from '@/db';
import { chatSessions, contactMessages } from '@/db/schema';

export const runtime = 'edge';

// Inbox list: chat sessions (newest first) + contact-form submissions. The client
// polls this; the per-session thread is loaded from /api/admin/chat/[id].
export async function GET(request: Request) {
  const env = await getEnv();
  if (!(await requireAdmin(request, env))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!env.DB) {
    return NextResponse.json({ live: false, chats: [], contacts: [], waiting: 0 });
  }

  const db = getDb(env as { DB: D1Database });
  try {
    const sessions = await db.select().from(chatSessions).orderBy(desc(chatSessions.last_message_at)).limit(100);
    const contacts = await db.select().from(contactMessages).orderBy(desc(contactMessages.created_at)).limit(100);
    const waiting = sessions.filter((s) => s.status === 'waiting').length;

    return NextResponse.json({
      live: true,
      waiting,
      chats: sessions.map((s) => ({
        id: s.id,
        visitor_id: s.visitor_id,
        status: s.status,
        created_at: s.created_at,
        last_message_at: s.last_message_at,
      })),
      contacts: contacts.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        subject: c.subject,
        message: c.message,
        status: c.status,
        created_at: c.created_at,
      })),
    });
  } catch (err) {
    console.error('admin chat list error:', err);
    return NextResponse.json({ live: true, chats: [], contacts: [], waiting: 0 });
  }
}
