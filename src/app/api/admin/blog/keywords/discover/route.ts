import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/cf';
import { requireAdmin } from '@/lib/auth';
import { discoverKeywords, ALL_CLUSTERS, type Cluster } from '@/lib/keyword-discovery';

export const runtime = 'edge';

// Admin-triggered keyword discovery. Mines DataForSEO for new terms in the
// selected category clusters and stores them as review `candidate`s.
export async function POST(request: Request) {
  const env = await getEnv();
  if (!(await requireAdmin(request, env))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    clusters?: string[];
    minVolume?: number;
    maxDifficulty?: number;
    includeLongTail?: boolean;
  };
  const clusters = (body.clusters || []).filter((c): c is Cluster => (ALL_CLUSTERS as string[]).includes(c));

  const summary = await discoverKeywords(env, {
    clusters: clusters.length ? clusters : undefined,
    minVolume: typeof body.minVolume === 'number' ? body.minVolume : undefined,
    maxDifficulty: typeof body.maxDifficulty === 'number' ? body.maxDifficulty : undefined,
    includeLongTail: body.includeLongTail,
  });

  // Surface a misconfiguration clearly (button should tell the operator to set keys).
  if (!summary.configured) {
    return NextResponse.json({ ...summary, error: 'DataForSEO not configured.' }, { status: 503 });
  }
  return NextResponse.json({ ok: true, ...summary });
}
