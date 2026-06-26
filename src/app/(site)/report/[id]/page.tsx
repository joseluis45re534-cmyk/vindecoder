'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  Loader2, Lock, ShieldCheck, AlertTriangle, Gauge, FileText,
  Camera, Gavel, BadgeDollarSign, Bell, Users, Car, CheckCircle2, Clock, RotateCcw, Mail,
} from 'lucide-react';
import { TRIAL_PLAN, formatPrice } from '@/lib/pricing';
import PriceCountUp from '@/components/checkout/PriceCountUp';
import TrialCheckout from '@/components/checkout/TrialCheckout';
import SuccessCheck from '@/components/checkout/SuccessCheck';
import ManageSubscriptionButton from '@/components/checkout/ManageSubscriptionButton';
import UnlockedReport from '@/components/report/UnlockedReport';

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
  brandImageUrl?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;
const TRIAL_FEE = TRIAL_PLAN.trialFeeCents ?? 100;
const TRIAL_MONTHLY = TRIAL_PLAN.recurringCents ?? 2900;
const TRIAL_DAYS = TRIAL_PLAN.trialDays ?? 3;

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

function ReportContent() {
  const params = useParams();
  const search = useSearchParams();
  const id = (params.id as string) || '';
  const paid = search.get('paid') === '1';
  const sessionId = search.get('session_id') || undefined;

  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const photoY = useTransform(scrollY, [0, 500], [0, -28]);

  const [data, setData] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [photoFailed, setPhotoFailed] = useState(false);
  const [brandFailed, setBrandFailed] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        // Free, pre-payment preview — GoodCar VIN Decoder via /api/preview.
        const res = await fetch('/api/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vin: id }),
        });
        const result = (await res.json()) as {
          success?: boolean;
          specs?: {
            vin?: string; year?: string; make?: string; model?: string; trim?: string;
            bodyStyle?: string; drivetrain?: string; engine?: string; transmission?: string; country?: string;
            photoUrl?: string; brandImageUrl?: string;
          };
          error?: string;
          notFound?: boolean;
        };
        if (result.success && result.specs) {
          const s = result.specs;
          setData({
            make: s.make || '',
            model: s.model || '',
            year: Number(s.year) || 0,
            vin: s.vin || id,
            country: s.country,
            engine: s.engine,
            bodyType: s.bodyStyle,
            trim: s.trim,
            drivetrain: s.drivetrain,
            transmission: s.transmission,
            // Verified exact-VIN photo from the key-free retail CDN when one exists,
            // else undefined → GoodCar make emblem → neutral placeholder.
            photoUrl: s.photoUrl,
            brandImageUrl: s.brandImageUrl,
          });
        } else {
          // notFound → block checkout (the error branch renders and no report/CTA shows).
          setError(result.error || 'Failed to load report');
        }
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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
  // Only ever show this exact vehicle's real dealer photo. When none exists, fall
  // back to GoodCar's make emblem (a brand logo, clearly labeled) — never a
  // same-model stand-in or lifestyle stock — then a neutral placeholder.
  const hasRealPhoto = Boolean(data.photoUrl) && !photoFailed;
  const showBrand = !hasRealPhoto && Boolean(data.brandImageUrl) && !brandFailed;

  // Section entrance: fade + slide as each card scrolls into view (no-op under
  // prefers-reduced-motion).
  const fadeUp = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.15 },
        transition: { duration: 0.3, ease: EASE },
      };
  const gridParent = reduce
    ? {}
    : {
        initial: 'hidden' as const,
        whileInView: 'show' as const,
        viewport: { once: true, amount: 0.2 },
        variants: { hidden: {}, show: { transition: { staggerChildren: 0.05 } } },
      };
  const gridChild = reduce
    ? {}
    : {
        variants: {
          hidden: { opacity: 0, y: 14 },
          show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: EASE } },
        },
      };
  const panelIn = reduce
    ? {}
    : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35, ease: EASE, delay: 0.08 } };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 lg:pb-12">
      {/* Header strip */}
      <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-4 sm:px-6 lg:px-8 pt-10 pb-24">
        <motion.div
          className="max-w-6xl mx-auto text-center"
          {...(reduce ? {} : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, ease: EASE } })}
        >
          <span className="inline-flex items-center gap-2 bg-emerald-500/15 text-emerald-300 text-sm font-semibold px-4 py-1.5 rounded-full ring-1 ring-emerald-400/20">
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> We found your vehicle
          </span>
          <h1 className="font-display text-2xl sm:text-4xl font-bold text-white mt-5 tracking-tight">
            Your <span className="text-blue-300">{title}</span> report is ready
          </h1>
          <p className="text-slate-300 mt-3 max-w-xl mx-auto">
            Unlock 40+ data points sourced from NMVTIS, NICB &amp; state DMVs — in seconds.
          </p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          {/* ===== LEFT: report content ===== */}
          <div className="space-y-6">
            {/* Vehicle hero */}
            <motion.div className="bg-white rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-100 p-6 sm:p-7" {...fadeUp}>
              <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-6">
                {/* Vehicle photo — real auto.dev retail photo when available, else neutral placeholder */}
                <div className="relative w-full h-36 sm:h-full min-h-[140px] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  {hasRealPhoto ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <motion.img
                        src={data.photoUrl as string}
                        alt={`${title} — vehicle photo`}
                        className="w-full h-full object-cover scale-105"
                        style={{ y: reduce ? 0 : photoY }}
                        onError={() => setPhotoFailed(true)}
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent px-3 pt-6 pb-2 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-white shrink-0" aria-hidden="true" />
                        <span className="text-[10px] text-white font-semibold leading-tight">Photo of this vehicle</span>
                      </div>
                    </>
                  ) : showBrand ? (
                    // GoodCar make emblem — a real brand logo from the GoodCar API,
                    // shown when no actual photo of this exact vehicle exists.
                    <div className="w-full h-full flex flex-col items-center justify-center text-center px-4 gap-2 bg-gradient-to-br from-slate-50 to-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={data.brandImageUrl as string}
                        alt={`${data.make} logo`}
                        className="max-h-16 max-w-[70%] object-contain"
                        onError={() => setBrandFailed(true)}
                      />
                      <span className="text-[10px] text-slate-400 font-medium leading-tight">No photo on record · showing make</span>
                    </div>
                  ) : (
                    // Neutral placeholder — no real photo of this exact VIN exists.
                    <div className="w-full h-full flex flex-col items-center justify-center text-center px-3 gap-2 bg-gradient-to-br from-slate-50 to-slate-100">
                      <Car className="w-8 h-8 text-slate-300" aria-hidden="true" />
                      <span className="text-[11px] text-slate-400 font-medium leading-tight">No photo on record for this VIN</span>
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-slate-900 leading-tight">{title}</h2>
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
            </motion.div>

            {/* Once paid, the real GoodCar report replaces the locked teasers. */}
            {paid && <UnlockedReport vin={id} sessionId={sessionId} />}

            {!paid && (
              <>
            {/* Findings grid */}
            <motion.div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-7" {...fadeUp}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-slate-900">What&apos;s in your report</h3>
                <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-wider">9 sections locked</span>
              </div>
              <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5" {...gridParent}>
                {CHECKS.map(({ icon: Icon, label, hint, color }) => (
                  <motion.div key={label} className="relative bg-slate-50 rounded-2xl border border-slate-100 p-4 hover:border-slate-200 transition-colors" {...gridChild}>
                    <div className="flex items-start justify-between mb-2.5">
                      <span className={`inline-flex w-9 h-9 rounded-lg items-center justify-center ${color}`}>
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </span>
                      <Lock className="w-3.5 h-3.5 text-slate-300" aria-hidden="true" />
                    </div>
                    <p className="font-bold text-slate-900 text-sm leading-snug">{label}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{hint}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Frosted "data behind the blur" teaser */}
            <motion.div className="relative bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-7 overflow-hidden" {...fadeUp}>
              <h3 className="font-display font-bold text-slate-900 mb-4">Report preview</h3>
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
            </motion.div>
              </>
            )}
          </div>

          {/* ===== RIGHT: sticky checkout / success card ===== */}
          <motion.aside id="order" className="lg:sticky lg:top-20" {...panelIn}>
            {paid ? (
              /* ---- Post-payment success ---- */
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-900/10 border border-slate-100 overflow-hidden">
                <div className="p-7 flex flex-col items-center text-center">
                  <SuccessCheck />
                  <h2 className="font-display text-xl font-bold text-slate-900 mt-4">Payment successful</h2>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    Your <strong className="text-slate-700">{formatPrice(TRIAL_FEE)}</strong> trial has started. We&apos;re preparing your full report
                    for <span className="font-semibold text-slate-700">{title}</span>.
                  </p>
                  <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-3">
                    <Mail className="w-3.5 h-3.5 text-primary" aria-hidden="true" /> A receipt is on its way to your inbox.
                  </p>
                  <div className="w-full border-t border-slate-100 my-5" />
                  <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                    After {TRIAL_DAYS} days you&apos;ll be charged {formatPrice(TRIAL_MONTHLY)}/month unless you cancel.
                  </p>
                  <ManageSubscriptionButton sessionId={sessionId} reportId={id} />
                </div>
              </div>
            ) : (
              /* ---- Checkout panel ---- */
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-900/10 border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 px-6 py-5 text-white">
                  <p className="text-xs uppercase tracking-widest text-blue-300 font-semibold">Full report access</p>
                  <p className="text-sm text-slate-300 mt-1">{title}</p>
                </div>
                <div className="p-6">
                  <div className="flex items-end gap-2 mb-1">
                    <PriceCountUp cents={TRIAL_FEE} className="font-display text-5xl font-bold text-slate-900" />
                    <span className="text-slate-400 font-medium mb-1.5">today</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mb-5">
                    then <span className="font-bold text-slate-700">{formatPrice(TRIAL_MONTHLY)}/mo</span> after your {TRIAL_DAYS}-day trial
                  </p>

                  <ul className="space-y-2.5 mb-6">
                    {TRIAL_PLAN.features.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-security mt-0.5 shrink-0" aria-hidden="true" />
                        {b}
                      </li>
                    ))}
                  </ul>

                  <TrialCheckout reportId={id} />

                  <div className="grid grid-cols-3 gap-2 mt-5 text-center">
                    {[
                      { icon: ShieldCheck, t: 'Secure' },
                      { icon: Clock, t: 'Instant' },
                      { icon: RotateCcw, t: 'Cancel anytime' },
                    ].map(({ icon: Icon, t }) => (
                      <div key={t} className="flex flex-col items-center gap-1 text-[11px] text-slate-400 font-medium">
                        <Icon className="w-4 h-4 text-slate-400" aria-hidden="true" />
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-slate-400">
              <Users className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
              Trusted by thousands of U.S. car buyers
            </div>
          </motion.aside>
        </div>
      </div>

      {/* Mobile sticky unlock bar (hidden once paid) */}
      {!paid && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-between gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div>
            <p className="text-xs text-slate-400 leading-none">Start today for</p>
            <p className="text-lg font-extrabold text-slate-900 leading-tight">{formatPrice(TRIAL_FEE)}</p>
          </div>
          <a
            href="#order"
            className="flex-1 max-w-[60%] bg-accent hover:brightness-110 active:scale-[0.98] text-white font-bold text-center px-5 py-3 rounded-full shadow-md shadow-accent/25 transition-all"
          >
            Unlock full report
          </a>
        </div>
      )}
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <ReportContent />
    </Suspense>
  );
}
