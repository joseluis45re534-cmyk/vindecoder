import Link from 'next/link';
import { FileWarning, Droplets, Gauge, AlertTriangle, ArrowRight } from 'lucide-react';
import { TRIAL_PLAN, formatPrice } from '@/lib/pricing';

const FEE = formatPrice(TRIAL_PLAN.trialFeeCents ?? 100);

const RISKS = [
  { icon: FileWarning, c: 'text-rose-600 bg-rose-50', label: 'Salvage / rebuilt title', d: 'Totaled, then patched back together' },
  { icon: Droplets, c: 'text-sky-600 bg-sky-50', label: 'Flood damage', d: 'Hidden corrosion & electrical faults' },
  { icon: Gauge, c: 'text-amber-600 bg-amber-50', label: 'Odometer rollback', d: 'Inflated value, masked wear' },
  { icon: AlertTriangle, c: 'text-orange-600 bg-orange-50', label: 'Open safety recalls', d: 'Unfixed manufacturer defects' },
];

export default function ProblemBlock() {
  return (
    <section className="py-16 sm:py-24 bg-slate-50 px-4 sm:px-6 lg:px-8" aria-labelledby="problem-heading">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <div className="scroll-reveal">
          <p className="text-sm font-semibold text-accent uppercase tracking-widest mb-3">Skip the headache</p>
          <h2 id="problem-heading" className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight leading-tight">
            A clean-looking car can hide an expensive past
          </h2>
          <p className="text-slate-500 mb-7 leading-relaxed">
            Salvage titles, flood damage, and rolled-back odometers don&apos;t show up on a test drive. A {FEE} history
            check is a lot cheaper than a $20,000 mistake.
          </p>
          <Link
            href="#vin-search"
            className="inline-flex items-center gap-2 bg-accent text-white font-bold px-6 py-3.5 rounded-full shadow-md shadow-accent/25 hover:brightness-110 active:scale-[0.98] transition-all"
          >
            Check a VIN now <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 gap-3.5">
          {RISKS.map(({ icon: Icon, c, label, d }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5 card-lift">
              <span className={`inline-flex w-10 h-10 rounded-xl items-center justify-center mb-3 ${c}`}>
                <Icon className="w-5 h-5" aria-hidden="true" />
              </span>
              <p className="font-bold text-slate-900 text-sm">{label}</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
