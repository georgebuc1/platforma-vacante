/**
 * Transforms external API offer data to internal Offer type format
 * Handles mapping between different API response structures and our internal Offer interface
 */

import type { Offer, TripType, TransportType, MealType, StopsType, OfferStatus, Currency, PriceType } from '@/types';

/**
 * Mapping from external API trip types to our internal TripType enum
 */
const TRIP_TYPE_MAPPING: Record<string, TripType> = {
  beach: 'beach',
  'city break': 'city_break',
  city_break: 'city_break',
  mountain: 'mountain',
  all_inclusive: 'all_inclusive',
  family: 'family',
  romantic: 'romantic',
  adventure: 'adventure',
  weekend: 'weekend',
  // Add more mappings as needed
};

/**
 * Mapping from external API transport types to our internal TransportType enum
 */
const TRANSPORT_TYPE_MAPPING: Record<string, TransportType> = {
  avion: 'avion',
  flight: 'avion',
  plane: 'avion',
  autocar: 'autocar',
  bus: 'autocar',
  masina: 'masina',
  car: 'masina',
  rental: 'masina',
  tren: 'tren',
  train: 'tren',
  avion_transfer: 'avion_transfer',
  // Add more mappings as needed
};

/**
 * Mapping from external API meal types to our internal MealType enum
 */
const MEAL_TYPE_MAPPING: Record<string, MealType> = {
  fara_masa: 'fara_masa',
  'no meals': 'fara_masa',
  mic_dejun: 'mic_dejun',
  breakfast: 'mic_dejun',
  'continental breakfast': 'mic_dejun',
  demipensiune: 'demipensiune',
  'half board': 'demipensiune',
  pensiune_completa: 'pensiune_completa',
  'full board': 'pensiune_completa',
  all_inclusive: 'all_inclusive',
  'all inclusive': 'all_inclusive',
  // Add more mappings as needed
};

/**
 * Mapping from external API stop types to our internal StopsType enum
 */
const STOPS_TYPE_MAPPING: Record<string, StopsType> = {
  direct: 'direct',
  nonstop: 'direct',
  'one stop': 'o_escala',
  o_escala: 'o_escala',
  'one': 'o_escala',
  'multiple': 'mai_multe_escale',
  'mai_multe_escale': 'mai_multe_escale',
  'many': 'mai_multe_escale',
  // Add more mappings as needed
};

/**
 * Determine offer score based on price and other factors
 * This is a simplified scoring algorithm - can be enhanced
 */
function calculateOfferScore(
  totalPrice: number,
  destination: string,
  durationDays: number
): number {
  // Base score
  let score = 5;

  // Adjust based on price (lower price = higher score, up to a point)
  if (totalPrice < 500) score += 3;
  else if (totalPrice < 1000) score += 2;
  else if (totalPrice < 2000) score += 1;
  else if (totalPrice > 5000) score -= 2;

  // Adjust based on duration (reasonable length trips get bonus)
  if (durationDays >= 4 && durationDays <= 10) score += 1;
  else if (durationDays > 14) score -= 1;

  // Ensure score is between 1 and 10
  return Math.min(10, Math.max(1, Math.round(score)));
}

/**
 * Determine offer status based on dates and availability
 */
function determineOfferStatus(
  departureDate: string,
  returnDate: string,
  expiresAt?: string
): OfferStatus {
  const now = new Date();
  const departure = new Date(departureDate);
  const returnDateObj = new Date(returnDate);
  const expiresAtDate = expiresAt ? new Date(expiresAt) : null;

  // If expired based on expiration date
  if (expiresAtDate && expiresAtDate < now) return 'expired';

  // If the trip has already passed
  if (returnDateObj < now) return 'expired';

  // If departure is in the past but return is in future (ongoing trip)
  if (departure < now && returnDateObj > now) return 'active';

  // If departure is in the future
  if (departure > now) return 'active';

  // Default to active
  return 'active';
}

