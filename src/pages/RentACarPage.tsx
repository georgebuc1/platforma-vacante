import OffersPage from '@/pages/OffersPage';
import LocalrentWidget from '@/components/widgets/LocalrentWidget';

export default function RentACarPage() {
  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
            Caută mașini de închiriat, live
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Rezultate directe de la Localrent.com — disponibilitate și prețuri reale.
          </p>
          <LocalrentWidget />
        </div>
      </div>

      <OffersPage
        presetFilters={{ transport_type: 'masina' }}
        pageTitle="Rent a car"
        pageSubtitle="Închirieri auto pentru vacanța ta, la destinație."
        emptyTitle="Nu avem încă oferte listate separat aici."
        emptyMessage="Folosește căutarea de mai sus — vine cu disponibilitate live, direct de la furnizor."
      />
    </>
  );
}
