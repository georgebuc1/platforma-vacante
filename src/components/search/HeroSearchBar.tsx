import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BedDouble, MapPin, Users, Search, Minus, Plus } from 'lucide-react';
import type { SearchFilters } from '@/types';
import { DESTINATIONS, searchDestinations, type DestinationOption } from '@/data/destinations';
import { MONTHS } from '@/components/search/SearchForm';
import DateRangePicker, { parseLocalDate } from '@/components/search/DateRangePicker';

type CategoryKey = 'bilete' | 'cazari' | 'rent-a-car' | 'last-minute';

const ROUTE_BY_CATEGORY: Record<CategoryKey, string> = {
  bilete: '/bilete',
  cazari: '/cazari',
  'rent-a-car': '/rent-a-car',
  'last-minute': '/last-minute',
};

function monthValueForDate(date: Date): string {
  const names = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];
  return names[date.getMonth()];
}

interface HeroSearchBarProps {
  /** Which category this search submits to. The Header's Booking-style tab
   *  strip is the actual category switcher now (matching Booking.com,
   *  where the tabs above the bar ARE the navigation) — this component no
   *  longer duplicates its own tab row. */
  defaultCategory?: CategoryKey;
}

export default function HeroSearchBar({ defaultCategory = 'bilete' }: HeroSearchBarProps) {
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const guestsRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<DestinationOption | null>(null);
  const [suggestions, setSuggestions] = useState<DestinationOption[]>(DESTINATIONS);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [error, setError] = useState('');

  const [showGuests, setShowGuests] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (guestsRef.current && !guestsRef.current.contains(e.target as Node)) {
        setShowGuests(false);
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

  const adjust = (setter: typeof setAdults, value: number, min: number) => {
    setter(Math.max(min, value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const match =
      selected ||
      DESTINATIONS.find((d) => d.city.toLowerCase() === query.trim().toLowerCase());

    if (!query.trim()) {
      setError('Introduceți destinația.');
      return;
    }
    if (!match) {
      setError('Alegeți o destinație din listă, ca să găsim exact ce căutați.');
      return;
    }

    const filters: SearchFilters = { destination: match.city };

    if (defaultCategory === 'cazari') filters.accommodation_only = true;
    if (defaultCategory === 'rent-a-car') filters.transport_type = 'masina';
    if (defaultCategory === 'bilete') filters.transport_type = 'avion';
    if (defaultCategory === 'last-minute') filters.last_minute = true;

    if (departDate) {
      filters.month = monthValueForDate(parseLocalDate(departDate));
    }

    navigate(ROUTE_BY_CATEGORY[defaultCategory], { state: filters });
  };

  const guestsSummary = `${adults} ${adults === 1 ? 'adult' : 'adulți'} \u00b7 ${children} copii \u00b7 ${rooms} ${rooms === 1 ? 'cameră' : 'camere'}`;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border-2 border-warning-400 bg-white shadow-card-hover overflow-visible"
    >
      <div className="flex flex-col lg:flex-row lg:items-stretch divide-y lg:divide-y-0 lg:divide-x divide-slate-200">

        {/* Destination */}
        <div ref={wrapperRef} className="relative flex-[1.4] min-w-0">
          <div className="flex items-center gap-2.5 px-4 h-14">
            <BedDouble className="h-5 w-5 text-slate-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-medium text-slate-500 leading-tight">
                Introduceți destinația
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onFocus={() => { setSuggestions(searchDestinations(query)); setShowSuggestions(true); }}
                placeholder="Unde mergeți?"
                className="w-full bg-transparent outline-none text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal"
                autoComplete="off"
              />
            </div>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-30 mt-1 w-full max-h-72 overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
              <li className="px-4 pt-2.5 pb-1 text-xs font-bold text-slate-400 uppercase tracking-wide">
                Destinații populare
              </li>
              {suggestions.map((s) => (
                <li key={s.iata}>
                  <button
                    type="button"
                    onClick={() => handleSelect(s)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm hover:bg-slate-50 transition-colors"
                  >
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="text-slate-800">
                      <span className="font-semibold">{s.city}</span>
                      <span className="text-slate-500"> {s.country}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Dates — shared calendar, matches Booking.com's check-in/check-out picker */}
        <DateRangePicker
          departDate={departDate}
          returnDate={returnDate}
          onChange={(d, r) => { setDepartDate(d); setReturnDate(r); }}
        />

        {/* Guests / rooms */}
        <div ref={guestsRef} className="relative flex-1">
          <button
            type="button"
            onClick={() => setShowGuests((v) => !v)}
            className="w-full flex items-center gap-2.5 px-4 h-14 text-left"
          >
            <Users className="h-5 w-5 text-slate-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-medium text-slate-500 leading-tight">
                Selectați numărul de camere/oaspeți
              </label>
              <span className="block truncate text-sm font-semibold text-slate-800">
                {guestsSummary}
              </span>
            </div>
          </button>

          {showGuests && (
            <div className="absolute z-30 right-0 mt-1 w-72 rounded-lg border border-slate-200 bg-white shadow-lg p-4 space-y-4">
              {([
                ['Adulți', adults, setAdults, 1],
                ['Copii', children, setChildren, 0],
                ['Camere', rooms, setRooms, 1],
              ] as const).map(([label, value, setter, min]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">{label}</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => adjust(setter, value - 1, min)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:border-cta-500 hover:text-cta-500 transition-colors"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-4 text-center text-sm font-semibold">{value}</span>
                    <button
                      type="button"
                      onClick={() => adjust(setter, value + 1, min)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:border-cta-500 hover:text-cta-500 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setShowGuests(false)}
                className="w-full rounded-lg bg-cta-500 text-white text-sm font-semibold py-2 hover:bg-cta-400 transition-colors"
              >
                Selectați
              </button>
            </div>
          )}
        </div>

        {/* Search button */}
        <button
          type="submit"
          className="flex items-center justify-center gap-2 h-14 lg:w-auto px-8 bg-cta-500 text-white font-bold text-sm hover:bg-cta-400 transition-colors lg:rounded-r-[6px]"
        >
          <Search className="h-5 w-5" />
          Căutare
        </button>
      </div>

      {error && <p className="px-4 py-2 text-xs text-error-600">{error}</p>}
    </form>
  );
}
