'use client';

import type { ReactNode } from 'react';

export function CalcSlider({
  icon,
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  icon: ReactNode;
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

export const usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
export const usd2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
