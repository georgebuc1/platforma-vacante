import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ChevronRight, Calendar, Clock, Plane, Hotel, UtensilsCrossed,
  Star, ExternalLink, Info, AlertTriangle, MapPin, CheckCircle2, Loader2,
} from 'lucide-react';
import { getOfferBySlug, trackClick } from '@/services/storageService';
import { formatPrice, formatDate } from '@/utils/pricing';
import { getBadge } from '@/utils/filters';
import { TRIP_TYPE_LABELS } from '@/components/search/SearchForm';
import { showToast } from '@/components/common/Toast';
import type { MealType, TransportType, Offer } from '@/types';

const MEAL_LABELS: Record<MealType, string> = {
  fara_masa: 'Fără masă', mic_dejun: 'Mic dejun', demipensiune: 'Demipensiune',
  pensiune_completa: 'Pensiune completă', all_inclusive: 'All-inclusive',
};

const TRANSPORT_LABELS: Record<TransportType, string> = {
  avion: 'Avion', autocar: 'Autocar', masina: 'Mașină', tren: 'Tren', avion_transfer: 'Avion + transfer',
};

const BADGE_STYLES: Record<string, string> = {
  good: 'bg-success-100 text-success-700',
  low: 'bg-accent-100 text-accent-700',
  recommended: 'bg-brand-100 text-brand-700',
};

