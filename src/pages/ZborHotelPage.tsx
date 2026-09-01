import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import TravelpayoutsWidget from '@/components/TravelpayoutsWidget';

export default function ZborHotelPage() {
  useDocumentMeta(
    'Zbor + Hotel',
    'Caută pachete de zbor și cazare pentru vacanța ta.'
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
        Zbor + Hotel
      </h1>
      <p className="mt-1 mb-6 text-slate-500 dark:text-slate-400">
        Pachete combinate — zbor și cazare într-o singură căutare.
      </p>

      <div className="card p-4 sm:p-6 mb-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
          Caută zboruri și cazări live, în timp real
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Rezultate directe de la Travelpayouts — prețuri actualizate chiar acum.
        </p>
        <TravelpayoutsWidget />
      </div>

      <div className="rounded-xl border border-warning-100 bg-warning-50 p-4 text-sm text-warning-700 dark:border-warning-900/50 dark:bg-warning-950/30 dark:text-warning-300">
        <strong>Căutarea combinată de pachete (zbor + hotel într-un singur rezultat) e în lucru.</strong>{' '}
        Momentan poți căuta zborul mai sus, iar cazarea separat, în secțiunea{' '}
        <a href="/cazari" className="underline font-semibold">Sejururi</a>.
      </div>
    </div>
  );
}
