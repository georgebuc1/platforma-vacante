import { FormEvent, useState } from 'react';
import { CarTaxiFront, MapPin, Search, ShieldCheck } from 'lucide-react';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import AgodaLocationAutocomplete from '@/components/search/AgodaLocationAutocomplete';

const AFFILIATE_URL = 'https://tp.media/r?campaign_id=147&marker=769203&p=4439&sub_id=769203&trs=565952&u=https%3A%2F%2Fgettransfer.com';

export default function TaxiuriAeroportPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [error, setError] = useState('');

  useDocumentMeta(
    'Transfer Aeroport',
    'Rezervă un transfer de la aeroport la hotel sau la destinație.'
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!from.trim() || !to.trim()) {
      setError('Completează punctul de plecare și destinația.');
      return;
    }
    setError('');
    const partnerUrl = new URL(AFFILIATE_URL);
    partnerUrl.searchParams.set('from', from.trim());
    partnerUrl.searchParams.set('to', to.trim());
    window.location.assign(partnerUrl.toString());
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
        Transfer Aeroport
      </h1>
      <p className="mt-1 mb-6 text-slate-500 dark:text-slate-400">
        Rezervă rapid un transfer sigur între aeroport și destinația ta.
      </p>

      <div className="card overflow-visible p-6 sm:p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 mb-4">
          <CarTaxiFront className="h-7 w-7" />
        </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
        Cele mai bune prețuri de la cei mai buni șoferi, în toate țările
        </h2>
      <p className="mt-1 mb-6 text-sm text-slate-500 dark:text-slate-400">
        Introdu adresa, aeroportul sau hotelul de unde pleci și destinația.
        </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <label className="flex-1">
          <span className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">From</span>
          <span className="relative flex h-14 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <MapPin className="h-5 w-5 shrink-0 text-brand-500" />
            <AgodaLocationAutocomplete
              value={from}
              onChange={setFrom}
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
              placeholder="address, airport, hotel"
              ariaLabel="Punct de plecare"
            />
          </span>
        </label>
        <label className="flex-1">
          <span className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">To</span>
          <span className="relative flex h-14 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <MapPin className="h-5 w-5 shrink-0 text-brand-500" />
            <AgodaLocationAutocomplete
              value={to}
              onChange={setTo}
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
              placeholder="address, airport, hotel"
              ariaLabel="Destinație"
            />
          </span>
        </label>
        <button type="submit" className="btn h-14 bg-cta-500 text-white hover:bg-cta-400 focus:ring-cta-500 lg:px-7">
          <Search className="h-4 w-4" />
          Caută transfer
        </button>
      </form>

      {error && <p className="mt-3 text-sm font-medium text-error-600">{error}</p>}

      <div className="mt-6 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <ShieldCheck className="h-4 w-4 text-brand-500" />
        Căutarea începe în site-ul nostru; rezervarea se finalizează prin partener.
      </div>
      </div>
    </div>
  );
}
