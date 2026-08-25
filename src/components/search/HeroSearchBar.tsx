import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, BedDouble, Car, Zap, MapPin, Calendar, Search } from 'lucide-react';
import type { SearchFilters } from '@/types';
import { DESTINATIONS, searchDestinations, type DestinationOption } from '@/data/destinations';
import { MONTHS } from '@/components/search/SearchForm';

type CategoryKey = 'bilete' | 'cazari' | 'rent-a-car' | 'last-minute';

const CATEGORIES: { key: CategoryKey; label: string; icon: typeof Plane; route: string }[] = [
  { key: 'bilete', label: 'Bilete', icon: Plane, route: '/bilete' },
  { key: 'cazari', label: 'Cazări', icon: BedDouble, route: '/cazari' },
  { key: 'rent-a-car', label: 'Rent a car', icon: Car, route: '/rent-a-car' },
  { key: 'last-minute', label: 'Last minute', icon: Zap, route: '/last-minute' },
];

// Maps a JS Date month index (0-11) to the matching value in MONTHS
// (e.g. 0 -> 'ianuarie'), so picking a depart date can also narrow the
// results by month without the person having to set two separate fields.
function monthValueForDate(date: Date): string {
  const names = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];
  return names[date.getMonth()];
}

interface HeroSearchBarProps {
  defaultCategory?: CategoryKey;
}

export default function HeroSearchBar({ defaultCategory = 'bilete' }: HeroSearchBarProps) {
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [category, setCategory] = useState<CategoryKey>(defaultCategory);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<DestinationOption | null>(null);
  const [suggestions, setSuggestions] = useState<DestinationOption[]>(DESTINATIONS);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [error, setError] = useState('');

  // Close the dropdown on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setSelected(null);
    setError('');
    setSuggestions(searchDestinations(value));
    setShowSuggestions(true);
  };

  const handleSelect = (option: DestinationOption) => {
    setSelected(option);
    setQuery(`${option.city}, ${option.country}`);
    setShowSuggestions(false);
    setError('');
  };

  const activeCategory = CATEGORIES.find((c) => c.key === category)!;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // "Căutare exactă": we only accept a destination that matches one of
    // our known destinations (either picked from the dropdown, or typed
    // exactly). Anything else would silently return zero results anyway,
    // since offers are matched by an exact destination string.
    const match =
      selected ||
      DESTINATIONS.find((d) => d.city.toLowerCase() === query.trim().toLowerCase());

    if (!query.trim()) {
      setError('Introdu o destinație.');
      return;
    }
    if (!match) {
      setError('Alege o destinație din listă, ca să găsim exact ce cauți.');
      return;
    }

    const filters: SearchFilters = { destination: match.city };

    if (category === 'cazari') filters.accommodation_only = true;
    if (category === 'rent-a-car') filters.transport_type = 'masina';
    if (category === 'bilete') filters.transport_type = 'avion';
    if (category === 'last-minute') filters.last_minute = true;

    if (departDate) {
      filters.month = monthValueForDate(new Date(departDate));
    }

    navigate(activeCategory.route, { state: filters });
  };

  return (
    <div className="bg-white rounded-2xl shadow-card-hover border border-slate-200 p-4 sm:p-5">

      {/* Category tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 pb-3 mb-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = cat.key === category;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setCategory(cat.key)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {cat.label.toUpperCase()}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 lg:flex-row lg:items-stretch">

        {/* Destination input with autocomplete */}
        <div ref={wrapperRef} className="relative flex-1 min-w-0">
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3.5 h-14">
            <MapPin className="h-5 w-5 text-brand-500 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => { setSuggestions(searchDestinations(query)); setShowSuggestions(true); }}
              placeholder="Unde vrei să mergi? (ex: Antalya)"
              className="w-full bg-transparent outline-none text-sm sm:text-base text-slate-800 placeholder:text-slate-400"
              autoComplete="off"
            />
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-20 mt-1.5 w-full max-h-72 overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
              {suggestions.map((s) => (
                <li key={s.iata}>
                  <button
                    type="button"
                    onClick={() => handleSelect(s)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm hover:bg-brand-50 transition-colors"
                  >
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="text-slate-800">
                      {s.city}, <span className="text-slate-500">{s.country}</span>
                    </span>
                    <span className="ml-auto text-xs font-mono text-slate-400">{s.iata}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Dates */}
        <div className="flex gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3.5 h-14 flex-1 lg:w-40">
            <Calendar className="h-4 w-4 text-brand-500 shrink-0" />
            <input
              type="date"
              value={departDate}
              onChange={(e) => setDepartDate(e.target.value)}
              className="w-full bg-transparent outline-none text-sm text-slate-700"
            />
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3.5 h-14 flex-1 lg:w-40">
            <Calendar className="h-4 w-4 text-brand-500 shrink-0" />
            <input
              type="date"
              value={returnDate}
              min={departDate || undefined}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full bg-transparent outline-none text-sm text-slate-700"
            />
          </div>
        </div>

        {/* Search button */}
        <button
          type="submit"
          className="btn-primary h-14 px-6 shrink-0 text-sm sm:text-base"
        >
          <Search className="h-5 w-5" />
          CAUTĂ
        </button>
      </form>

      {error && <p className="mt-2 text-xs text-error-600">{error}</p>}
    </div>
  );
}
