'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Loader2, FileText, AlertTriangle, Car, Gauge, ShieldCheck, BadgeDollarSign, Gavel, Camera, Bell, RefreshCw, CheckCircle2,
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

// Short, human summary per section from the mapped GoodCar data.
function summarize(key: string, v: unknown): string {
  const o = (v && typeof v === 'object' ? (v as Record<string, unknown>) : {}) as Record<string, unknown>;
  switch (key) {
    case 'titleHistory': {
      const owners = Array.isArray(o.owners) ? o.owners.length : 0;
      const issues = Array.isArray(o.issues) ? o.issues.length : 0;
      return `${plural(owners, 'owner')}${issues ? ` · ${plural(issues, 'brand')}` : ''}`;
    }
    case 'salvageTotalLoss': {
      const n = (Array.isArray(o.junk) ? o.junk.length : 0) + (Array.isArray(o.totalLoss) ? o.totalLoss.length : 0);
      return plural(n, 'record');
    }
    case 'odometer':
      return o.lastReportedMileage ? `${o.lastReportedMileage} mi` : o.estimatedMileage ? `~${o.estimatedMileage} mi` : 'Reported';
    case 'auctionSales':
      return plural(Array.isArray(v) ? v.length : 0, 'sale record');
    case 'photos':
      return plural(Array.isArray(v) ? v.length : 0, 'photo');
    case 'recalls':
      return plural(Array.isArray(v) ? v.length : 0, 'open recall');
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
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-bold text-slate-900">Your full report</h3>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> Unlocked
        </span>
      </div>
      {report?.photoUrl && (
        <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={report.photoUrl} alt="Vehicle photo" className="w-full h-full object-cover" />
        </div>
      )}
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
