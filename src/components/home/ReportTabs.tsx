'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FileText, Users, Gauge, Car, Camera, Bell } from 'lucide-react';

type Row = { k: string; v: string; ok?: boolean; warn?: boolean };

const TABS: { id: string; icon: typeof FileText; label: string; rows: Row[]; note: string }[] = [
  {
    id: 'title', icon: FileText, label: 'Title & brands',
    rows: [
      { k: 'Title status', v: 'Clean', ok: true },
      { k: 'Salvage / junk', v: 'None found', ok: true },
      { k: 'Flood / fire', v: 'None found', ok: true },
      { k: 'States checked', v: 'All 50' },
    ],
    note: 'Catches title washing — brands hidden by moving a car across state lines.',
  },
  {
    id: 'ownership', icon: Users, label: 'Ownership',
    rows: [
      { k: 'Previous owners', v: '2 owners' },
      { k: 'Ownership length', v: '3 yrs · 4 yrs' },
      { k: 'Last titled in', v: 'Florida' },
      { k: 'Use type', v: 'Personal' },
    ],
    note: 'See how long each owner kept it — and whether it was a fleet or rental.',
  },
  {
    id: 'odometer', icon: Gauge, label: 'Odometer',
    rows: [
      { k: 'Last reported', v: '60,431 mi' },
      { k: 'Rollback alert', v: 'None', ok: true },
      { k: 'Reading history', v: '6 records' },
    ],
    note: 'Reported readings over time flag rollbacks and tampering.',
  },
  {
    id: 'accidents', icon: Car, label: 'Accidents',
    rows: [
      { k: 'Accidents', v: 'None reported', ok: true },
      { k: 'Damage records', v: '0' },
      { k: 'Airbag deployment', v: 'None', ok: true },
    ],
    note: 'Reported collision and damage events, with severity where available.',
  },
  {
    id: 'photos', icon: Camera, label: 'Photos',
    rows: [
      { k: 'Listing photos', v: 'When available' },
      { k: 'Condition images', v: 'Historical' },
    ],
    note: 'Past listing photos help you compare condition over time.',
  },
  {
    id: 'recalls', icon: Bell, label: 'Recalls',
    rows: [
      { k: 'Open recalls', v: '1 open', warn: true },
      { k: 'Safety campaigns', v: 'NHTSA' },
      { k: 'Remedy available', v: 'Yes', ok: true },
    ],
    note: 'Open manufacturer safety recalls, straight from NHTSA.',
  },
];

export default function ReportTabs() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(TABS[0].id);
  const tab = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <section id="report" className="py-16 sm:py-24 bg-white px-4 sm:px-6 lg:px-8" aria-labelledby="report-heading">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Inside your report</p>
          <h2 id="report-heading" className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Everything you need, before you buy
          </h2>
          <p className="text-slate-500 mt-3 max-w-2xl mx-auto">Tap through a sample report to see exactly what a VIN unlocks.</p>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-6 lg:gap-10 items-start">
          {/* Tabs */}
          <div role="tablist" aria-label="Report sections" className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1">
            {TABS.map(({ id, icon: Icon, label }) => {
              const on = id === active;
              return (
                <button
                  key={id}
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActive(id)}
                  className={`shrink-0 flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                    on ? 'bg-primary text-white shadow-md shadow-primary/25' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" /> {label}
                </button>
              );
            })}
          </div>

          {/* Panel */}
          <div className="relative bg-slate-50 rounded-3xl border border-slate-100 p-6 sm:p-8 min-h-[280px]">
            <span className="absolute top-5 right-5 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white px-2.5 py-1 rounded-full border border-slate-100">Sample</span>
            <AnimatePresence mode="wait">
              <motion.div
                key={tab.id}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <span className="inline-flex w-10 h-10 rounded-xl bg-primary/10 text-primary items-center justify-center">
                    <tab.icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <h3 className="font-display text-xl font-bold text-slate-900">{tab.label}</h3>
                </div>
                <dl className="space-y-2.5 mb-5">
                  {tab.rows.map((r) => (
                    <div key={r.k} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-slate-100">
                      <dt className="text-sm text-slate-500">{r.k}</dt>
                      <dd className={`text-sm font-bold ${r.warn ? 'text-amber-600' : r.ok ? 'text-emerald-600' : 'text-slate-900'}`}>{r.v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="text-sm text-slate-500 leading-relaxed">{tab.note}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
