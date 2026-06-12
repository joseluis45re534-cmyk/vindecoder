'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save, Check, KeyRound, ShieldAlert } from 'lucide-react';

interface KeyStatus {
  set: boolean;
  hint: string | null;
  source: 'db' | 'env' | 'unset';
}
interface Status {
  stripeSecret: KeyStatus;
  stripeWebhookSecret: KeyStatus;
  stripePublishable: KeyStatus;
  paypalClientId: KeyStatus;
  paypalSecret: KeyStatus;
  paypalEnv: { value: string };
  persistable: boolean;
}

const FIELDS: { key: keyof Status; label: string; placeholder: string; secret: boolean }[] = [
  { key: 'stripeSecret', label: 'Stripe secret key', placeholder: 'sk_live_…', secret: true },
  { key: 'stripeWebhookSecret', label: 'Stripe webhook secret', placeholder: 'whsec_…', secret: true },
  { key: 'stripePublishable', label: 'Stripe publishable key', placeholder: 'pk_live_…', secret: false },
  { key: 'paypalClientId', label: 'PayPal client ID', placeholder: 'A21…', secret: false },
  { key: 'paypalSecret', label: 'PayPal secret', placeholder: 'EL…', secret: true },
];

export default function PaymentsEditor() {
  const [status, setStatus] = useState<Status | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [paypalEnv, setPaypalEnv] = useState('sandbox');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const load = () =>
    fetch('/api/admin/settings/payments')
      .then((r) => r.json() as Promise<Status>)
      .then((d) => {
        setStatus(d);
        setPaypalEnv(d.paypalEnv?.value || 'sandbox');
      })
      .catch(() => setMsg({ type: 'err', text: 'Failed to load payment settings' }));

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/settings/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, paypalEnv }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok) {
        setMsg({ type: 'ok', text: 'Saved. Empty fields were left unchanged.' });
        setValues({});
        await load();
      } else {
        setMsg({ type: 'err', text: data.error || 'Save failed' });
      }
    } catch {
      setMsg({ type: 'err', text: 'Network error' });
    } finally {
      setSaving(false);
    }
  };

  if (!status) {
    return (
      <div className="flex items-center gap-2 text-slate-500 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading payment settings…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {!status.persistable && (
        <div className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          D1 is not bound here — keys entered below won&apos;t persist. Connect D1, or set them as Cloudflare Pages secrets.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
        {FIELDS.map(({ key, label, placeholder, secret }) => {
          const st = status[key] as KeyStatus;
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400" /> {label}
                </label>
                {st.set ? (
                  <span className="text-xs flex items-center gap-1.5 text-emerald-600">
                    <Check className="w-3.5 h-3.5" /> {st.hint}
                    <span className="text-slate-400">({st.source})</span>
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">not set</span>
                )}
              </div>
              <input
                type={secret ? 'password' : 'text'}
                value={values[key] || ''}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                placeholder={st.set ? 'Enter a new value to replace…' : placeholder}
                autoComplete="off"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>
          );
        })}

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">PayPal environment</label>
          <select
            value={paypalEnv}
            onChange={(e) => setPaypalEnv(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:border-blue-500 focus:outline-none"
          >
            <option value="sandbox">sandbox</option>
            <option value="live">live</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save keys
        </button>
        {msg && (
          <span className={`text-sm ${msg.type === 'ok' ? 'text-emerald-600' : 'text-red-600'}`}>{msg.text}</span>
        )}
      </div>

      <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
        <ShieldAlert className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
        <span>
          Secrets are write-only here — the panel only ever shows a masked hint, never the full value. For maximum
          security, prefer Cloudflare Pages secrets; DB-stored keys override env when present.
        </span>
      </div>
    </div>
  );
}
