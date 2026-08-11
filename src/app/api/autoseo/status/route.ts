import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/cf';

export const runtime = 'edge';

// Non-sensitive diagnostic: reports whether the AutoSEO key is bound at RUNTIME
// (the same env the blog pages read) and what the upstream API returns — without
// ever exposing the key. Lets us tell "secret not bound to this deployment" from
// "wrong key value" from "working". Safe to remove once the blog is confirmed live.
export async function GET() {
  const env = await getEnv();
  const configured = Boolean(env.AUTOSEO_BLOG_API_KEY);

  let upstreamStatus: number | null = null;
  let total: number | null = null;
  let error: string | null = null;

  if (configured) {
    try {
      const res = await fetch('https://autoseo.it.com/api/content-api/v1/articles?page=1&pageSize=1', {
        headers: { Authorization: `Bearer ${env.AUTOSEO_BLOG_API_KEY}`, Accept: 'application/json' },
      });
      upstreamStatus = res.status;
      if (res.ok) {
        const d = (await res.json()) as { total?: number };
        total = typeof d.total === 'number' ? d.total : null;
      }
    } catch (e) {
      error = (e as Error).message;
    }
  }

  return NextResponse.json(
    { configured, upstreamStatus, total, error, hint:
      !configured ? 'Key not bound to this deployment — set it in Cloudflare and REDEPLOY.'
      : upstreamStatus === 401 || upstreamStatus === 403 ? 'Key is bound but rejected — check the value (whitespace / wrong key).'
      : upstreamStatus === 200 ? 'Working — API reachable and key accepted.'
      : 'Unexpected upstream response.' },
    { headers: { 'cache-control': 'no-store' } },
  );
}
