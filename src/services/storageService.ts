/**
 * Supabase service layer — all persistence goes through Supabase.
 * Maps between DB row format and the app's internal TypeScript types.
 * Replacing this file with a different backend requires no UI changes.
 */

import { supabase } from '@/lib/supabase';
import type { DbOfferRow, DbAlertRow, DbClickRow } from '@/types/database';
import type {
  Offer, Alert, ClickEvent,
  TripType, TransportType, MealType, StopsType,
  OfferStatus, Currency, PriceType, AlertFrequency, AlertStatus,
} from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Convert undefined → null for Supabase nullable columns */
function n<T>(v: T | undefined): T | null {
  return v === undefined ? null : v;
}

// ─────────────────────────────────────────────────────────────────────────────
// Row → Offer
// ─────────────────────────────────────────────────────────────────────────────
function rowToOffer(row: DbOfferRow): Offer {
  return {
    id: String(row.id),
    title: row.title ?? '',
    slug: row.slug ?? String(row.id),
    short_description: row.short_description ?? '',
    full_description: row.full_description ?? undefined,
    country: row.country ?? '',
    destination: row.destination ?? '',
    region: row.region ?? undefined,
    trip_types: (row.trip_types ?? []) as TripType[],
    transport_type: (row.transport_type ?? 'avion') as TransportType,
    departure_city: row.departure_city ?? '',
    departure_airport: row.departure_airport ?? row.airport ?? undefined,
    airline: row.airline ?? undefined,
    stops: (row.stops ?? 'direct') as StopsType,
    departure_date: row.departure_date ?? '',
    return_date: row.return_date ?? '',
    duration_days: row.duration_days ?? row.nights ?? 0,
    duration_nights: row.duration_nights ?? (row.nights ? row.nights - 1 : 0),
    accommodation_included: row.accommodation_included ?? true,
    hotel_name: row.hotel_name ?? undefined,
    hotel_stars: row.hotel_stars ?? undefined,
    number_of_nights: row.number_of_nights ?? row.nights ?? undefined,
    meal_type: (row.meal_type ?? row.meal_plan ?? 'fara_masa') as MealType,
    transport_price: row.transport_price ?? 0,
    accommodation_price: row.accommodation_price ?? 0,
    baggage_price: row.baggage_price ?? 0,
    transfer_price: row.transfer_price ?? 0,
    other_costs: row.other_costs ?? 0,
    total_price: row.total_price ?? row.price_per_person ?? row.budget_max ?? 0,
    currency: (row.currency ?? 'RON') as Currency,
    price_type: (row.price_type ?? 'per_person') as PriceType,
    number_of_people: row.number_of_people ?? 1,
    provider_name: row.provider_name ?? row.supplier ?? '',
    offer_url: row.offer_url ?? row.affiliate_url ?? '#',
    is_affiliate_link: row.is_affiliate_link ?? false,
    main_image_url: row.image_url ?? '',
    gallery_images: row.gallery_images ?? [row.image_url_2, row.image_url_3].filter((x): x is string => Boolean(x)),
    offer_score: Number(row.offer_score ?? 7),
    score_reason: row.score_reason ?? undefined,
    status: (row.active === false ? 'expired' : (row.status ?? 'active')) as OfferStatus,
    expires_at: row.expires_at ?? undefined,
    last_checked_at: row.last_checked_at ?? row.verified_date ?? new Date().toISOString().slice(0, 10),
    created_at: row.created_at,
    click_count: row.click_count ?? row.clicks ?? 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Offer → DB payload
// ─────────────────────────────────────────────────────────────────────────────
function offerToPayload(offer: Partial<Offer>): Partial<DbOfferRow> {
  const p: Partial<DbOfferRow> = {};
  if (offer.title !== undefined) p.title = offer.title;
  if (offer.slug !== undefined) p.slug = offer.slug;
  if (offer.short_description !== undefined) p.short_description = offer.short_description;
  if (offer.full_description !== undefined) p.full_description = n(offer.full_description);
  if (offer.country !== undefined) p.country = offer.country;
  if (offer.destination !== undefined) p.destination = offer.destination;
  if (offer.region !== undefined) p.region = n(offer.region);
  if (offer.trip_types !== undefined) { p.trip_types = offer.trip_types; p.vacation_type = offer.trip_types[0] ?? null; }
  if (offer.transport_type !== undefined) p.transport_type = offer.transport_type;
  if (offer.departure_city !== undefined) p.departure_city = offer.departure_city;
  if (offer.departure_airport !== undefined) p.departure_airport = n(offer.departure_airport);
  if (offer.airline !== undefined) p.airline = n(offer.airline);
  if (offer.stops !== undefined) p.stops = n(offer.stops);
  if (offer.departure_date !== undefined) p.departure_date = offer.departure_date;
  if (offer.return_date !== undefined) p.return_date = offer.return_date;
  if (offer.duration_days !== undefined) { p.duration_days = offer.duration_days; p.nights = offer.duration_days; }
  if (offer.duration_nights !== undefined) p.duration_nights = offer.duration_nights;
  if (offer.accommodation_included !== undefined) p.accommodation_included = offer.accommodation_included;
  if (offer.hotel_name !== undefined) p.hotel_name = n(offer.hotel_name);
  if (offer.hotel_stars !== undefined) p.hotel_stars = n(offer.hotel_stars);
  if (offer.number_of_nights !== undefined) p.number_of_nights = n(offer.number_of_nights);
  if (offer.meal_type !== undefined) { p.meal_type = offer.meal_type; p.meal_plan = offer.meal_type; }
  if (offer.transport_price !== undefined) p.transport_price = offer.transport_price;
  if (offer.accommodation_price !== undefined) p.accommodation_price = offer.accommodation_price;
  if (offer.baggage_price !== undefined) p.baggage_price = offer.baggage_price;
  if (offer.transfer_price !== undefined) p.transfer_price = offer.transfer_price;
  if (offer.other_costs !== undefined) p.other_costs = offer.other_costs;
  if (offer.total_price !== undefined) { p.total_price = offer.total_price; p.price_per_person = offer.total_price; }
  if (offer.currency !== undefined) p.currency = offer.currency;
  if (offer.price_type !== undefined) p.price_type = offer.price_type;
  if (offer.number_of_people !== undefined) p.number_of_people = offer.number_of_people;
  if (offer.provider_name !== undefined) { p.provider_name = offer.provider_name; p.supplier = offer.provider_name; }
  if (offer.offer_url !== undefined) p.offer_url = offer.offer_url;
  if (offer.is_affiliate_link !== undefined) p.is_affiliate_link = offer.is_affiliate_link;
  if (offer.main_image_url !== undefined) p.image_url = offer.main_image_url;
  if (offer.gallery_images !== undefined) p.gallery_images = offer.gallery_images;
  if (offer.offer_score !== undefined) p.offer_score = offer.offer_score;
  if (offer.score_reason !== undefined) p.score_reason = n(offer.score_reason);
  if (offer.status !== undefined) { p.status = offer.status; p.active = offer.status === 'active'; }
  if (offer.expires_at !== undefined) p.expires_at = n(offer.expires_at);
  if (offer.last_checked_at !== undefined) p.last_checked_at = offer.last_checked_at;
  if (offer.click_count !== undefined) { p.click_count = offer.click_count; p.clicks = offer.click_count; }
  return p;
}

// ─────────────────────────────────────────────────────────────────────────────
// OFFERS
// ─────────────────────────────────────────────────────────────────────────────

export async function getOffers(): Promise<Offer[]> {
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('getOffers:', error.message); return []; }
  return (data as DbOfferRow[] ?? []).map(rowToOffer);
}

export async function getOfferById(id: string): Promise<Offer | undefined> {
  const numId = Number(id);
  if (isNaN(numId)) return undefined;
  const { data, error } = await supabase.from('offers').select('*').eq('id', numId).maybeSingle();
  if (error || !data) return undefined;
  return rowToOffer(data as DbOfferRow);
}

export async function getOfferBySlug(slug: string): Promise<Offer | undefined> {
  const { data, error } = await supabase.from('offers').select('*').eq('slug', slug).maybeSingle();
  if (error || !data) return undefined;
  return rowToOffer(data as DbOfferRow);
}

/** Return all slugs currently in the database, for uniqueness checks. */
export async function getExistingSlugs(excludeId?: string): Promise<string[]> {
  let query = supabase.from('offers').select('slug');
  if (excludeId) {
    const numId = Number(excludeId);
    if (!isNaN(numId)) query = query.neq('id', numId);
  }
  const { data, error } = await query;
  if (error || !data) return [];
  return (data as Pick<DbOfferRow, 'slug'>[]).map((r) => r.slug ?? '').filter(Boolean);
}

export async function saveOffer(offer: Offer): Promise<Offer> {
  const payload = offerToPayload(offer);
  const numId = Number(offer.id);
  const isNew = !offer.id || isNaN(numId);

  if (!isNew) {
    const { data, error } = await supabase
      .from('offers')
      .update(payload as Record<string, unknown>)
      .eq('id', numId)
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (data) return rowToOffer(data as DbOfferRow);
  }

  const { id: _ignored, ...insertPayload } = payload as Partial<DbOfferRow> & { id?: unknown };
  void _ignored;
  const { data, error } = await supabase
    .from('offers')
    .insert(insertPayload as Record<string, unknown>)
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Insert returned no data.');
  return rowToOffer(data as DbOfferRow);
}

export async function updateOffer(id: string, updates: Partial<Offer>): Promise<Offer | undefined> {
  const numId = Number(id);
  if (isNaN(numId)) return undefined;
  const payload = offerToPayload(updates);
  const { data, error } = await supabase
    .from('offers')
    .update(payload as Record<string, unknown>)
    .eq('id', numId)
    .select()
    .maybeSingle();
  if (error) { console.error('updateOffer:', error.message); return undefined; }
  if (!data) return undefined;
  return rowToOffer(data as DbOfferRow);
}

export async function deleteOffer(id: string): Promise<void> {
  const numId = Number(id);
  if (isNaN(numId)) return;
  const { error } = await supabase.from('offers').delete().eq('id', numId);
  if (error) console.error('deleteOffer:', error.message);
}

// ─────────────────────────────────────────────────────────────────────────────
// ALERTS
// ─────────────────────────────────────────────────────────────────────────────

function rowToAlert(row: DbAlertRow): Alert {
  return {
    id: row.id,
    email: row.email,
    departure_city: row.departure_city,
    max_budget: row.max_budget,
    country: row.country ?? undefined,
    trip_type: row.trip_type ?? undefined,
    month: row.month ?? undefined,
    duration: row.duration ?? undefined,
    frequency: row.frequency as AlertFrequency,
    consent: row.consent,
    status: row.status as AlertStatus,
    created_at: row.created_at,
  };
}

export async function getAlerts(): Promise<Alert[]> {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('getAlerts:', error.message); return []; }
  return (data as DbAlertRow[] ?? []).map(rowToAlert);
}

