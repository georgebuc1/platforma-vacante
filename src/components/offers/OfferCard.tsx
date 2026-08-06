import { Link } from 'react-router-dom';
import { Calendar, Clock, Plane, Star, MapPin } from 'lucide-react';
import type { Offer } from '@/types';
import { formatPrice, formatDate, getOfferPrice } from '@/utils/pricing';
import { getBadge } from '@/utils/filters';
import { TRIP_TYPE_LABELS } from '@/components/search/SearchForm';
import { trackClick } from '@/services/storageService';
import ImageCarousel from './ImageCarousel';

interface OfferCardProps {
  offer: Offer;
}

const BADGE_STYLES: Record<string, string> = {
  good: 'bg-success-100 text-success-700',
  low: 'bg-accent-100 text-accent-700',
  recommended: 'bg-brand-100 text-brand-700',
};

export default function OfferCard({ offer }: OfferCardProps) {
  const badge = getBadge(offer);
  const price = getOfferPrice(offer);
  const tripTypeLabel = offer.trip_types?.[0] ? TRIP_TYPE_LABELS[offer.trip_types[0]] || '' : '';

  const handleClick = () => {
    trackClick(offer.id, offer.slug, 'view');
  };

  return (
    <Link
      to={`/oferte/${offer.slug}`}
      onClick={handleClick}
      className="group card overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 flex flex-col"
    >
      {/* Image */}
      {/* Image */}
<div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
  <ImageCarousel
    mainImage={offer.main_image_url}
    galleryImages={offer.gallery_images}
    alt={`${offer.destination}, ${offer.country}`}
  />

  {badge && (
    <span className={`absolute top-3 left-3 badge ${BADGE_STYLES[badge.variant]} shadow-sm`}>
      {badge.label}
    </span>
  )}

  <span className="absolute top-3 right-3 badge bg-white/95 text-slate-800 shadow-sm">
    <Star className="h-3 w-3 fill-accent-500 text-accent-500" />
    {(offer.offer_score || 0).toFixed(1).replace('.', ',')}
  </span>
</div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-center gap-1 text-xs font-semibold text-brand-600 mb-1">
          <MapPin className="h-3.5 w-3.5" />
          {offer.country}, {offer.destination}
        </div>

        <h3 className="font-bold text-slate-900 text-base leading-snug mb-3 line-clamp-2 group-hover:text-brand-700 transition-colors">
          {offer.title}
        </h3>

        {/* Info row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500 mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> {formatDate(offer.departure_date)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {offer.duration_days} zile
          </span>
          <span className="flex items-center gap-1">
            <Plane className="h-3.5 w-3.5" /> {offer.departure_city}
          </span>
          {tripTypeLabel && (
            <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
              {tripTypeLabel}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-end justify-between pt-3 border-t border-slate-100">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-slate-900">{formatPrice(price, offer.currency)}</span>
            </div>
            <span className="text-xs text-slate-400">/ persoană</span>
          </div>
          <span className="btn-primary text-sm px-4 py-2.5">
            Vezi oferta
          </span>
        </div>
      </div>
    </Link>
  );
}
