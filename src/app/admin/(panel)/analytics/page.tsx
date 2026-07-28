import { loadAnalytics } from '@/lib/admin-data';

export const runtime = 'edge';

const SOURCE_COLORS: Record<string, string> = {
  'Organic search': 'bg-blue-500',
  'AI search': 'bg-violet-500',
  Direct: 'bg-emerald-500',
  Referral: 'bg-amber-500',
  Social: 'bg-rose-500',
};

export default async function AnalyticsPage() {
  const a = await loadAnalytics();

  const funnel = [
    { label: 'Pageviews', value: a.pageviews, color: 'bg-slate-400' },
    { label: 'VIN searches', value: a.vinSearches, color: 'bg-blue-500' },
    { label: 'Checkouts started', value: a.checkoutsStarted, color: 'bg-violet-500' },
    { label: 'Purchases', value: a.purchases, color: 'bg-emerald-500' },
  ];
  const funnelMax = Math.max(1, a.pageviews);
  const pct = (n: number, d: number) => (d ? Math.round((n / d) * 1000) / 10 : 0);
  const topMax = a.topPages[0]?.views || 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-slate-900">Analytics</h2>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${a.live ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
          {a.live ? 'Live (D1 events)' : 'Demo data'}
        </span>
      </div>

      {/* Conversion funnel */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-baseline justify-between mb-5">
          <h3 className="font-bold text-slate-900">Conversion funnel</h3>
          <span className="text-sm text-slate-500">
            {pct(a.purchases, a.pageviews)}% view → purchase
          </span>
        </div>
        <div className="space-y-4">
          {funnel.map((f, i) => (
            <div key={f.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-700 font-medium">{f.label}</span>
                <span className="text-slate-500">
                  {f.value.toLocaleString()}
                  {i > 0 && <span className="text-slate-400"> · {pct(f.value, funnel[i - 1].value)}% of prev</span>}
                </span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${f.color} rounded-full`} style={{ width: `${Math.max(2, (f.value / funnelMax) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-5">Top pages</h3>
          <div className="space-y-4">
            {a.topPages.length === 0 && <p className="text-sm text-slate-400">No pageviews recorded yet.</p>}
            {a.topPages.map((p) => (
              <div key={p.path}>
                <div className="flex justify-between text-sm mb-1 gap-3">
                  <span className="text-slate-700 font-medium truncate">{p.path}</span>
                  <span className="text-slate-500 shrink-0">{p.views.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(p.views / topMax) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-5">Traffic sources</h3>
          <div className="space-y-4">
            {a.sources.map((src) => (
              <div key={src.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-700 font-medium">{src.name}</span>
                  <span className="text-slate-500">{src.pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${SOURCE_COLORS[src.name] || 'bg-slate-400'} rounded-full`} style={{ width: `${src.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-5">
            First-party events (pageview, vin_search, checkout_started, purchase) are written to the{' '}
            <code className="font-mono">events</code> table via <code className="font-mono">/api/track</code>. Sources are
            derived from the referrer — no cookies, no third-party trackers.
          </p>
        </div>
      </div>
    </div>
  );
}
