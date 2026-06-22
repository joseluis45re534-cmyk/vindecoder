import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/cf';
import { requireAdmin } from '@/lib/auth';
import { getBlogSchedule, setBlogSchedule } from '@/lib/settings';
import type { BlogSchedule, ScheduleMode } from '@/lib/blog-schedule';

export const runtime = 'edge';

const MODES: ScheduleMode[] = ['on_trigger', 'daily', 'weekly', 'interval'];
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, Math.round(n)));

export async function GET(request: Request) {
  const env = await getEnv();
  if (!(await requireAdmin(request, env))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ live: !!env.DB, schedule: await getBlogSchedule(env) });
}

export async function POST(request: Request) {
  const env = await getEnv();
  if (!(await requireAdmin(request, env))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!env.DB) return NextResponse.json({ error: 'D1 database not bound — cannot save schedule.' }, { status: 503 });

  const b = (await request.json().catch(() => ({}))) as Partial<BlogSchedule>;
  const patch: Partial<BlogSchedule> = {};

  if (typeof b.enabled === 'boolean') patch.enabled = b.enabled;
  if (typeof b.autoPublish === 'boolean') patch.autoPublish = b.autoPublish;
  if (b.mode && MODES.includes(b.mode)) patch.mode = b.mode;
  if (typeof b.timeOfDay === 'string' && /^\d{1,2}:\d{2}$/.test(b.timeOfDay)) patch.timeOfDay = b.timeOfDay;
  if (typeof b.weekday === 'number') patch.weekday = clamp(b.weekday, 0, 6);
  if (typeof b.intervalHours === 'number') patch.intervalHours = clamp(b.intervalHours, 1, 168);
  if (typeof b.timezone === 'string' && b.timezone.length <= 64) patch.timezone = b.timezone;
  if (typeof b.qtyPerRun === 'number') patch.qtyPerRun = clamp(b.qtyPerRun, 1, 10);
  if (typeof b.minQualityToPublish === 'number') patch.minQualityToPublish = clamp(b.minQualityToPublish, 0, 100);

  const updated = await setBlogSchedule(env, patch);
  return NextResponse.json({ ok: true, schedule: updated });
}
