import { loadDashboard } from '@/lib/admin-data';

export const runtime = 'edge';

const TOP_PAGES = [
  { path: '/', views: 2140, label: 'Home' },
  { path: '/blog/salvage-title-vs-rebuilt-title', views: 612, label: 'Salvage vs rebuilt' },
  { path: '/pricing', views: 488, label: 'Pricing' },
  { path: '/blog/how-to-read-a-vin-number', views: 421, label: 'How to read a VIN' },
  { path: '/blog/check-car-for-flood-damage', views: 305, label: 'Flood damage' },
];

const SOURCES = [
  { name: 'Organic search (Google)', pct: 52, color: 'bg-blue-500' },
  { name: 'AI search (ChatGPT, Perplexity)', pct: 18, color: 'bg-violet-500' },
  { name: 'Direct', pct: 16, color: 'bg-emerald-500' },
  { name: 'Referral', pct: 9, color: 'bg-amber-500' },
  { name: 'Social', pct: 5, color: 'bg-rose-500' },
];

export default async function AnalyticsPage() {
  const s = await loadDashboard();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-slate-900">Analytics</h2>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.live ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
          {s.live ? 'Live (D1 events)' : 'Demo data'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-5">Top pages</h3>
          <div className="space-y-4">
            {TOP_PAGES.map((p) => {
              const max = TOP_PAGES[0].views;
              return (
                <div key={p.path}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700 font-medium">{p.label}</span>
                    <span className="text-slate-500">{p.views.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(p.views / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-5">Traffic sources</h3>
          <div className="space-y-4">
            {SOURCES.map((src) => (
              <div key={src.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-700 font-medium">{src.name}</span>
                  <span className="text-slate-500">{src.pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${src.color} rounded-full`} style={{ width: `${src.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-5">
            First-party events are written to the <code className="font-mono">events</code> table via <code className="font-mono">/api/track</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
