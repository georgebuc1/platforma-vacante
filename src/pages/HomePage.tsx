import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  ArrowRight,
  Search,
  Filter,
  Compass,
  Star,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import SearchForm from '@/components/search/SearchForm';
import OfferCard from '@/components/offers/OfferCard';
import { getOffers } from '@/services/storageService';
import { sortOffers } from '@/utils/filters';
import type { Offer } from '@/types';

const STEPS = [
  {
    icon: Search,
    number: '01',
    title: 'Spune-ne ce cauți',
    description:
      'Alege orașul de plecare, bugetul, perioada și tipul de vacanță.',
  },
  {
    icon: Filter,
    number: '02',
    title: 'Filtrăm pentru tine',
    description:
      'Analizăm ofertele disponibile și îți afișăm variantele potrivite.',
  },
  {
    icon: Compass,
    number: '03',
    title: 'Alege vacanța',
    description:
      'Compară ofertele și mergi mai departe către furnizorul potrivit.',
  },
];

export default function HomePage() {
  const [popularOffers, setPopularOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOffers()
      .then((offers) => {
        const active = offers.filter((o) => o.status === 'active');
        setPopularOffers(sortOffers(active, 'recommended').slice(0, 6));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white dark:bg-slate-950">

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">

        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-brand-100/60 blur-3xl dark:bg-brand-900/20" />

          <div className="absolute top-56 -left-32 h-[320px] w-[320px] rounded-full bg-accent-100/40 blur-3xl dark:bg-accent-900/10" />

          <div className="absolute bottom-0 left-1/2 h-40 w-[600px] -translate-x-1/2 rounded-full bg-brand-100/20 blur-3xl dark:bg-brand-900/10" />
        </div>

        <div className="container-page relative py-12 sm:py-16 lg:py-20">

          {/* Hero text */}
          <div className="mx-auto max-w-4xl text-center">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-4 py-2 text-sm font-semibold text-brand-700 shadow-sm backdrop-blur dark:border-brand-800 dark:bg-slate-900/80 dark:text-brand-300">
              <Star className="h-4 w-4 fill-brand-500 text-brand-500" />
              <span>Găsește mai mult. Cheltuiește mai puțin.</span>
            </div>

            <h1 className="animate-slide-up text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl xl:text-7xl dark:text-white">
              VACANȚĂ ÎN{' '}
              <span className="text-brand-600 dark:text-brand-400">
                BANII TĂI!
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
              Spune-ne de unde pleci, cât vrei să cheltuiești și când vrei să
              călătorești. Noi îți găsim variantele care se potrivesc bugetului
              tău.
            </p>

          </div>

          {/* Search box */}
          <div className="relative z-10 mx-auto mt-8 max-w-6xl animate-fade-in sm:mt-10">
            <SearchForm />
          </div>

          {/* Trust indicators */}
          <div className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-medium text-slate-500 dark:text-slate-400">

            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-brand-500" />
              Fără costuri ascunse
            </span>

            <span className="hidden h-4 w-px bg-slate-200 sm:block dark:bg-slate-700" />

            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-brand-500" />
              Căutare simplă și rapidă
            </span>

            <span className="hidden h-4 w-px bg-slate-200 sm:block dark:bg-slate-700" />

            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-accent-500" />
              Oferte selectate
            </span>

          </div>
        </div>
      </section>


      {/* =========================================================
          RECOMMENDED OFFERS
      ========================================================= */}
      <section className="container-page py-14 sm:py-16 lg:py-20">

        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <div className="mb-2 text-sm font-bold uppercase tracking-wide text-brand-600 dark:text-brand-400">
              Descoperă
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
              Oferte care merită văzute
            </h2>

            <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base dark:text-slate-400">
              Am selectat câteva dintre cele mai interesante variante
              disponibile.
            </p>
          </div>

          <Link
            to="/oferte"
            className="group inline-flex items-center gap-2 self-start text-sm font-bold text-brand-600 transition-colors hover:text-brand-700 sm:self-auto dark:text-brand-400 dark:hover:text-brand-300"
          >
            Vezi toate ofertele
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>

        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>
        ) : popularOffers.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {popularOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Momentan nu există oferte disponibile.
            </p>
          </div>
        )}

      </section>


      {/* =========================================================
          HOW IT WORKS
      ========================================================= */}
      <section className="border-y border-slate-100 bg-slate-50/70 py-14 sm:py-16 lg:py-20 dark:border-slate-800 dark:bg-slate-900/60">

        <div className="container-page">

          <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">

            <div className="mb-2 text-sm font-bold uppercase tracking-wide text-brand-600 dark:text-brand-400">
              Simplu
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
              Cum funcționează?
            </h2>

            <p className="mt-2 text-sm text-slate-500 sm:text-base dark:text-slate-400">
              Trei pași simpli până la vacanța potrivită.
            </p>

          </div>


          <div className="grid gap-5 md:grid-cols-3">

            {STEPS.map((step) => (
              <div
                key={step.number}
                className="group relative rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950"
              >

                <div className="flex items-start justify-between">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                    <step.icon className="h-6 w-6" />
                  </div>

                  <span className="text-3xl font-extrabold text-slate-100 dark:text-slate-800">
                    {step.number}
                  </span>

                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {step.description}
                </p>

              </div>
            ))}

          </div>

        </div>
      </section>


      {/* =========================================================
          ALERT CTA
      ========================================================= */}
      <section className="container-page py-14 sm:py-16 lg:py-20">

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-600 to-brand-700 px-6 py-12 text-center shadow-xl sm:px-12 sm:py-16">

          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

          <div className="relative mx-auto max-w-2xl">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur mb-5">
              <Bell className="h-7 w-7" />
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Nu vrei să cauți în fiecare zi?
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-brand-50 sm:text-base">
              Creează o alertă și te anunțăm când apare o ofertă care se
              potrivește criteriilor tale.
            </p>

            <Link
              to="/alerte"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-bold text-brand-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-brand-50 hover:shadow-xl"
            >
              <Bell className="h-5 w-5" />
              CREEAZĂ O ALERTĂ
            </Link>

          </div>
        </div>

      </section>


      {/* =========================================================
          FINAL VALUE STRIP
      ========================================================= */}
      <section className="border-t border-slate-100 bg-white py-8 dark:border-slate-800 dark:bg-slate-950">

        <div className="container-page">

          <div className="flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:gap-8">

            <span className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <ShieldCheck className="h-4 w-4 text-brand-500" />
              Transparent
            </span>

            <span className="hidden h-4 w-px bg-slate-200 sm:block dark:bg-slate-800" />

            <span className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <Search className="h-4 w-4 text-brand-500" />
              Simplu
            </span>

            <span className="hidden h-4 w-px bg-slate-200 sm:block dark:bg-slate-800" />

            <span className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <HeartIcon />
              Util
            </span>

          </div>

        </div>
      </section>

    </div>
  );
}


/* Small reusable heart icon */
function HeartIcon() {
  return (
    <svg
      className="h-4 w-4 text-brand-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}