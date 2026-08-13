import { Link } from 'react-router-dom';
import { Calendar, Clock, Plane, MapPin } from 'lucide-react';
import type { Offer } from '@/types';
import { formatPrice, formatDate, getOfferPrice } from '@/utils/pricing';
import { getBadge, getScoreLabel } from '@/utils/filters';
import { TRIP_TYPE_LABELS } from '@/components/search/SearchForm';
import { trackClick } from '@/services/storageService';
import ImageCarousel from './ImageCarousel';

interface OfferCardProps {
  offer: Offer;
}

const BADGE_STYLES: Record<string, string> = {
  good: `
    bg-success-100 text-success-700
    dark:bg-emerald-950/60 dark:text-emerald-300
    dark:border dark:border-emerald-800/50
  `,

  low: `
    bg-accent-100 text-accent-700
    dark:bg-orange-950/60 dark:text-orange-300
    dark:border dark:border-orange-800/50
  `,

  recommended: `
    bg-brand-100 text-brand-700
    dark:bg-blue-950/60 dark:text-blue-300
    dark:border dark:border-blue-800/50
  `,
};

export default function OfferCard({ offer }: OfferCardProps) {
  const badge = getBadge(offer);
  const price = getOfferPrice(offer);

  const tripTypeLabel = offer.trip_types?.[0]
    ? TRIP_TYPE_LABELS[offer.trip_types[0]] || ''
    : '';

  const handleClick = () => {
    trackClick(offer.id, offer.slug, 'view');
  };

  return (
    <Link
      to={`/oferte/${offer.slug}`}
      onClick={handleClick}
      className="
        group
        card
        overflow-hidden
        flex
        flex-col

        transition-all
        duration-300

        hover:-translate-y-1
        hover:shadow-card-hover

        dark:hover:border-slate-700
        dark:hover:shadow-2xl
      "
    >

      {/* =====================================================
          IMAGE
          ===================================================== */}

      <div
        className="
          relative
          aspect-[16/10]
          overflow-hidden

          bg-slate-100
          dark:bg-slate-900
        "
      >
        <ImageCarousel
          mainImage={offer.main_image_url}
          galleryImages={offer.gallery_images}
          alt={`${offer.destination}, ${offer.country}`}
        />

        {/* Badge */}

        {badge && (
          <span
            className={`
              absolute
              top-3
              left-3
              badge
              shadow-sm

              backdrop-blur-sm

              ${BADGE_STYLES[badge.variant]}
            `}
          >
            {badge.label}
          </span>
        )}

      </div>

      {/* =====================================================
          CONTENT
          ===================================================== */}

      <div
        className="
          flex
          flex-col
          flex-1
          p-4

          bg-white
          dark:bg-slate-900
        "
      >

        {/* Location */}

        <div
          className="
            flex
            items-center
            gap-1

            text-xs
            font-semibold

            text-brand-600
            dark:text-blue-400

            mb-1
          "
        >
          <MapPin className="h-3.5 w-3.5 shrink-0" />

          <span>
            {offer.country}, {offer.destination}
          </span>
        </div>

        {/* Title + Booking.com-style score badge */}

        <div className="mb-3 flex items-start justify-between gap-3">
          <h3
            className="
              font-bold
              text-base
              leading-snug
              line-clamp-2

              text-slate-900
              dark:text-slate-100

              group-hover:text-brand-700
              dark:group-hover:text-blue-400

              transition-colors
            "
          >
            {offer.title}
          </h3>

          {offer.offer_score > 0 && (
            <div className="flex shrink-0 items-center gap-1.5">
              <div className="text-right">
                <span className="block text-[11px] font-semibold leading-none text-slate-600 dark:text-slate-400">
                  {getScoreLabel(offer.offer_score)}
                </span>
              </div>

              <span
                className="
                  flex h-8 w-8 shrink-0
                  items-center justify-center
                  rounded-md rounded-br-none
                  bg-navy-600
                  text-sm font-extrabold text-white
                  dark:bg-navy-500
                "
              >
                {offer.offer_score.toFixed(1).replace('.', ',')}
              </span>
            </div>
          )}
        </div>

        {/* =================================================
            INFORMATION
            ================================================= */}

        <div
          className="
            flex
            flex-wrap
            gap-x-4
            gap-y-1.5

            text-xs

            text-slate-500
            dark:text-slate-400

            mb-4
          "
        >

          {/* Date */}

          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 shrink-0" />

            {formatDate(offer.departure_date)}
          </span>

          {/* Duration */}

          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 shrink-0" />

            {offer.duration_days} zile
          </span>

          {/* Departure */}

          <span className="flex items-center gap-1">
            <Plane className="h-3.5 w-3.5 shrink-0" />

            {offer.departure_city}
          </span>

          {/* Trip type */}

          {tripTypeLabel && (
            <span
              className="
                rounded-md
                px-2
                py-0.5
                font-medium

                bg-slate-100
                text-slate-600

                dark:bg-slate-800
                dark:text-slate-300
                dark:border
                dark:border-slate-700
              "
            >
              {tripTypeLabel}
            </span>
          )}
        </div>

        {/* =================================================
            FOOTER
            ================================================= */}

        <div
          className="
            mt-auto

            flex
            items-end
            justify-between

            pt-3

            border-t
            border-slate-100
            dark:border-slate-800
          "
        >

          {/* Price */}

          <div>

            <div className="flex items-baseline gap-1">

              <span
                className="
                  text-xl
                  font-extrabold

                  text-slate-900
                  dark:text-white
                "
              >
                {formatPrice(price, offer.currency)}
              </span>

            </div>

            <span
              className="
                text-xs

                text-slate-400
                dark:text-slate-500
              "
            >
              / persoană
            </span>

          </div>

          {/* CTA */}

          <span
            className="
              btn

              bg-cta-500
              text-white

              text-sm
              px-4
              py-2.5

              shadow-sm

              group-hover:bg-cta-400
              group-hover:shadow-md
            "
          >
            Vezi oferta
          </span>

        </div>
      </div>
    </Link>
  );
}