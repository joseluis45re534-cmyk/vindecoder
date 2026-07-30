import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/cf';
import { discoverKeywords } from '@/lib/keyword-discovery';

export const runtime = 'edge';

// Scheduled keyword discovery. Point a weekly scheduler (Cloudflare Cron Trigger
// / external cron) at this with `Authorization: Bearer <CRON_SECRET>`. Mines all
// category clusters and stores new terms as review candidates for the admin.
export async function POST(request: Request) {
  const env = await getEnv();
  const auth = request.headers.get('authorization') || '';
  if (!env.CRON_SECRET || auth !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const minVolume = Number(url.searchParams.get('minVolume')) || undefined;
  const maxDifficulty = Number(url.searchParams.get('maxDifficulty')) || undefined;

  try {
    const summary = await discoverKeywords(env, { minVolume, maxDifficulty });
    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    console.error('[cron/keywords] failed:', err);
    return NextResponse.json({ error: 'Discovery failed' }, { status: 500 });
  }
}
