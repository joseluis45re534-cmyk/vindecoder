'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FileText, History, Gauge, Car, Camera, Bell } from 'lucide-react';

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
    id: 'title-history', icon: History, label: 'Title history',
    rows: [
      { k: 'Title records', v: '4 records' },
      { k: 'Last titled in', v: 'Florida' },
      { k: 'Lien records', v: 'None found', ok: true },
    ],
    note: 'Each title record with its state and date — useful for spotting a car moved across state lines.',
  },
  {
    id: 'odometer', icon: Gauge, label: 'Odometer',
    rows: [
      { k: 'Last reported', v: '60,431 mi' },
      { k: 'Reading history', v: '6 records' },
    ],
    note: 'Each reported reading with its date. A later, lower reading is a red flag to ask about.',
  },
  {
    id: 'accidents', icon: Car, label: 'Accidents',
    rows: [
      { k: 'Accidents', v: 'None reported', ok: true },
      { k: 'Damage records', v: '0' },
    ],
    note: 'Reported accident, total-loss, and auction damage records, where available.',
  },
  {
    id: 'photos', icon: Camera, label: 'Photos',
    rows: [
      { k: 'Auction photos', v: 'When on file' },
      { k: 'Damage shown', v: 'As listed' },
    ],
    note: 'Photos appear when the VIN has a salvage or insurance auction history.',
  },
  {
    id: 'recalls', icon: Bell, label: 'Recalls',
    rows: [
      { k: 'Open recalls', v: '1 open', warn: true },
      { k: 'Source', v: 'NHTSA' },
    ],
    note: 'Manufacturer safety recalls (NHTSA data). Confirm open status free at nhtsa.gov/recalls.',
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
          <p className="text-slate-500 mt-3 max-w-2xl mx-auto">Tap through a sample report to see the kinds of records a VIN check can surface.</p>
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