/**
 * Transform generic offer data to internal Offer format
 * This function handles the core transformation logic
 */
export function transformToInternalOffer(
  rawOffer: any,
  source: string = 'unknown'
): Offer | null {
  try {
    // Validate required fields
    if (!rawOffer || !rawOffer.title || !rawOffer.destination) {
      console.warn('Invalid offer data: missing required fields', rawOffer);
      return null;
    }

    // Extract and map fields with sensible defaults
    const offer: Offer = {
      // ID handling - prefer external ID, fallback to generated
      id: String(rawOffer.id || rawOffer._id || Math.random().toString(36).substr(2, 9)),

      // Basic information
      title: String(rawOffer.title || ''),
      slug: String(rawOffer.slug || rawOffer.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '') || ''),
      short_description: String(rawOffer.short_description || rawOffer.description || ''),
      full_description: rawOffer.full_description || undefined,

      // Location
      country: String(rawOffer.country || 'Necunoscut'),
      destination: String(rawOffer.destination || ''),
      region: rawOffer.region ? String(rawOffer.region) : undefined,

      // Trip classification
      trip_types: Array.isArray(rawOffer.trip_types)
        ? rawOffer.trip_types
            .map((t: string) => TRIP_TYPE_MAPPING[t.toLowerCase()] || 'city_break')
            .filter((t): t is TripType => t !== undefined)
        : [TRIP_TYPE_MAPPING[(rawOffer.trip_type || 'city_break').toLowerCase()] || 'city_break'],

      // Transportation
      transport_type: TRANSPORT_TYPE_MAPPING[
        (rawOffer.transport_type || 'avion').toLowerCase()
      ] || 'avion',

      // Departure information
      departure_city: String(rawOffer.departure_city || 'Necunoscut'),
      departure_airport: rawOffer.departure_airport ? String(rawOffer.departure_airport) : undefined,
      airline: rawOffer.airline ? String(rawOffer.airline) : undefined,
      stops: STOPS_TYPE_MAPPING[
        (rawOffer.stops || 'direct').toLowerCase()
      ] || 'direct',

      // Dates
      departure_date: String(rawOffer.departure_date || ''),
      return_date: String(rawOffer.return_date || ''),

      // Duration calculations
      duration_days: Number(rawOffer.duration_days) ||
                    calculateDurationDays(
                      String(rawOffer.departure_date || ''),
                      String(rawOffer.return_date || '')
                    ) || 0,
      duration_nights: Number(rawOffer.duration_nights) ||
                      calculateDurationNights(
                        String(rawOffer.departure_date || ''),
                        String(rawOffer.return_date || '')
                      ) || 0,

      // Accommodation
      accommodation_included: Boolean(rawOffer.accommodation_included ?? true),
      hotel_name: rawOffer.hotel_name ? String(rawOffer.hotel_name) : undefined,
      hotel_stars: rawOffer.hotel_stars ? Number(rawOffer.hotel_stars) : undefined,
      number_of_nights: rawOffer.number_of_nights ? Number(rawOffer.number_of_nights) : undefined,

      // Meals
      meal_type: MEAL_TYPE_MAPPING[
        (rawOffer.meal_type || rawOffer.meal_plan || 'fara_masa').toLowerCase()
      ] || 'fara_masa',

      // Pricing
      transport_price: Number(rawOffer.transport_price) || 0,
      accommodation_price: Number(rawOffer.accommodation_price) || 0,
      baggage_price: Number(rawOffer.baggage_price) || 0,
      transfer_price: Number(rawOffer.transfer_price) || 0,
      other_costs: Number(rawOffer.other_costs) || 0,
      total_price: Number(rawOffer.total_price) || 0,
      currency: (rawOffer.currency && ['RON', 'EUR'].includes(rawOffer.currency))
                ? rawOffer.currency as Currency
                : 'RON',
      price_type: (rawOffer.price_type && ['per_person', 'total'].includes(rawOffer.price_type))
                ? rawOffer.price_type as PriceType
                : 'per_person',
      number_of_people: Number(rawOffer.number_of_people) || 1,

      // Provider and booking
      provider_name: String(rawOffer.provider_name || source),
      offer_url: String(rawOffer.offer_url || rawOffer.url || '#'),
      is_affiliate_link: Boolean(rawOffer.is_affiliate_link || rawOffer.affiliate || false),
      main_image_url: String(rawOffer.main_image_url || rawOffer.image_url || ''),
      gallery_images: Array.isArray(rawOffer.gallery_images)
        ? rawOffer.gallery_images.filter((url: string): url is string => typeof url === 'string' && url.length > 0)
        : rawOffer.image_url_2 || rawOffer.image_url_3
          ? [rawOffer.image_url, rawOffer.image_url_2, rawOffer.image_url_3].filter(
              (url): url is string => typeof url === 'string' && url.length > 0
            )
          : [],

      // Scoring and metadata
      offer_score: Number(rawOffer.offer_score) ||
                  calculateOfferScore(
                    Number(rawOffer.total_price) || 0,
                    String(rawOffer.destination || ''),
                    Number(rawOffer.duration_days) || 0
                  ),
      score_reason: rawOffer.score_reason || undefined,

      // Status and timestamps
      status:
        (rawOffer.status && ['draft', 'active', 'expired', 'archived'].includes(rawOffer.status))
          ? rawOffer.status as OfferStatus
          : determineOfferStatus(
              String(rawOffer.departure_date || ''),
              String(rawOffer.return_date || ''),
              String(rawOffer.expires_at || '')
            ),
      expires_at: rawOffer.expires_at ? String(rawOffer.expires_at) : undefined,
      last_checked_at: String(rawOffer.last_checked_at || new Date().toISOString().slice(0, 10)),
      created_at: String(rawOffer.created_at || new Date().toISOString()),
      click_count: Number(rawOffer.click_count) || 0,
    };

    // Validate essential fields
    if (!offer.title || !offer.destination || !offer.departure_date || !offer.return_date) {
      console.warn('Offer missing essential fields after transformation:', offer);
      return null;
    }

    return offer;
  } catch (error) {
    console.error('Error transforming offer:', error, rawOffer);
    return null;
  }
}

