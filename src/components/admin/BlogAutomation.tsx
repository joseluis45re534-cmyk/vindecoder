'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Trash2, Play, Save, CalendarClock, ListPlus, Database } from 'lucide-react';

interface KeywordRow {
  id: string;
  term: string;
  status: string;
  created_at: string;
}
interface Schedule {
  enabled: boolean;
  mode: 'on_trigger' | 'daily' | 'weekly' | 'interval';
  timeOfDay: string;
  weekday: number;
  intervalHours: number;
  timezone: string;
  qtyPerRun: number;
  autoPublish: boolean;
  minQualityToPublish: number;
  lastRunAt: string | null;
}

const DEFAULT_SCHEDULE: Schedule = {
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

const TIMEZONES = ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'UTC'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const KW_STATUS: Record<string, string> = {
  queued: 'bg-blue-50 text-blue-700',
  drafting: 'bg-amber-50 text-amber-700',
  done: 'bg-emerald-50 text-emerald-700',
  skipped: 'bg-slate-100 text-slate-500',
};

export default function BlogAutomation() {
  const [live, setLive] = useState(true);
  const [rows, setRows] = useState<KeywordRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [text, setText] = useState('');
  const [adding, setAdding] = useState(false);
  const [kwMsg, setKwMsg] = useState('');
  const [schedule, setSchedule] = useState<Schedule>(DEFAULT_SCHEDULE);
  const [savingSched, setSavingSched] = useState(false);
  const [schedMsg, setSchedMsg] = useState('');
  const [running, setRunning] = useState(false);
  const [runMsg, setRunMsg] = useState('');

  const loadKeywords = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/blog/keywords');
      if (!res.ok) return;
      const d = (await res.json()) as { live: boolean; rows: KeywordRow[]; counts: Record<string, number> };
      setLive(d.live);
      setRows(d.rows || []);
      setCounts(d.counts || {});
    } catch {
      /* noop */
    }
  }, []);

  const loadSchedule = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/blog/schedule');
      if (!res.ok) return;
      const d = (await res.json()) as { schedule?: Schedule };
      if (d.schedule) setSchedule(d.schedule);
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    loadKeywords();
    loadSchedule();
  }, [loadKeywords, loadSchedule]);

  const addKeywords = async () => {
    if (!text.trim() || adding) return;
    setAdding(true);
    setKwMsg('');
    try {
      const res = await fetch('/api/admin/blog/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const d = (await res.json()) as { added?: number; skipped?: number; error?: string };
      if (res.ok) {
        setKwMsg(`Added ${d.added}${d.skipped ? `, skipped ${d.skipped} duplicate(s)` : ''}.`);
        setText('');
        await loadKeywords();
      } else setKwMsg(d.error || 'Failed to add.');
    } finally {
      setAdding(false);
    }
  };

  const del = async (id: string) => {
    await fetch(`/api/admin/blog/keywords?id=${id}`, { method: 'DELETE' });
    await loadKeywords();
  };

  const upd = (patch: Partial<Schedule>) => setSchedule((s) => (s ? { ...s, ...patch } : s));

  const saveSchedule = async () => {
    if (!schedule || savingSched) return;
    setSavingSched(true);
    setSchedMsg('');
    try {
      const res = await fetch('/api/admin/blog/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule),
      });
      const d = (await res.json()) as { schedule?: Schedule; error?: string };
      if (res.ok && d.schedule) {
        setSchedule(d.schedule);
        setSchedMsg('Schedule saved.');
      } else setSchedMsg(d.error || 'Failed to save.');
    } finally {
      setSavingSched(false);
    }
  };

  const runNow = async () => {
    if (running) return;
    setRunning(true);
    setRunMsg('');
    try {
      const res = await fetch('/api/admin/blog/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      const d = (await res.json()) as { message?: string; generated?: number; published?: number; inReview?: number; error?: string };
      if (res.ok) {
        setRunMsg(d.message || `Generated ${d.generated} — ${d.published} published, ${d.inReview} in review.`);
        await loadKeywords();
        await loadSchedule();
      } else setRunMsg(d.error || 'Run failed.');
    } finally {
      setRunning(false);
    }
  };

  const card = 'bg-white rounded-2xl border border-slate-100 shadow-sm p-6';
  const input = 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400';

  return (
    <div className="space-y-6">
      {!live && (
        <div className="flex items-start gap-2 text-sm text-amber-900 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          <Database className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          <span>Connect the D1 database to store the keyword backlog and schedule. Until then, changes won&apos;t persist.</span>
        </div>
      )}

      {/* Keyword backlog */}
      <div className={card}>
        <div className="flex items-center gap-2 mb-1">
          <ListPlus className="w-5 h-5 text-blue-600" aria-hidden="true" />
          <h3 className="font-bold text-slate-900">Keyword backlog</h3>
          <span className="ml-auto text-xs text-slate-500">{counts.queued || 0} queued · {counts.done || 0} done</span>
        </div>
        <p className="text-sm text-slate-500 mb-3">Add one keyword or paste a bulk list (one per line, or comma-separated).</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder={'how to check a salvage title\nused car inspection checklist\nwhat is a clean title'}
          className={`${input} resize-y font-mono`}
        />
        <div className="flex items-center gap-3 mt-2">
          <button
            type="button"
            onClick={addKeywords}
            disabled={adding || !text.trim()}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm px-4 py-2 rounded-xl"
          >
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <ListPlus className="w-4 h-4" />} Add to backlog
          </button>
          {kwMsg && <span className="text-xs text-slate-500">{kwMsg}</span>}
        </div>

        {rows.length > 0 && (
          <ul className="mt-4 divide-y divide-slate-100 max-h-64 overflow-y-auto border border-slate-100 rounded-xl">
            {rows.map((k) => (
              <li key={k.id} className="flex items-center gap-2 px-3 py-2">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize shrink-0 ${KW_STATUS[k.status] || 'bg-slate-100'}`}>{k.status}</span>
                <span className="text-sm text-slate-700 truncate flex-1">{k.term}</span>
                <button type="button" onClick={() => del(k.id)} aria-label="Delete keyword" className="text-slate-300 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Schedule */}
      {schedule && (
        <div className={card}>
          <div className="flex items-center gap-2 mb-4">
            <CalendarClock className="w-5 h-5 text-violet-600" aria-hidden="true" />
            <h3 className="font-bold text-slate-900">Schedule</h3>
            <label className="ml-auto inline-flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={schedule.enabled} onChange={(e) => upd({ enabled: e.target.checked })} className="h-4 w-4 accent-blue-600" />
              Enabled
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Frequency</span>
              <select value={schedule.mode} onChange={(e) => upd({ mode: e.target.value as Schedule['mode'] })} className={`mt-1 ${input}`}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="interval">Every N hours</option>
                <option value="on_trigger">On every cron trigger</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Posts per run</span>
              <input type="number" min={1} max={10} value={schedule.qtyPerRun} onChange={(e) => upd({ qtyPerRun: Number(e.target.value) })} className={`mt-1 ${input}`} />
            </label>

            {(schedule.mode === 'daily' || schedule.mode === 'weekly') && (
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Time of day</span>
                <input type="time" value={schedule.timeOfDay} onChange={(e) => upd({ timeOfDay: e.target.value })} className={`mt-1 ${input}`} />
              </label>
            )}

            {schedule.mode === 'weekly' && (
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Day of week</span>
                <select value={schedule.weekday} onChange={(e) => upd({ weekday: Number(e.target.value) })} className={`mt-1 ${input}`}>
                  {WEEKDAYS.map((d, i) => (
                    <option key={d} value={i}>{d}</option>
                  ))}
                </select>
              </label>
            )}

            {schedule.mode === 'interval' && (
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Every (hours)</span>
                <input type="number" min={1} max={168} value={schedule.intervalHours} onChange={(e) => upd({ intervalHours: Number(e.target.value) })} className={`mt-1 ${input}`} />
              </label>
            )}

            {(schedule.mode === 'daily' || schedule.mode === 'weekly') && (
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Timezone</span>
                <select value={schedule.timezone} onChange={(e) => upd({ timezone: e.target.value })} className={`mt-1 ${input}`}>
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </label>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={schedule.autoPublish} onChange={(e) => upd({ autoPublish: e.target.checked })} className="h-4 w-4 accent-blue-600" />
              Auto-publish (else hold for review)
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Min quality to publish ({schedule.minQualityToPublish}/100)</span>
              <input type="range" min={0} max={100} value={schedule.minQualityToPublish} onChange={(e) => upd({ minQualityToPublish: Number(e.target.value) })} className="mt-2 w-full accent-blue-600" disabled={!schedule.autoPublish} />
            </label>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button type="button" onClick={saveSchedule} disabled={savingSched} className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-sm px-4 py-2 rounded-xl">
              {savingSched ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save schedule
            </button>
            {schedMsg && <span className="text-xs text-slate-500">{schedMsg}</span>}
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            Last run: {schedule.lastRunAt ? new Date(schedule.lastRunAt).toLocaleString() : 'never'}. An external cron trigger must
            POST <code className="font-mono">/api/cron/blog</code> (Bearer <code className="font-mono">CRON_SECRET</code>) for scheduled runs to fire.
          </p>
        </div>
      )}

      {/* Run now */}
      <div className={card}>
        <div className="flex items-center gap-2 mb-1">
          <Play className="w-5 h-5 text-emerald-600" aria-hidden="true" />
          <h3 className="font-bold text-slate-900">Run now</h3>
        </div>
        <p className="text-sm text-slate-500 mb-3">Generate and publish a batch immediately from the queued backlog (ignores the schedule timing).</p>
        <div className="flex items-center gap-3">
          <button type="button" onClick={runNow} disabled={running} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm px-4 py-2 rounded-xl">
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Run now
          </button>
          {runMsg && <span className="text-xs text-slate-600">{runMsg}</span>}
        </div>
      </div>
    </div>
  );
}
