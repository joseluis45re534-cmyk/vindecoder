'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  Loader2, FileText, AlertTriangle, Car, Gauge, ShieldCheck, BadgeDollarSign, Gavel, Bell, RefreshCw, CheckCircle2, Download,
} from 'lucide-react';

// ── VinCheck report shapes (see the partner example payloads) ──
type Rec = Record<string, unknown>;
interface RiskFactor { key?: string; label?: string; detail?: string; bad?: boolean }
interface RiskProfile {
  tier?: string; score?: number; headline?: string; summary?: string; recommendation?: string; factors?: RiskFactor[];
}
interface TitleSection { brands?: Rec[]; issues?: Rec[]; history?: Rec[]; nmvtis?: unknown }
interface TheftStatus { status?: string; flagged?: boolean }
interface MarketValue { average?: number | null; low?: number | null; high?: number | null; currency?: string }

interface ReportData {
  vin: string;
  specs?: Rec;
  titleHistory?: TitleSection | null;
  salvageTotalLoss?: Rec[] | null;
  accidents?: Rec[] | null;
  odometer?: Rec[] | null;
  theft?: TheftStatus | null;
  liensLoans?: Rec[] | null;
  auctionSales?: Rec[] | null;
  photos?: string[] | null;
  recalls?: Rec[] | null;
  marketValue?: MarketValue | null;
  titleBrands?: Rec[] | null;
  riskProfile?: RiskProfile | null;
  photoUrl?: string;
  brandImageUrl?: string;
  sectionCount?: number;
  dataPointCount?: number;
}

const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;
const asArr = (v: unknown): Rec[] => (Array.isArray(v) ? (v as Rec[]) : []);
const s = (v: unknown): string => (v == null ? '' : String(v));

type Tone = 'alert' | 'clear' | 'info' | 'muted';
const iconTone: Record<Tone, string> = {
  alert: 'text-rose-600 bg-rose-50',
  clear: 'text-emerald-600 bg-emerald-50',
  info: 'text-blue-600 bg-blue-50',
  muted: 'text-slate-400 bg-slate-100',
};
const pillTone: Record<Tone, string> = {
  alert: 'text-rose-700 bg-rose-50',
  clear: 'text-emerald-700 bg-emerald-50',
  info: 'text-blue-700 bg-blue-50',
  muted: 'text-slate-400 bg-slate-100',
};

