'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Loader2, FileText, AlertTriangle, Car, Gauge, ShieldCheck, BadgeDollarSign, Gavel, Camera, Bell, RefreshCw, CheckCircle2, Download,
} from 'lucide-react';

interface ReportData {
  vin: string;
  titleHistory?: unknown;
  salvageTotalLoss?: unknown;
  accidents?: unknown;
  odometer?: unknown;
  theft?: unknown;
  liensLoans?: unknown;
  auctionSales?: unknown;
  photos?: unknown;
  recalls?: unknown;
  marketValue?: unknown;
  photoUrl?: string;
  brandImageUrl?: string;
  sectionCount?: number;
  dataPointCount?: number;
}

const SECTIONS: { key: keyof ReportData; icon: typeof FileText; label: string }[] = [
  { key: 'titleHistory', icon: FileText, label: 'Title & brand history' },
  { key: 'salvageTotalLoss', icon: AlertTriangle, label: 'Salvage / total loss' },
  { key: 'accidents', icon: Car, label: 'Accident history' },
  { key: 'odometer', icon: Gauge, label: 'Odometer readings' },
  { key: 'theft', icon: ShieldCheck, label: 'Theft records' },
  { key: 'liensLoans', icon: BadgeDollarSign, label: 'Liens & loans' },
  { key: 'auctionSales', icon: Gavel, label: 'Auction & sale history' },
  { key: 'photos', icon: Camera, label: 'Vehicle photos' },
  { key: 'recalls', icon: Bell, label: 'Open recalls' },
];

function hasData(v: unknown): boolean {
  if (v == null) return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'object') return Object.keys(v as object).length > 0;
  return String(v).trim() !== '';
}

const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;

// Short, human summary per section. Handles both the active VinCheck provider
// (sections arrive as a `{ count: n }` summary, or a detailed array in live
// mode) and the legacy GoodCar object shape (owners / lastReportedMileage / …).
function summarize(key: string, v: unknown): string {
  // VinCheck record-count summary: `{ count: n }` (test mode / summary-only).
  if (v && typeof v === 'object' && !Array.isArray(v) && typeof (v as Record<string, unknown>).count === 'number') {
    const n = (v as { count: number }).count;
    const noun: Record<string, string> = {
      titleHistory: 'title record',
      salvageTotalLoss: 'record',
      accidents: 'record',
      odometer: 'reading',
      auctionSales: 'record',
      recalls: 'open recall',
      photos: 'photo',
    };
    return plural(n, noun[key] || 'record');
  }

  // Detailed array (VinCheck live per-record data, or a GoodCar list).
  if (Array.isArray(v)) {
    const noun: Record<string, string> = {
      titleHistory: 'record',
      accidents: 'record',
      odometer: 'reading',
      auctionSales: 'sale record',
      photos: 'photo',
      recalls: 'open recall',
    };
    return plural(v.length, noun[key] || 'record');
  }

  const o = (v && typeof v === 'object' ? (v as Record<string, unknown>) : {}) as Record<string, unknown>;
  switch (key) {
    case 'titleHistory': {
      // o.issues is GoodCar's list of title CHECKS run (mostly "clear"), not
      // confirmed brands — so summarize by owners only to avoid over-counting.
      const owners = Array.isArray(o.owners) ? o.owners.length : 0;
      return owners ? plural(owners, 'owner') : 'Title on record';
    }
    case 'salvageTotalLoss': {
      const n = (Array.isArray(o.junk) ? o.junk.length : 0) + (Array.isArray(o.totalLoss) ? o.totalLoss.length : 0);
      return n ? plural(n, 'record') : 'Records found';
    }
    case 'odometer':
      return o.lastReportedMileage ? `${o.lastReportedMileage} mi` : o.estimatedMileage ? `~${o.estimatedMileage} mi` : 'Reported';
    case 'marketValue':
      return 'Estimates available';
    default:
      return 'Records found';
  }
}