export default function OfferDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [showRedirectMsg, setShowRedirectMsg] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!slug) { setLoading(false); return; }
    getOfferBySlug(slug).then((found) => {
      setOffer(found ?? null);
      setLoading(false);
      if (found) trackClick(found.id, found.slug, 'view');
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="container-page py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Oferta nu a fost găsită</h1>
        <p className="text-slate-500 mb-6">Este posibil ca această ofertă să fi expirat sau să fi fost ștearsă.</p>
        <Link to="/oferte" className="btn-primary">Înapoi la oferte</Link>
      </div>
    );
  }

  const badge = getBadge(offer);
  const gallery = offer.gallery_images?.length ? offer.gallery_images : [offer.main_image_url];

  const priceRows = [
    { label: 'Transport', value: offer.transport_price },
    { label: 'Cazare', value: offer.accommodation_price },
    { label: 'Bagaj', value: offer.baggage_price },
    { label: 'Transfer', value: offer.transfer_price },
    { label: 'Alte costuri', value: offer.other_costs },
  ];

  const handleCheckOffer = () => {
    trackClick(offer.id, offer.slug, 'check_offer');
    setShowRedirectMsg(true);
    window.open(offer.offer_url, '_blank', 'noopener,noreferrer');
    showToast('Vei fi redirecționat către furnizorul ofertei.', 'info');
  };

  return (
    <div className="container-page py-6">
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-5 flex-wrap">
        <Link to="/" className="hover:text-brand-600">Acasă</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/oferte" className="hover:text-brand-600">Oferte</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-700 font-medium truncate">{offer.destination}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery */}
          <div>
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100">
              <img
                src={gallery[activeImage]}
                alt={offer.title}
                className="h-full w-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/1200x750/e2e8f0/64748b?text=${encodeURIComponent(offer.destination)}`; }}
              />
              {badge && <span className={`absolute top-4 left-4 badge ${BADGE_STYLES[badge.variant]} shadow-sm`}>{badge.label}</span>}
            </div>
            {gallery.length > 1 && (
              <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                {gallery.map((img, idx) => (
                  <button key={idx} onClick={() => setActiveImage(idx)}
                    className={`h-20 w-28 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${activeImage === idx ? 'border-brand-500' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                    <img src={img} alt={`Galerie ${idx + 1}`} className="h-full w-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title + score */}
          <div>
            <div className="flex items-center gap-1 text-sm font-semibold text-brand-600 mb-1">
              <MapPin className="h-4 w-4" /> {offer.country}, {offer.destination}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{offer.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-accent-50 px-3 py-1.5 text-sm font-bold text-accent-700">
                <Star className="h-4 w-4 fill-accent-500 text-accent-500" />
                {(offer.offer_score || 0).toFixed(1).replace('.', ',')} / 10
              </span>
              {offer.trip_types.map((tt) => (
                <span key={tt} className="badge bg-slate-100 text-slate-600">{TRIP_TYPE_LABELS[tt] || tt}</span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Despre această ofertă</h2>
            <p className="text-slate-600 leading-relaxed">{offer.full_description || offer.short_description}</p>
            {offer.score_reason && (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-sm text-brand-700">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                <span><strong>De ce recomandăm:</strong> {offer.score_reason}</span>
              </div>
            )}
          </div>

          {/* Trip details */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Detalii călătorie</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailItem icon={Calendar} label="Data plecării" value={formatDate(offer.departure_date)} />
              <DetailItem icon={Calendar} label="Data întoarcerii" value={formatDate(offer.return_date)} />
              <DetailItem icon={Clock} label="Durata" value={`${offer.duration_days} zile / ${offer.duration_nights} nopți`} />
              <DetailItem icon={Plane} label="Transport" value={TRANSPORT_LABELS[offer.transport_type]} />
              {offer.airline && <DetailItem icon={Plane} label="Companie aeriană" value={offer.airline} />}
              {offer.stops && <DetailItem icon={Plane} label="Escale" value={offer.stops === 'direct' ? 'Zbor direct' : offer.stops === 'o_escala' ? 'O escală' : 'Mai multe escale'} />}
              <DetailItem icon={MapPin} label="Plecare din" value={offer.departure_city} />
            </div>
          </div>

          {/* Accommodation */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Cazare</h2>
            {offer.accommodation_included ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {offer.hotel_name && <DetailItem icon={Hotel} label="Hotel" value={offer.hotel_name} />}
                {offer.hotel_stars && <DetailItem icon={Star} label="Categorie" value={`${offer.hotel_stars}★`} />}
                {offer.number_of_nights && <DetailItem icon={Clock} label="Nopți" value={`${offer.number_of_nights} nopți`} />}
                {offer.meal_type && <DetailItem icon={UtensilsCrossed} label="Masă" value={MEAL_LABELS[offer.meal_type]} />}
              </div>
            ) : (
              <p className="text-slate-500">Cazarea nu este inclusă în acest pachet.</p>
            )}
          </div>
        </div>

        {/* Price sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="card p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Structură preț</h2>
              <div className="space-y-2.5">
                {priceRows.map((row) => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-slate-500">{row.label}</span>
                    <span className="font-medium text-slate-700">{formatPrice(row.value || 0, offer.currency)}</span>
                  </div>
                ))}
                <div className="border-t border-slate-100 pt-3 mt-3 flex justify-between items-baseline">
                  <span className="font-bold text-slate-900">TOTAL</span>
                  <div className="text-right">
                    <div className="text-2xl font-extrabold text-brand-600">{formatPrice(offer.total_price, offer.currency)}</div>
                    <div className="text-xs text-slate-400">/ persoană</div>
                  </div>
                </div>
              </div>
              <button onClick={handleCheckOffer} className="btn-primary w-full mt-5 text-base py-4">
                VERIFICĂ OFERTA <ExternalLink className="h-5 w-5" />
              </button>
              {showRedirectMsg && (
                <div className="mt-3 flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-700">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Vei fi redirecționat către furnizorul ofertei. Prețurile și disponibilitatea pot varia.</span>
                </div>
              )}
              <div className="mt-4 text-xs text-slate-400 text-center">
                Furnizor: <span className="font-medium text-slate-600">{offer.provider_name}</span>
              </div>
            </div>
            <div className="card p-4">
              <div className="text-xs text-slate-500 mb-1">Ultima verificare:</div>
              <div className="text-sm font-medium text-slate-700">{formatDate(offer.last_checked_at)}</div>
            </div>
            <div className="flex items-start gap-2 rounded-xl bg-warning-50 border border-warning-100 p-4 text-xs text-warning-700">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Prețurile și disponibilitatea se pot modifica. Verifică întotdeauna prețul final înainte de rezervare.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-xs text-slate-400">{label}</div>
        <div className="text-sm font-semibold text-slate-700">{value}</div>
      </div>
    </div>
  );
}
