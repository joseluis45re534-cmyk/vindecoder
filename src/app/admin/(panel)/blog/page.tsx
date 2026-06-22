import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { loadPosts } from '@/lib/admin-data';
import BlogStudio from '@/components/admin/BlogStudio';
import BlogAutomation from '@/components/admin/BlogAutomation';

export const runtime = 'edge';

const STATUS_STYLES: Record<string, string> = {
  published: 'bg-emerald-50 text-emerald-700',
  in_review: 'bg-blue-50 text-blue-700',
  scheduled: 'bg-violet-50 text-violet-700',
  draft: 'bg-slate-100 text-slate-600',
};

export default async function AdminBlogPage() {
  const { rows, live } = await loadPosts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Blog automation</h2>
          <p className="text-slate-500 text-sm mt-1">
            Keyword-driven drafting with a quality gate and human-in-the-loop publishing.
          </p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${live ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
          {live ? 'Live (D1)' : 'Demo data'}
        </span>
      </div>

      <BlogAutomation />

      <BlogStudio />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Posts</h3>
          <Link href="/blog" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View blog <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-5 py-3 font-semibold">Title</th>
              <th className="px-5 py-3 font-semibold">Keyword</th>
              <th className="px-5 py-3 font-semibold">Quality</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Published</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-900">{p.title}</td>
                <td className="px-5 py-3 text-slate-500 font-mono text-xs">{p.keyword || '—'}</td>
                <td className="px-5 py-3">{p.quality_score != null ? `${p.quality_score}/100` : '—'}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[p.status || 'draft'] || 'bg-slate-100'}`}>
                    {(p.status || 'draft').replace('_', ' ')}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-500">{p.published_at || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-sm text-amber-900">
        <p className="font-bold mb-1">On automation &amp; AI content</p>
        <p>
          This pipeline optimizes for <strong>genuine quality and originality</strong> — the only durable way to rank and to be
          cited by AI search. Posts are disclosed as AI-assisted. Auto-publishing is gated by the quality threshold you set above;
          anything below it is held in <strong>in&nbsp;review</strong>. Scheduled runs fire when an external Cloudflare Cron Trigger
          (or scheduler) POSTs <code className="font-mono bg-white/60 px-1.5 py-0.5 rounded mx-1">/api/cron/blog</code>
          (Bearer <code className="font-mono bg-white/60 px-1.5 py-0.5 rounded">CRON_SECRET</code>) — the schedule controls the timing &amp; quantity.
          Note: mass auto-publishing of AI content can trip Google&apos;s scaled-content policy; keep quantities modest.
        </p>
      </div>
    </div>
  );
}
