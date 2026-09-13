import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import KiwiFlightWidget from '@/components/widgets/KiwiFlightWidget';

export default function BiletePage() {
  useDocumentMeta(
    'Bilete de avion',
    'Caută bilete de avion prin motorul Kiwi.'
  );

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
          Bilete de avion
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400 sm:text-base">
          Caută și compară bilete de avion cu Kiwi.
        </p>
        <div className="mt-6 rounded-2xl bg-white p-3 shadow-sm">
          <KiwiFlightWidget />
        </div>
      </div>
    </div>
  );
}
