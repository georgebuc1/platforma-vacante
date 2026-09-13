import { useNavigate } from 'react-router-dom';
import SearchForm from '@/components/search/SearchForm';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import type { SearchFilters } from '@/types';

export default function BiletePage() {
  const navigate = useNavigate();

  useDocumentMeta(
    'Bilete de avion',
    'Caută și compară opțiuni de călătorie în cadrul platformei Vacanța Mea.'
  );

  const handleSearch = (filters: SearchFilters) => {
    navigate('/oferte', {
      state: {
        ...filters,
        transport_type: 'avion',
      },
    });
  };

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
          Bilete de avion
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400 sm:text-base">
          Caută opțiuni de vacanță în site-ul nostru, fără redirecționări către pagini externe.
        </p>
        <div className="mt-6">
          <SearchForm variant="hero" onSearch={handleSearch} />
        </div>
      </div>
    </div>
  );
}
