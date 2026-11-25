import { DollarSign, ShoppingCart, Users as UsersIcon, Eye, TrendingUp } from 'lucide-react';
import { loadDashboard } from '@/lib/admin-data';
import { formatPrice } from '@/lib/pricing';

export const runtime = 'edge';

function LiveBadge({ live }: { live: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
        live ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-emerald-500' : 'bg-amber-500'}`} />
      {live ? 'Live data (D1)' : 'Demo data — connect D1'}
    </span>
  );
}

export default async function AdminDashboard() {
  const s = await loadDashboard();
  const max = Math.max(...s.revenueSeries);

  const cards = [
    { label: 'Revenue (paid)', value: formatPrice(s.revenueCents), icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Orders', value: String(s.orders), icon: ShoppingCart, color: 'text-blue-600 bg-blue-50' },
    { label: 'Users', value: String(s.users), icon: UsersIcon, color: 'text-violet-600 bg-violet-50' },
    { label: 'Pageviews', value: s.pageviews.toLocaleString(), icon: Eye, color: 'text-sky-600 bg-sky-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-slate-900">Dashboard</h2>
        <LiveBadge live={s.live} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" aria-hidden="true" />
              </span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900">Revenue (last 12 weeks)</h3>
            <span className="flex items-center gap-1 text-emerald-600 text-sm font-semibold">
              <TrendingUp className="w-4 h-4" aria-hidden="true" /> Trending up
            </span>
          </div>
          <div className="flex items-end gap-2 h-40">
            {s.revenueSeries.map((v, idx) => (
              <div key={idx} className="flex-1 flex flex-col justify-end">
                <div
                  className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md transition-all hover:from-blue-700"
                  style={{ height: `${(v / max) * 100}%` }}
                  title={`Week ${idx + 1}`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-4">Conversion</h3>
          <p className="text-4xl font-extrabold text-slate-900">{s.conversion.toFixed(2)}%</p>
          <p className="text-sm text-slate-500 mt-1">Pageview → paid order</p>
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Avg. order value</span><span className="font-bold">{formatPrice(s.orders ? s.revenueCents / s.orders : 0)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Paid orders</span><span className="font-bold">{s.orders}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
