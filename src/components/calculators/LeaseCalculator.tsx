'use client';

import { useMemo, useState } from 'react';
import { Calculator, BadgeDollarSign, Percent, CalendarClock, Gauge } from 'lucide-react';
import { CalcSlider, usd0, usd2 } from './CalcSlider';

// Standard lease math:
//   residual        = MSRP * residualPct
//   capCost         = negotiatedPrice - downPayment
//   depreciationFee = (capCost - residual) / termMonths
//   rentFee         = (capCost + residual) * moneyFactor
//   monthly         = (depreciationFee + rentFee) * (1 + taxPct)
export default function LeaseCalculator() {
  const [msrp, setMsrp] = useState(35000);
  const [price, setPrice] = useState(33000);
  const [down, setDown] = useState(2000);
  const [residualPct, setResidualPct] = useState(57);
  const [moneyFactor, setMoneyFactor] = useState(0.0015);
  const [term, setTerm] = useState(36);
  const [taxPct, setTaxPct] = useState(7);

  const { monthly, residual, base, tax, totalCost } = useMemo(() => {
    const residualVal = msrp * (residualPct / 100);
    const capCost = Math.max(price - down, 0);
    const depFee = Math.max((capCost - residualVal) / term, 0);
    const rentFee = (capCost + residualVal) * moneyFactor;
    const baseMonthly = depFee + rentFee;
    const taxMonthly = baseMonthly * (taxPct / 100);
    const m = baseMonthly + taxMonthly;
    return { monthly: m, residual: residualVal, base: baseMonthly, tax: taxMonthly, totalCost: m * term + down };
  }, [msrp, price, down, residualPct, moneyFactor, term, taxPct]);

  const apprMF = (moneyFactor * 2400).toFixed(1); // money factor → approx APR

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-900/5 overflow-hidden">
      <div className="lg:col-span-3 p-8 sm:p-10 space-y-7">
        <CalcSlider icon={<BadgeDollarSign className="w-4 h-4" aria-hidden="true" />} label="MSRP (sticker price)" value={msrp} display={usd0.format(msrp)} min={10000} max={120000} step={500} onChange={setMsrp} />
        <CalcSlider icon={<BadgeDollarSign className="w-4 h-4" aria-hidden="true" />} label="Negotiated price" value={price} display={usd0.format(price)} min={8000} max={msrp} step={250} onChange={setPrice} />
        <CalcSlider icon={<BadgeDollarSign className="w-4 h-4" aria-hidden="true" />} label="Down payment" value={down} display={usd0.format(down)} min={0} max={price} step={250} onChange={setDown} />
        <CalcSlider icon={<Gauge className="w-4 h-4" aria-hidden="true" />} label="Residual value" value={residualPct} display={`${residualPct}% of MSRP`} min={30} max={75} step={1} onChange={setResidualPct} />
        <CalcSlider icon={<Percent className="w-4 h-4" aria-hidden="true" />} label={`Money factor (~${apprMF}% APR)`} value={moneyFactor} display={moneyFactor.toFixed(4)} min={0} max={0.005} step={0.0001} onChange={setMoneyFactor} />
        <CalcSlider icon={<CalendarClock className="w-4 h-4" aria-hidden="true" />} label="Lease term" value={term} display={`${term} months`} min={24} max={48} step={12} onChange={setTerm} />
        <CalcSlider icon={<Percent className="w-4 h-4" aria-hidden="true" />} label="Sales tax" value={taxPct} display={`${taxPct}%`} min={0} max={12} step={0.5} onChange={setTaxPct} />
      </div>

      <div className="lg:col-span-2 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white p-8 sm:p-10 flex flex-col justify-center">
        <p className="flex items-center gap-2 text-blue-200/80 text-sm font-semibold uppercase tracking-widest mb-3">
          <Calculator className="w-4 h-4" aria-hidden="true" /> Estimated lease
        </p>
        <p className="text-5xl font-extrabold tracking-tight mb-1">
          {usd2.format(monthly)}
          <span className="text-lg font-semibold text-blue-200/70">/mo</span>
        </p>
        <p className="text-blue-200/60 text-sm mb-8">{term}-month lease · {residualPct}% residual</p>
        <dl className="space-y-3 text-sm border-t border-white/10 pt-6">
          <div className="flex justify-between"><dt className="text-blue-200/70">Base (before tax)</dt><dd className="font-bold">{usd2.format(base)}</dd></div>
          <div className="flex justify-between"><dt className="text-blue-200/70">Monthly tax</dt><dd className="font-bold">{usd2.format(tax)}</dd></div>
          <div className="flex justify-between"><dt className="text-blue-200/70">Residual value</dt><dd className="font-bold">{usd0.format(residual)}</dd></div>
          <div className="flex justify-between"><dt className="text-blue-200/70">Total lease cost</dt><dd className="font-bold">{usd0.format(totalCost)}</dd></div>
        </dl>
        <p className="text-blue-200/40 text-xs mt-8 leading-relaxed">
          Estimate only — excludes acquisition, disposition, and dealer fees. Money factor × 2400 approximates APR.
        </p>
      </div>
    </div>
  );
}
