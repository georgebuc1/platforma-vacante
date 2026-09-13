import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Search,
  Filter,
  Compass,
  Star,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import TripSearchBar from '@/components/search/TripSearchBar';
import PopularToursSection from '@/components/widgets/PopularToursSection';
import OfferCard from '@/components/offers/OfferCard';
import { getOffers } from '@/services/storageService';
import { sortOffers } from '@/utils/filters';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
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
  useDocumentMeta(
    'Vacanță în banii tăi',
    'Găsește vacanța potrivită în funcție de buget, perioadă și preferințele tale. Comparăm oferte de la furnizori de încredere, inclusiv Booking.com.'
  );

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
          HERO — solid navy band, Booking.com style
      ========================================================= */}
      <section className="relative bg-navy-600 dark:bg-navy-900">

        <div className="container-page relative pt-12 pb-24 sm:pt-16 sm:pb-28 lg:pt-20 lg:pb-32">

          {/* Hero text */}
          <div className="max-w-3xl">

            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-200">
              Planifică mai simplu. Călătorește mai mult.
            </p>
            <h1 className="animate-slide-up text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Găsește-ți următoarea vacanță
            </h1>

          </div>
        </div>

        {/* Search box — overlaps the navy band and the white section below */}
        <div className="container-page relative z-10 -mt-16 pb-2 sm:-mt-20">
          <div className="mx-auto max-w-5xl animate-fade-in">
            <TripSearchBar />
          </div>

          {/* Trust indicators */}
          <div className="mx-auto mt-5 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-2 pb-2 text-xs font-medium text-navy-100">

            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-white" />
              Fără costuri ascunse
            </span>

            <span className="hidden h-4 w-px bg-white/20 sm:block" />

            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-white" />
              Căutare simplă și rapidă
            </span>

            <span className="hidden h-4 w-px bg-white/20 sm:block" />

            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-white" />
              Oferte selectate
            </span>

          </div>
        </div>
      </section>


      {/* =========================================================
          RECOMMENDED OFFERS
      ========================================================= */}
      <section className="container-page py-10 sm:py-12 lg:py-14">

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
          POPULAR TOURS (Klook widgets)
      ========================================================= */}
      <PopularToursSection />


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