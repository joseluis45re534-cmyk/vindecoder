import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getEnv } from '@/lib/cf';

export const runtime = 'edge';

// AutoSEO calls this the moment an article publishes/updates so it appears
// immediately instead of waiting for the ~10-min ISR window. Carries NO article
// content — only the slug; the page re-fetches from the API as normal.

// Constant-time string compare (hex signatures) — avoids leaking via timing.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: Request) {
  const env = await getEnv();
  const secret = env.AUTOSEO_REVALIDATE_SECRET;

  // Read the RAW body BEFORE parsing — the signature is over the exact bytes.
  const raw = await request.text();
  const signature = request.headers.get('x-autoseo-signature') || '';

  // Verify only when a secret is configured (AutoSEO signs only when set).
  if (secret) {
    if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    const expected = `sha256=${await hmacSha256Hex(secret, raw)}`;
    if (!timingSafeEqual(signature, expected)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  let body: { slug?: string; type?: string } = {};
  try { body = JSON.parse(raw); } catch { /* tolerate empty/invalid */ }

  const slug = typeof body.slug === 'string' ? body.slug : '';
  const delivery = request.headers.get('x-autoseo-delivery') || 'unknown';
  const event = request.headers.get('x-autoseo-event') || body.type || 'unknown';
  console.log('[autoseo/revalidate]', JSON.stringify({ event, slug, delivery }));

  // Revalidate the article, the index, and the sitemap. Idempotent, so a
  // duplicate delivery is harmless. Best-effort — never 500 if the platform's
  // on-demand revalidation is unavailable (the 10-min ISR window still catches up).
  try {
    if (slug) revalidatePath(`/blog/${slug}`);
    revalidatePath('/blog');
    revalidatePath('/sitemap.xml');
  } catch (err) {
    console.error('[autoseo/revalidate] revalidatePath failed:', err);
  }

  return NextResponse.json({ revalidated: true });
}
