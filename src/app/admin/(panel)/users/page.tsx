import { loadUsers } from '@/lib/admin-data';

export const runtime = 'edge';

// Accounts come from Supabase Auth (where sign-up actually happens), with each
// account's paid D1 orders matched by email.
export default async function UsersPage() {
  const { rows, total, live, error } = await loadUsers();
  const confirmed = rows.filter((u) => u.confirmed).length;
  const paying = rows.filter((u) => (u.paidOrders ?? 0) > 0).length;
  const ordersKnown = rows.some((u) => u.paidOrders !== null);
  const badge = live ? 'Live (Supabase)' : rows.length ? 'Demo data' : 'Unavailable';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-slate-900">Users</h2>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${live ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
          {badge}
        </span>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </p>
      )}

      {live && (
        <p className="text-sm text-slate-500">
          {total} {total === 1 ? 'account' : 'accounts'} · {confirmed} confirmed
          {ordersKnown && <> · {paying} with a paid order</>}
          {rows.length < total && <> · showing the newest {rows.length}</>}
        </p>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-5 py-3 font-semibold">Email</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold text-right">Paid orders</th>
              <th className="px-5 py-3 font-semibold">Joined (UTC)</th>
              <th className="px-5 py-3 font-semibold">Last sign-in (UTC)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                  No accounts to show.
                </td>
              </tr>
            )}
            {rows.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center text-xs font-bold">
                      {(u.name || u.email).slice(0, 1).toUpperCase()}
                    </span>
                    <span className="font-medium text-slate-900">{u.name || '—'}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-600">{u.email}</td>
                <td className="px-5 py-3">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                      u.confirmed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {u.confirmed ? 'Confirmed' : 'Unconfirmed'}
                  </span>
                </td>
                <td className="px-5 py-3 text-right tabular-nums">
                  {u.paidOrders === null ? (
                    <span className="text-slate-300">—</span>
                  ) : u.paidOrders > 0 ? (
                    <span className="font-semibold text-slate-900">{u.paidOrders}</span>
                  ) : (
                    <span className="text-slate-400">0</span>
                  )}
                </td>
                <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{u.createdAt ?? '—'}</td>
                <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                  {u.lastSignInAt ?? <span className="text-slate-300">never</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
