import { useState } from 'react';
import KlookToursWidget from '@/components/widgets/KlookToursWidget';
import { KLOOK_WIDGETS } from '@/data/klookWidgets';

export default function PopularToursSection() {
  const [activeCity, setActiveCity] = useState(KLOOK_WIDGETS[0].city);
  const active = KLOOK_WIDGETS.find((w) => w.city === activeCity) ?? KLOOK_WIDGETS[0];

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
          Ce poți face acolo
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Excursii și activități reale, via Klook — prețuri actualizate chiar acum.
        </p>

        <div className="flex gap-2 mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
          {KLOOK_WIDGETS.map((w) => (
            <button
              key={w.city}
              type="button"
              onClick={() => setActiveCity(w.city)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                activeCity === w.city
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>

        {/* key forces remount when switching city, so the old script's
            content doesn't linger before the new one loads */}
        <KlookToursWidget key={active.city} src={active.src} />
      </div>
    </section>
  );
}
