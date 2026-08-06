import { Filter, X } from 'lucide-react';
import type { SearchFilters, SortOption } from '@/types';
import { DEPARTURE_CITIES, MONTHS, DURATIONS, TRIP_TYPES } from '@/components/search/SearchForm';
import { getUniqueCountries, getUniqueDestinations } from '@/utils/filters';
import type { Offer } from '@/types';

interface FiltersPanelProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  offers: Offer[];
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recommended', label: 'Recomandate' },
  { value: 'price_asc', label: 'Preț crescător' },
  { value: 'price_desc', label: 'Preț descrescător' },
  { value: 'score', label: 'Scor ofertă' },
  { value: 'newest', label: 'Cele mai noi' },
];

export default function FiltersPanel({ filters, onChange, offers, sort, onSortChange }: FiltersPanelProps) {
  const countries = getUniqueCountries(offers);
  const destinations = getUniqueDestinations(offers);

  const update = (key: keyof SearchFilters, value: string | number | undefined) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-5">
      {/* Sort */}
      <div>
        <label className="label-field">Sortare</label>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="input-field"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Departure city */}
      <div>
        <label className="label-field">Loc de plecare</label>
        <select
          value={filters.departure_city || 'orice'}
          onChange={(e) => update('departure_city', e.target.value)}
          className="input-field"
        >
          <option value="orice">Orice oraș</option>
          {DEPARTURE_CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Country */}
      <div>
        <label className="label-field">Țară</label>
        <select
          value={filters.country || 'orice'}
          onChange={(e) => update('country', e.target.value)}
          className="input-field"
        >
          <option value="orice">Orice țară</option>
          {countries.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Destination */}
      <div>
        <label className="label-field">Destinație</label>
        <select
          value={filters.destination || 'orice'}
          onChange={(e) => update('destination', e.target.value)}
          className="input-field"
        >
          <option value="orice">Orice destinație</option>
          {destinations.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Max budget */}
      <div>
        <label className="label-field">Buget maxim (RON)</label>
        <input
          type="number"
          min="0"
          step="50"
          value={filters.max_budget || ''}
          onChange={(e) => update('max_budget', e.target.value ? Number(e.target.value) : undefined)}
          className="input-field"
          placeholder="Ex: 2500"
        />
      </div>

      {/* Trip type */}
      <div>
        <label className="label-field">Tip vacanță</label>
        <select
          value={filters.trip_type || 'orice'}
          onChange={(e) => update('trip_type', e.target.value)}
          className="input-field"
        >
          {TRIP_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Duration */}
      <div>
        <label className="label-field">Durată</label>
        <select
          value={filters.duration || 'orice'}
          onChange={(e) => update('duration', e.target.value)}
          className="input-field"
        >
          {DURATIONS.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
      </div>

      {/* Month */}
      <div>
        <label className="label-field">Perioada</label>
        <select
          value={filters.month || 'oricand'}
          onChange={(e) => update('month', e.target.value)}
          className="input-field"
        >
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      {/* Min score */}
      <div>
        <label className="label-field">Scor minim</label>
        <select
          value={filters.min_score?.toString() || '0'}
          onChange={(e) => update('min_score', e.target.value ? Number(e.target.value) : undefined)}
          className="input-field"
        >
          <option value="0">Orice scor</option>
          <option value="7">7+</option>
          <option value="8">8+</option>
          <option value="9">9+</option>
        </select>
      </div>
    </div>
  );
}

export function FiltersButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="btn-secondary w-full md:hidden">
      <Filter className="h-4 w-4" /> Filtrează
    </button>
  );
}

export function MobileFiltersDrawer({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-xl overflow-y-auto animate-fade-in">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Filter className="h-5 w-5" /> Filtre
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
