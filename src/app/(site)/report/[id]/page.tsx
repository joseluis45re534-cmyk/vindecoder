'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import {
  Loader2, Lock, ShieldCheck, ShieldAlert, AlertTriangle, Gauge, FileText,
  Camera, Gavel, BadgeDollarSign, Bell, Users, Car, CheckCircle2, Clock, RotateCcw,
} from 'lucide-react';
import CheckoutButtons from '@/components/CheckoutButtons';

interface Preview {
  make: string;
  model: string;
  year: number;
  vin: string;
  country?: string;
  engine?: string;
  bodyType?: string;
  trim?: string;
  drivetrain?: string;
  transmission?: string;
  photoUrl?: string;
}

const PRICE = '$24.99';

// Data-point categories revealed in the full report (locked in the preview).
const CHECKS = [
  { icon: FileText, label: 'Title & brand history', hint: 'Clean · salvage · rebuilt · junk', color: 'text-blue-600 bg-blue-50' },
  { icon: AlertTriangle, label: 'Salvage / total loss', hint: 'Insurance write-offs', color: 'text-amber-600 bg-amber-50' },
  { icon: Car, label: 'Accident history', hint: 'Reported damage events', color: 'text-rose-600 bg-rose-50' },
  { icon: Gauge, label: 'Odometer readings', hint: 'Rollback & tampering alerts', color: 'text-blue-600 bg-blue-50' },
  { icon: ShieldCheck, label: 'Theft records', hint: 'NICB theft & recovery', color: 'text-emerald-600 bg-emerald-50' },
  { icon: BadgeDollarSign, label: 'Liens & loans', hint: 'Open financial claims', color: 'text-violet-600 bg-violet-50' },
  { icon: Gavel, label: 'Auction & sale history', hint: 'Past listings & sales', color: 'text-sky-600 bg-sky-50' },
  { icon: Camera, label: 'Vehicle photos', hint: 'Historical condition photos', color: 'text-fuchsia-600 bg-fuchsia-50' },
  { icon: Bell, label: 'Open recalls', hint: 'Manufacturer safety recalls', color: 'text-orange-600 bg-orange-50' },
];

const INCLUDED = [
  'NMVTIS title-brand history',
  'Salvage, junk & flood check',
  'Odometer rollback alerts',
  'Theft & recovery records',
  'Liens, loans & impound info',
  'Accident & auction history',
  'Real vehicle photos',
  'Open safety recalls',
  'Full specs & 40+ data points',
];

