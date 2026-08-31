import { CarTaxiFront } from 'lucide-react';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

export default function TaxiuriAeroportPage() {
  useDocumentMeta(
    'Taxiuri aeroport',
    'Rezervă un transfer de la aeroport la hotel, la destinație.'
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
        Taxiuri aeroport
      </h1>
      <p className="mt-1 mb-6 text-slate-500 dark:text-slate-400">
        Transferuri aeroport–hotel, rezervate din timp.
      </p>

      <div className="card p-10 flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 mb-4">
          <CarTaxiFront className="h-7 w-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
          Căutare live, în curând
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
          Lucrăm la integrarea unui widget de căutare live pentru transferuri aeroport (via Welcome Pickups / Kiwitaxi). Revino în curând.
        </p>
      </div>
    </div>
  );
}
