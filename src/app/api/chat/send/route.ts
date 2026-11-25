import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { getEnv } from '@/lib/cf';
import { getDb } from '@/db';
import { chatSessions, chatMessages } from '@/db/schema';
import { callChatBot, MAX_BOT_MESSAGES, type ApiMessage, type ApiRole } from '@/lib/chat';
import { allowRequest } from '@/lib/report-cache';
import { clientIp, ipBucket } from '@/lib/ip';

export const runtime = 'edge';

// Two full bot conversations an hour per IP (MAX_BOT_MESSAGES is 20 per session).
const CHAT_MESSAGES_PER_IP_HOUR = 40;
// Messages to a human agent don't call the bot; this only stops flooding.
const HUMAN_MESSAGES_PER_IP_HOUR = 200;
// Bound what one bot call can carry: the history is client-supplied.
const MAX_HISTORY_MESSAGES = 40;
const MAX_MESSAGE_CHARS = 2000;
const RATE_LIMITED =
  "You've sent a lot of messages in a short time. Please try again in an hour, or use the contact page and we'll reply by email.";

type SessionStatus = 'bot' | 'waiting' | 'live' | 'closed';

const HANDOFF_SUGGEST =
  "You've reached the limit for this chat. Click “Talk to a human” and the team will follow up here.";
const BOT_ERROR =
  "I'm having trouble answering right now. Click “Talk to a human” and someone from the team will follow up here.";

// Filter the visible thread down to a valid Anthropic history: only user/assistant
// roles, starting with a user turn, with consecutive same-role turns merged.
function toApiHistory(raw: { role?: string; content?: string }[]): ApiMessage[] {
  const filtered = raw
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-MAX_HISTORY_MESSAGES)
    .map((m) => ({ role: m.role as ApiRole, content: String(m.content || '').slice(0, MAX_MESSAGE_CHARS) }));
  while (filtered.length && filtered[0].role === 'assistant') filtered.shift();
  const merged: ApiMessage[] = [];
  for (const m of filtered) {
    const last = merged[merged.length - 1];
    if (last && last.role === m.role) last.content += '\n\n' + m.content;
    else merged.push({ ...m });
  }
  return merged;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    sessionId?: string;
    visitorId?: string;
    text?: string;
    history?: { role?: string; content?: string }[];
  };

  const text = (body.text || '').trim().slice(0, 2000);
  if (!text) return NextResponse.json({ error: 'Empty message' }, { status: 400 });

  const sid = body.sessionId || crypto.randomUUID();
  const visitorId = (body.visitorId || '').slice(0, 80) || crypto.randomUUID();
  const env = await getEnv();
  const hasDb = !!env.DB;
  let status: SessionStatus = 'bot';
  const db = hasDb ? getDb(env as { DB: D1Database }) : null;

  // Resolve the session first (no writes yet), so the rate limit below knows
  // whether this message goes to the bot or to a human agent.
  let isNewSession = true;
  if (db) {
    try {
      const existing = await db.select().from(chatSessions).where(eq(chatSessions.id, sid)).limit(1);
      if (existing.length) {
        // Ownership: a message can only be posted to a session by the visitor
        // that owns it — stops one visitor writing into another's thread.
        if (existing[0].visitor_id !== visitorId) {
          return NextResponse.json({ error: 'Session not found' }, { status: 403 });
        }
        status = (existing[0].status as SessionStatus) || 'bot';
        isNewSession = false;
      }
    } catch (err) {
      console.error('chat session lookup error:', err);
    }
  }

  // Per-IP caps. MAX_BOT_MESSAGES is per session, and session/visitor IDs come
  // from the client, so without this a script could open unlimited sessions and
  // run up the Anthropic bill. Messages in a human-agent thread never reach the
  // bot, so they get a separate, generous cap instead. Fails open (like
  // /api/contact) if D1 is missing or the limiter errors.
  const ip = ipBucket(clientIp(request));
  const human = status === 'waiting' || status === 'live';
  let allowed = true;
  try {
    allowed = human
      ? await allowRequest(env, `chat-human:${ip}`, HUMAN_MESSAGES_PER_IP_HOUR)
      : await allowRequest(env, `chat:${ip}`, CHAT_MESSAGES_PER_IP_HOUR);
  } catch (err) {
    console.error('chat rate-limit error:', err);
  }
  if (!allowed) {
    // Nothing is stored; the widget shows `reply` as a note and keeps the draft.
    return NextResponse.json({ sessionId: body.sessionId, status, reply: RATE_LIMITED }, { status: 429 });
  }

  // Persist the user message.
  if (db) {
    try {
      if (isNewSession) await db.insert(chatSessions).values({ id: sid, visitor_id: visitorId, status: 'bot' });
      await db.insert(chatMessages).values({ id: crypto.randomUUID(), session_id: sid, role: 'user', content: text });
      await db.update(chatSessions).set({ last_message_at: new Date().toISOString() }).where(eq(chatSessions.id, sid));
    } catch (err) {
      console.error('chat persist error:', err);
    }
  }

  // A human is (or is about to be) handling this — don't invoke the bot.
  if (status === 'waiting' || status === 'live') {
    return NextResponse.json({ sessionId: sid, persisted: hasDb, status, reply: null });
  }

  // Message cap (cost/abuse guard) — count user turns from DB when available,
  // otherwise from the client-supplied history.
  let userCount = (body.history || []).filter((m) => m.role === 'user').length + 1;
  if (db) {
    try {
      const rows = await db
        .select()
        .from(chatMessages)
        .where(and(eq(chatMessages.session_id, sid), eq(chatMessages.role, 'user')));
      userCount = rows.length;
    } catch {
      /* fall back to client count */
    }
  }
  if (userCount > MAX_BOT_MESSAGES) {
    if (db) {
      try {
        await db.insert(chatMessages).values({ id: crypto.randomUUID(), session_id: sid, role: 'assistant', content: HANDOFF_SUGGEST });
      } catch { /* noop */ }
    }
    return NextResponse.json({ sessionId: sid, persisted: hasDb, status, reply: HANDOFF_SUGGEST });
  }

  // Ask the bot.
  let reply: string;
  try {
    const history = toApiHistory([...(body.history || []), { role: 'user', content: text }]);
    reply = await callChatBot(env, history);
  } catch (err) {
    console.error('chat bot error:', err);
    reply = BOT_ERROR;
  }

  if (db) {
    try {
      await db.insert(chatMessages).values({ id: crypto.randomUUID(), session_id: sid, role: 'assistant', content: reply });
      await db.update(chatSessions).set({ last_message_at: new Date().toISOString() }).where(eq(chatSessions.id, sid));
    } catch { /* noop */ }
  }

  return NextResponse.json({ sessionId: sid, persisted: hasDb, status, reply });
}
