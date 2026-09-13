import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { useNavigate } from 'react-router-dom';
import SearchForm from '@/components/search/SearchForm';
import type { SearchFilters } from '@/types';

export default function ZborHotelPage() {
  const navigate = useNavigate();

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

      <div className="card mb-6 p-4 sm:p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
          Planifică zborul și cazarea
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Alege criteriile, apoi vezi ofertele disponibile în platforma noastră.
        </p>
        <SearchForm
          variant="hero"
          onSearch={(filters: SearchFilters) =>
            navigate('/oferte', { state: filters })
          }
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
        Rezultatele rămân în site-ul nostru. Pentru oferte live de cazare, folosește secțiunea{' '}
        <a href="/cazari" className="font-semibold underline">Sejururi</a>.
      </div>
    </div>
  );
}