function ReportContent() {
  const params = useParams();
  const id = (params.id as string) || '';

  const [data, setData] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [photoFailed, setPhotoFailed] = useState(false);

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
  const cleanEngine = data.engine && data.engine !== 'N/A' && data.engine.length < 28 ? data.engine : null;
  const cleanBody = data.bodyType && data.bodyType !== 'N/A' ? data.bodyType : null;

  // Build the basic-info grid from the fields that decoded cleanly — skip blanks
  // rather than render a wall of "—".
  const specs = [
    { k: 'Year', v: String(data.year) },
    { k: 'Body', v: cleanBody },
    { k: 'Drivetrain', v: data.drivetrain },
    { k: 'Trim', v: data.trim },
    { k: 'Engine', v: cleanEngine },
    { k: 'Transmission', v: data.transmission },
    { k: 'Country', v: data.country },
  ].filter((f) => f.v) as { k: string; v: string }[];
  // Show the real dealer photo of the vehicle when auto.dev has a listing for it
  // (publicly hosted on retail.photos.vin); otherwise fall back to the stock image.
  const hasRealPhoto = Boolean(data.photoUrl) && !photoFailed;
  const heroSrc = hasRealPhoto ? (data.photoUrl as string) : '/images/report-hero.jpg';

  return (
    <div className="min-h-screen bg-slate-50 pb-28 lg:pb-12">
      {/* Header strip */}
      <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-4 sm:px-6 lg:px-8 pt-10 pb-24">
        <div className="max-w-6xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 bg-emerald-500/15 text-emerald-300 text-sm font-semibold px-4 py-1.5 rounded-full ring-1 ring-emerald-400/20">
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> We found your vehicle
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white mt-5 tracking-tight">
            Your <span className="text-blue-300">{title}</span> report is ready
          </h1>
          <p className="text-slate-300 mt-3 max-w-xl mx-auto">
            Unlock 40+ data points sourced from NMVTIS, NICB &amp; state DMVs — in seconds.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-6 items-start">
          {/* ===== LEFT: report content ===== */}
          <div className="space-y-6">
            {/* Vehicle hero */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-100 p-6 sm:p-7">
              <div className="grid grid-cols-1 sm:grid-cols-[180px,1fr] gap-6">
                {/* Vehicle photo — real auto.dev retail photo when available, else representative stock */}
                <div className="relative w-full h-36 sm:h-full min-h-[140px] rounded-2xl overflow-hidden bg-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroSrc}
                    alt={hasRealPhoto ? `${title} — vehicle photo` : `${title} — vehicle inspection`}
                    className="w-full h-full object-cover"
                    onError={() => setPhotoFailed(true)}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent px-3 pt-6 pb-2 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-white shrink-0" aria-hidden="true" />
                    <span className="text-[10px] text-white font-semibold leading-tight">
                      {hasRealPhoto ? 'More vehicle photos in full report' : 'Vehicle photos in full report'}
                    </span>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">{title}</h2>
                  <p className="font-mono text-xs text-slate-400 mt-1">VIN {data.vin}</p>
                  <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-4 mt-5">
                    {specs.map((f) => (
                      <div key={f.k}>
                        <dt className="text-[11px] text-slate-400 uppercase tracking-wide">{f.k}</dt>
                        <dd className="font-bold text-slate-900 text-sm mt-0.5 truncate">{f.v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>

            {/* Findings grid */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-7">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-extrabold text-slate-900">What&apos;s in your report</h3>
                <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-wider">9 sections locked</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {CHECKS.map(({ icon: Icon, label, hint, color }) => (
                  <div key={label} className="relative bg-slate-50 rounded-2xl border border-slate-100 p-4 hover:border-slate-200 transition-colors">
                    <div className="flex items-start justify-between mb-2.5">
                      <span className={`inline-flex w-9 h-9 rounded-lg items-center justify-center ${color}`}>
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </span>
                      <Lock className="w-3.5 h-3.5 text-slate-300" aria-hidden="true" />
                    </div>
                    <p className="font-bold text-slate-900 text-sm leading-snug">{label}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{hint}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Frosted "data behind the blur" teaser */}
            <div className="relative bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-7 overflow-hidden">
              <h3 className="font-extrabold text-slate-900 mb-4">Report preview</h3>
              <div className="space-y-3 blur-[5px] select-none pointer-events-none" aria-hidden="true">
                {[
                  ['Title brand', 'Clean — no brands recorded'],
                  ['Last reported odometer', '63,118 mi'],
                  ['Accident records', 'No accidents reported'],
                  ['Open liens', 'None found'],
                  ['Previous owners', '2 owners'],
                  ['Auction records', '1 sale record'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                    <span className="text-sm text-slate-500">{k}</span>
                    <span className="text-sm font-bold text-slate-900">{v}</span>
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[1px]">
                <span className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center mb-3 shadow-lg">
                  <Lock className="w-5 h-5 text-white" aria-hidden="true" />
                </span>
                <p className="font-bold text-slate-900">Unlock to reveal the full history</p>
                <p className="text-sm text-slate-500 mt-1">40+ verified data points</p>
              </div>
            </div>
          </div>

          {/* ===== RIGHT: sticky order card ===== */}
          <aside id="order" className="lg:sticky lg:top-20">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-900/10 border border-slate-100 overflow-hidden">
              <div className="bg-slate-900 px-6 py-5 text-white">
                <p className="text-xs uppercase tracking-widest text-blue-300 font-semibold">Full report</p>
                <p className="text-sm text-slate-300 mt-1">{title}</p>
              </div>
              <div className="p-6">
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-4xl font-extrabold text-slate-900">{PRICE}</span>
                  <span className="text-slate-400 font-medium mb-1.5">one-time</span>
                </div>
                <p className="text-xs text-emerald-600 font-semibold mb-5">No subscription · no hidden fees</p>

                <ul className="space-y-2.5 mb-6">
                  {INCLUDED.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" aria-hidden="true" />
                      {b}
                    </li>
                  ))}
                </ul>

                <CheckoutButtons planId="single" reportId={id} highlighted />

                <div className="grid grid-cols-3 gap-2 mt-5 text-center">
                  {[
                    { icon: ShieldCheck, t: 'Secure' },
                    { icon: Clock, t: 'Instant' },
                    { icon: RotateCcw, t: 'Guarantee' },
                  ].map(({ icon: Icon, t }) => (
                    <div key={t} className="flex flex-col items-center gap-1 text-[11px] text-slate-400 font-medium">
                      <Icon className="w-4 h-4 text-slate-400" aria-hidden="true" />
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-slate-400">
              <Users className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
              Trusted by thousands of U.S. car buyers
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile sticky unlock bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-between gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div>
          <p className="text-xs text-slate-400 leading-none">Full report</p>
          <p className="text-lg font-extrabold text-slate-900 leading-tight">{PRICE}</p>
        </div>
        <a
          href="#order"
          className="flex-1 max-w-[60%] bg-orange-600 hover:bg-orange-500 active:scale-[0.98] text-white font-bold text-center px-5 py-3 rounded-full shadow-md shadow-orange-600/25 transition-all"
        >
          Unlock full report
        </a>
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
