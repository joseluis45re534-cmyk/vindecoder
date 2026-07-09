'use client';

import { useMemo, useState } from 'react';
import { Calculator, BadgeDollarSign, Percent, CalendarClock, TrendingDown } from 'lucide-react';
import { CalcSlider, usd0 } from './CalcSlider';

// Simple declining-balance depreciation:
//   value(y) = price * (1 - firstYearRate) * (1 - laterRate)^(y-1)
// New cars typically drop faster in year one, so year 1 uses its own rate.
export default function DepreciationCalculator() {
  const [price, setPrice] = useState(35000);
  const [firstYear, setFirstYear] = useState(20);
  const [laterRate, setLaterRate] = useState(15);
  const [years, setYears] = useState(5);

  const rows = useMemo(() => {
    const out: { year: number; value: number; lost: number }[] = [];
    let value = price;
    for (let y = 1; y <= years; y++) {
      const rate = y === 1 ? firstYear : laterRate;
      const next = value * (1 - rate / 100);
      out.push({ year: y, value: next, lost: value - next });
      value = next;
    }
    return out;
  }, [price, firstYear, laterRate, years]);

  const endValue = rows.length ? rows[rows.length - 1].value : price;
  const totalLost = price - endValue;
  const pctLost = price > 0 ? (totalLost / price) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-900/5 overflow-hidden">
      <div className="lg:col-span-3 p-8 sm:p-10 space-y-7">
        <CalcSlider icon={<BadgeDollarSign className="w-4 h-4" aria-hidden="true" />} label="Purchase price" value={price} display={usd0.format(price)} min={5000} max={120000} step={500} onChange={setPrice} />
        <CalcSlider icon={<Percent className="w-4 h-4" aria-hidden="true" />} label="First-year depreciation" value={firstYear} display={`${firstYear}%`} min={5} max={35} step={1} onChange={setFirstYear} />
        <CalcSlider icon={<Percent className="w-4 h-4" aria-hidden="true" />} label="Following-years rate" value={laterRate} display={`${laterRate}%/yr`} min={5} max={30} step={1} onChange={setLaterRate} />
        <CalcSlider icon={<CalendarClock className="w-4 h-4" aria-hidden="true" />} label="Years to project" value={years} display={`${years} years`} min={1} max={10} step={1} onChange={setYears} />

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="text-left px-4 py-2 font-semibold">Year</th>
                <th className="text-right px-4 py-2 font-semibold">Value</th>
                <th className="text-right px-4 py-2 font-semibold">Lost</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.year} className="border-t border-slate-100">
                  <td className="px-4 py-2 text-slate-700">Year {r.year}</td>
                  <td className="px-4 py-2 text-right font-semibold text-slate-900 tabular-nums">{usd0.format(r.value)}</td>
                  <td className="px-4 py-2 text-right text-slate-500 tabular-nums">-{usd0.format(r.lost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="lg:col-span-2 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white p-8 sm:p-10 flex flex-col justify-center">
        <p className="flex items-center gap-2 text-blue-200/80 text-sm font-semibold uppercase tracking-widest mb-3">
          <TrendingDown className="w-4 h-4" aria-hidden="true" /> Value after {years} years
        </p>
        <p className="text-5xl font-extrabold tracking-tight mb-1">{usd0.format(endValue)}</p>
        <p className="text-blue-200/60 text-sm mb-8">from {usd0.format(price)} today</p>
        <dl className="space-y-3 text-sm border-t border-white/10 pt-6">
          <div className="flex justify-between"><dt className="text-blue-200/70">Total value lost</dt><dd className="font-bold">{usd0.format(totalLost)}</dd></div>
          <div className="flex justify-between"><dt className="text-blue-200/70">Depreciation</dt><dd className="font-bold">{pctLost.toFixed(0)}%</dd></div>
        </dl>
        <p className="text-blue-200/40 text-xs mt-8 leading-relaxed inline-flex items-start gap-1.5">
          <Calculator className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
          Estimate only. Actual depreciation depends on the model, mileage, condition, and title history.
        </p>
      </div>
    </div>
  );
}
