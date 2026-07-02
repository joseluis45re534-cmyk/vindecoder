import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/cf';
import { getDb } from '@/db';
import { contactMessages } from '@/db/schema';
import { allowRequest } from '@/lib/report-cache';

export const runtime = 'edge';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(request: Request) {
  const env = await getEnv();

  // Spam guard: cap contact submissions per IP (degrades open w/o D1).
  const ip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown';
  if (!(await allowRequest(env, `contact:${ip}`, 8))) {
    return NextResponse.json({ error: 'Too many messages — please try again later.' }, { status: 429 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  };

  const email = (body.email || '').trim();
  const message = (body.message || '').trim();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }
  if (message.length < 5) {
    return NextResponse.json({ error: 'Please enter a message.' }, { status: 400 });
  }

  try {
    if (env.DB) {
      const db = getDb(env as { DB: D1Database });
      await db.insert(contactMessages).values({
        id: crypto.randomUUID(),
        name: (body.name || '').trim().slice(0, 120) || null,
        email: email.slice(0, 200),
        subject: (body.subject || '').trim().slice(0, 200) || null,
        message: message.slice(0, 5000),
      });
    } else {
      // No DB bound — don't 500; the message is logged so nothing is silently lost.
      console.warn('Contact message received but DB is not configured:', { email });
    }
  } catch (err) {
    console.error('contact store error:', err);
    return NextResponse.json(
      { error: 'Could not send your message right now. Please email support@carvinlookup.us directly.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
