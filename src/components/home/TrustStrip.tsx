import { Database, MapPin, Clock, ShieldCheck } from 'lucide-react';

// Honest, official data sources the report actually draws from — no press logos
// or "as seen in" claims we can't substantiate.
const SOURCES = ['NMVTIS', 'NICB', 'NHTSA', 'State DMVs'];

// NOTE: figures below are flagged for the owner to confirm before launch.
const METRICS = [
  { icon: Database, value: '268M+', label: 'Vehicle records' },
  { icon: MapPin, value: '50', label: 'States covered' },
  { icon: ShieldCheck, value: '40+', label: 'Data points / report' },
  { icon: Clock, value: '< 60s', label: 'Average report time' },
];

export default function TrustStrip() {
  return (
    <section aria-label="Trusted data sources and key statistics" className="relative -mt-12 px-4 sm:px-6 lg:px-8 z-10">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-100 overflow-hidden">
        {/* Official sources */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Official data from</span>
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
