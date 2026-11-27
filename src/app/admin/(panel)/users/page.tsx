import Link from 'next/link';
import { loadPeople } from '@/lib/admin-data';

export const runtime = 'edge';

// Every email we hold, one row per address: Supabase accounts plus the emails
// collected in D1 (free-preview form, checkout, contact form).
const TABS = [
  { key: '', label: 'All' },
  { key: 'accounts', label: 'Accounts' },
  { key: 'no-account', label: 'No account' },
] as const;

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const sp = await searchParams;
  const { rows: everyone, accountsLoaded, emailsLoaded, notices } = await loadPeople();

  const withAccount = everyone.filter((p) => p.account);
  const withoutAccount = everyone.filter((p) => !p.account);
  const confirmed = withAccount.filter((p) => p.account?.confirmed).length;
  const paying = everyone.filter((p) => p.paidOrders > 0).length;
  const counts: Record<string, number> = { '': everyone.length, accounts: withAccount.length, 'no-account': withoutAccount.length };

  // Filtering by account only makes sense when we know who has one.
  const show = accountsLoaded && (sp.show === 'accounts' || sp.show === 'no-account') ? sp.show : '';
  const rows = show === 'accounts' ? withAccount : show === 'no-account' ? withoutAccount : everyone;

  const live = accountsLoaded || emailsLoaded;
  const badge = accountsLoaded && emailsLoaded
    ? 'Live (Supabase + D1)'
    : accountsLoaded ? 'Live (Supabase only)' : emailsLoaded ? 'Live (D1 only)' : 'Demo data';

  // Unknown (source not loaded) → "—"; zero stays visible but muted.
  const count = (n: number) =>
    !emailsLoaded ? <span className="text-slate-300">—</span>
      : n > 0 ? <span className="font-semibold text-slate-900">{n}</span>
        : <span className="text-slate-400">0</span>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Users</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Every email we&apos;ve collected: accounts, the free-preview form, checkout and the contact form.
          </p>
        </div>
        <span
          className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
            accountsLoaded && emailsLoaded ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
          }`}
        >
          {badge}
        </span>
      </div>

      {notices.map((n) => (
        <p key={n} role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {n}
        </p>
      ))}

      {live && (
        <p className="text-sm text-slate-500">
          {everyone.length} {everyone.length === 1 ? 'email' : 'emails'}
          {accountsLoaded && (
            <> · {withAccount.length} with an account ({confirmed} confirmed) · {withoutAccount.length} without an account</>
          )}
          {emailsLoaded && <> · {paying} with a paid order</>}
        </p>
      )}

      {accountsLoaded && (
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={t.key ? `/admin/users?show=${t.key}` : '/admin/users'}
              className={`text-sm font-semibold px-3.5 py-2 rounded-lg transition-colors ${
                show === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.label} <span className="font-medium text-slate-400">{counts[t.key]}</span>
            </Link>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[880px]">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-5 py-3 font-semibold">Email</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold text-right">VIN lookups</th>
              <th className="px-5 py-3 font-semibold text-right">Paid orders</th>
              <th className="px-5 py-3 font-semibold">First seen (UTC)</th>
              <th className="px-5 py-3 font-semibold">Last activity (UTC)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                  No emails to show.
                </td>
              </tr>
            )}
            {rows.map((p) => (
              <tr key={p.email} className="hover:bg-slate-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 shrink-0 rounded-full text-white flex items-center justify-center text-xs font-bold ${
                        p.account ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-slate-300'
                      }`}
                    >
                      {(p.name || p.email).slice(0, 1).toUpperCase()}
                    </span>
                    <span className="font-medium text-slate-900">{p.name || '—'}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-600">
                  {p.email}
                  {p.contactMessages > 0 && (
                    <span className="ml-2 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 whitespace-nowrap">
                      Contact form{p.contactMessages > 1 ? ` ×${p.contactMessages}` : ''}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3">
                  {!accountsLoaded ? (
                    <span className="text-slate-300">—</span>
                  ) : (
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                        !p.account
                          ? 'bg-slate-100 text-slate-600'
                          : p.account.confirmed
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {!p.account ? 'No account' : p.account.confirmed ? 'Confirmed' : 'Unconfirmed'}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-right tabular-nums">{count(p.lookups)}</td>
                <td className="px-5 py-3 text-right tabular-nums">{count(p.paidOrders)}</td>
                <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{p.firstSeen ?? '—'}</td>
                <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{p.lastActivity ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {accountsLoaded && (
        <p className="text-xs text-slate-400">
          &ldquo;No account&rdquo; means the address never signed up: it was typed into the free-preview form, the contact
          form or checkout, and has never been verified.
        </p>
      )}
    </div>
  );
}
