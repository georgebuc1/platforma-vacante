import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Save, Eye, Send, Trash2, ArrowLeft, Loader2, Upload, ImageIcon, X, AlertCircle } from 'lucide-react';
import { getOffers, getOfferById, saveOffer, deleteOffer } from '@/services/storageService';
import { uploadOfferImage, deleteOfferImage } from '@/services/imageService';
import { showToast } from '@/components/common/Toast';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { calculateTotalPrice, calculateDurationDays, calculateDurationNights } from '@/utils/pricing';
import { slugify } from '@/utils/slugify';
import { DEPARTURE_CITIES, TRIP_TYPES } from '@/components/search/SearchForm';
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
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previousImageRef = useRef<string>('');

  // Load existing offer when editing
  useEffect(() => {
    if (!id) return;
    getOfferById(id).then((existing) => {
      if (existing) {
        setOffer({ ...existing });
        previousImageRef.current = existing.main_image_url;
      }
      setLoadingOffer(false);
    });
  }, [id]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugEdited && offer.title) {
      setOffer((o) => ({ ...o, slug: slugify(o.title) }));
    }
  }, [offer.title, slugEdited]);

  // Auto-calculate duration and total
  useEffect(() => {
    const days = calculateDurationDays(offer.departure_date, offer.return_date);
    const nights = calculateDurationNights(offer.departure_date, offer.return_date);
    const total = calculateTotalPrice(offer);
    setOffer((o) => ({
      ...o,
      duration_days: days,
      duration_nights: nights,
      number_of_nights: o.accommodation_included ? nights : o.number_of_nights,
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

    // Check slug uniqueness async
    if (offer.slug) {
      const allOffers = await getOffers();
      const conflict = allOffers.find((o) => o.slug === offer.slug && o.id !== offer.id);
      if (conflict) errs.slug = 'Acest slug este deja folosit. Alege altul.';
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
      if (offer.main_image_url) {
        await deleteOfferImage(offer.main_image_url);
      }
      showToast('Oferta a fost ștearsă.', 'success');
      navigate('/admin/oferte');
    } catch {
      showToast('Eroare la ștergere.', 'error');
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError('');
    setUploading(true);
    setUploadProgress(0);
    try {
      const result = await uploadOfferImage(file, {
        onProgress: (pct) => setUploadProgress(pct),
      });
      // Delete old image from storage if it was a Supabase upload
      if (previousImageRef.current && previousImageRef.current !== result.publicUrl) {
        await deleteOfferImage(previousImageRef.current);
      }
      previousImageRef.current = result.publicUrl;
      update('main_image_url', result.publicUrl);
      showToast('Imaginea a fost încărcată cu succes.', 'success');
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Eroare la încărcarea imaginii.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async () => {
    if (!offer.main_image_url) return;
    await deleteOfferImage(offer.main_image_url);
    previousImageRef.current = '';
    update('main_image_url', '');
    setImageError('');
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
              <input type="text" value={offer.slug} onChange={(e) => { update('slug', e.target.value); setSlugEdited(true); }} className="input-field" placeholder="creta-7-zile-plecare-bucuresti" />
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

        {/* Section 7 */}
        <FormSection title="Imagine principală" number={7}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleImageSelect}
            className="hidden"
          />
          {imageError && (
            <div className="flex items-start gap-2 rounded-xl bg-error-50 border border-error-100 p-3 text-sm text-error-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{imageError}</span>
            </div>
          )}
          {offer.main_image_url && !uploading ? (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-100 max-w-md group">
                <img src={offer.main_image_url} alt="Preview" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/640x400/e2e8f0/64748b?text=Imagine+indisponibila`; }} />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-error-600 text-white hover:bg-error-700 shadow-lg transition-colors"
                  title="Șterge imaginea"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary text-sm"
              >
                <Upload className="h-4 w-4" /> Înlocuiește imaginea
              </button>
            </div>
          ) : uploading ? (
            <div className="space-y-3 max-w-md">
              <div className="flex items-center gap-3 rounded-xl bg-brand-50 border border-brand-100 p-4">
                <Loader2 className="h-5 w-5 animate-spin text-brand-500 shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-brand-700">Se încarcă imaginea... {uploadProgress}%</div>
                  <div className="mt-2 h-2 rounded-full bg-brand-100 overflow-hidden">
                    <div
                      className="h-full bg-brand-500 transition-all duration-200 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 w-full max-w-md rounded-xl border-2 border-dashed border-slate-300 hover:border-brand-400 hover:bg-brand-50/50 transition-colors py-12 cursor-pointer"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                <ImageIcon className="h-6 w-6" />
              </div>
              <div className="text-sm font-semibold text-slate-600">Selectează o imagine</div>
              <div className="text-xs text-slate-400">JPG, PNG sau WEBP — maxim 5 MB</div>
            </button>
          )}
          {errors.main_image_url && <p className="text-xs text-error-600">{errors.main_image_url}</p>}
        </FormSection>

        {/* Section 8 */}
        <FormSection title="Galerie" number={8}>
          <Field label="Imagini galerie (URL-uri separate prin virgulă)">
            <textarea
              value={(offer.gallery_images || []).join(', ')}
              onChange={(e) => update('gallery_images', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
              rows={2} className="input-field resize-none" placeholder="https://..., https://..." />
          </Field>
          {(offer.gallery_images || []).length > 0 && (
            <div className="flex gap-3 flex-wrap">
              {(offer.gallery_images || []).map((img, idx) => (
                <div key={idx} className="h-20 w-28 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                  <img src={img} alt={`Galerie ${idx + 1}`} className="h-full w-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          )}
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
