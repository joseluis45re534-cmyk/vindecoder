'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
import SearchForm from '@/components/SearchForm';
import { TRIAL_PLAN, formatPrice } from '@/lib/pricing';

const FEE = formatPrice(TRIAL_PLAN.trialFeeCents ?? 100);
const MONTHLY = formatPrice(TRIAL_PLAN.recurringCents ?? 2900);
const EASE = [0.22, 1, 0.36, 1] as const;

const MOCK_SPECS = ['2021', 'Sedan', '2.5L I4', '60,431 mi'];
const MOCK_ROWS: [string, string][] = [
  ['Title brand', 'Clean'],
  ['Accidents', 'None reported'],
  ['Previous owners', '2 owners'],
  ['Open liens', 'None found'],
  ['Odometer', 'Verified'],
];

export default function Hero() {
  const reduce = useReducedMotion();
  const enter = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, ease: EASE, delay } };

  return (
    <section
      id="vin-search"
      className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 pt-14 sm:pt-20 pb-24 sm:pb-28 px-4 sm:px-6 lg:px-8"
    >
      <div aria-hidden="true" className="animate-float pointer-events-none absolute -top-40 left-1/4 w-[600px] sm:w-[800px] h-[400px] sm:h-[520px] rounded-full bg-blue-600/20 blur-3xl" />

      <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
        {/* ---- Left: headline + search ---- */}
        <div className="text-center lg:text-left">
          <motion.p {...enter(0)} className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-blue-100 text-xs sm:text-sm font-medium px-4 py-1.5 rounded-full mb-6 backdrop-blur">
            <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            Official NMVTIS, NICB &amp; DMV data · All 50 states
          </motion.p>

          <motion.h1 {...enter(0.05)} className="font-display text-4xl sm:text-5xl xl:text-6xl font-bold tracking-tight text-white mb-5 leading-[1.07]">
            A VIN check that can
            <span className="block bg-gradient-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent mt-1">save you thousands</span>
          </motion.h1>

          <motion.p {...enter(0.1)} className="max-w-xl mx-auto lg:mx-0 text-base sm:text-lg text-slate-300 mb-8">
            Run any VIN or U.S. license plate for an instant vehicle history report — title brands, salvage &amp; flood damage, theft records, open liens, and odometer rollback.
          </motion.p>

          <motion.div {...enter(0.15)} className="lg:[&_form]:mx-0 lg:[&>div]:mx-0">
            <SearchForm />
          </motion.div>

          <motion.div {...enter(0.2)} className="mt-6 flex flex-wrap justify-center lg:justify-start items-center gap-x-5 gap-y-2 text-sm text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Lock className="w-4 h-4 text-emerald-400" aria-hidden="true" /> {FEE} to start · then {MONTHLY}/mo · cancel anytime
            </span>
          </motion.div>
          <motion.ul {...enter(0.25)} className="mt-3 flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-2 text-sm text-slate-400">
            {['Free vehicle preview', 'Instant delivery', 'Secure checkout'].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" aria-hidden="true" /> {t}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* ---- Right: floating report-preview mockup ---- */}
        <motion.div
          {...(reduce ? {} : { initial: { opacity: 0, y: 30, rotate: -1 }, animate: { opacity: 1, y: 0, rotate: 0 }, transition: { duration: 0.5, ease: EASE, delay: 0.15 } })}
          className="relative hidden lg:block"
          aria-hidden="true"
        >
          <div className="relative bg-white rounded-3xl shadow-2xl shadow-black/40 border border-white/10 p-5 max-w-md ml-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Sample report
              </span>
              <span className="text-[11px] text-slate-400 font-mono">1HG…CM82</span>
            </div>
            <div className="relative rounded-2xl h-36 bg-gradient-to-br from-sky-50 to-slate-200 mb-4 overflow-hidden">
              <svg viewBox="0 0 280 130" className="w-full h-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Sample sedan illustration">
                {/* ground shadow */}
                <ellipse cx="140" cy="117" rx="112" ry="8" fill="#0f172a" opacity="0.07" />
                {/* body */}
                <path d="M32 90 L32 78 Q32 68 44 66 L92 60 Q99 43 122 41 L150 39 Q176 39 196 58 L240 64 Q252 66 252 80 L252 90 L230 90 Q208 50 186 90 L106 90 Q84 50 62 90 Z" fill="#2563EB" />
                {/* lower-body shade */}
                <path d="M32 90 L252 90 L230 90 Q208 50 186 90 L106 90 Q84 50 62 90 Z" fill="#1e40af" opacity="0.18" />
                {/* belt-line highlight */}
                <path d="M44 66 L92 60 Q99 43 122 41 L150 39 Q176 39 196 58 L240 64" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
                {/* glass */}
                <path d="M99 58 Q104 47 122 46 L149 44 Q166 44 179 57 Z" fill="#dbeafe" />
                <path d="M138 45 L138 58" stroke="#2563EB" strokeWidth="3" />
                {/* lights */}
                <path d="M34 70 Q40 69 44 71 L44 76 Q39 77 35 76 Z" fill="#e0f2fe" />
                <rect x="244" y="70" width="7" height="7" rx="2" fill="#f87171" />
                {/* door + handle */}
                <path d="M150 60 L150 86" stroke="#1e40af" strokeWidth="1.5" opacity="0.35" />
                <rect x="156" y="64" width="10" height="3" rx="1.5" fill="#1e40af" opacity="0.4" />
                {/* wheels */}
                <g>
                  <circle cx="84" cy="94" r="20" fill="#1e293b" />
                  <circle cx="84" cy="94" r="10.5" fill="#cbd5e1" />
                  <circle cx="84" cy="94" r="3.5" fill="#64748b" />
                </g>
                <g>
                  <circle cx="208" cy="94" r="20" fill="#1e293b" />
                  <circle cx="208" cy="94" r="10.5" fill="#cbd5e1" />
                  <circle cx="208" cy="94" r="3.5" fill="#64748b" />
                </g>
              </svg>
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900">2021 Toyota Camry SE</h3>
            <div className="flex flex-wrap gap-1.5 mt-2 mb-4">
              {MOCK_SPECS.map((s) => (
                <span key={s} className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">{s}</span>
              ))}
            </div>
            <div className="space-y-1.5">
              {MOCK_ROWS.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{k}</span>
                  <span className="flex items-center gap-1 font-bold text-emerald-600"><CheckCircle2 className="w-3.5 h-3.5" /> {v}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100 text-center">40+ verified data points · NMVTIS · NICB · DMV</p>
          </div>
          {/* floating accent chip */}
          <motion.div
            {...(reduce ? {} : { animate: { y: [0, -10, 0] }, transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } })}
            className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-2.5"
          >
            <p className="text-[10px] text-slate-400 leading-none">Verdict</p>
            <p className="text-sm font-extrabold text-emerald-600 leading-tight">Clean history ✓</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
