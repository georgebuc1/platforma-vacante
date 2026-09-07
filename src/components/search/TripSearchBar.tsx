import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, BedDouble, Car, Search, MapPin, Users, Minus, Plus, ArrowLeftRight, Luggage, Zap, Flame } from 'lucide-react';
import DateRangePicker from './DateRangePicker';
import { DESTINATIONS, normalize } from '@/data/destinations';
import { DEPARTURE_CITIES } from './SearchForm';
import { preloadWorldCities, searchWorldCities, type WorldCity } from '@/utils/worldCities';

type Tab = 'hotels' | 'flights' | 'cars' | 'last-minute';

/** Destinația aleasă în câmpul "Destinație", indiferent dacă vine din lista
 * noastră curată (cu id Agoda verificat, eventual) sau din datasetul mondial
 * de orașe (fără id — vezi utils/worldCities.ts pentru motiv). */
interface SelectedDestination {
  city: string;
  country: string;
  agodaCityId?: number;
}

const TABS: { key: Tab; label: string; icon: typeof Plane }[] = [
  { key: 'hotels', label: 'Hotel', icon: BedDouble },
  { key: 'flights', label: 'Bilete avion', icon: Plane },
  { key: 'cars', label: 'Rent a car', icon: Car },
  { key: 'last-minute', label: 'Last minute', icon: Flame },
];

const TAB_STYLES: Record<Tab, { icon: string; active: string }> = {
  hotels: {
    icon: 'bg-slate-100 text-slate-600 group-hover:bg-slate-200',
    active: 'bg-slate-200 text-slate-900 ring-1 ring-slate-300',
  },
  flights: {
    icon: 'bg-slate-100 text-slate-600 group-hover:bg-slate-200',
    active: 'bg-slate-200 text-slate-900 ring-1 ring-slate-300',
  },
  cars: {
    icon: 'bg-slate-100 text-slate-600 group-hover:bg-slate-200',
    active: 'bg-slate-200 text-slate-900 ring-1 ring-slate-300',
  },
  'last-minute': {
    icon: 'bg-slate-100 text-orange-600 group-hover:bg-slate-200',
    active: 'bg-slate-200 text-slate-900 ring-1 ring-slate-300',
  },
};

function defaultCheckIn(): string {
  const d = new Date();
  d.setDate(d.getDate() + 21);
  return d.toISOString().slice(0, 10);
}
function defaultCheckOut(offsetDays = 3): string {
  const d = new Date();
  d.setDate(d.getDate() + 21 + offsetDays);
  return d.toISOString().slice(0, 10);
}

