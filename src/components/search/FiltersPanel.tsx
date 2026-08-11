import { Filter, X } from 'lucide-react';
import type { SearchFilters, SortOption, Offer } from '@/types';
import {
  DEPARTURE_CITIES,
  MONTHS,
  DURATIONS,
  TRIP_TYPES,
} from '@/components/search/SearchForm';
import {
  getUniqueCountries,
  getUniqueDestinations,
} from '@/utils/filters';

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

export default function FiltersPanel({
  filters,
  onChange,
  offers,
  sort,
  onSortChange,
}: FiltersPanelProps) {
  const countries = getUniqueCountries(offers);
  const destinations = getUniqueDestinations(offers);

  const update = (
    key: keyof SearchFilters,
    value: string | number | undefined
  ) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="space-y-5">

      {/* Sort */}
      <div>
        <label className="label-field">
          Sortare
        </label>

        <select
          value={sort}
          onChange={(e) =>
            onSortChange(e.target.value as SortOption)
          }
          className="input-field"
        >
          {SORT_OPTIONS.map((s) => (
            <option
              key={s.value}
              value={s.value}
              className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Departure city */}
      <div>
        <label className="label-field">
          Loc de plecare
        </label>

        <select
          value={filters.departure_city || 'orice'}
          onChange={(e) =>
            update('departure_city', e.target.value)
          }
          className="input-field"
        >
          <option
            value="orice"
            className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            Orice oraș
          </option>

          {DEPARTURE_CITIES.map((city) => (
            <option
              key={city}
              value={city}
              className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              {city}
            </option>
          ))}
        </select>
      </div>

      {/* Country */}
      <div>
        <label className="label-field">
          Țară
        </label>

        <select
          value={filters.country || 'orice'}
          onChange={(e) =>
            update('country', e.target.value)
          }
          className="input-field"
        >
          <option
            value="orice"
            className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            Orice țară
          </option>

          {countries.map((country) => (
            <option
              key={country}
              value={country}
              className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              {country}
            </option>
          ))}
        </select>
      </div>

      {/* Destination */}
      <div>
        <label className="label-field">
          Destinație
        </label>

        <select
          value={filters.destination || 'orice'}
          onChange={(e) =>
            update('destination', e.target.value)
          }
          className="input-field"
        >
          <option
            value="orice"
            className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            Orice destinație
          </option>

          {destinations.map((destination) => (
            <option
              key={destination}
              value={destination}
              className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              {destination}
            </option>
          ))}
        </select>
      </div>

      {/* Max budget */}
      <div>
        <label className="label-field">
          Buget maxim (RON)
        </label>

        <input
          type="number"
          min="0"
          step="50"
          value={filters.max_budget || ''}
          onChange={(e) =>
            update(
              'max_budget',
              e.target.value
                ? Number(e.target.value)
                : undefined
            )
          }
          className="input-field"
          placeholder="Ex: 2500"
        />
      </div>

      {/* Trip type */}
      <div>
        <label className="label-field">
          Tip vacanță
        </label>

        <select
          value={filters.trip_type || 'orice'}
          onChange={(e) =>
            update('trip_type', e.target.value)
          }
          className="input-field"
        >
          {TRIP_TYPES.map((trip) => (
            <option
              key={trip.value}
              value={trip.value}
              className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              {trip.label}
            </option>
          ))}
        </select>
      </div>

      {/* Duration */}
      <div>
        <label className="label-field">
          Durată
        </label>

        <select
          value={filters.duration || 'orice'}
          onChange={(e) =>
            update('duration', e.target.value)
          }
          className="input-field"
        >
          {DURATIONS.map((duration) => (
            <option
              key={duration.value}
              value={duration.value}
              className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              {duration.label}
            </option>
          ))}
        </select>
      </div>

      {/* Month */}
      <div>
        <label className="label-field">
          Perioada
        </label>

        <select
          value={filters.month || 'oricand'}
          onChange={(e) =>
            update('month', e.target.value)
          }
          className="input-field"
        >
          {MONTHS.map((month) => (
            <option
              key={month.value}
              value={month.value}
              className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              {month.label}
            </option>
          ))}
        </select>
      </div>

      {/* Min score */}
      <div>
        <label className="label-field">
          Scor minim
        </label>

        <select
          value={filters.min_score?.toString() || '0'}
          onChange={(e) =>
            update(
              'min_score',
              e.target.value
                ? Number(e.target.value)
                : undefined
            )
          }
          className="input-field"
        >
          <option
            value="0"
            className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            Orice scor
          </option>

          <option
            value="7"
            className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            7+
          </option>

          <option
            value="8"
            className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            8+
          </option>

          <option
            value="9"
            className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            9+
          </option>
        </select>
      </div>

    </div>
  );
}


/* =========================================================
   FILTERS BUTTON – MOBILE
   ========================================================= */

export function FiltersButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="btn-secondary w-full md:hidden"
    >
      <Filter className="h-4 w-4" />
      Filtrează
    </button>
  );
}


/* =========================================================
   MOBILE FILTERS DRAWER
   ========================================================= */

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

      {/* Overlay */}
      <div
        className="
          absolute inset-0
          bg-slate-950/60
          dark:bg-black/70
          backdrop-blur-[2px]
        "
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="
          absolute right-0 top-0
          h-full
          w-[85%]
          max-w-sm
          overflow-y-auto
          animate-fade-in

          bg-white
          dark:bg-[#111827]

          border-l
          border-slate-200
          dark:border-[#263247]

          shadow-2xl
        "
      >

        {/* Header */}
        <div
          className="
            sticky top-0 z-10

            flex items-center justify-between

            bg-white
            dark:bg-[#111827]

            border-b
            border-slate-100
            dark:border-[#263247]

            px-4 py-3

            transition-colors
            duration-300
          "
        >
          <h3
            className="
              flex items-center gap-2
              font-bold
              text-slate-900
              dark:text-slate-100
            "
          >
            <Filter className="h-5 w-5" />
            Filtre
          </h3>

          <button
            onClick={onClose}
            className="
              p-2
              rounded-lg

              text-slate-500
              hover:text-slate-800
              hover:bg-slate-100

              dark:text-slate-400
              dark:hover:text-slate-100
              dark:hover:bg-slate-800

              transition-colors
            "
            aria-label="Închide filtrele"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {children}
        </div>

      </div>
    </div>
  );
}