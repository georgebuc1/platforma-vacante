import { useState } from 'react';
import { Car, Check, MapPin, Search, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import OffersPage from '@/pages/OffersPage';

const DISCOVER_CARS_SEARCH_URL = 'https://www.discovercars.com/uk/search/7fad73db-5aeb-471a-b755-e935fc0f30f0';
const DISCOVER_CARS_LOCATION_ID = 1669;
const DISCOVER_CARS_AFFILIATE_ID = 'georgebuc1';
const DISCOVER_CARS_CAMPAIGN_ID = '65100b9c';

function formatDiscoverDate(value: string, time: string) {
  return `${value}T${time}:00`;
}

function buildDiscoverCarsLink(pickupDate: string, dropoffDate: string, driverAge: number) {
  const search = {
    PickupLocationId: DISCOVER_CARS_LOCATION_ID,
    DropOffLocationId: DISCOVER_CARS_LOCATION_ID,
    PickupDateTime: formatDiscoverDate(pickupDate, '11:00'),
    DropOffDateTime: formatDiscoverDate(dropoffDate, '11:00'),
    ResidenceCountry: 'RO',
    DriverAge: driverAge,
    Hash: '',
  };
  const encodedSearch = window.btoa(JSON.stringify(search));
  const params = new URLSearchParams({
    sq: encodedSearch,
    searchVersion: '2',
    a_aid: DISCOVER_CARS_AFFILIATE_ID,
    a_cid: DISCOVER_CARS_CAMPAIGN_ID,
  });
  return `${DISCOVER_CARS_SEARCH_URL}?${params.toString()}`;
}

export default function RentACarPage() {
  const [pickupDate, setPickupDate] = useState('');
  const [dropoffDate, setDropoffDate] = useState('');
  const [driverAge, setDriverAge] = useState(35);
  const [error, setError] = useState('');

  return (
    <>
      <section className="bg-navy-600 dark:bg-navy-900">
        <div className="container-page py-10 sm:py-14">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-200">
              Car rental, fără complicații
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Găsește mașina potrivită pentru călătoria ta
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-navy-100 sm:text-base">
              Comparăm opțiunile disponibile la destinație și îți prezentăm
              clar prețul, condițiile și furnizorul înainte de rezervare.
            </p>
          </div>

          <form
            className="mt-8 rounded-2xl bg-white p-4 shadow-card-hover sm:p-5"
            onSubmit={(event) => {
              event.preventDefault();
              if (!pickupDate || !dropoffDate || dropoffDate <= pickupDate) {
                setError('Alege o perioadă validă pentru închiriere.');
                return;
              }
              setError('');
              window.location.assign(buildDiscoverCarsLink(pickupDate, dropoffDate, driverAge));
            }}
          >
            <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_0.8fr_auto]">
              <label className="rounded-xl border border-slate-200 px-4 py-3">
                <span className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                  <MapPin className="h-4 w-4 text-brand-500" /> Locație preluare
                </span>
                <input
                  required
                  defaultValue="Aeroport Henri Coandă (OTP)"
                  readOnly
                  className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-400"
                />
              </label>
              <label className="rounded-xl border border-slate-200 px-4 py-3">
                <span className="text-[11px] font-semibold text-slate-500">Preluare</span>
                <input required type="date" value={pickupDate} onChange={(event) => setPickupDate(event.target.value)} className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-800 outline-none" />
              </label>
              <label className="rounded-xl border border-slate-200 px-4 py-3">
                <span className="text-[11px] font-semibold text-slate-500">Returnare</span>
                <input required type="date" value={dropoffDate} onChange={(event) => setDropoffDate(event.target.value)} className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-800 outline-none" />
              </label>
              <label className="rounded-xl border border-slate-200 px-4 py-3">
                <span className="text-[11px] font-semibold text-slate-500">Vârsta șoferului</span>
                <select value={driverAge} onChange={(event) => setDriverAge(Number(event.target.value))} className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-800 outline-none">
                  {[21, 25, 30, 35, 65].map((age) => <option key={age} value={age}>{age} ani</option>)}
                </select>
              </label>
              <button type="submit" className="btn-primary min-h-14 px-5">
                <Search className="h-5 w-5" />
                Vezi mașinile
              </button>
            </div>
            {error && <p className="mt-3 text-xs font-semibold text-error-600">{error}</p>}
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-500" /> Preț total transparent</span>
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-500" /> Furnizor verificat</span>
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-500" /> Fără taxe ascunse</span>
            </div>
          </form>
        </div>
      </section>

      <section className="container-page py-8 sm:py-10">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: SlidersHorizontal, title: 'Compari ușor', text: 'Filtre pentru preț, categorie, cutie și condiții.' },
            { icon: ShieldCheck, title: 'Condiții clare', text: 'Vezi depozitul, kilometrii și politica de combustibil.' },
            { icon: Car, title: 'Alegi informat', text: 'Rezervi la partener după ce vezi toate detaliile.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-5">
              <Icon className="h-5 w-5 text-brand-500" />
              <h2 className="mt-3 font-bold text-slate-900 dark:text-white">{title}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <OffersPage
        presetFilters={{ transport_type: 'masina' }}
        pageTitle="Rent a car"
        pageSubtitle="Închirieri auto pentru vacanța ta, la destinație."
        emptyTitle="Pregătim primele oferte auto."
        emptyMessage="În curând vei putea compara mașini și condiții reale direct în Vacanța Mea."
      />
    </>
  );
}
