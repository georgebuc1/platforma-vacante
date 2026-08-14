import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Save, Eye, Send, Trash2, ArrowLeft, Loader2, RefreshCw, Wand2 } from 'lucide-react';
import { getOfferById, saveOffer, deleteOffer, getExistingSlugs } from '@/services/storageService';
import { deleteOfferImages } from '@/services/imageService';
import { showToast } from '@/components/common/Toast';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import ImageUploader from '@/components/admin/ImageUploader';
import { calculateTotalPrice, calculateDurationDays, calculateDurationNights } from '@/utils/pricing';
import { generateSlug, validateSlug, ensureUniqueSlug } from '@/utils/slugify';
import { DEPARTURE_CITIES, TRIP_TYPES } from '@/components/search/SearchForm';
import {
  BOOKING_PROVIDER_NAME,
  buildBookingAffiliateUrl,
  isBookingComUrl,
  getStoredAffiliateId,
  saveStoredAffiliateId,
} from '@/utils/affiliate';
import type {
  Offer, OfferStatus, Currency, PriceType, TransportType, MealType, StopsType, TripType,
} from '@/types';

const TRANSPORT_OPTIONS: { value: TransportType; label: string }[] = [
  { value: 'avion', label: 'Avion' }, { value: 'autocar', label: 'Autocar' },
  { value: 'masina', label: 'Mașină' }, { value: 'tren', label: 'Tren' },
  { value: 'avion_transfer', label: 'Avion + transfer' },
];
const MEAL_OPTIONS: { value: MealType; label: string }[] = [
  { value: 'fara_masa', label: 'Fără masă' }, { value: 'mic_dejun', label: 'Mic dejun' },
  { value: 'demipensiune', label: 'Demipensiune' }, { value: 'pensiune_completa', label: 'Pensiune completă' },
  { value: 'all_inclusive', label: 'All-inclusive' },
];
const STOPS_OPTIONS: { value: StopsType; label: string }[] = [
  { value: 'direct', label: 'Direct' }, { value: 'o_escala', label: 'O escală' },
  { value: 'mai_multe_escale', label: 'Mai multe escale' },
];
const STATUS_OPTIONS: { value: OfferStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' }, { value: 'active', label: 'Activă' },
  { value: 'expired', label: 'Expirată' }, { value: 'archived', label: 'Arhivată' },
];
const TRIP_TYPE_OPTIONS = TRIP_TYPES.filter((t) => t.value !== 'orice') as { value: TripType; label: string }[];

function emptyOffer(): Offer {
  const now = new Date().toISOString().slice(0, 10);
  return {
    id: '', title: '', slug: '', short_description: '', full_description: '',
    country: '', destination: '', region: '', trip_types: [],
    transport_type: 'avion', departure_city: 'București', departure_airport: '',
    airline: '', stops: 'direct', departure_date: now, return_date: now,
    duration_days: 0, duration_nights: 0, accommodation_included: true,
    hotel_name: '', hotel_stars: 3, number_of_nights: 0, meal_type: 'mic_dejun',
    transport_price: 0, accommodation_price: 0, baggage_price: 0, transfer_price: 0,
    other_costs: 0, total_price: 0, currency: 'RON', price_type: 'per_person',
    number_of_people: 1, provider_name: '', offer_url: '', is_affiliate_link: false,
    main_image_url: '', gallery_images: [], offer_score: 8, score_reason: '',
    status: 'draft', last_checked_at: now, created_at: new Date().toISOString(), click_count: 0,
  };
}