// One record → its non-empty scalar key/value pairs (VinCheck records are
// heterogeneous: titleHistory {date,type,state,mileage}, junkSalvage
// {Disposition,"Date Obtained",…}, odometer {date,source,mileage}, …).
function RecordRow({ rec }: { rec: Rec }) {
  const entries = Object.entries(rec).filter(
    ([, v]) => v != null && typeof v !== 'object' && String(v).trim() !== '',
  );
  if (!entries.length) return null;
  return (
    <div className="rounded-xl bg-white border border-slate-100 px-3.5 py-2.5">
      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1.5">
        {entries.map(([k, v]) => (
          <div key={k} className="min-w-0">
            <dt className="text-[10px] text-slate-400 uppercase tracking-wide truncate">{k}</dt>
            <dd className="text-[12px] text-slate-800 font-medium">{s(v)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function SectionCard({
  icon: Icon, label, tone, status, children,
}: { icon: typeof FileText; label: string; tone: Tone; status: string; children?: ReactNode }) {
  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`inline-flex w-9 h-9 rounded-lg items-center justify-center shrink-0 ${iconTone[tone]}`}>
            <Icon className="w-4 h-4" aria-hidden="true" />
          </span>
          <p className="font-bold text-slate-900 text-sm leading-snug">{label}</p>
        </div>
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${pillTone[tone]}`}>{status}</span>
      </div>
      {children && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );
}

function RiskBanner({ rp }: { rp: RiskProfile }) {
  const tier = (rp.tier || '').toLowerCase();
  const grad =
    tier === 'high' || tier === 'severe' ? 'from-rose-500 to-rose-600'
      : tier === 'medium' || tier === 'elevated' || tier === 'moderate' ? 'from-amber-500 to-orange-600'
        : 'from-emerald-500 to-emerald-600';
  const score = typeof rp.score === 'number' ? rp.score : null;
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${grad} text-white p-5 mb-5`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wide font-semibold text-white/80">Risk assessment</p>
          <p className="font-display font-bold text-lg leading-tight mt-0.5">{rp.headline || `${rp.tier || 'Unrated'} risk`}</p>
        </div>
        {score != null && (
          <div className="text-right shrink-0">
            <div className="font-display font-bold text-3xl leading-none">
              {score}<span className="text-base text-white/70">/100</span>
            </div>
            {rp.tier && <div className="text-[11px] text-white/80 uppercase tracking-wide mt-0.5">{rp.tier} risk</div>}
          </div>
        )}
      </div>
      {rp.summary && <p className="text-[13px] text-white/90 mt-3 leading-relaxed">{rp.summary}</p>}
      {Array.isArray(rp.factors) && rp.factors.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-4">
          {rp.factors.map((f, i) => (
            <div key={i} className="flex items-start gap-2 bg-white/10 rounded-lg px-2.5 py-1.5">
              <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${f.bad ? 'bg-rose-200' : 'bg-emerald-200'}`} />
              <div className="min-w-0">
                <p className="text-[12px] font-semibold leading-tight">{f.label}</p>
                {f.detail && <p className="text-[11px] text-white/80 leading-tight mt-0.5">{f.detail}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function fmtMoney(n: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
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

  // Derived, typed views of the mapped VinCheck report for rendering.
  const title = (report?.titleHistory ?? null) as TitleSection | null;
  const brands = asArr(report?.titleBrands ?? title?.brands);
  const titleTimeline = asArr(title?.history);
  const salvage = asArr(report?.salvageTotalLoss);
  const accidents = asArr(report?.accidents);
  const odometer = asArr(report?.odometer);
  const liens = asArr(report?.liensLoans);
  const auctions = asArr(report?.auctionSales);
  const recalls = asArr(report?.recalls);
  const theft = (report?.theft ?? null) as TheftStatus | null;
  const photos = Array.isArray(report?.photos) ? (report?.photos as string[]) : [];
  const mv = (report?.marketValue ?? null) as MarketValue | null;
  const latestOdo = odometer.find((o) => /latest/i.test(s(o.date))) || odometer[0];
  const latestMileage = latestOdo ? s(latestOdo.mileage) : '';

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
      {/* Overall risk assessment (VinCheck riskProfile). */}
      {report?.riskProfile && <RiskBanner rp={report.riskProfile} />}

      {/* Additional real photos beyond the hero. */}
      {photos.length > 1 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-5">
          {photos.slice(1, 9).map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt={`Vehicle photo ${i + 2}`}
              loading="lazy"
              className="w-full aspect-[4/3] object-cover rounded-xl border border-slate-200 bg-slate-100"
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Title & brand history */}
        <SectionCard
          icon={FileText}
          label="Title & brand history"
          tone={brands.length ? 'alert' : titleTimeline.length ? 'clear' : 'muted'}
          status={brands.length ? plural(brands.length, 'brand') : titleTimeline.length ? 'Clean' : 'No records'}
        >
          {brands.map((b, i) => <RecordRow key={`b${i}`} rec={b} />)}
          {titleTimeline.length > 0 && (
            <>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide pt-1">Title timeline</p>
              {titleTimeline.map((t, i) => <RecordRow key={`t${i}`} rec={t} />)}
            </>
          )}
        </SectionCard>

        {/* Salvage / total loss */}
        <SectionCard
          icon={AlertTriangle}
          label="Salvage / total loss"
          tone={salvage.length ? 'alert' : 'clear'}
          status={salvage.length ? plural(salvage.length, 'record') : 'None reported'}
        >
          {salvage.map((rec, i) => <RecordRow key={i} rec={rec} />)}
        </SectionCard>

        {/* Accident history */}
        <SectionCard
          icon={Car}
          label="Accident history"
          tone={accidents.length ? 'alert' : 'clear'}
          status={accidents.length ? plural(accidents.length, 'record') : 'No accidents reported'}
        >
          {accidents.map((rec, i) => <RecordRow key={i} rec={rec} />)}
        </SectionCard>

        {/* Odometer readings */}
        <SectionCard
          icon={Gauge}
          label="Odometer readings"
          tone={odometer.length ? 'info' : 'muted'}
          status={latestMileage ? `${latestMileage} mi` : odometer.length ? plural(odometer.length, 'reading') : 'No readings'}
        >
          {odometer.map((rec, i) => <RecordRow key={i} rec={rec} />)}
        </SectionCard>

        {/* Theft records */}
        <SectionCard
          icon={ShieldCheck}
          label="Theft records"
          tone={theft ? (theft.flagged ? 'alert' : 'clear') : 'muted'}
          status={theft ? (theft.flagged ? 'Record found' : 'None found') : 'Not available'}
        >
          {theft?.status && <p className="text-[12px] text-slate-600">{theft.status}</p>}
        </SectionCard>

        {/* Liens & loans */}
        <SectionCard
          icon={BadgeDollarSign}
          label="Liens & loans"
          tone={liens.length ? 'alert' : 'clear'}
          status={liens.length ? plural(liens.length, 'record') : 'None found'}
        >
          {liens.map((rec, i) => <RecordRow key={i} rec={rec} />)}
        </SectionCard>

        {/* Auction & sale history */}
        <SectionCard
          icon={Gavel}
          label="Auction & sale history"
          tone={auctions.length ? 'info' : 'muted'}
          status={auctions.length ? plural(auctions.length, 'record') : 'No sales on record'}
        >
          {auctions.map((rec, i) => <RecordRow key={i} rec={rec} />)}
        </SectionCard>

        {/* Open recalls */}
        <SectionCard
          icon={Bell}
          label="Open recalls"
          tone={recalls.length ? 'alert' : 'clear'}
          status={recalls.length ? plural(recalls.length, 'open recall') : 'No open recalls'}
        >
          {recalls.map((rec, i) => <RecordRow key={i} rec={rec} />)}
        </SectionCard>

        {/* Estimated market value (when VinCheck returns valuation data) */}
        {mv && typeof mv.average === 'number' && (
          <SectionCard icon={BadgeDollarSign} label="Estimated market value" tone="info" status={fmtMoney(mv.average, mv.currency)}>
            {typeof mv.low === 'number' && typeof mv.high === 'number' && (
              <p className="text-[12px] text-slate-600">
                Range {fmtMoney(mv.low, mv.currency)} – {fmtMoney(mv.high, mv.currency)}
              </p>
            )}
          </SectionCard>
        )}
      </div>
    </div>
  );
}
