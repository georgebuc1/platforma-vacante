import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ArrowRight, Search, Filter, Compass, Star } from 'lucide-react';
import SearchForm from '@/components/search/SearchForm';
import OfferCard from '@/components/offers/OfferCard';
import { getOffers } from '@/services/storageService';
import { sortOffers } from '@/utils/filters';
import type { Offer } from '@/types';

const STEPS = [
  { icon: Search, title: 'Spune-ne ce cauți', description: 'Alege bugetul, perioada și preferințele tale.' },
  { icon: Filter, title: 'Noi filtrăm ofertele', description: 'Găsim variantele care se potrivesc criteriilor tale.' },
  { icon: Compass, title: 'Alege vacanța potrivită', description: 'Compară variantele și verifică oferta furnizorului.' },
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
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-100/50 blur-3xl" />
          <div className="absolute top-40 -left-24 h-72 w-72 rounded-full bg-accent-100/40 blur-3xl" />
        </div>
        <div className="container-page relative py-12 sm:py-16 lg:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-4 py-1.5 text-sm font-semibold text-brand-700 mb-6 animate-fade-in">
              <Star className="h-4 w-4 fill-brand-500 text-brand-500" />
              Platformă românească de găsire a vacanțelor
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight animate-slide-up">
              VACANȚĂ ÎN <span className="text-brand-600">BANII TĂI!</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto animate-slide-up">
              Spune-ne de unde pleci, cât vrei să cheltuiești și când vrei să călătorești. Îți arătăm vacanțele care se potrivesc bugetului tău.
            </p>
          </div>
          <div className="mt-8 max-w-5xl mx-auto animate-fade-in">
            <SearchForm />
          </div>
        </div>
      </section>

      {/* POPULAR OFFERS */}
      <section className="container-page py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Oferte care merită văzute</h2>
          <p className="mt-2 text-slate-500">Am selectat câteva dintre cele mai interesante variante disponibile.</p>
        </div>
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-slate-100 animate-pulse h-80" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {popularOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}
        <div className="text-center mt-10">
          <Link to="/oferte" className="btn-secondary">
            Vezi toate ofertele <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white border-y border-slate-100 py-16">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Cum funcționează</h2>
            <p className="mt-2 text-slate-500">Trei pași simpli până la vacanța ta.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 mb-4">
                  <step.icon className="h-8 w-8" />
                </div>
                <div className="text-sm font-bold text-brand-500 mb-1">Pasul {idx + 1}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ALERT CTA */}
      <section className="container-page py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700 px-6 py-12 sm:px-12 sm:py-16 text-center">
          <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur text-white mb-5">
              <Bell className="h-7 w-7" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Nu vrei să cauți în fiecare zi?</h2>
            <p className="mt-3 text-brand-50 max-w-xl mx-auto">
              Creează o alertă și te anunțăm când apare o ofertă care se potrivește criteriilor tale.
            </p>
            <Link
              to="/alerte"
              className="inline-flex items-center gap-2 mt-6 rounded-xl bg-white px-6 py-3.5 font-bold text-brand-700 hover:bg-brand-50 transition-colors shadow-lg"
            >
              <Bell className="h-5 w-5" />
              CREEAZĂ O ALERTĂ
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
