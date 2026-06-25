'use client';

import { MessageCircle, Zap, Clock, Headset } from 'lucide-react';

const STATS = [
  { icon: Zap, t: 'Instant', d: 'AI answers' },
  { icon: Clock, t: '24/7', d: 'Always on' },
  { icon: Headset, t: 'Human', d: 'On handoff' },
];

export default function SupportBand() {
  const openChat = () => window.dispatchEvent(new CustomEvent('cvl:open-chat'));
  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8" aria-labelledby="support-heading">
      <div className="max-w-5xl mx-auto bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl px-6 sm:px-10 py-9 sm:py-10 text-white shadow-xl shadow-blue-900/20">
        <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <h2 id="support-heading" className="font-display text-2xl sm:text-3xl font-bold">Real help, whenever you need it</h2>
            <p className="text-blue-100 mt-2 max-w-lg">Stuck on a VIN, a charge, or your report? Our assistant answers instantly — and hands you to a real person when you need one.</p>
            <div className="grid grid-cols-3 gap-3 mt-6 max-w-sm">
              {STATS.map(({ icon: Icon, t, d }) => (
                <div key={t} className="bg-white/10 rounded-xl px-3 py-3 text-center">
                  <Icon className="w-5 h-5 mx-auto mb-1.5 text-blue-200" aria-hidden="true" />
                  <p className="font-display font-bold leading-none">{t}</p>
                  <p className="text-[11px] text-blue-200 mt-1">{d}</p>
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={openChat}
            className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-bold px-6 py-3.5 rounded-full shadow-lg hover:scale-[1.03] active:scale-100 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-700"
          >
            <MessageCircle className="w-5 h-5" aria-hidden="true" /> Chat with us
          </button>
        </div>
      </div>
    </section>
  );
}
