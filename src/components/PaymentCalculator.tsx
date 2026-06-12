
'use client';

import { useMemo, useState } from 'react';
import { Calculator, BadgeDollarSign, Percent, CalendarClock } from 'lucide-react';

const usd = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
});

const usdCents = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
});

export default function PaymentCalculator() {
    const [price, setPrice] = useState(25000);
    const [down, setDown] = useState(5000);
    const [apr, setApr] = useState(7.5);
    const [months, setMonths] = useState(60);

    const downClamped = Math.min(down, price);
    const principal = Math.max(price - downClamped, 0);

    const { monthly, totalInterest, totalCost } = useMemo(() => {
        if (principal <= 0) return { monthly: 0, totalInterest: 0, totalCost: downClamped };
        const r = apr / 100 / 12;
        const m = r === 0 ? principal / months : (principal * r) / (1 - Math.pow(1 + r, -months));
        const paid = m * months;
        return {
            monthly: m,
            totalInterest: paid - principal,
            totalCost: paid + downClamped,
        };
    }, [principal, apr, months, downClamped]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-900/5 overflow-hidden">
            {/* Inputs */}
            <div className="lg:col-span-3 p-8 sm:p-10 space-y-8">
                <Slider
                    icon={<BadgeDollarSign className="w-4 h-4" aria-hidden="true" />}
                    label="Vehicle price"
                    value={price}
                    display={usd.format(price)}
                    min={1000}
                    max={100000}
                    step={500}
                    onChange={setPrice}
                />
                <Slider
                    icon={<BadgeDollarSign className="w-4 h-4" aria-hidden="true" />}
                    label="Down payment"
                    value={downClamped}
                    display={usd.format(downClamped)}
                    min={0}
                    max={price}
                    step={500}
                    onChange={setDown}
                />
                <Slider
                    icon={<Percent className="w-4 h-4" aria-hidden="true" />}
                    label="Interest rate (APR)"
                    value={apr}
                    display={`${apr.toFixed(1)}%`}
                    min={0}
                    max={20}
                    step={0.1}
                    onChange={setApr}
                />
                <Slider
                    icon={<CalendarClock className="w-4 h-4" aria-hidden="true" />}
                    label="Loan term"
                    value={months}
                    display={`${months} months`}
                    min={12}
                    max={84}
                    step={6}
                    onChange={setMonths}
                />
            </div>

            {/* Result */}
            <div className="lg:col-span-2 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white p-8 sm:p-10 flex flex-col justify-center">
                <p className="flex items-center gap-2 text-blue-200/80 text-sm font-semibold uppercase tracking-widest mb-3">
                    <Calculator className="w-4 h-4" aria-hidden="true" /> Estimated payment
                </p>
                <p className="text-5xl font-extrabold tracking-tight mb-1">
                    {usdCents.format(monthly)}
                    <span className="text-lg font-semibold text-blue-200/70">/mo</span>
                </p>
                <p className="text-blue-200/60 text-sm mb-8">
                    {usd.format(principal)} financed over {months} months at {apr.toFixed(1)}% APR
                </p>
                <dl className="space-y-3 text-sm border-t border-white/10 pt-6">
                    <div className="flex justify-between">
                        <dt className="text-blue-200/70">Total interest</dt>
                        <dd className="font-bold">{usd.format(totalInterest)}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-blue-200/70">Total cost of vehicle</dt>
                        <dd className="font-bold">{usd.format(totalCost)}</dd>
                    </div>
                </dl>
                <p className="text-blue-200/40 text-xs mt-8 leading-relaxed">
                    Estimate only — excludes tax, title, registration, and dealer fees. Actual rates depend on credit, lender, and vehicle history.
                </p>
            </div>
        </div>
    );
}

function Slider({
    icon,
    label,
    value,
    display,
    min,
    max,
    step,
    onChange,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    display: string;
    min: number;
    max: number;
    step: number;
    onChange: (v: number) => void;
}) {
    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">{icon}</span>
                    {label}
                </label>
                <span className="text-sm font-extrabold text-slate-900 bg-slate-100 px-3 py-1 rounded-full tabular-nums">
                    {display}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                aria-label={label}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-200 accent-blue-600"
            />
        </div>
    );
}