/**
 * Helper function to calculate duration days from dates
 */
function calculateDurationDays(departureDate: string, returnDate: string): number {
  if (!departureDate || !returnDate) return 0;
  try {
    const depart = new Date(departureDate);
    const returnDt = new Date(returnDate);
    const diffTime = Math.abs(returnDt.getTime() - depart.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

/**
 * Helper function to calculate duration nights from dates
 */
function calculateDurationNights(departureDate: string, returnDate: string): number {
  const days = calculateDurationDays(departureDate, returnDate);
  return Math.max(0, days - 1);
}

// Export individual transformers for specific APIs if needed
export const offerTransformers = {
  /**
   * Transform Travelpayouts specific format to internal Offer
   * Implementation will depend on actual API response structure
   */
  travelpayouts: (rawData: any): Offer | null => {
    // Placeholder - implement based on actual Travelpayouts API response
    // This would need to be updated once we have access to the real API
    return transformToInternalOffer(rawData, 'travelpayouts');
  },

  /**
   * Transform Skyscanner specific format to internal Offer
   */
  skyscanner: (rawData: any): Offer | null => {
    // Placeholder for Skyscanner transformation
    return transformToInternalOffer(rawData, 'skyscanner');
  },

  /**
   * Transform Amadeus specific format to internal Offer
   */
  amadeus: (rawData: any): Offer | null => {
    // Placeholder for Amadeus transformation
    return transformToInternalOffer(rawData, 'amadeus');
  },

  /**
   * Transform generic offer data
   */
  generic: transformToInternalOffer
};