export async function saveAlert(alert: Omit<Alert, 'id' | 'created_at' | 'status'>): Promise<Alert> {
  const { data, error } = await supabase
    .from('alerts')
    .insert({
      email: alert.email,
      departure_city: alert.departure_city,
      max_budget: alert.max_budget,
      country: n(alert.country),
      trip_type: n(alert.trip_type),
      month: n(alert.month),
      duration: n(alert.duration),
      frequency: alert.frequency,
      consent: alert.consent,
      status: 'active',
    } as Partial<DbAlertRow>)
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Alert insert returned no data.');
  return rowToAlert(data as DbAlertRow);
}

export async function updateAlertStatus(id: string, status: Alert['status']): Promise<void> {
  const { error } = await supabase
    .from('alerts')
    .update({ status } as Partial<DbAlertRow>)
    .eq('id', id);
  if (error) console.error('updateAlertStatus:', error.message);
}

export async function deleteAlert(id: string): Promise<void> {
  const { error } = await supabase.from('alerts').delete().eq('id', id);
  if (error) console.error('deleteAlert:', error.message);
}

// ─────────────────────────────────────────────────────────────────────────────
// CLICKS
// ─────────────────────────────────────────────────────────────────────────────

export async function getClicks(): Promise<ClickEvent[]> {
  const { data, error } = await supabase
    .from('clicks')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(500);
  if (error) { console.error('getClicks:', error.message); return []; }
  return (data as DbClickRow[] ?? []).map((row): ClickEvent => ({
    id: row.id,
    offer_id: String(row.offer_id ?? ''),
    offer_slug: row.offer_slug,
    action: row.action as ClickEvent['action'],
    timestamp: row.timestamp,
  }));
}

export async function trackClick(offerId: string, offerSlug: string, action: ClickEvent['action']): Promise<void> {
  const numId = Number(offerId);
  await supabase.from('clicks').insert({
    offer_id: isNaN(numId) ? null : numId,
    offer_slug: offerSlug,
    action,
  } as Partial<DbClickRow>);

  if (!isNaN(numId)) {
    // Uses a narrow SECURITY DEFINER function instead of a direct UPDATE,
    // so anonymous visitors can bump the counter without needing write
    // access to the rest of the offers table (see RLS migration).
    const { error } = await supabase.rpc('increment_offer_clicks', { offer_id_input: numId });
    if (error) console.error('increment_offer_clicks:', error.message);
  }
}

export async function getClickCount(): Promise<number> {
  const { count } = await supabase.from('clicks').select('*', { count: 'exact', head: true });
  return count ?? 0;
}

export async function getClicksByOffer(offerId: string): Promise<number> {
  const numId = Number(offerId);
  if (isNaN(numId)) return 0;
  const { count } = await supabase.from('clicks').select('*', { count: 'exact', head: true }).eq('offer_id', numId);
  return count ?? 0;
}
