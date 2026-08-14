import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Wallet, Calendar, Clock, Compass, Coins } from 'lucide-react';
import type { Currency, SearchFilters } from '@/types';

export const DEPARTURE_CITIES = [
  'București', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Sibiu', 'Craiova',
  'Oradea', 'Suceava', 'Orice aeroport',
];

export const MONTHS = [
  { value: 'oricand', label: 'Oricând' },
  { value: 'luna_astazi', label: 'Luna aceasta' },
  { value: 'luna_urmatoare', label: 'Luna următoare' },
  { value: 'ianuarie', label: 'Ianuarie' },
  { value: 'februarie', label: 'Februarie' },
  { value: 'martie', label: 'Martie' },
  { value: 'aprilie', label: 'Aprilie' },
  { value: 'mai', label: 'Mai' },
  { value: 'iunie', label: 'Iunie' },
  { value: 'iulie', label: 'Iulie' },
  { value: 'august', label: 'August' },
  { value: 'septembrie', label: 'Septembrie' },
  { value: 'octombrie', label: 'Octombrie' },
  { value: 'noiembrie', label: 'Noiembrie' },
  { value: 'decembrie', label: 'Decembrie' },
];

export const DURATIONS = [
  { value: 'orice', label: 'Orice durată' },
  { value: 'weekend', label: 'Weekend' },
  { value: '3-5', label: '3–5 zile' },
  { value: '5-7', label: '5–7 zile' },
  { value: '7-10', label: '7–10 zile' },
  { value: '10-14', label: '10–14 zile' },
];

export const TRIP_TYPES = [
  { value: 'orice', label: 'Orice tip' },
  { value: 'beach', label: 'Mare' },
  { value: 'city_break', label: 'City-break' },
  { value: 'mountain', label: 'Munte' },
  { value: 'all_inclusive', label: 'All-inclusive' },
  { value: 'family', label: 'Familie' },
  { value: 'romantic', label: 'Romantic' },
  { value: 'adventure', label: 'Aventură' },
  { value: 'weekend', label: 'Weekend' },
];

export const TRIP_TYPE_LABELS: Record<string, string> = {
  beach: 'Mare', city_break: 'City-break', mountain: 'Munte', all_inclusive: 'All-inclusive',
  family: 'Familie', romantic: 'Romantic', adventure: 'Aventură', weekend: 'Weekend',
};

interface SearchFormProps {
  defaultFilters?: Partial<SearchFilters>;
  variant?: 'hero' | 'compact';
  onSearch?: (filters: SearchFilters) => void;
}

export default function SearchForm({ defaultFilters, variant = 'hero', onSearch }: SearchFormProps) {
  const navigate = useNavigate();
  const [departureCity, setDepartureCity] = useState(defaultFilters?.departure_city || 'București');
  const [maxBudget, setMaxBudget] = useState(defaultFilters?.max_budget?.toString() || '2500');
  const [currency, setCurrency] = useState<Currency>(defaultFilters?.currency || 'RON');
  const [month, setMonth] = useState(defaultFilters?.month || 'oricand');
  const [duration, setDuration] = useState(defaultFilters?.duration || 'orice');
  const [tripType, setTripType] = useState(defaultFilters?.trip_type || 'orice');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!departureCity) errs.departureCity = 'Alege locul de plecare.';
    const budgetNum = Number(maxBudget);
    if (!maxBudget || Number.isNaN(budgetNum) || budgetNum <= 0) errs.maxBudget = 'Introdu un buget valid.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const filters: SearchFilters = {
      departure_city: departureCity,
      max_budget: Number(maxBudget), currency, month, duration, trip_type: tripType,
    };
    if (onSearch) onSearch(filters);
    else navigate('/oferte', { state: filters });
  };

  const isHero = variant === 'hero';
  return (
    <form onSubmit={handleSubmit} className={`bg-white rounded-2xl shadow-card-hover border border-slate-200 ${isHero ? 'p-5 sm:p-6' : 'p-4'}`}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <div>
          <label className="label-field !text-slate-700 flex items-center gap-1.5"><MapPin className="h-4 w-4 text-brand-500" />De unde pleci?</label>
          <select value={departureCity} onChange={(e) => setDepartureCity(e.target.value)} className="input-field">
            {DEPARTURE_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.departureCity && <p className="mt-1 text-xs text-error-600">{errors.departureCity}</p>}
        </div>
        <div>
          <label className="label-field !text-slate-700 flex items-center gap-1.5"><Wallet className="h-4 w-4 text-brand-500" />Buget maxim</label>
          <div className="relative">
            <input type="number" min="0" step="50" value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} className="input-field pr-16" placeholder="2500" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">{currency} / pers.</span>
          </div>
          {errors.maxBudget && <p className="mt-1 text-xs text-error-600">{errors.maxBudget}</p>}
        </div>
        <div>
          <label className="label-field !text-slate-700 flex items-center gap-1.5"><Coins className="h-4 w-4 text-brand-500" />Monedă</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className="input-field">
            <option value="RON">Lei (RON)</option><option value="EUR">Euro (EUR)</option>
          </select>
        </div>
        <div>
          <label className="label-field !text-slate-700 flex items-center gap-1.5"><Calendar className="h-4 w-4 text-brand-500" />Când vrei să pleci?</label>
          <select value={month} onChange={(e) => setMonth(e.target.value)} className="input-field">
            {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label-field !text-slate-700 flex items-center gap-1.5"><Clock className="h-4 w-4 text-brand-500" />Cât timp?</label>
          <select value={duration} onChange={(e) => setDuration(e.target.value)} className="input-field">
            {DURATIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label-field !text-slate-700 flex items-center gap-1.5"><Compass className="h-4 w-4 text-brand-500" />Tip vacanță</label>
          <select value={tripType} onChange={(e) => setTripType(e.target.value)} className="input-field">
            {TRIP_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>
      <button type="submit" className={`btn-primary w-full mt-5 ${isHero ? 'text-base py-4' : ''}`}><Search className="h-5 w-5" />GĂSEȘTE-MI VACANȚA</button>
    </form>
  );
}
