import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Plane,
  Hotel,
  UtensilsCrossed,
  Star,
  ExternalLink,
  Info,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

import { getOfferBySlug, trackClick } from '@/services/storageService';
import { formatPrice, formatDate } from '@/utils/pricing';
import { getBadge } from '@/utils/filters';
import { TRIP_TYPE_LABELS } from '@/components/search/SearchForm';
import { showToast } from '@/components/common/Toast';
import type { MealType, TransportType, Offer } from '@/types';
import Lightbox from '@/components/offers/Lightbox';

const BADGE_STYLES: Record<string, string> = {
  good: 'bg-success-100 text-success-700 dark:bg-success-950/40 dark:text-success-400',
  low: 'bg-accent-100 text-accent-700 dark:bg-accent-950/40 dark:text-accent-400',
  recommended:
    'bg-brand-100 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400',
};

export default function OfferDetailsPage() {
  const { slug } = useParams<{ slug: string }>();

  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showRedirectMsg, setShowRedirectMsg] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!slug) {
      setLoading(false);
      return;
    }

    getOfferBySlug(slug)
      .then(setOffer)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="container-page py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Oferta nu a fost găsită
        </h1>

        <Link
          to="/oferte"
          className="btn-primary mt-6 inline-flex"
        >
          Înapoi la oferte
        </Link>
      </div>
    );
  }

  const gallery = [
    offer.main_image_url,
    ...(offer.gallery_images || []),
  ].filter(Boolean);

  const badge = getBadge(offer);

  const tripTypeLabel = offer.trip_types?.[0]
    ? TRIP_TYPE_LABELS[offer.trip_types[0]] || ''
    : '';

  const previousImage = () => {
    setActiveImage((current) =>
      current === 0 ? gallery.length - 1 : current - 1
    );
  };

  const nextImage = () => {
    setActiveImage((current) =>
      current === gallery.length - 1 ? 0 : current + 1
    );
  };

  const handlePreviousImage = () => {
    previousImage();
  };

  const handleNextImage = () => {
    nextImage();
  };

  const handleVerifyOffer = () => {
    trackClick(offer.id, offer.slug, 'redirect');
    setShowRedirectMsg(true);

    if (offer.affiliate_url) {
      window.open(offer.affiliate_url, '_blank', 'noopener,noreferrer');
    } else {
      showToast('Link-ul furnizorului nu este disponibil momentan.', 'error');
    }
  };

  const mealLabels: Record<MealType, string> = {
    none: 'Fără masă',
    breakfast: 'Mic dejun',
    half_board: 'Demipensiune',
    full_board: 'Pensiune completă',
    all_inclusive: 'All Inclusive',
  };

  const transportLabels: Record<TransportType, string> = {
    flight: 'Avion',
    bus: 'Autocar',
    car: 'Mașină',
    train: 'Tren',
    ferry: 'Ferry',
    none: 'Fără transport inclus',
  };

  const price = offer.price_per_person || offer.price_total || 0;

  return (
    <div className="container-page py-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link
          to="/"
          className="hover:text-brand-600 dark:hover:text-brand-400"
        >
          Acasă
        </Link>

        <ChevronRight className="h-4 w-4" />

        <Link
          to="/oferte"
          className="hover:text-brand-600 dark:hover:text-brand-400"
        >
          Oferte
        </Link>

        <ChevronRight className="h-4 w-4" />

        <span className="truncate text-slate-700 dark:text-slate-300">
          {offer.destination}
        </span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Main content */}
        <div className="min-w-0">
          {/* Gallery */}
          <div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
              <img
                src={gallery[activeImage]}
                alt={offer.title}
                className="h-full w-full cursor-zoom-in object-cover"
                onClick={() => setLightboxOpen(true)}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    `https://placehold.co/1200x750/e2e8f0/64748b?text=${encodeURIComponent(
                      offer.destination
                    )}`;
                }}
              />

              {gallery.length > 1 && (
                <>
                  <button
                    onClick={previousImage}
                    aria-label="Imaginea anterioară"
                    className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-700 shadow-lg transition hover:bg-white dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <button
                    onClick={nextImage}
                    aria-label="Imaginea următoare"
                    className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-700 shadow-lg transition hover:bg-white dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {badge && (
                <span
                  className={`absolute left-4 top-4 badge shadow-sm ${BADGE_STYLES[badge.variant]}`}
                >
                  {badge.label}
                </span>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`h-20 w-28 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                      activeImage === idx
                        ? 'border-brand-500'
                        : 'border-transparent opacity-70 hover:opacity-100 dark:border-slate-700'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Galerie ${idx + 1}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Header */}
          <div className="mt-6">
            <div className="mb-1 flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-400">
              <MapPin className="h-4 w-4" />
              {offer.country}, {offer.destination}
            </div>

            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
                  {offer.title}
                </h1>

                {offer.subtitle && (
                  <p className="mt-2 text-slate-500 dark:text-slate-400">
                    {offer.subtitle}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-accent-50 px-3 py-1.5 text-sm font-bold text-accent-700 dark:bg-accent-950/40 dark:text-accent-400">
                  <Star className="h-4 w-4 fill-accent-500 text-accent-500" />
                  {(offer.offer_score || 0).toFixed(1).replace('.', ',')}
                </span>

                {tripTypeLabel && (
                  <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {tripTypeLabel}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* About */}
          <div className="card mt-6 p-6">
            <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-slate-100">
              Despre această ofertă
            </h2>

            <p className="leading-relaxed text-slate-600 dark:text-slate-300">
              {offer.description ||
                'Descoperă această ofertă și bucură-te de o vacanță memorabilă la un preț atractiv.'}
            </p>

            <div className="mt-4 flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-sm text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />

              <span>
                Oferta poate fi modificată de furnizor. Verifică întotdeauna
                disponibilitatea și prețul final înainte de rezervare.
              </span>
            </div>
          </div>

          {/* Trip details */}
          <div className="card mt-6 p-6">
            <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">
              Detalii călătorie
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">
              <DetailItem
                icon={Calendar}
                label="Plecare"
                value={formatDate(offer.departure_date)}
              />

              <DetailItem
                icon={Clock}
                label="Durată"
                value={`${offer.duration_days} zile`}
              />

              <DetailItem
                icon={Plane}
                label="Plecare din"
                value={offer.departure_city}
              />

              <DetailItem
                icon={Plane}
                label="Transport"
                value={
                  transportLabels[offer.transport_type as TransportType] ||
                  offer.transport_type ||
                  'Nespecificat'
                }
              />

              {offer.meal_type && (
                <DetailItem
                  icon={UtensilsCrossed}
                  label="Masă"
                  value={
                    mealLabels[offer.meal_type as MealType] ||
                    offer.meal_type
                  }
                />
              )}

              {offer.nights && (
                <DetailItem
                  icon={Hotel}
                  label="Nopți"
                  value={`${offer.nights} nopți`}
                />
              )}
            </div>
          </div>

          {/* Accommodation */}
          <div className="card mt-6 p-6">
            <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">
              Cazare
            </h2>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
                <Hotel className="h-6 w-6" />
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {offer.hotel_name || 'Cazare inclusă'}
                </h3>

                {offer.hotel_stars && (
                  <div className="mt-1 flex items-center gap-1">
                    {Array.from({ length: offer.hotel_stars }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-accent-500 text-accent-500"
                      />
                    ))}
                  </div>
                )}

                {offer.hotel_description && (
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {offer.hotel_description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Included */}
          {offer.included && offer.included.length > 0 && (
            <div className="card mt-6 p-6">
              <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">
                Ce este inclus
              </h2>

              <div className="grid gap-3 sm:grid-cols-2">
                {offer.included.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-600 dark:text-success-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:block">
          <div className="sticky top-24 space-y-4">
           {/* Price / Booking CTA */}
<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
  {/* Header */}
  <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800">
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Prețul vacanței
        </div>

        <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          Verifică prețul final la furnizor
        </div>
      </div>

      {badge && (
        <span
          className={`badge shadow-sm ${BADGE_STYLES[badge.variant]}`}
        >
          {badge.label}
        </span>
      )}
    </div>
  </div>

  {/* Price */}
  <div className="px-6 py-6">
    <div className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
      De la
    </div>

    <div className="mt-1 flex items-baseline gap-2">
      <span className="text-4xl font-extrabold tracking-tight text-brand-600 dark:text-brand-400">
        {formatPrice(price, offer.currency)}
      </span>

      <span className="text-sm text-slate-500 dark:text-slate-400">
        / persoană
      </span>
    </div>

    {offer.price_total && offer.price_total !== price && (
      <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Preț total:{' '}
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          {formatPrice(offer.price_total, offer.currency)}
        </span>
      </div>
    )}

    {/* CTA */}
    <button
      onClick={handleVerifyOffer}
      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-4 text-base font-extrabold text-white shadow-md shadow-brand-600/20 transition-all hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/30 active:scale-[0.98] dark:bg-brand-500 dark:hover:bg-brand-400"
    >
      VERIFICĂ OFERTA
      <ExternalLink className="h-5 w-5" />
    </button>

    <div className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">
      Verifică prețul și disponibilitatea actuală
    </div>

    {/* Redirect message */}
    {showRedirectMsg && (
      <div className="mt-4 flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-xs leading-relaxed text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />

        <span>
          Vei fi redirecționat către furnizorul ofertei. Prețurile și
          disponibilitatea pot varia.
        </span>
      </div>
    )}
  </div>

  {/* Provider */}
  <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/40">
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-slate-500 dark:text-slate-400">
        Furnizor
      </span>

      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
        {offer.provider_name}
      </span>
    </div>
  </div>
</div>

            {/* Last checked */}
            <div className="card p-4">
              <div className="mb-1 text-xs text-slate-500 dark:text-slate-400">
                Ultima verificare:
              </div>

              <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {formatDate(offer.last_checked_at)}
              </div>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2 rounded-xl border border-warning-100 bg-warning-50 p-4 text-xs text-warning-700 dark:border-warning-900/50 dark:bg-warning-950/30 dark:text-warning-300">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

              <span>
                Prețurile și disponibilitatea se pot modifica. Verifică
                întotdeauna prețul final înainte de rezervare.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <Lightbox
        images={gallery}
        currentIndex={activeImage}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onPrev={handlePreviousImage}
        onNext={handleNextImage}
      />
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        <Icon className="h-4 w-4" />
      </div>

      <div>
        <div className="text-xs text-slate-400 dark:text-slate-500">
          {label}
        </div>

        <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {value}
        </div>
      </div>
    </div>
  );
}