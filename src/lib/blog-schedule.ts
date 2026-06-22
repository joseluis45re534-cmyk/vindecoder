// Blog automation schedule — shape, defaults, and the "is a run due?" check.
// Stored in the `settings` table under key `blog_schedule` (see settings.ts).
// Pure module (no DB import) so it's safe to use anywhere.

export type ScheduleMode = 'on_trigger' | 'daily' | 'weekly' | 'interval';

export interface BlogSchedule {
  enabled: boolean;
  mode: ScheduleMode;
  /** "HH:MM" 24h, local to `timezone` (daily/weekly). */
  timeOfDay: string;
  /** 0=Sun … 6=Sat (weekly). */
  weekday: number;
  /** Hours between runs (interval). */
  intervalHours: number;
  /** IANA timezone, e.g. "America/New_York". */
  timezone: string;
  /** Posts to generate per run (capped in the runner). */
  qtyPerRun: number;
  /** Publish automatically when quality clears the threshold. */
  autoPublish: boolean;
  /** 0–100. Posts below this go to `in_review` instead of `published`. */
  minQualityToPublish: number;
  /** Set by the runner after each batch. */
  lastRunAt: string | null;
}

export const DEFAULT_SCHEDULE: BlogSchedule = {
  enabled: false,
  mode: 'daily',
  timeOfDay: '09:00',
  weekday: 1,
  intervalHours: 24,
  timezone: 'America/New_York',
  qtyPerRun: 1,
  autoPublish: true,
  minQualityToPublish: 80,
  lastRunAt: null,
};

const WD: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function partsInTz(d: Date, timezone: string) {
  const p = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour12: false,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(d);
  const get = (t: string) => p.find((x) => x.type === t)?.value || '';
  return {
    ymd: `${get('year')}-${get('month')}-${get('day')}`,
    weekday: WD[get('weekday')] ?? 0,
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  };
}

/**
 * Whether a scheduled run should fire now. The external cron heartbeat may call
 * more often than the schedule; this self-gates so posts only go out as configured.
 */
export function isDue(s: BlogSchedule, now: Date = new Date()): boolean {
  if (!s.enabled) return false;
  if (s.mode === 'on_trigger') return true;

  const last = s.lastRunAt ? new Date(s.lastRunAt) : null;

  if (s.mode === 'interval') {
    if (!last) return true;
    return now.getTime() - last.getTime() >= Math.max(1, s.intervalHours) * 3600_000;
  }

  // daily / weekly
  const cur = partsInTz(now, s.timezone);
  const [hh, mm] = (s.timeOfDay || '09:00').split(':').map((n) => Number(n) || 0);
  const schedMinutes = hh * 60 + mm;
  if (cur.minutes < schedMinutes) return false; // not yet time today
  if (s.mode === 'weekly' && cur.weekday !== s.weekday) return false;

  // Already ran today (in the configured tz)? Then skip until the next cycle.
  if (last && partsInTz(last, s.timezone).ymd === cur.ymd) return false;

  return true;
}
