import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, Clock, Plane, Hotel, UtensilsCrossed, Star, ExternalLink, Info, AlertTriangle, MapPin, CheckCircle2, Loader2, Building2, Luggage, Route, PlaneTakeoff, PlaneLanding } from 'lucide-react';
import { getOfferBySlug, trackClick } from '@/services/storageService';
import { formatPrice, formatDate } from '@/utils/pricing';
import { getBadge } from '@/utils/filters';
import { BOOKING_PROVIDER_NAME } from '@/utils/affiliate';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { TRIP_TYPE_LABELS } from '@/components/search/SearchForm';
import { showToast } from '@/components/common/Toast';
import type { MealType, TransportType, Offer } from '@/types';
import Lightbox from '@/components/offers/Lightbox';
import { buildIncludedItems, getStopsLabel } from '@/utils/offerDetails';

const BADGE_STYLES: Record<string, string> = {
  good: 'bg-success-100 text-success-700 dark:bg-success-950/40 dark:text-success-400',
  low: 'bg-accent-100 text-accent-700 dark:bg-accent-950/40 dark:text-accent-400',
  recommended: 'bg-brand-100 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400',
};

export default function OfferDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showRedirectMsg, setShowRedirectMsg] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); if (!slug) { setLoading(false); return; } getOfferBySlug(slug).then((value) => setOffer(value ?? null)).finally(() => setLoading(false)); }, [slug]);

  useDocumentMeta(
    offer ? `${offer.title} — ${offer.destination}` : 'Detalii ofertă',
    offer?.short_description || `Ofertă de vacanță în ${offer?.destination || ''}, ${offer?.country || ''}. Vezi prețul și detaliile complete.`
  );

  if (loading) return <div className="container-page py-16"><div className="flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div></div>;
  if (!offer) return <div className="container-page py-16 text-center"><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Oferta nu a fost găsită</h1><Link to="/oferte" className="btn-primary mt-6 inline-flex">Înapoi la oferte</Link></div>;

  const gallery = [offer.main_image_url, ...(offer.gallery_images || [])].filter(Boolean);
  const badge = getBadge(offer);
  const tripTypeLabel = offer.trip_types?.[0] ? TRIP_TYPE_LABELS[offer.trip_types[0]] || '' : '';
  const price = offer.total_price || 0;
  const includedItems = buildIncludedItems(offer);
  const mealLabels: Record<MealType, string> = { fara_masa: 'Fără masă', mic_dejun: 'Mic dejun', demipensiune: 'Demipensiune', pensiune_completa: 'Pensiune completă', all_inclusive: 'All Inclusive' ,ultra_all_inclusive: 'Ultra All Inclusive', };
  const transportLabels: Record<TransportType, string> = { avion: 'Avion', autocar: 'Autocar', masina: 'Mașină', tren: 'Tren', avion_transfer: 'Avion + transfer' };
  const previousImage = () => setActiveImage((current) => current === 0 ? gallery.length - 1 : current - 1);
  const nextImage = () => setActiveImage((current) => current === gallery.length - 1 ? 0 : current + 1);
  const handleVerifyOffer = () => { trackClick(offer.id, offer.slug, 'check_offer'); setShowRedirectMsg(true); if (offer.offer_url && offer.offer_url !== '#') window.open(offer.offer_url, '_blank', 'noopener,noreferrer'); else showToast('Link-ul furnizorului nu este disponibil momentan.', 'error'); };

  return <div className="container-page py-8">
    <div className="mb-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><Link to="/" className="hover:text-brand-600">Acasă</Link><ChevronRight className="h-4 w-4" /><Link to="/oferte" className="hover:text-brand-600">Oferte</Link><ChevronRight className="h-4 w-4" /><span className="truncate text-slate-700 dark:text-slate-300">{offer.destination}</span></div>

    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="min-w-0">
        <div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-slate-100 shadow-sm dark:bg-slate-800">
            <img src={gallery[activeImage] || ''} alt={`${offer.title} - ${offer.destination}`} className="h-full w-full cursor-zoom-in object-cover" onClick={() => gallery.length > 0 && setLightboxOpen(true)} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent p-5 sm:p-7 pointer-events-none"><div className="max-w-2xl"><div className="flex items-center gap-2 text-sm font-semibold text-white/90"><MapPin className="h-4 w-4" />{offer.country}, {offer.destination}</div><h1 className="mt-1 text-2xl font-extrabold leading-tight text-white sm:text-4xl">{offer.title}</h1>{offer.short_description && <p className="mt-2 line-clamp-2 text-sm text-white/85 sm:text-base">{offer.short_description}</p>}</div></div>
            {gallery.length > 1 && <><button onClick={previousImage} aria-label="Imaginea anterioară" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-slate-700 shadow-lg hover:bg-white dark:bg-slate-900/90 dark:text-slate-200"><ChevronLeft className="h-5 w-5" /></button><button onClick={nextImage} aria-label="Imaginea următoare" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-slate-700 shadow-lg hover:bg-white dark:bg-slate-900/90 dark:text-slate-200"><ChevronRight className="h-5 w-5" /></button></>}
            {badge && <span className={`absolute left-4 top-4 badge shadow-sm ${BADGE_STYLES[badge.variant]}`}>{badge.label}</span>}
          </div>
          {gallery.length > 1 && <div className="mt-3 flex gap-3 overflow-x-auto pb-1">{gallery.map((img, idx) => <button key={idx} onClick={() => setActiveImage(idx)} className={`h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition ${activeImage === idx ? 'border-brand-500' : 'border-transparent opacity-70 hover:opacity-100'}`}><img src={img} alt={`Galerie ${idx + 1}`} className="h-full w-full object-cover" loading="lazy" /></button>)}</div>}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center gap-2 text-sm"><span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 font-bold text-brand-700 dark:bg-brand-950/40 dark:text-brand-300"><MapPin className="h-4 w-4" />{offer.country}, {offer.destination}</span>{tripTypeLabel && <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{tripTypeLabel}</span>}{offer.offer_score > 0 && <span className="inline-flex items-center gap-1.5 rounded-lg bg-navy-600 px-3 py-1.5 font-bold text-white"><Star className="h-4 w-4 fill-accent-400 text-accent-400" />{offer.offer_score.toFixed(1).replace('.', ',')}</span>}</div>
          <div className="text-xs text-slate-400">Verificată: {formatDate(offer.last_checked_at)}</div>
        </div>

        <div className="card mt-6 p-6"><h2 className="mb-3 text-lg font-bold">Despre această ofertă</h2><p className="leading-relaxed text-slate-600 dark:text-slate-300">{offer.full_description || offer.short_description || 'Descoperă această ofertă și bucură-te de o vacanță memorabilă la un preț atractiv.'}</p><div className="mt-4 flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-sm text-brand-700 dark:bg-brand-950/40 dark:text-brand-300"><Info className="mt-0.5 h-4 w-4 shrink-0" /><span>Oferta poate fi modificată de furnizor. Verifică întotdeauna disponibilitatea și prețul final înainte de rezervare.</span></div></div>

        <div className="card mt-6 p-6"><h2 className="mb-4 text-lg font-bold">Detalii călătorie</h2><div className="grid gap-5 sm:grid-cols-2">
          <DetailItem icon={Calendar} label="Plecare" value={formatDate(offer.departure_date)} />
          <DetailItem icon={Calendar} label="Întoarcere" value={formatDate(offer.return_date)} />
          <DetailItem icon={Clock} label="Durată" value={`${offer.duration_days} zile / ${offer.duration_nights || Math.max(0, offer.duration_days - 1)} nopți`} />
          <DetailItem icon={PlaneTakeoff} label="Plecare din" value={offer.departure_airport || offer.departure_city} />
          <DetailItem icon={Plane} label="Companie" value={offer.airline || 'Nespecificată'} />
          <DetailItem icon={Route} label="Escală" value={getStopsLabel(offer.stops)} />
          <DetailItem icon={Plane} label="Transport" value={transportLabels[offer.transport_type] || offer.transport_type} />
          {offer.meal_type && <DetailItem icon={UtensilsCrossed} label="Masă" value={mealLabels[offer.meal_type] || offer.meal_type} />}
        </div></div>

        <div className="card mt-6 p-6"><h2 className="mb-4 text-lg font-bold">Cazare</h2>{offer.accommodation_included ? <div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400"><Hotel className="h-6 w-6" /></div><div><h3 className="font-bold">{offer.hotel_name || 'Cazare inclusă'}</h3>{offer.hotel_stars && <div className="mt-1 flex items-center gap-1">{Array.from({ length: offer.hotel_stars }).map((_, i) => <Star key={i} className="h-4 w-4 fill-accent-500 text-accent-500" />)}</div>}{offer.number_of_nights ? <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{offer.number_of_nights} nopți incluse în pachet.</p> : null}</div></div> : <div className="flex items-center gap-3 rounded-xl border border-warning-100 bg-warning-50 p-4 text-sm text-warning-700 dark:border-warning-900/50 dark:bg-warning-950/30 dark:text-warning-300"><Building2 className="h-5 w-5 shrink-0" /><span><strong>Cazarea nu este inclusă.</strong> Prețul afișat se referă la componentele indicate în ofertă.</span></div>}</div>

        <div className="card mt-6 p-6"><h2 className="mb-4 text-lg font-bold">Ce este inclus</h2>{includedItems.length > 0 ? <div className="grid gap-3 sm:grid-cols-2">{includedItems.map((item, index) => <div key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-600 dark:text-success-400" /><span>{item}</span></div>)}</div> : <p className="text-sm text-slate-500 dark:text-slate-400">Componentele incluse nu sunt specificate complet pentru această ofertă.</p>}</div>

        {offer.is_affiliate_link && <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">Transparență: unele linkuri de pe această platformă sunt linkuri de afiliere. Putem primi un comision dacă alegi să rezervi printr-un astfel de link, fără cost suplimentar pentru tine.</div>}
      </div>

      <div className="lg:block"><div className="sticky top-24 space-y-4"><div className="card p-6"><h2 className="mb-4 text-lg font-bold">Prețul vacanței</h2><div className="flex items-end justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800"><div><div className="text-xs text-slate-500">Preț {offer.price_type === 'total' ? 'total' : 'per persoană'}</div><div className="mt-1 text-3xl font-extrabold text-brand-600 dark:text-brand-400">{formatPrice(price, offer.currency)}</div>{offer.price_type !== 'total' && <div className="text-xs text-slate-400">/ persoană</div>}</div><div className="text-right text-xs text-slate-500"><Luggage className="ml-auto h-5 w-5 text-brand-500" />{offer.currency}</div></div><button onClick={handleVerifyOffer} className="btn-primary mt-6 w-full">{offer.provider_name === BOOKING_PROVIDER_NAME ? 'VEZI PE BOOKING.COM' : 'VERIFICĂ OFERTA'}<ExternalLink className="h-5 w-5" /></button>{showRedirectMsg && <div className="mt-3 flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-700 dark:bg-brand-950/40 dark:text-brand-300"><Info className="mt-0.5 h-4 w-4 shrink-0" /><span>Vei fi redirecționat către furnizorul ofertei. Prețurile și disponibilitatea pot varia.</span></div>}<div className="mt-4 text-center text-xs text-slate-400">Furnizor: <span className="font-medium text-slate-600 dark:text-slate-300">{offer.provider_name}</span></div></div><div className="card p-4"><div className="mb-1 text-xs text-slate-500">Ultima verificare</div><div className="text-sm font-medium">{formatDate(offer.last_checked_at)}</div></div><div className="flex items-start gap-2 rounded-xl border border-warning-100 bg-warning-50 p-4 text-xs text-warning-700 dark:border-warning-900/50 dark:bg-warning-950/30 dark:text-warning-300"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span>Prețurile și disponibilitatea se pot modifica. Verifică întotdeauna prețul final înainte de rezervare.</span></div></div></div>
    </div>
    <Lightbox images={gallery} currentIndex={activeImage} isOpen={lightboxOpen} onClose={() => setLightboxOpen(false)} onPrev={previousImage} onNext={nextImage} />
  </div>;
}

function DetailItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) { return <div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400"><Icon className="h-4 w-4" /></div><div><div className="text-xs text-slate-400 dark:text-slate-500">{label}</div><div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{value}</div></div></div>; }
