import { getEnv } from '@/lib/cf';
import { Check, X, KeyRound } from 'lucide-react';
import PaymentsEditor from '@/components/admin/PaymentsEditor';

export const runtime = 'edge';

export default async function SettingsPage() {
  const env = await getEnv();

  const otherGroups = [
    {
      name: 'Admin & Automation',
      keys: [
        { key: 'ADMIN_PASSWORD', set: Boolean(env.ADMIN_PASSWORD) },
        { key: 'ADMIN_SESSION_SECRET', set: Boolean(env.ADMIN_SESSION_SECRET) },
        { key: 'ANTHROPIC_API_KEY', set: Boolean(env.ANTHROPIC_API_KEY) },
        { key: 'CRON_SECRET', set: Boolean(env.CRON_SECRET) },
      ],
    },
    {
      name: 'Bindings',
      keys: [
        { key: 'DB (D1)', set: Boolean(env.DB) },
        { key: 'NEXT_PUBLIC_SITE_URL', set: Boolean(env.NEXT_PUBLIC_SITE_URL) },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">Settings</h2>
        <p className="text-slate-500 text-sm mt-1">
          Manage payment credentials here. Other secrets are set as Cloudflare Pages secrets (or
          <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded mx-1">.dev.vars</code> locally).
        </p>
      </div>

      <section>
        <h3 className="font-bold text-slate-900 mb-3">Payment providers</h3>
        <PaymentsEditor />
      </section>

      <section>
        <h3 className="font-bold text-slate-900 mb-3">Other configuration (read-only)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {otherGroups.map((g) => (
            <div key={g.name} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-slate-400" aria-hidden="true" /> {g.name}
              </h4>
              <ul className="space-y-2.5">
                {g.keys.map(({ key, set }) => (
                  <li key={key} className="flex items-center justify-between text-sm">
                    <code className="font-mono text-xs text-slate-600">{key}</code>
                    {set ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                        <Check className="w-4 h-4" aria-hidden="true" /> Set
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400 font-semibold">
                        <X className="w-4 h-4" aria-hidden="true" /> Missing
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