function GuestsPicker({
  adults, children, onChange,
}: { adults: number; children: number; onChange: (a: number, c: number) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={ref} className="relative flex-1 min-w-[160px]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 px-4 h-14 text-left"
      >
        <Users className="h-4 w-4 text-slate-400 shrink-0" />
        <div className="min-w-0">
          <label className="block text-[11px] font-medium text-slate-500 leading-tight">Călători</label>
          <span className="block truncate text-sm font-semibold text-slate-800">
            {adults} {adults === 1 ? 'adult' : 'adulți'}{children > 0 ? `, ${children} ${children === 1 ? 'copil' : 'copii'}` : ''}
          </span>
        </div>
      </button>

      {open && (
        <div className="absolute z-30 mt-1 left-0 right-0 sm:w-72 rounded-lg border border-slate-200 bg-white shadow-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Adulți</span>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => onChange(Math.max(1, adults - 1), children)} className="h-7 w-7 rounded-full border border-slate-300 flex items-center justify-center hover:border-cta-500">
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-4 text-center text-sm">{adults}</span>
              <button type="button" onClick={() => onChange(Math.min(12, adults + 1), children)} className="h-7 w-7 rounded-full border border-slate-300 flex items-center justify-center hover:border-cta-500">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Copii</span>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => onChange(adults, Math.max(0, children - 1))} className="h-7 w-7 rounded-full border border-slate-300 flex items-center justify-center hover:border-cta-500">
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-4 text-center text-sm">{children}</span>
              <button type="button" onClick={() => onChange(adults, Math.min(8, children + 1))} className="h-7 w-7 rounded-full border border-slate-300 flex items-center justify-center hover:border-cta-500">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TripSearchBar() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('hotels');
  const [error, setError] = useState('');

  // Shared travelers state
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  // Hotels (Agoda)
  const [destQuery, setDestQuery] = useState('');
  const [selectedDest, setSelectedDest] = useState<SelectedDestination | null>(null);
  const [destOpen, setDestOpen] = useState(false);
  const [worldMatches, setWorldMatches] = useState<WorldCity[]>([]);
  const [checkInDate, setCheckInDate] = useState(defaultCheckIn());
  const [checkOutDate, setCheckOutDate] = useState(defaultCheckOut());
  const destWrapperRef = useRef<HTMLDivElement>(null);

  // Flights / cars — same round-trip dates, simple from/to
  const [oneWay, setOneWay] = useState(false);
  const [bags, setBags] = useState(0);
  const [fromCity, setFromCity] = useState('București');
  const [toQuery, setToQuery] = useState('');

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (destWrapperRef.current && !destWrapperRef.current.contains(e.target as Node)) setDestOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Interoghează datasetul mondial de orașe (~130.000, încărcat lazy) de
  // fiecare dată când se schimbă textul căutat, ca sugestiile să apară
  // imediat, pentru orice oraș din lume — nu doar din lista noastră curată.
  useEffect(() => {
    let cancelled = false;
    const trimmed = destQuery.trim();
    if (trimmed.length < 3) {
      setWorldMatches([]);
      return;
    }
    searchWorldCities(trimmed, 8).then((matches) => {
      if (!cancelled) setWorldMatches(matches);
    });
    return () => {
      cancelled = true;
    };
  }, [destQuery]);

  const q = normalize(destQuery.trim());
  const curatedMatches = q
    ? DESTINATIONS.filter((d) => normalize(d.city).includes(q) || normalize(d.country).includes(q))
    : DESTINATIONS.slice(0, 8);

  // Combinăm cele două surse: lista noastră curată are prioritate (nume în
  // română, iar unele au și căutare live), completată cu potriviri din
  // datasetul mondial pentru orice oraș pe care nu-l aveam deja.
  const worldSuggestions = worldMatches.filter(
    (w) => !curatedMatches.some((d) => normalize(d.city) === normalize(w.name))
  );
  const filteredDestinations: SelectedDestination[] = [
    ...curatedMatches.map((d) => ({ city: d.city, country: d.country, agodaCityId: d.agodaCityId })),
    ...worldSuggestions.map((w) => ({ city: w.name, country: w.countryCode })),
  ].slice(0, 8);

  const handleDateChange = (depart: string, ret: string) => {
    setCheckInDate(depart);
    // NU face fallback pe `depart` aici (era `ret || depart`) — asta bloca
    // alegerea datei de întoarcere: după primul click, checkOutDate devenea
    // egal cu checkInDate, iar DateRangePicker credea că intervalul e deja
    // complet și pornea un interval nou la fiecare click în loc să-l încheie.
    setCheckOutDate(ret);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (tab === 'hotels') {
      if (!selectedDest) {
        setError('Alege o destinație din listă.');
        return;
      }
      if (!checkInDate || !checkOutDate || checkOutDate <= checkInDate) {
        setError('Alege datele sejurului.');
        return;
      }

      // Rezultatele rămân mereu pe site-ul nostru: pentru orașele cu id
      // Agoda verificat afișăm cardurile noastre cu date live; pentru
      // restul, pagina de rezultate explică limitarea în loc să te scoată
      // pe agoda.com cu o potrivire ghicită (vezi CazareCautaPage.tsx).
      navigate('/cazare-cauta', {
        state: {
          agodaCityId: selectedDest.agodaCityId,
          destinationName: selectedDest.city,
          country: selectedDest.country,
          checkInDate,
          checkOutDate,
          adults,
          children,
        },
      });
      return;
    }

    if (tab === 'flights') {
      // The live flight search itself runs on /bilete via the Travelpayouts
      // widget already embedded there — that widget doesn't accept prefill
      // params, so this just gets the person to the right page.
      navigate('/bilete');
      return;
    }

    if (tab === 'last-minute') {
      navigate('/last-minute');
      return;
    }

    // cars
    navigate('/rent-a-car');
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-white/70 bg-[#fffdf8] p-4 shadow-[0_18px_50px_rgba(3,24,54,0.22)] sm:p-5">
      {/* Tabs */}
      <div className="mb-4 flex flex-wrap items-center justify-start gap-2 border-b border-slate-100 pb-4">
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          const tabStyle = TAB_STYLES[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => { setTab(key); setError(''); }}
              className={`group flex items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors ${
                active ? tabStyle.active : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                  active ? tabStyle.active : tabStyle.icon
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className={`text-xs font-semibold ${active ? 'text-slate-900' : 'text-slate-600'}`}>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-options row — only meaningful for flights */}
      {tab === 'flights' && (
        <div className="flex items-center gap-4 mb-3 text-sm">
          <button
            type="button"
            onClick={() => setOneWay((v) => !v)}
            className="font-semibold text-slate-700 hover:text-cta-600"
          >
            {oneWay ? 'Doar dus' : 'Dus-întors'} ⌄
          </button>
          <div className="flex items-center gap-1.5 text-slate-500">
            <Luggage className="h-4 w-4" />
            <select
              value={bags}
              onChange={(e) => setBags(Number(e.target.value))}
              className="bg-transparent font-medium text-slate-700 focus:outline-none"
            >
              {[0, 1, 2, 3].map((n) => <option key={n} value={n}>{n} {n === 1 ? 'bagaj' : 'bagaje'}</option>)}
            </select>
          </div>
        </div>
      )}

      {tab === 'last-minute' && (
        <div className="flex min-h-14 items-center justify-between gap-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
          <div>
            <p className="text-sm font-bold text-slate-800">Oferte de ultim moment</p>
            <p className="text-xs text-slate-500">Descoperă plecări avantajoase, actualizate de partenerii noștri.</p>
          </div>
          <Zap className="h-5 w-5 shrink-0 text-amber-500" />
        </div>
      )}

      {/* Fields row */}
      <div className="flex flex-col divide-y divide-[#dbe7e8] overflow-visible rounded-xl border border-[#cfe0e1] bg-white/80 sm:flex-row sm:divide-x sm:divide-y-0">
        {tab === 'hotels' && (
          <>
            <div ref={destWrapperRef} className="relative flex-[1.4] min-w-[200px]">
              <div className="flex items-center gap-2.5 px-4 h-14">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <label className="block text-[11px] font-medium text-slate-500 leading-tight">Destinație</label>
                  <input
                    type="text"
                    value={destQuery}
                    onFocus={() => { setDestOpen(true); preloadWorldCities(); }}
                    onChange={(e) => { setDestQuery(e.target.value); setSelectedDest(null); setDestOpen(true); }}
                    placeholder="Orice oraș din lume"
                    className="block w-full truncate text-sm font-semibold text-slate-800 bg-transparent focus:outline-none placeholder:font-normal placeholder:text-slate-400"
                    autoComplete="off"
                  />
                </div>
              </div>
              {destOpen && (
                <div className="absolute z-30 mt-1 left-0 right-0 max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                  {filteredDestinations.length > 0 ? filteredDestinations.map((d) => (
                    <button
                      key={`${d.city}-${d.country}`}
                      type="button"
                      onClick={() => { setSelectedDest(d); setDestQuery(d.city); setDestOpen(false); setError(''); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-brand-50 flex items-center justify-between gap-2"
                    >
                      <span className="text-sm font-medium text-slate-800">{d.city}</span>
                      <span className="text-xs text-slate-400">{d.country}</span>
                    </button>
                  )) : (
                    <p className="px-4 py-3 text-sm text-slate-400">
                      {destQuery.trim().length < 3 ? 'Scrie cel puțin 3 litere.' : 'Niciun oraș găsit.'}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-[220px]">
              <DateRangePicker departDate={checkInDate} returnDate={checkOutDate} onChange={handleDateChange} />
            </div>

            <GuestsPicker adults={adults} children={children} onChange={(a, c) => { setAdults(a); setChildren(c); }} />
          </>
        )}

        {tab === 'flights' && (
          <>
            <div className="flex-1 min-w-[160px] flex items-center gap-2.5 px-4 h-14">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <label className="block text-[11px] font-medium text-slate-500 leading-tight">De unde?</label>
                <select value={fromCity} onChange={(e) => setFromCity(e.target.value)} className="block w-full text-sm font-semibold text-slate-800 bg-transparent focus:outline-none">
                  {DEPARTURE_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-center px-1 sm:px-0">
              <span className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400">
                <ArrowLeftRight className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="flex-1 min-w-[160px] flex items-center gap-2.5 px-4 h-14">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <label className="block text-[11px] font-medium text-slate-500 leading-tight">Spre unde?</label>
                <input
                  type="text"
                  value={toQuery}
                  onChange={(e) => setToQuery(e.target.value)}
                  placeholder="Orice destinație"
                  className="block w-full text-sm font-semibold text-slate-800 bg-transparent focus:outline-none placeholder:font-normal placeholder:text-slate-400"
                />
              </div>
            </div>
            <div className="flex-1 min-w-[220px]">
              <DateRangePicker departDate={checkInDate} returnDate={oneWay ? '' : checkOutDate} onChange={handleDateChange} />
            </div>
            <GuestsPicker adults={adults} children={children} onChange={(a, c) => { setAdults(a); setChildren(c); }} />
          </>
        )}

        {tab === 'cars' && (
          <>
            <div className="flex-1 min-w-[200px] flex items-center gap-2.5 px-4 h-14">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <label className="block text-[11px] font-medium text-slate-500 leading-tight">Locație ridicare</label>
                <select value={fromCity} onChange={(e) => setFromCity(e.target.value)} className="block w-full text-sm font-semibold text-slate-800 bg-transparent focus:outline-none">
                  {DEPARTURE_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex-1 min-w-[220px]">
              <DateRangePicker departDate={checkInDate} returnDate={checkOutDate} onChange={handleDateChange} />
            </div>
          </>
        )}

        <button type="submit" className="btn-primary rounded-none sm:rounded-r-xl px-6 h-14 sm:h-auto shrink-0">
          <Search className="h-5 w-5" />
          CAUTĂ
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-error-600">{error}</p>}
    </form>
  );
}
