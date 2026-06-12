'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save, Check } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  tagline: string;
  priceCents: number;
  currency: 'usd';
  interval: 'one_time' | 'month';
  features: string[];
  highlighted?: boolean;
  cta: string;
}

export default function PricingEditor() {
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [persistable, setPersistable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings/pricing')
      .then((r) => r.json() as Promise<{ plans: Plan[]; persistable: boolean }>)
      .then((d) => {
        setPlans(d.plans);
        setPersistable(d.persistable);
      })
      .catch(() => setMsg({ type: 'err', text: 'Failed to load pricing' }));
  }, []);

  const update = (i: number, patch: Partial<Plan>) =>
    setPlans((prev) => (prev ? prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)) : prev));

  const save = async () => {
    if (!plans) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/settings/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plans }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      setMsg(res.ok ? { type: 'ok', text: 'Pricing saved — live on /pricing.' } : { type: 'err', text: data.error || 'Save failed' });
    } catch {
      setMsg({ type: 'err', text: 'Network error' });
    } finally {
      setSaving(false);
    }
  };

  if (!plans) {
    return (
      <div className="flex items-center gap-2 text-slate-500 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading pricing…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {!persistable && (
        <div className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          D1 is not bound in this environment — edits won&apos;t persist. Connect D1 (or set Cloudflare secrets) to save.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {plans.map((p, i) => (
          <div key={p.id} className={`bg-white rounded-2xl border p-5 ${p.highlighted ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-100'}`}>
            <div className="flex items-center justify-between mb-3">
              <code className="text-xs text-slate-400 font-mono">{p.id}</code>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <input type="checkbox" checked={!!p.highlighted} onChange={(e) => update(i, { highlighted: e.target.checked })} />
                Popular
              </label>
            </div>

            <label className="block text-xs font-semibold text-slate-500 mb-1">Name</label>
            <input value={p.name} onChange={(e) => update(i, { name: e.target.value })} className="w-full mb-3 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:outline-none" />

            <label className="block text-xs font-semibold text-slate-500 mb-1">Tagline</label>
            <input value={p.tagline} onChange={(e) => update(i, { tagline: e.target.value })} className="w-full mb-3 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:outline-none" />

            <div className="flex gap-3 mb-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Price (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={(p.priceCents / 100).toString()}
                  onChange={(e) => update(i, { priceCents: Math.round((Number(e.target.value) || 0) * 100) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Interval</label>
                <select
                  value={p.interval}
                  onChange={(e) => update(i, { interval: e.target.value as Plan['interval'] })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:outline-none bg-white"
                >
                  <option value="one_time">one-time</option>
                  <option value="month">monthly</option>
                </select>
              </div>
            </div>

            <label className="block text-xs font-semibold text-slate-500 mb-1">Features (one per line)</label>
            <textarea
              value={p.features.join('\n')}
              onChange={(e) => update(i, { features: e.target.value.split('\n').filter(Boolean) })}
              rows={5}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:outline-none resize-y"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save pricing
        </button>
        {msg && (
          <span className={`text-sm flex items-center gap-1.5 ${msg.type === 'ok' ? 'text-emerald-600' : 'text-red-600'}`}>
            {msg.type === 'ok' && <Check className="w-4 h-4" />}
            {msg.text}
          </span>
        )}
      </div>
    </div>
  );
}
