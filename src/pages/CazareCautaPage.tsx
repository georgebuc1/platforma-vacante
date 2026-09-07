import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Loader2, Star, Coffee, ExternalLink, AlertTriangle, ChevronLeft, MapPinOff } from 'lucide-react';
import { agodaService } from '@/services/agodaService';
import { transformAgodaResultsToOffers } from '@/utils/agodaTransformer';
import { formatPrice, formatDate } from '@/utils/pricing';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { DESTINATIONS } from '@/data/destinations';
import type { Offer } from '@/types';

interface LocationState {
  agodaCityId?: number;
  destinationName: string;
  country: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
}

// Destinații pentru care avem deja căutare live, sugerate ca alternativă
// atunci când orașul ales încă nu are un id Agoda verificat.
const LIVE_ALTERNATIVES = DESTINATIONS.filter((d) => d.agodaCityId);

export default function CazareCautaPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | undefined;

  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useDocumentMeta(
    state ? `Cazări în ${state.destinationName}` : 'Căutare cazare',
    'Rezultate live de cazare de la Agoda pentru destinația și datele alese.'
  );

  useEffect(() => {
    if (!state) {
      navigate('/', { replace: true });
      return;
    }

    // Fără un id Agoda verificat pentru orașul ăsta nu putem apela căutarea
    // live (API-ul Agoda cere obligatoriu un id numeric de oraș) — afișăm
    // direct mesajul de mai jos, fără să mai încercăm un apel API.
    if (!state.agodaCityId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');

    agodaService
      .searchCity({
        cityId: state.agodaCityId,
        checkInDate: state.checkInDate,
        checkOutDate: state.checkOutDate,
        numberOfAdult: state.adults,
        numberOfChildren: state.children,
        maxResult: 24,
        sortBy: 'PriceAsc',
      })
      .then((hotels) => {
        if (cancelled) return;
        const transformed = transformAgodaResultsToOffers(hotels, {
          destination: state.destinationName,
          country: state.country,
          checkInDate: state.checkInDate,
          checkOutDate: state.checkOutDate,
          numberOfPeople: state.adults + state.children,
        });
        setOffers(transformed);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Căutarea a eșuat.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [state, navigate]);

  if (!state) return null;

  return (
    <div className="container-page py-8 sm:py-10">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-cta-600 mb-4">
        <ChevronLeft className="h-4 w-4" />
        Înapoi
      </Link>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
        Cazări în {state.destinationName}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {formatDate(state.checkInDate)} — {formatDate(state.checkOutDate)} · {state.adults} {state.adults === 1 ? 'adult' : 'adulți'}
        {state.children ? `, ${state.children} ${state.children === 1 ? 'copil' : 'copii'}` : ''}
      </p>

      {!state.agodaCityId && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <MapPinOff className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
            <div>
              <p className="font-semibold text-slate-800">
                Nu avem încă rezultate live pentru {state.destinationName}.
              </p>
              <p className="mt-1.5 text-sm text-slate-500">
                Căutarea live e disponibilă deocamdată doar pentru destinațiile de mai jos — le extindem constant.
              </p>
            </div>
          </div>

          {LIVE_ALTERNATIVES.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {LIVE_ALTERNATIVES.map((d) => (
                <button
                  key={d.iata}
                  type="button"
                  onClick={() =>
                    navigate('/cazare-cauta', {
                      state: {
                        agodaCityId: d.agodaCityId,
                        destinationName: d.city,
                        country: d.country,
                        checkInDate: state.checkInDate,
                        checkOutDate: state.checkOutDate,
                        adults: state.adults,
                        children: state.children,
                      },
                    })
                  }
                  className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 hover:border-cta-500 hover:text-cta-600 transition-colors"
                >
                  {d.city}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {state.agodaCityId && loading && (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-cta-500" />
          <p className="text-sm">Căutăm cele mai bune oferte pe Agoda...</p>
        </div>
      )}

      {state.agodaCityId && !loading && error && (
        <div className="mt-8 flex items-start gap-3 rounded-xl border border-error-100 bg-error-50 p-5 text-sm text-error-700">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Nu am putut încărca rezultatele.</p>
            <p className="mt-1 text-error-600">{error}</p>
          </div>
        </div>
      )}

      {state.agodaCityId && !loading && !error && offers.length === 0 && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
          Nu am găsit cazări disponibile pentru această destinație și aceste date. Încearcă alte date.
        </div>
      )}

      {state.agodaCityId && !loading && !error && offers.length > 0 && (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => (
            <a
              key={offer.slug}
              href={offer.offer_url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="card overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img
                  src={offer.main_image_url}
                  alt={offer.hotel_name || offer.title}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col flex-1 p-4">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  {Array.from({ length: Math.round(offer.hotel_stars || 0) }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-accent-400 text-accent-400" />
                  ))}
                </div>
                <h3 className="mt-1 font-bold text-slate-900 line-clamp-2">{offer.hotel_name || offer.title}</h3>
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                  {offer.meal_type === 'mic_dejun' && (
                    <span className="flex items-center gap-1"><Coffee className="h-3.5 w-3.5" />Mic dejun inclus</span>
                  )}
                </div>
                <div className="mt-auto pt-4 flex items-end justify-between">
                  <div>
                    <div className="text-lg font-extrabold text-cta-600">
                      {formatPrice(offer.total_price, offer.currency)}
                    </div>
                    <div className="text-[11px] text-slate-400">total sejur</div>
                  </div>
                  <span className="flex items-center gap-1 text-sm font-semibold text-cta-600">
                    Vezi <ExternalLink className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
