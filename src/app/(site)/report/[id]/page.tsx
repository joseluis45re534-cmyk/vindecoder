'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import {
  Loader2, Lock, ShieldAlert, ShieldCheck, AlertTriangle, Gauge, FileText,
  Camera, Gavel, BadgeDollarSign, Bell, Users, Car, CheckCircle2,
} from 'lucide-react';

interface Preview {
  make: string;
  model: string;
  year: number;
  vin: string;
  country?: string;
  engine?: string;
  bodyType?: string;
}

const PRICE = '$24.99';

// Data-point categories revealed in the full report (locked in the preview).
const CHECKS = [
  { icon: FileText, label: 'Title & brand history', hint: 'Clean, salvage, rebuilt, junk' },
  { icon: AlertTriangle, label: 'Salvage / total loss', hint: 'Insurance write-offs' },
  { icon: Car, label: 'Accident history', hint: 'Reported damage events' },
  { icon: Gauge, label: 'Odometer readings', hint: 'Rollback & tampering alerts' },
  { icon: ShieldCheck, label: 'Theft records', hint: 'NICB theft & recovery' },
  { icon: BadgeDollarSign, label: 'Liens & loans', hint: 'Open financial claims' },
  { icon: Gavel, label: 'Auction & sale history', hint: 'Past listings & sales' },
  { icon: Camera, label: 'Vehicle photos', hint: 'Historical condition photos' },
  { icon: Bell, label: 'Open recalls', hint: 'Manufacturer safety recalls' },
];

const BENEFITS = [
  'VIN search & full decode',
  'NMVTIS title-brand history',
  'Salvage / junk / rebuilt check',
  'Insurance total-loss records',
  'Odometer rollback alerts',
  'Lien & impound information',
  'Theft & recovery records',
  'Auction & sale history',
  'Real vehicle photos',
  'Open safety recalls',
  'Full specs & equipment',
  '40+ data points',
];

function ReportContent() {
  const params = useParams();
  const id = (params.id as string) || '';

  const [data, setData] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/check-vin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vin: id }),
        });
        const result = (await res.json()) as { success?: boolean; preview?: Preview; error?: string };
        if (result.success && result.preview) setData({ ...result.preview, vin: result.preview.vin || id });
        else setError(result.error || 'Failed to load report');
      } catch {
        setError('Failed to load report');
      } finally {
        setLoading(false);
      }
    };
    if (id) run();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-slate-500 text-sm font-medium">Pulling vehicle records…</p>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-500 font-medium">
        {error || 'Report not found'}
      </div>
    );
  }

  const title = `${data.year} ${data.make} ${data.model}`;

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Found banner */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm font-semibold px-4 py-1.5 rounded-full">
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> We found your vehicle
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-4 tracking-tight">
            Your {title} report is ready
          </h1>
          <p className="text-slate-500 mt-2">Unlock 40+ data points sourced from NMVTIS, NICB &amp; state DMVs.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-100 overflow-hidden">
          {/* Vehicle summary */}
          <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-[auto,1fr] gap-6 border-b border-slate-100">
            <div className="w-full sm:w-44 h-32 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative overflow-hidden">
              <Car className="w-12 h-12 text-slate-300" aria-hidden="true" />
              <span className="absolute inset-0 backdrop-blur-[2px] flex items-center justify-center">
                <Lock className="w-5 h-5 text-slate-400" aria-hidden="true" />
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">{title}</h2>
              <p className="font-mono text-sm text-slate-400 mt-0.5">VIN: {data.vin}</p>
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 mt-5 text-sm">
                <div><dt className="text-slate-400 text-xs uppercase tracking-wide">Country</dt><dd className="font-bold text-slate-900">{data.country || '—'}</dd></div>
                <div><dt className="text-slate-400 text-xs uppercase tracking-wide">Engine</dt><dd className="font-bold text-slate-900">{data.engine && data.engine !== 'N/A' ? data.engine : '—'}</dd></div>
                <div><dt className="text-slate-400 text-xs uppercase tracking-wide">Body</dt><dd className="font-bold text-slate-900">{data.bodyType && data.bodyType !== 'N/A' ? data.bodyType : '—'}</dd></div>
                <div><dt className="text-slate-400 text-xs uppercase tracking-wide">Year</dt><dd className="font-bold text-slate-900">{data.year}</dd></div>
              </dl>
            </div>
          </div>

          {/* Locked findings grid */}
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-extrabold text-slate-900">What&apos;s in your report</h3>
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-wide">Locked</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {CHECKS.map(({ icon: Icon, label, hint }) => (
                <div key={label} className="relative bg-slate-50 rounded-2xl border border-slate-100 p-5">
                  <div className="flex items-start justify-between mb-2">
                    <span className="inline-flex w-9 h-9 rounded-lg bg-white border border-slate-100 items-center justify-center text-blue-600">
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </span>
                    <Lock className="w-4 h-4 text-slate-300" aria-hidden="true" />
                  </div>
                  <p className="font-bold text-slate-900 text-sm">{label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{hint}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Unlock CTA bar */}
          <div className="bg-slate-50 border-t border-slate-100 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              Full NMVTIS vehicle history report · instant access
            </div>
            <button className="w-full sm:w-auto bg-orange-600 hover:bg-orange-500 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg shadow-orange-600/25 hover:scale-[1.02] active:scale-100 transition-all">
              Unlock Full Report — {PRICE}
            </button>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 mt-6 p-6 sm:p-8">
          <h3 className="font-extrabold text-slate-900 mb-5">Your full report includes</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-center gap-2.5 text-sm text-slate-700 py-1 border-b border-slate-50">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden="true" />
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Trust row */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400 mt-6">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Secure checkout</span>
          <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-blue-500" /> Trusted by thousands of buyers</span>
          <span className="flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> Money-back guarantee</span>
        </div>

        {/* Final CTA */}
        <div className="text-center mt-8">
          <button className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-lg px-10 py-4 rounded-full shadow-lg shadow-orange-600/25 hover:scale-[1.02] active:scale-100 transition-all">
            Get the full {data.make} {data.model} report — {PRICE}
          </button>
          <p className="text-xs text-slate-400 mt-3">One-time payment · no subscription · instant delivery</p>
        </div>
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
      <ReportContent />
    </Suspense>
  );
}
