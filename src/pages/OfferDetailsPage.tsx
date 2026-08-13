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
  Loader2,
} from 'lucide-react';

import { getOfferBySlug, trackClick } from '@/services/storageService';
import { formatPrice, formatDate, getOfferPrice } from '@/utils/pricing';
import { getBadge } from '@/utils/filters';
import { BOOKING_PROVIDER_NAME } from '@/utils/affiliate';
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
      .then((result) => setOffer(result ?? null))
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
    trackClick(offer.id, offer.slug, 'check_offer');
    setShowRedirectMsg(true);

    if (offer.offer_url) {
      window.open(offer.offer_url, '_blank', 'noopener,noreferrer');
    } else {
      showToast('Link-ul furnizorului nu este disponibil momentan.', 'error');
    }
  };

  const mealLabels: Record<MealType, string> = {
    fara_masa: 'Fără masă',
    mic_dejun: 'Mic dejun',
    demipensiune: 'Demipensiune',
    pensiune_completa: 'Pensiune completă',
    all_inclusive: 'All Inclusive',
  };

  const transportLabels: Record<TransportType, string> = {
    avion: 'Avion',
    autocar: 'Autocar',
    masina: 'Mașină',
    tren: 'Tren',
    avion_transfer: 'Avion + Transfer',
  };

  const price = getOfferPrice(offer);
  const priceLabel = offer.price_type === 'total' ? 'total' : '/ persoană';
  const groupTotal =
    offer.price_type === 'per_person' && offer.number_of_people && offer.number_of_people > 1
      ? price * offer.number_of_people
      : null;

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
  <div className="group relative aspect-[16/10] overflow-hidden rounded-3xl bg-slate-100 shadow-sm dark:bg-slate-800">
    <img
      src={gallery[activeImage]}
      alt={offer.title}
      className="h-full w-full cursor-zoom-in object-cover transition-transform duration-700 group-hover:scale-[1.015]"
      onClick={() => setLightboxOpen(true)}
      onError={(e) => {
        (e.target as HTMLImageElement).src =
          `https://placehold.co/1200x750/e2e8f0/64748b?text=${encodeURIComponent(
            offer.destination
          )}`;
      }}
    />

    {/* Subtle overlay */}
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

    {/* Badge */}
    {badge && (
      <span
        className={`absolute left-5 top-5 badge px-3 py-1.5 text-sm font-bold shadow-lg backdrop-blur-sm ${BADGE_STYLES[badge.variant]}`}
      >
        {badge.label}
      </span>
    )}

    {/* Image counter */}
    {gallery.length > 1 && (
      <div className="absolute bottom-4 left-4 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
        {activeImage + 1} / {gallery.length}
      </div>
    )}

    {/* View gallery */}
    <button
      onClick={() => setLightboxOpen(true)}
      className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-black/75"
    >
      Vezi fotografiile
    </button>

    {/* Navigation */}
    {gallery.length > 1 && (
      <>
        <button
          onClick={previousImage}
          aria-label="Imaginea anterioară"
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-slate-700 opacity-0 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-white group-hover:opacity-100 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          onClick={nextImage}
          aria-label="Imaginea următoare"
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-slate-700 opacity-0 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-white group-hover:opacity-100 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </>
    )}
  </div>

  {/* Thumbnails */}
  {gallery.length > 1 && (
    <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
      {gallery.map((img, idx) => (
        <button
          key={idx}
          onClick={() => setActiveImage(idx)}
          aria-label={`Vezi fotografia ${idx + 1}`}
          className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
            activeImage === idx
              ? 'border-brand-500 shadow-md shadow-brand-500/20'
              : 'border-transparent opacity-65 hover:opacity-100 dark:border-slate-700'
          }`}
        >
          <img
            src={img}
            alt={`Galerie ${idx + 1}`}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />

          {activeImage !== idx && (
            <div className="absolute inset-0 bg-black/10 transition hover:bg-transparent" />
          )}
        </button>
      ))}
    </div>
  )}
</div>

{/* Header */}
<div className="mt-7">
  {/* Destination */}
  <div className="flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-400">
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950/50">
      <MapPin className="h-4 w-4" />
    </div>

    <span>
      {offer.country}, {offer.destination}
    </span>
  </div>

  {/* Title + Score */}
  <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div className="min-w-0">
      <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        {offer.title}
      </h1>

      {offer.short_description && (
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-500 dark:text-slate-400">
          {offer.short_description}
        </p>
      )}
    </div>

    {/* Score */}
    <div className="flex shrink-0 items-center gap-2">
      <div className="flex items-center gap-1.5 rounded-xl bg-accent-50 px-3.5 py-2.5 dark:bg-accent-950/40">
        <Star className="h-5 w-5 fill-accent-500 text-accent-500" />

        <span className="text-lg font-extrabold text-accent-700 dark:text-accent-400">
          {(offer.offer_score || 0).toFixed(1).replace('.', ',')}
        </span>
      </div>

      {tripTypeLabel && (
        <span className="rounded-xl bg-slate-100 px-3.5 py-2.5 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
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
              {offer.full_description ||
                offer.short_description ||
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
<div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
  {/* Section header */}
  <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
        <Calendar className="h-5 w-5" />
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Detalii călătorie
        </h2>

        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Informații importante despre această vacanță
        </p>
      </div>
    </div>
  </div>

  {/* Details grid */}
  <div className="grid sm:grid-cols-2">
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

    {offer.duration_nights > 0 && (
      <DetailItem
        icon={Hotel}
        label="Nopți"
        value={`${offer.duration_nights} nopți`}
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

                {offer.accommodation_included && (
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    Cazarea este inclusă în prețul acestei oferte.
                  </p>
                )}
              </div>
            </div>
          </div>
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
        {priceLabel}
      </span>
    </div>

    {groupTotal && (
      <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Total pentru {offer.number_of_people} persoane:{' '}
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          {formatPrice(groupTotal, offer.currency)}
        </span>
      </div>
    )}

    {/* CTA */}
    <button
      onClick={handleVerifyOffer}
      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-cta-500 px-5 py-4 text-base font-extrabold text-white shadow-md shadow-cta-500/20 transition-all hover:bg-cta-400 hover:shadow-lg hover:shadow-cta-500/30 active:scale-[0.98]"
    >
      {offer.provider_name === BOOKING_PROVIDER_NAME
        ? 'VEZI PE BOOKING.COM'
        : 'VERIFICĂ OFERTA'}
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
    <div className="flex items-center gap-4 border-b border-slate-100 px-6 py-5 last:border-b-0 sm:nth-[odd]:border-r dark:border-slate-800">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
          {label}
        </div>

        <div className="mt-1 truncate text-sm font-bold text-slate-800 dark:text-slate-200">
          {value}
        </div>
      </div>
    </div>
  );
}