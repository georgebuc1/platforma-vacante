import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import type { SearchFilters, SortOption, Offer } from '@/types';
import { getOffers } from '@/services/storageService';
import { filterOffers, sortOffers } from '@/utils/filters';
import OfferCard from '@/components/offers/OfferCard';
import FiltersPanel, { MobileFiltersDrawer } from '@/components/search/FiltersPanel';
import { MONTHS, DURATIONS, TRIP_TYPES, TRIP_TYPE_LABELS } from '@/components/search/SearchForm';

const MONTH_LABELS: Record<string, string> = Object.fromEntries(MONTHS.map((m) => [m.value, m.label]));
const DURATION_LABELS: Record<string, string> = Object.fromEntries(DURATIONS.map((d) => [d.value, d.label]));
const TRIP_LABELS: Record<string, string> = Object.fromEntries(TRIP_TYPES.map((t) => [t.value, t.label]));

export default function OffersPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialFilters = (location.state as SearchFilters) || {};

  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    departure_city: initialFilters.departure_city || 'orice',
    max_budget: initialFilters.max_budget || undefined,
    month: initialFilters.month || 'oricand',
    duration: initialFilters.duration || 'orice',
    trip_type: initialFilters.trip_type || 'orice',
    country: 'orice',
    destination: 'orice',
    transport_type: 'orice',
    min_score: 0,
    sort: 'recommended',
  });
  const [sort, setSort] = useState<SortOption>('recommended');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    getOffers()
      .then(setAllOffers)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const result = filterOffers(allOffers, filters);
    return sortOffers(result, sort);
  }, [allOffers, filters, sort]);

  const activeChips: { key: keyof SearchFilters; label: string }[] = [];
  if (filters.departure_city && filters.departure_city !== 'orice') activeChips.push({ key: 'departure_city', label: filters.departure_city });
  if (filters.max_budget) activeChips.push({ key: 'max_budget', label: `Până la ${filters.max_budget.toLocaleString('ro-RO')} RON` });
  if (filters.month && filters.month !== 'oricand') activeChips.push({ key: 'month', label: MONTH_LABELS[filters.month] || filters.month });
  if (filters.duration && filters.duration !== 'orice') activeChips.push({ key: 'duration', label: DURATION_LABELS[filters.duration] || filters.duration });
  if (filters.trip_type && filters.trip_type !== 'orice') activeChips.push({ key: 'trip_type', label: TRIP_LABELS[filters.trip_type] || TRIP_TYPE_LABELS[filters.trip_type] || filters.trip_type });
  if (filters.country && filters.country !== 'orice') activeChips.push({ key: 'country', label: filters.country });
  if (filters.destination && filters.destination !== 'orice') activeChips.push({ key: 'destination', label: filters.destination });
  if (filters.min_score && filters.min_score > 0) activeChips.push({ key: 'min_score', label: `Scor ${filters.min_score}+` });

  const removeChip = (key: keyof SearchFilters) => {
    const defaults: Record<string, string | number | undefined> = {
      departure_city: 'orice', max_budget: undefined, month: 'oricand',
      duration: 'orice', trip_type: 'orice', country: 'orice', destination: 'orice', min_score: 0,
    };
    setFilters((f) => ({ ...f, [key]: defaults[key] }));
  };

  const clearAll = () => {
    setFilters({ departure_city: 'orice', max_budget: undefined, month: 'oricand', duration: 'orice', trip_type: 'orice', country: 'orice', destination: 'orice', transport_type: 'orice', min_score: 0, sort: 'recommended' });
    navigate('/oferte', { replace: true });
  };

  return (
    <div className="container-page py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Oferte pentru vacanța ta</h1>
        <p className="mt-1 text-slate-500">
          {loading ? 'Se încarcă ofertele...' : `Am găsit ${filtered.length} ${filtered.length === 1 ? 'ofertă' : 'oferte'} care se potrivesc.`}
        </p>
      </div>

      {activeChips.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {activeChips.map((chip) => (
            <span key={chip.key} className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700">
              {chip.label}
              <button onClick={() => removeChip(chip.key)} className="text-brand-400 hover:text-brand-700">
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          <button onClick={clearAll} className="text-sm font-medium text-slate-500 hover:text-slate-700 underline">Șterge tot</button>
        </div>
      )}

      <button onClick={() => setMobileFiltersOpen(true)} className="btn-secondary mb-5 w-full md:hidden">
        <SlidersHorizontal className="h-4 w-4" /> Filtrează
      </button>

      <div className="flex gap-8">
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-24 card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900">Filtre</h2>
              <button onClick={clearAll} className="text-xs font-medium text-brand-600 hover:text-brand-700">Resetează</button>
            </div>
            <FiltersPanel filters={filters} onChange={setFilters} offers={allOffers} sort={sort} onSortChange={setSort} />
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="rounded-2xl bg-slate-100 animate-pulse h-72" />)}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((offer) => <OfferCard key={offer.id} offer={offer} />)}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Nu am găsit momentan o ofertă potrivită.</h3>
              <p className="text-slate-500 mb-6">Încearcă să mărești bugetul sau să alegi o perioadă mai flexibilă.</p>
              <button onClick={clearAll} className="btn-primary">MODIFICĂ CRITERIILE</button>
            </div>
          )}
        </div>
      </div>

      <MobileFiltersDrawer open={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={clearAll} className="text-xs font-medium text-brand-600 hover:text-brand-700">Resetează</button>
        </div>
        <FiltersPanel filters={filters} onChange={setFilters} offers={allOffers} sort={sort} onSortChange={setSort} />
        <button onClick={() => setMobileFiltersOpen(false)} className="btn-primary w-full mt-6">
          Vezi {filtered.length} oferte
        </button>
      </MobileFiltersDrawer>
    </div>
  );
}
