import Link from 'next/link';
import { loadLookups } from '@/lib/admin-data';

export const runtime = 'edge';

const TYPE_STYLES: Record<string, string> = {
  preview: 'bg-blue-50 text-blue-700',
  report: 'bg-violet-50 text-violet-700',
};
const STATUS_STYLES: Record<string, string> = {
  ok: 'bg-emerald-50 text-emerald-700',
  cached: 'bg-slate-100 text-slate-600',
  not_found: 'bg-amber-50 text-amber-700',
  error: 'bg-red-50 text-red-700',
};

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || '';
  const type = sp.type === 'preview' || sp.type === 'report' ? sp.type : '';
  const page = Math.max(1, Number(sp.page) || 1);

  const { rows, live, total, pageSize, previews, reports } = await loadLookups({ q, type, page });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const href = (patch: { type?: string; page?: number }) => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    const t = patch.type ?? type;
    if (t) p.set('type', t);
    const pg = patch.page ?? page;
    if (pg > 1) p.set('page', String(pg));
    const s = p.toString();
    return `/admin/activity${s ? `?${s}` : ''}`;
  };

  const tabs: { key: string; label: string }[] = [
    { key: '', label: 'All' },
    { key: 'preview', label: 'Previews' },
    { key: 'report', label: 'Reports' },
  ];

  const stat = (label: string, value: number | string) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className="text-2xl font-extrabold text-slate-900 mt-1">{value}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">VIN activity</h2>
          <p className="text-sm text-slate-500 mt-0.5">Every preview and paid report, most recent first.</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${live ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
          {live ? 'Live (D1)' : 'Demo data'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stat('Total lookups', total)}
        {stat('Previews', previews)}
        {stat('Paid reports', reports)}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <form className="flex-1 flex gap-2" action="/admin/activity" method="get">
          {type && <input type="hidden" name="type" value={type} />}
          <input
            name="q"
            defaultValue={q}
            placeholder="Search VIN or email…"
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
          <button type="submit" className="rounded-xl bg-slate-900 text-white text-sm font-semibold px-4 py-2.5 hover:bg-slate-800">
            Search
          </button>
        </form>
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={href({ type: t.key, page: 1 })}
              className={`text-sm font-semibold px-3.5 py-2 rounded-lg transition-colors ${type === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[820px]">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-5 py-3 font-semibold">Time</th>
              <th className="px-5 py-3 font-semibold">VIN</th>
              <th className="px-5 py-3 font-semibold">Type</th>
              <th className="px-5 py-3 font-semibold">Vehicle</th>
              <th className="px-5 py-3 font-semibold">Email</th>
              <th className="px-5 py-3 font-semibold">Country</th>
              <th className="px-5 py-3 font-semibold">Records</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-slate-400">No lookups match your filters yet.</td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{r.created_at}</td>
                <td className="px-5 py-3">
                  <Link href={`/report/${r.vin}`} className="font-mono text-xs text-blue-700 hover:underline">{r.vin}</Link>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${TYPE_STYLES[r.type] || 'bg-slate-100'}`}>
                    {r.type}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-700">
                  {[r.year, r.make, r.model].filter(Boolean).join(' ') || '—'}
                </td>
                <td className="px-5 py-3 text-slate-600">{r.email || <span className="text-slate-300">anon</span>}</td>
                <td className="px-5 py-3 text-slate-500">{r.country || '—'}</td>
                <td className="px-5 py-3 font-semibold text-slate-900">{r.records_found ?? '—'}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[r.status || ''] || 'bg-slate-100'}`}>
                    {(r.status || 'ok').replace('_', ' ')}
                  </span>
                  {r.test_mode ? <span className="ml-1.5 text-[10px] font-bold text-amber-600 uppercase">test</span> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">
            Page {page} of {totalPages} · {total} lookups
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={href({ page: page - 1 })} className="px-3.5 py-2 rounded-lg border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50">
                ← Prev
              </Link>
            )}
            {page < totalPages && (
              <Link href={href({ page: page + 1 })} className="px-3.5 py-2 rounded-lg border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50">
                Next →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
