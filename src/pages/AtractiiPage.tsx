import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import PopularToursSection from '@/components/widgets/PopularToursSection';

export default function AtractiiPage() {
  useDocumentMeta(
    'Atracții și excursii',
    'Descoperă excursii, tururi și activități reale, cu prețuri live, pentru destinațiile tale preferate.'
  );

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          Atracții și excursii
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Tururi și activități reale, via Klook — prețuri actualizate chiar acum.
        </p>
      </div>
      <PopularToursSection />
    </div>
  );
}
