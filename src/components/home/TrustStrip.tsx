import { Database, MapPin, Clock, ShieldCheck } from 'lucide-react';
import { TRIAL_PLAN, formatPrice } from '@/lib/pricing';

// Record types the report provider actually supplies (see /data-sources) — no
// press logos, record counts, or "official" claims we can't substantiate.
// NMVTIS title data comes through an approved NMVTIS data provider.
const SOURCES = ['NMVTIS', 'State title records', 'Insurers & salvage yards', 'NHTSA recalls'];

// Product facts only — every figure here is verifiable on the site itself.
// Don't add record counts or speed claims without a citable source.
const METRICS = [
  { icon: ShieldCheck, value: 'Free', label: 'Vehicle preview first' },
  { icon: MapPin, value: '50', label: 'States covered' },
  { icon: Database, value: formatPrice(TRIAL_PLAN.trialFeeCents ?? 100), label: 'Full-access trial' },
  { icon: Clock, value: '24/7', label: 'Online, no app needed' },
];

export default function TrustStrip() {
  return (
    <section aria-label="Trusted data sources and key statistics" className="relative -mt-12 px-4 sm:px-6 lg:px-8 z-10">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-100 overflow-hidden">
        {/* Record sources */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Records from</span>
          {SOURCES.map((s) => (
            <span key={s} className="font-display text-sm font-bold text-slate-700">{s}</span>
          ))}
        </div>
        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100">
          {METRICS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="p-5 sm:p-6 text-center">
              <Icon className="w-5 h-5 text-primary mx-auto mb-2" aria-hidden="true" />
              <p className="font-display text-2xl sm:text-3xl font-bold text-slate-900">{value}</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