export default function AdminOfferForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [offer, setOffer] = useState<Offer>(emptyOffer());
  const [loadingOffer, setLoadingOffer] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugEdited, setSlugEdited] = useState(isEdit);

  // Booking.com affiliate link builder
  const [bookingPropertyUrl, setBookingPropertyUrl] = useState('');
  const [bookingAid, setBookingAid] = useState(getStoredAffiliateId());
  const [bookingLabel, setBookingLabel] = useState('vacantamea');

  // Load existing offer when editing
  useEffect(() => {
    if (!id) return;
    getOfferById(id).then((existing) => {
      if (existing) {
        setOffer({ ...existing });
      }
      setLoadingOffer(false);
    });
  }, [id]);

  // Auto-generate slug from title (only on create, not on edit)
  useEffect(() => {
    if (!slugEdited && offer.title) {
      setOffer((o) => ({ ...o, slug: generateSlug(o.title) }));
    }
  }, [offer.title, slugEdited]);

  const regenerateSlug = () => {
    if (!offer.title.trim()) {
      showToast('Introdu un titlu pentru a genera slug-ul.', 'error');
      return;
    }
    setSlugEdited(false);
    setOffer((o) => ({ ...o, slug: generateSlug(o.title) }));
    showToast('Slug-ul a fost regenerat din titlu.', 'success');
  };

  // Auto-calculate duration and total
  useEffect(() => {
    const days = calculateDurationDays(offer.departure_date, offer.return_date);
    const nights = calculateDurationNights(offer.departure_date, offer.return_date);
    const total = calculateTotalPrice(offer);
    setOffer((o) => ({
      ...o,
      duration_days: days,
      duration_nights: nights,
      number_of_nights: o.accommodation_included ? nights : 0,
      accommodation_price: o.accommodation_included ? o.accommodation_price : 0,
      total_price: total,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offer.departure_date, offer.return_date, offer.transport_price, offer.accommodation_price, offer.baggage_price, offer.transfer_price, offer.other_costs, offer.accommodation_included]);

  const update = <K extends keyof Offer>(key: K, value: Offer[K]) =>
    setOffer((o) => ({ ...o, [key]: value }));

  const toggleTripType = (tt: TripType) =>
    setOffer((o) => ({
      ...o,
      trip_types: o.trip_types.includes(tt) ? o.trip_types.filter((t) => t !== tt) : [...o.trip_types, tt],
    }));

  const validate = async (forPublish = false): Promise<boolean> => {
    const errs: Record<string, string> = {};
    if (!offer.title.trim()) errs.title = 'Acest câmp este obligatoriu.';
    if (!offer.slug.trim()) errs.slug = 'Acest câmp este obligatoriu.';
    if (!offer.short_description.trim()) errs.short_description = 'Acest câmp este obligatoriu.';
    if (!offer.country.trim()) errs.country = 'Acest câmp este obligatoriu.';
    if (!offer.destination.trim()) errs.destination = 'Acest câmp este obligatoriu.';
    if (!offer.departure_city.trim()) errs.departure_city = 'Acest câmp este obligatoriu.';
    if (!offer.departure_date) errs.departure_date = 'Acest câmp este obligatoriu.';
    if (!offer.return_date) errs.return_date = 'Acest câmp este obligatoriu.';
    if (offer.return_date < offer.departure_date) errs.return_date = 'Data întoarcerii trebuie să fie după data plecării.';
    if (!offer.provider_name.trim()) errs.provider_name = 'Acest câmp este obligatoriu.';
    if (!offer.offer_url.trim()) errs.offer_url = 'Acest câmp este obligatoriu.';
    else if (!/^https?:\/\//.test(offer.offer_url)) errs.offer_url = 'Introdu un link valid.';
    if (!offer.main_image_url.trim() && forPublish) errs.main_image_url = 'Adaugă o imagine principală.';
    if (offer.trip_types.length === 0 && forPublish) errs.trip_types = 'Selectează cel puțin un tip de vacanță.';
    if (offer.offer_score < 1 || offer.offer_score > 10) errs.offer_score = 'Scorul trebuie să fie între 1 și 10.';

    // Validate slug format
    const slugError = validateSlug(offer.slug);
    if (slugError) {
      errs.slug = slugError;
    } else {
      // Check slug uniqueness in Supabase
      const existingSlugs = await getExistingSlugs(offer.id);
      if (existingSlugs.includes(offer.slug)) {
        const unique = ensureUniqueSlug(offer.slug, existingSlugs, offer.id);
        if (unique !== offer.slug) {
          errs.slug = `Acest slug există deja. Sugestie: ${unique}`;
        }
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (status: OfferStatus) => {
    const forPublish = status === 'active';
    const valid = await validate(forPublish);
    if (!valid) {
      showToast('Formularul conține erori. Verifică câmpurile obligatorii.', 'error');
      return;
    }
    setSaving(true);
    try {
      await saveOffer({
        ...offer,
        status,
        last_checked_at: new Date().toISOString().slice(0, 10),
      });
      showToast(forPublish ? 'Oferta a fost publicată cu succes.' : 'Draft salvat cu succes.', 'success');
      navigate('/admin/oferte');
    } catch (err) {
      showToast(`Eroare la salvare: ${err instanceof Error ? err.message : 'necunoscută'}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    if (!offer.slug) { showToast('Adaugă un titlu pentru a previzualiza.', 'error'); return; }
    try {
      await saveOffer({ ...offer, status: offer.status === 'active' ? 'active' : 'draft' });
      window.open(`/oferte/${offer.slug}`, '_blank');
    } catch {
      showToast('Nu s-a putut salva draft-ul pentru previzualizare.', 'error');
    }
  };

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = () => {
    if (!id) return;
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteOffer(id);
      await deleteOfferImages([offer.main_image_url, ...(offer.gallery_images || [])]);
      showToast('Oferta a fost ștearsă.', 'success');
      navigate('/admin/oferte');
    } catch {
      showToast('Eroare la ștergere.', 'error');
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleImagesChange = (images: string[]) => {
    const mainImage = images[0] || '';
    const gallery = images.slice(1);
    setOffer((o) => ({ ...o, main_image_url: mainImage, gallery_images: gallery }));
  };

  const applyBookingPreset = () => {
    setOffer((o) => ({ ...o, provider_name: BOOKING_PROVIDER_NAME, is_affiliate_link: true }));
  };

  const generateBookingAffiliateLink = () => {
    if (!bookingPropertyUrl.trim()) {
      showToast('Lipește mai întâi linkul către proprietatea de pe Booking.com.', 'error');
      return;
    }
    if (!isBookingComUrl(bookingPropertyUrl)) {
      showToast('Linkul introdus nu pare să fie de pe booking.com. Verifică-l.', 'error');
      return;
    }
    if (!bookingAid.trim()) {
      showToast('Introdu ID-ul tău de afiliat Booking.com (aid).', 'error');
      return;
    }

    const affiliateUrl = buildBookingAffiliateUrl(bookingPropertyUrl, bookingAid, bookingLabel);

    setOffer((o) => ({
      ...o,
      offer_url: affiliateUrl,
      provider_name: BOOKING_PROVIDER_NAME,
      is_affiliate_link: true,
    }));

    saveStoredAffiliateId(bookingAid);
    showToast('Link de afiliat Booking.com generat și salvat pe ofertă.', 'success');
  };

  const totalPreview = useMemo(() => calculateTotalPrice(offer), [offer]);

  if (loadingOffer) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/oferte" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{isEdit ? 'Editează ofertă' : 'Adaugă ofertă'}</h1>
          <p className="text-slate-500 text-sm mt-0.5">{isEdit ? 'Modifică detaliile ofertei.' : 'Completează informațiile pentru noua ofertă.'}</p>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSave('active'); }} className="space-y-6">
        {/* Section 1 */}
        <FormSection title="Informații generale" number={1}>
          <FieldGroup>
            <Field label="Titlu" required error={errors.title}>
              <input type="text" value={offer.title} onChange={(e) => update('title', e.target.value)} className="input-field" placeholder="Ex: Creta – 7 zile cu plecare din București" />
            </Field>
            <Field label="Slug (URL)" required error={errors.slug}>
              <div className="flex gap-2">
                <input type="text" value={offer.slug} onChange={(e) => { update('slug', e.target.value); setSlugEdited(true); }} className="input-field" placeholder="creta-7-zile-plecare-bucuresti" />
                <button type="button" onClick={regenerateSlug} className="btn-secondary shrink-0" title="Regenerează slug din titlu">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              {offer.slug && (
                <p className="mt-2 text-xs text-slate-400">
                  URL final: <span className="text-brand-600 font-medium">https://ofertevacante.netlify.app/oferte/{offer.slug}</span>
                </p>
              )}
            </Field>
          </FieldGroup>
          <Field label="Descriere scurtă" required error={errors.short_description}>
            <textarea value={offer.short_description} onChange={(e) => update('short_description', e.target.value)} rows={2} className="input-field resize-none" placeholder="Rezumat scurt al ofertei..." />
          </Field>
          <Field label="Descriere completă">
            <textarea value={offer.full_description || ''} onChange={(e) => update('full_description', e.target.value)} rows={4} className="input-field resize-none" placeholder="Descriere detaliată..." />
          </Field>
        </FormSection>

        {/* Section 2 */}
        <FormSection title="Destinație" number={2}>
          <FieldGroup>
            <Field label="Țară" required error={errors.country}>
              <input type="text" value={offer.country} onChange={(e) => update('country', e.target.value)} className="input-field" placeholder="Grecia" />
            </Field>
            <Field label="Destinație" required error={errors.destination}>
              <input type="text" value={offer.destination} onChange={(e) => update('destination', e.target.value)} className="input-field" placeholder="Creta" />
            </Field>
          </FieldGroup>
          <Field label="Regiune">
            <input type="text" value={offer.region || ''} onChange={(e) => update('region', e.target.value)} className="input-field" placeholder="Insulele Grecești" />
          </Field>
          <Field label="Tipuri de vacanță" error={errors.trip_types}>
            <div className="flex flex-wrap gap-2">
              {TRIP_TYPE_OPTIONS.map((tt) => {
                const active = offer.trip_types.includes(tt.value);
                return (
                  <button key={tt.value} type="button" onClick={() => toggleTripType(tt.value)}
                    className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${active ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    {tt.label}
                  </button>
                );
              })}
            </div>
          </Field>
        </FormSection>

        {/* Section 3 */}
        <FormSection title="Transport" number={3}>
          <FieldGroup>
            <Field label="Tip transport">
              <select value={offer.transport_type} onChange={(e) => update('transport_type', e.target.value as TransportType)} className="input-field">
                {TRANSPORT_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
            <Field label="Oraș plecare" required error={errors.departure_city}>
              <select value={offer.departure_city} onChange={(e) => update('departure_city', e.target.value)} className="input-field">
                {DEPARTURE_CITIES.filter((c) => c !== 'Orice aeroport').map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </FieldGroup>
          <FieldGroup>
            <Field label="Aeroport plecare">
              <input type="text" value={offer.departure_airport || ''} onChange={(e) => update('departure_airport', e.target.value)} className="input-field" placeholder="OTP - Otopeni" />
            </Field>
            <Field label="Companie aeriană">
              <input type="text" value={offer.airline || ''} onChange={(e) => update('airline', e.target.value)} className="input-field" placeholder="Aegean Airlines" />
            </Field>
          </FieldGroup>
          <FieldGroup>
            <Field label="Escale">
              <select value={offer.stops || 'direct'} onChange={(e) => update('stops', e.target.value as StopsType)} className="input-field">
                {STOPS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
            <div />
          </FieldGroup>
          <FieldGroup>
            <Field label="Data plecării" required error={errors.departure_date}>
              <input type="date" value={offer.departure_date} onChange={(e) => update('departure_date', e.target.value)} className="input-field" />
            </Field>
            <Field label="Data întoarcerii" required error={errors.return_date}>
              <input type="date" value={offer.return_date} onChange={(e) => update('return_date', e.target.value)} className="input-field" />
            </Field>
          </FieldGroup>
          <div className="flex gap-4 text-sm text-slate-500 bg-slate-50 rounded-xl p-3">
            <span>Durata: <strong className="text-slate-700">{offer.duration_days} zile</strong></span>
            <span>Nopți: <strong className="text-slate-700">{offer.duration_nights} nopți</strong></span>
            <span className="text-slate-400">(calculate automat)</span>
          </div>
        </FormSection>

        {/* Section 4 */}
        <FormSection title="Cazare" number={4}>
          <Field label="Cazare inclusă?">
            <div className="flex gap-2">
              <button type="button" onClick={() => update('accommodation_included', true)} className={`rounded-xl border px-6 py-2.5 text-sm font-semibold ${offer.accommodation_included ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600'}`}>DA</button>
              <button type="button" onClick={() => update('accommodation_included', false)} className={`rounded-xl border px-6 py-2.5 text-sm font-semibold ${!offer.accommodation_included ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600'}`}>NU</button>
            </div>
          </Field>
          {offer.accommodation_included && (
            <>
              <FieldGroup>
                <Field label="Nume hotel">
                  <input type="text" value={offer.hotel_name || ''} onChange={(e) => update('hotel_name', e.target.value)} className="input-field" placeholder="Hotel Creta 4★" />
                </Field>
                <Field label="Stele hotel">
                  <select value={offer.hotel_stars || 3} onChange={(e) => update('hotel_stars', Number(e.target.value))} className="input-field">
                    {[1, 2, 3, 4, 5].map((s) => <option key={s} value={s}>{s}★</option>)}
                  </select>
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field label="Număr nopți">
                  <input type="number" min="0" value={offer.number_of_nights || 0} onChange={(e) => update('number_of_nights', Number(e.target.value))} className="input-field" />
                </Field>
                <Field label="Tip masă">
                  <select value={offer.meal_type || 'fara_masa'} onChange={(e) => update('meal_type', e.target.value as MealType)} className="input-field">
                    {MEAL_OPTIONS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </Field>
              </FieldGroup>
            </>
          )}
        </FormSection>

        {/* Section 5 */}
        <FormSection title="Preț" number={5}>
          <FieldGroup>
            <Field label="Preț transport (RON)">
              <input type="number" min="0" value={offer.transport_price || 0} onChange={(e) => update('transport_price', Number(e.target.value))} className="input-field" />
            </Field>
            <Field label="Preț cazare (RON)">
              <input type="number" min="0" value={offer.accommodation_price || 0} onChange={(e) => update('accommodation_price', Number(e.target.value))} className="input-field" />
            </Field>
          </FieldGroup>
          <FieldGroup>
            <Field label="Preț bagaj (RON)">
              <input type="number" min="0" value={offer.baggage_price || 0} onChange={(e) => update('baggage_price', Number(e.target.value))} className="input-field" />
            </Field>
            <Field label="Preț transfer (RON)">
              <input type="number" min="0" value={offer.transfer_price || 0} onChange={(e) => update('transfer_price', Number(e.target.value))} className="input-field" />
            </Field>
          </FieldGroup>
          <FieldGroup>
            <Field label="Alte costuri (RON)">
              <input type="number" min="0" value={offer.other_costs || 0} onChange={(e) => update('other_costs', Number(e.target.value))} className="input-field" />
            </Field>
            <div className="flex items-end">
              <div className="w-full rounded-xl bg-brand-50 border border-brand-100 p-4">
                <div className="text-xs text-brand-600 font-medium">TOTAL (calculat automat)</div>
                <div className="text-2xl font-extrabold text-brand-700">
                  {new Intl.NumberFormat('ro-RO').format(totalPreview)} {offer.currency}
                </div>
              </div>
            </div>
          </FieldGroup>
          <FieldGroup>
            <Field label="Monedă">
              <select value={offer.currency} onChange={(e) => update('currency', e.target.value as Currency)} className="input-field">
                <option value="RON">RON</option>
                <option value="EUR">EUR</option>
              </select>
            </Field>
            <Field label="Tip preț">
              <select value={offer.price_type} onChange={(e) => update('price_type', e.target.value as PriceType)} className="input-field">
                <option value="per_person">Per persoană</option>
                <option value="total">Total</option>
              </select>
            </Field>
          </FieldGroup>
          <FieldGroup>
            <Field label="Număr persoane">
              <input type="number" min="1" value={offer.number_of_people || 1} onChange={(e) => update('number_of_people', Number(e.target.value))} className="input-field" />
            </Field>
            <div />
          </FieldGroup>
        </FormSection>

        {/* Section 6 */}
        <FormSection title="Furnizor" number={6}>

          {/* Quick provider presets */}
          <div>
            <label className="label-field">Furnizor rapid</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={applyBookingPreset}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                  offer.provider_name === BOOKING_PROVIDER_NAME
                    ? 'border-navy-600 bg-navy-600 text-white'
                    : 'border-slate-200 text-slate-600 hover:border-navy-300 hover:text-navy-700'
                }`}
              >
                Booking.com
              </button>
              <button
                type="button"
                onClick={() => update('provider_name', '')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300"
              >
                Alt furnizor
              </button>
            </div>
          </div>

          {/* Booking.com affiliate link builder — only relevant when provider is Booking.com */}
          {offer.provider_name === BOOKING_PROVIDER_NAME && (
            <div className="rounded-xl border border-navy-100 bg-navy-50 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-navy-700">
                <Wand2 className="h-4 w-4" />
                Generator link afiliat Booking.com
              </div>

              <p className="text-xs leading-relaxed text-navy-600">
                Lipește linkul către hotelul/proprietatea de pe booking.com și ID-ul
                tău de afiliat (aid) din Partner Hub. Se generează automat linkul
                trackable pe care îl salvezi ca ofertă.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label-field !mb-1 !text-navy-700">Link proprietate Booking.com</label>
                  <input
                    type="url"
                    value={bookingPropertyUrl}
                    onChange={(e) => setBookingPropertyUrl(e.target.value)}
                    className="input-field"
                    placeholder="https://www.booking.com/hotel/..."
                  />
                </div>
                <div>
                  <label className="label-field !mb-1 !text-navy-700">ID afiliat (aid)</label>
                  <input
                    type="text"
                    value={bookingAid}
                    onChange={(e) => setBookingAid(e.target.value)}
                    className="input-field"
                    placeholder="Ex: 123456"
                  />
                </div>
              </div>

              <div>
                <label className="label-field !mb-1 !text-navy-700">Label urmărire (opțional)</label>
                <input
                  type="text"
                  value={bookingLabel}
                  onChange={(e) => setBookingLabel(e.target.value)}
                  className="input-field"
                  placeholder="vacantamea"
                />
              </div>

              <button
                type="button"
                onClick={generateBookingAffiliateLink}
                className="inline-flex items-center gap-2 rounded-lg bg-cta-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-cta-400"
              >
                <Wand2 className="h-4 w-4" />
                Generează și aplică linkul
              </button>

              <p className="text-[11px] text-navy-500">
                Nu ai încă un ID de afiliat? Îl obții după ce te înscrii în{' '}
                <a
                  href="https://www.booking.com/affiliate-program/v2/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  programul de afiliere Booking.com
                </a>.
              </p>
            </div>
          )}

          <FieldGroup>
            <Field label="Nume furnizor" required error={errors.provider_name}>
              <input type="text" value={offer.provider_name} onChange={(e) => update('provider_name', e.target.value)} className="input-field" placeholder="TravelDemo" />
            </Field>
            <Field label="Link ofertă" required error={errors.offer_url}>
              <input type="url" value={offer.offer_url} onChange={(e) => update('offer_url', e.target.value)} className="input-field" placeholder="https://..." />
            </Field>
          </FieldGroup>
          <Field label="Link afiliat?">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={offer.is_affiliate_link} onChange={(e) => update('is_affiliate_link', e.target.checked)} className="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
              <span className="text-sm text-slate-600">Da, acesta este un link de afiliat</span>
            </label>
          </Field>
        </FormSection>

        {/* Section 7 — Imagini (principală + galerie) */}
        <FormSection title="Imagini" number={7}>
          <p className="text-sm text-slate-500 -mt-2">
            Prima imagine devine imaginea principală. Restul intră în galerie. Trage imaginile pentru a schimba ordinea.
          </p>
          <ImageUploader
            initialImages={[offer.main_image_url, ...(offer.gallery_images || [])].filter(Boolean)}
            onChange={handleImagesChange}
            maxImages={10}
          />
          {errors.main_image_url && <p className="text-xs text-error-600">{errors.main_image_url}</p>}
        </FormSection>

        {/* Section 9 */}
        <FormSection title="Scor" number={9}>
          <FieldGroup>
            <Field label="Scor ofertă (1-10)" error={errors.offer_score}>
              <input type="number" min="1" max="10" step="0.1" value={offer.offer_score} onChange={(e) => update('offer_score', Number(e.target.value))} className="input-field" />
            </Field>
            <div />
          </FieldGroup>
          <Field label="Motiv scor">
            <input type="text" value={offer.score_reason || ''} onChange={(e) => update('score_reason', e.target.value)} className="input-field" placeholder="Preț excelent pentru 7 zile..." />
          </Field>
        </FormSection>

        {/* Section 10 */}
        <FormSection title="Status" number={10}>
          <FieldGroup>
            <Field label="Status">
              <select value={offer.status} onChange={(e) => update('status', e.target.value as OfferStatus)} className="input-field">
                {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="Data expirării">
              <input type="date" value={offer.expires_at || ''} onChange={(e) => update('expires_at', e.target.value)} className="input-field" />
            </Field>
          </FieldGroup>
          <div className="text-xs text-slate-400">Ultima verificare: {offer.last_checked_at}</div>
        </FormSection>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 -mx-6 lg:-mx-8 px-6 lg:px-8 py-4 flex flex-col sm:flex-row gap-3">
          <button type="button" onClick={() => handleSave('draft')} disabled={saving} className="btn-secondary flex-1">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvează draft
          </button>
          <button type="button" onClick={handlePreview} disabled={saving} className="btn-ghost flex-1">
            <Eye className="h-4 w-4" /> Previzualizează
          </button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Publică oferta
          </button>
          {isEdit && (
            <button type="button" onClick={handleDelete} disabled={saving} className="btn-danger">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      <ConfirmDialog
        open={showDeleteDialog}
        title="Ștergere ofertă"
        message="Sigur dorești să ștergi această ofertă?"
        warning="Această acțiune nu poate fi anulată."
        confirmLabel="Șterge"
        cancelLabel="Renunță"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}

function FormSection({ title, number, children }: { title: string; number: number; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-brand-700 text-sm font-bold">{number}</span>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}
function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label-field">{label} {required && <span className="text-error-500">*</span>}</label>
      {children}
      {error && <p className="mt-1 text-xs text-error-600">{error}</p>}
    </div>
  );
}
