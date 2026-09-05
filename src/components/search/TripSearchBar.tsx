import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, BedDouble, Car, Search, MapPin, Users, Minus, Plus, ArrowLeftRight, Luggage } from 'lucide-react';
import DateRangePicker from './DateRangePicker';
import { DESTINATIONS, type DestinationOption } from '@/data/destinations';
import { DEPARTURE_CITIES } from './SearchForm';
import { buildAgodaSearchFallbackUrl } from '@/utils/affiliate';

type Tab = 'flights' | 'hotels' | 'cars';

const TABS: { key: Tab; label: string; icon: typeof Plane }[] = [
  { key: 'flights', label: 'Bilete avion', icon: Plane },
  { key: 'hotels', label: 'Cazări', icon: BedDouble },
  { key: 'cars', label: 'Mașini', icon: Car },
];

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
  const [selectedDest, setSelectedDest] = useState<DestinationOption | null>(null);
  const [destOpen, setDestOpen] = useState(false);
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

  // Căutăm în TOATE destinațiile (nu doar cele cu agodaCityId verificat) —
  // altfel majoritatea orașelor din lume nu apăreau deloc în listă cât timp
  // erau scrise. Cele fără id verificat rămân alegibile, doar că trimit
  // căutarea direct pe agoda.com în loc de rezultatele live din pagină
  // (vezi handleSubmit mai jos și buildAgodaSearchFallbackUrl).
  const q = destQuery.trim().toLowerCase();
  const filteredDestinations = q
    ? DESTINATIONS.filter(
        (d) => d.city.toLowerCase().includes(q) || d.country.toLowerCase().includes(q)
      ).slice(0, 8)
    : DESTINATIONS.slice(0, 8);

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

      if (!selectedDest.agodaCityId) {
        // Nu avem un id Agoda verificat pentru orașul ăsta (Agoda nu oferă
        // un API public de căutare după nume — vezi buildAgodaSearchFallbackUrl),
        // așa că trimitem căutarea direct pe agoda.com, cu datele completate.
        window.open(
          buildAgodaSearchFallbackUrl({
            destinationName: `${selectedDest.city}, ${selectedDest.country}`,
            checkInDate,
            checkOutDate,
            adults,
            children,
          }),
          '_blank',
          'noopener,noreferrer'
        );
        return;
      }

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

    // cars
    navigate('/rent-a-car');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card-hover border border-slate-200 p-4 sm:p-5">
      {/* Tabs */}
      <div className="flex items-center gap-2 sm:gap-3 mb-4">
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => { setTab(key); setError(''); }}
              className="flex flex-col items-center gap-1.5 group"
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
                  active ? 'bg-cta-500 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className={`text-xs font-semibold ${active ? 'text-slate-900' : 'text-slate-500'}`}>{label}</span>
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

      {/* Fields row */}
      <div className="rounded-xl border border-slate-200 flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-200 overflow-visible">
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
                    onFocus={() => setDestOpen(true)}
                    onChange={(e) => { setDestQuery(e.target.value); setSelectedDest(null); setDestOpen(true); }}
                    placeholder="Unde vrei să mergi?"
                    className="block w-full truncate text-sm font-semibold text-slate-800 bg-transparent focus:outline-none placeholder:font-normal placeholder:text-slate-400"
                    autoComplete="off"
                  />
                </div>
              </div>
              {destOpen && (
                <div className="absolute z-30 mt-1 left-0 right-0 max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                  {filteredDestinations.length > 0 ? filteredDestinations.map((d) => (
                    <button
                      key={d.iata}
                      type="button"
                      onClick={() => { setSelectedDest(d); setDestQuery(d.city); setDestOpen(false); setError(''); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-brand-50 flex items-center justify-between gap-2"
                    >
                      <span className="text-sm font-medium text-slate-800">{d.city}</span>
                      <span className="text-xs text-slate-400">
                        {d.country}
                        {!d.agodaCityId && <span className="ml-1.5 italic">· pe Agoda.com</span>}
                      </span>
                    </button>
                  )) : (
                    <p className="px-4 py-3 text-sm text-slate-400">Niciun oraș găsit.</p>
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