export default function UnlockedReport({ vin, sessionId }: { vin: string; sessionId?: string }) {
  const [report, setReport] = useState<ReportData | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'retry' | 'error' | 'notfound'>('loading');
  const [msg, setMsg] = useState('');
  const [photoFailed, setPhotoFailed] = useState(false);
  const [brandFailed, setBrandFailed] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [dlError, setDlError] = useState('');

  const downloadPdf = useCallback(async () => {
    setDownloading(true);
    setDlError('');
    try {
      const params = new URLSearchParams({ vin });
      if (sessionId) params.set('session_id', sessionId);
      const res = await fetch(`/api/report/pdf?${params.toString()}`);
      if (!res.ok) throw new Error('pdf');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `carvinlookup-${vin}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setDlError('Could not generate the PDF — please try again.');
    } finally {
      setDownloading(false);
    }
  }, [vin, sessionId]);

  const load = useCallback(async () => {
    setState('loading');
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vin, sessionId }),
      });
      const d = (await res.json()) as { report?: ReportData; error?: string; retryable?: boolean; notFound?: boolean };
      if (res.ok && d.report) {
        setReport(d.report);
        setState('ready');
      } else if (res.status === 404 || d.notFound) {
        setMsg(d.error || 'No records found for this VIN.');
        setState('notfound');
      } else if (d.retryable) {
        setMsg(d.error || "We're preparing your report…");
        setState('retry');
      } else {
        setMsg(d.error || 'Could not load your report.');
        setState('error');
      }
    } catch {
      setMsg('Network error.');
      setState('error');
    }
  }, [vin, sessionId]);

  useEffect(() => {
    load();
  }, [load]);

  if (state === 'loading') {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-7">
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin text-primary" /> Loading your full report…
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5">
          {SECTIONS.map((s) => (
            <div key={s.label} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (state === 'retry' || state === 'error') {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-7 text-center">
        <p className="font-bold text-slate-900">{state === 'retry' ? 'Preparing your report' : 'Something went wrong'}</p>
        <p className="text-sm text-slate-500 mt-1">{msg}</p>
        <button
          type="button"
          onClick={load}
          className="mt-4 inline-flex items-center gap-2 bg-primary text-white font-semibold text-sm px-4 py-2 rounded-xl hover:brightness-110"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  if (state === 'notfound') {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-7 text-center text-slate-500">
        {msg}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-7">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h3 className="font-display font-bold text-slate-900">Your full report</h3>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={downloadPdf}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 text-[12px] font-bold text-white bg-primary px-3 py-1.5 rounded-full hover:brightness-110 active:scale-[0.98] disabled:opacity-60 transition"
          >
            {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : <Download className="w-3.5 h-3.5" aria-hidden="true" />}
            {downloading ? 'Preparing…' : 'Download PDF'}
          </button>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> Unlocked
          </span>
        </div>
      </div>
      {dlError && <p className="text-xs text-red-600 mb-4 -mt-2" role="alert">{dlError}</p>}
      {report?.photoUrl && !photoFailed ? (
        <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={report.photoUrl}
            alt="Vehicle photo"
            className="w-full h-full object-cover"
            onError={() => setPhotoFailed(true)}
          />
        </div>
      ) : report?.brandImageUrl && !brandFailed ? (
        // GoodCar make emblem — real brand logo from the GoodCar API, shown when
        // no actual photo of this exact vehicle exists.
        <div className="w-full h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 mb-4 flex flex-col items-center justify-center gap-2 px-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={report.brandImageUrl}
            alt="Make logo"
            className="max-h-20 max-w-[60%] object-contain"
            onError={() => setBrandFailed(true)}
          />
          <span className="text-[11px] text-slate-400 font-medium">No photo on record · showing make</span>
        </div>
      ) : null}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {SECTIONS.map(({ key, icon: Icon, label }) => {
          const present = report ? hasData(report[key]) : false;
          return (
            <div key={label} className="bg-slate-50 rounded-2xl border border-slate-100 p-4">
              <div className="flex items-start justify-between mb-2.5">
                <span className={`inline-flex w-9 h-9 rounded-lg items-center justify-center ${present ? 'text-blue-600 bg-blue-50' : 'text-slate-400 bg-slate-100'}`}>
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </span>
              </div>
              <p className="font-bold text-slate-900 text-sm leading-snug">{label}</p>
              <p className={`text-[11px] mt-0.5 ${present ? 'text-slate-600' : 'text-slate-400'}`}>
                {present ? summarize(key, report?.[key]) : 'No records found'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
