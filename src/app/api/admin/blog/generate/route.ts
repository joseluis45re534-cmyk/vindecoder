import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/cf';
import { verifySession, COOKIE_NAME, adminSecret } from '@/lib/auth';
import { generatePost } from '@/lib/content-pipeline';

export const runtime = 'edge';

function cookie(req: Request, name: string): string | undefined {
  const header = req.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return undefined;
}

export async function POST(request: Request) {
  const env = await getEnv();

  // Guard: admin session required (this lives under /api, not /admin).
  const ok = await verifySession(cookie(request, COOKIE_NAME), adminSecret(env));
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'Content generation needs ANTHROPIC_API_KEY. Add it in Settings.', configured: false },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as { keyword?: string; intent?: string };
  if (!body.keyword) return NextResponse.json({ error: 'keyword is required' }, { status: 400 });

  try {
    const post = await generatePost(
      env,
      body.keyword,
      (body.intent as 'informational') || 'informational'
    );
    // Drafts are returned for human review — never auto-published from here.
    return NextResponse.json({ post, status: 'draft' });
  } catch (err) {
    console.error('Blog generation error:', err);
    return NextResponse.json({ error: String(err instanceof Error ? err.message : err) }, { status: 500 });
  }
}
