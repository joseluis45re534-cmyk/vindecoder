import { loadOrders } from '@/lib/admin-data';
import { formatPrice } from '@/lib/pricing';

export const runtime = 'edge';

const STATUS_STYLES: Record<string, string> = {
  paid: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  failed: 'bg-red-50 text-red-700',
  refunded: 'bg-slate-100 text-slate-600',
};

export default async function OrdersPage() {
  const { rows, live } = await loadOrders();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-slate-900">Payments</h2>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${live ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
          {live ? 'Live (D1)' : 'Demo data'}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-5 py-3 font-semibold">Order ID</th>
              <th className="px-5 py-3 font-semibold">Customer</th>
              <th className="px-5 py-3 font-semibold">Plan</th>
              <th className="px-5 py-3 font-semibold">Provider</th>
              <th className="px-5 py-3 font-semibold">Amount</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50">
                <td className="px-5 py-3 font-mono text-xs text-slate-500">{o.id}</td>
                <td className="px-5 py-3 text-slate-900">{o.email || '—'}</td>
                <td className="px-5 py-3 capitalize">{o.plan_id}</td>
                <td className="px-5 py-3">
                  <span className="capitalize inline-flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${o.provider === 'stripe' ? 'bg-indigo-500' : 'bg-sky-500'}`} />
                    {o.provider}
                  </span>
                </td>
                <td className="px-5 py-3 font-bold text-slate-900">{formatPrice(o.amount_cents)}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[o.status] || 'bg-slate-100'}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-500">{o.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
