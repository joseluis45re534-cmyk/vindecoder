'use client';

import { useState, type FormEvent } from 'react';
import { Loader2, Send, CheckCircle2 } from 'lucide-react';

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');
    setError('');
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fd.get('name'),
          email: fd.get('email'),
          subject: fd.get('subject'),
          message: fd.get('message'),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setStatus('sent');
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
        setStatus('error');
      }
    } catch {
      setError('Network error — please try again.');
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
        <span className="inline-flex w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 items-center justify-center mb-3">
          <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
        </span>
        <h2 className="font-bold text-slate-900 text-lg">Message sent</h2>
        <p className="text-slate-500 text-sm mt-1">Thanks — we&apos;ll get back to you by email shortly.</p>
      </div>
    );
  }

  const inputCls =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary';

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-7 space-y-4">
      <h2 className="font-bold text-slate-900 text-lg">Send us a message</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Name</span>
          <input name="name" type="text" autoComplete="name" className={`mt-1 ${inputCls}`} placeholder="Your name" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email <span className="text-red-500">*</span></span>
          <input name="email" type="email" required autoComplete="email" className={`mt-1 ${inputCls}`} placeholder="you@example.com" />
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Subject</span>
        <input name="subject" type="text" className={`mt-1 ${inputCls}`} placeholder="How can we help?" />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Message <span className="text-red-500">*</span></span>
        <textarea name="message" required rows={5} className={`mt-1 ${inputCls} resize-y`} placeholder="Tell us a bit more…" />
      </label>

      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="inline-flex items-center justify-center gap-2 font-bold py-3 px-6 rounded-xl bg-primary text-white shadow-md shadow-primary/25 hover:brightness-110 transition-[filter] disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
      >
        {status === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Send className="w-4 h-4" aria-hidden="true" />}
        Send message
      </button>
    </form>
  );
}
