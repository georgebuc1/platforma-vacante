import OffersPage from '@/pages/OffersPage';
import KiwiFlightWidget from '@/components/widgets/KiwiFlightWidget';

export default function BiletePage() {
  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
            Caută zboruri live, în timp real
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Rezultate directe de la Kiwi.com — prețuri actualizate chiar acum.
          </p>
          <KiwiFlightWidget />
        </div>
      </div>

      <OffersPage
        presetFilters={{ transport_type: 'avion' }}
        pageTitle="Bilete de avion"
        pageSubtitle="Zboruri ieftine către destinațiile tale preferate, actualizate automat."
        emptyTitle="Nu am găsit bilete pentru aceste criterii."
        emptyMessage="Încearcă altă destinație sau lărgește perioada de căutare."
      />
    </>
  );
}
