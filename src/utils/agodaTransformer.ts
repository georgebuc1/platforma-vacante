/**
 * Transforms Agoda Long Tail Search API results into the internal Offer type.
 *
 * Agoda's API only returns hotel/accommodation data (no flights), so these
 * become "accommodation_included: true" offers with transport_type left as
 * 'masina' (site default for "no organised transport") — adjust if you add
 * a dedicated "cazare" transport/trip type later.
 */

import type { AgodaHotelResult } from '@/services/agodaService';
import type { Offer, Currency } from '@/types';
import { generateSlug } from '@/utils/slugify';

export interface AgodaTransformContext {
  destination: string; // e.g. "Antalya" — display name for the city searched
  country: string; // e.g. "Turcia"
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  departureCity?: string; // your site's default, e.g. "București"
  numberOfPeople?: number;
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const diff = Math.round((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff);
}

/**
 * Transform a single Agoda hotel result into an internal Offer.
 * Returns null if required fields are missing/invalid.
 */
export function transformAgodaHotelToOffer(
  hotel: AgodaHotelResult,
  ctx: AgodaTransformContext
): Offer | null {
  if (!hotel.hotelId || !hotel.hotelName || !hotel.dailyRate) {
    return null;
  }

  const nights = nightsBetween(ctx.checkInDate, ctx.checkOutDate);
  const totalPrice = Math.round(hotel.dailyRate * nights * 100) / 100;

  const baseSlug = generateSlug(`${hotel.hotelName} ${ctx.destination} ${nights} nopti`);

  const now = new Date().toISOString();

  // NOTE: storageService.saveOffer() treats a non-numeric/empty id as "new"
  // and inserts a fresh row (Supabase's numeric id is generated on insert).
  // Because there's no `external_id` column yet to look up an existing Agoda
  // offer by hotelId, re-running the sync with forceUpdate will currently
  // create duplicate rows for the same hotel rather than updating the price.
  // If you want live price refresh later, add an `external_id` (or
  // `agoda_hotel_id`) column to `offers` and look it up before saveOffer().
  const offer: Offer = {
    id: '',
    title: `${hotel.hotelName} - ${ctx.destination}, ${nights} nop\u021bi`,
    slug: baseSlug,
    short_description: `Cazare la ${hotel.hotelName} (${hotel.starRating}★) \u00een ${ctx.destination}, ${nights} nop\u021bi.`,
    country: ctx.country,
    destination: ctx.destination,
    trip_types: ['city_break'],
    transport_type: 'masina', // Agoda only sells accommodation; no transport bundled
    departure_city: ctx.departureCity || 'București',
    departure_date: ctx.checkInDate,
    return_date: ctx.checkOutDate,
    duration_days: nights + 1,
    duration_nights: nights,
    accommodation_included: true,
    hotel_name: hotel.hotelName,
    hotel_stars: Math.round(hotel.starRating),
    number_of_nights: nights,
    meal_type: hotel.includeBreakfast ? 'mic_dejun' : 'fara_masa',
    total_price: totalPrice,
    currency: (hotel.currency as Currency) || 'RON',
    price_type: 'total',
    number_of_people: ctx.numberOfPeople ?? 2,
    provider_name: 'Agoda',
    offer_url: hotel.landingURL,
    is_affiliate_link: true,
    main_image_url: hotel.imageURL,
    offer_score: computeScore(hotel),
    status: 'active',
    last_checked_at: now,
    created_at: now,
    // PriceBreakdown fields — Agoda gives us one bundled rate, so accommodation
    // carries the full price and the rest stay at 0.
    transport_price: 0,
    accommodation_price: totalPrice,
    baggage_price: 0,
    transfer_price: 0,
    other_costs: 0,
  };

  return offer;
}

export function transformAgodaResultsToOffers(
  hotels: AgodaHotelResult[],
  ctx: AgodaTransformContext
): Offer[] {
  return hotels
    .map((hotel) => transformAgodaHotelToOffer(hotel, ctx))
    .filter((offer): offer is Offer => offer !== null);
}

/**
 * Simple 1-10 score based on review score, discount and star rating.
 * Tune the weights to match how `offer_score` is used elsewhere on the site.
 */
function computeScore(hotel: AgodaHotelResult): number {
  const reviewComponent = (hotel.reviewScore || 0) / 10; // 0-1
  const discountComponent = Math.min(hotel.discountPercentage || 0, 50) / 50; // 0-1
  const starComponent = (hotel.starRating || 0) / 5; // 0-1

  const score = reviewComponent * 5 + discountComponent * 3 + starComponent * 2;
  return Math.max(1, Math.min(10, Math.round(score * 10) / 10));
}
