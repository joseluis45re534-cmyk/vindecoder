'use client';

import { useState } from 'react';
import { Sparkles, Loader2, CheckCircle2, AlertTriangle, Copy } from 'lucide-react';

interface GeneratedPost {
  title: string;
  slug: string;
  description: string;
  keyword: string;
  body: string;
  qualityScore: number;
  qualityNotes: string[];
}

const SUGGESTED = [
  'how to check a salvage title',
  'used car inspection checklist',
  'what is a clean title',
  'how to spot odometer fraud',
  'buying a car with a rebuilt title',
];

export default function BlogStudio() {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [post, setPost] = useState<GeneratedPost | null>(null);

  const generate = async (kw: string) => {
    setLoading(true);
    setError('');
    setPost(null);
    try {
      const res = await fetch('/api/admin/blog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: kw }),
      });
      const data = (await res.json()) as { post?: GeneratedPost; error?: string };
      if (res.ok && data.post) setPost(data.post);
      else setError(data.error || 'Generation failed');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-5 h-5 text-violet-600" aria-hidden="true" />
        <h3 className="font-bold text-slate-900">Content studio</h3>
      </div>
      <p className="text-sm text-slate-500 mb-5">
        Enter a target keyword. The pipeline drafts an original, E-E-A-T-focused article and runs a quality gate.
        Drafts are held for your review — nothing publishes automatically.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (keyword.trim()) generate(keyword.trim());
        }}
        className="flex gap-2"
      >
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="e.g. how to check a salvage title"
          className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all text-sm"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !keyword.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-5 rounded-xl flex items-center gap-2 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Draft
        </button>
      </form>

      <div className="flex flex-wrap gap-2 mt-3">
        {SUGGESTED.map((s) => (
          <button
            key={s}
            onClick={() => {
              setKeyword(s);
              generate(s);
            }}
            disabled={loading}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded-full transition-colors disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-5 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {post && (
        <div className="mt-6 border-t border-slate-100 pt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  post.qualityScore >= 80
                    ? 'bg-emerald-50 text-emerald-700'
                    : post.qualityScore >= 60
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                Quality {post.qualityScore}/100
              </span>
              <span className="text-xs text-slate-400 font-mono">/{post.slug}</span>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(post.body)}
              className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" /> Copy markdown
            </button>
          </div>

          <h4 className="text-lg font-bold text-slate-900">{post.title}</h4>
          <p className="text-sm text-slate-500 mb-3">{post.description}</p>

          {post.qualityNotes.length > 0 && (
            <ul className="mb-4 space-y-1">
              {post.qualityNotes.map((n, i) => (
                <li key={i} className="text-xs text-slate-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-300" aria-hidden="true" /> {n}
                </li>
              ))}
            </ul>
          )}

          <pre className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs text-slate-700 whitespace-pre-wrap max-h-96 overflow-y-auto font-mono leading-relaxed">
            {post.body}
          </pre>
          <p className="text-xs text-slate-400 mt-3">
            Review, edit, and publish from your CMS / D1. AI-assisted drafts are disclosed via post metadata.
          </p>
        </div>
      )}
    </div>
  );
}
