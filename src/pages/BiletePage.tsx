import KiwiFlightWidget from '@/components/widgets/KiwiFlightWidget';

export default function BiletePage() {
  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
            Caută zboruri live
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Compară ofertele Kiwi și continuă rezervarea pe pagina partenerului.
          </p>
          <KiwiFlightWidget />
        </div>
      </div>
    </>
  );
}
