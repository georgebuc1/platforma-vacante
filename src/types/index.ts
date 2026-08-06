export type TripType =
  | 'beach'
  | 'city_break'
  | 'mountain'
  | 'all_inclusive'
  | 'family'
  | 'romantic'
  | 'adventure'
  | 'weekend';

export type TransportType = 'avion' | 'autocar' | 'masina' | 'tren' | 'avion_transfer';

export type MealType =
  | 'fara_masa'
  | 'mic_dejun'
  | 'demipensiune'
  | 'pensiune_completa'
  | 'all_inclusive';

export type StopsType = 'direct' | 'o_escala' | 'mai_multe_escale';

export type OfferStatus = 'draft' | 'active' | 'expired' | 'archived';

export type Currency = 'RON' | 'EUR';

export type PriceType = 'per_person' | 'total';

export type AlertFrequency = 'immediate' | 'daily' | 'weekly';

export type AlertStatus = 'active' | 'inactive';

export interface PriceBreakdown {
  transport_price: number;
  accommodation_price: number;
  baggage_price: number;
  transfer_price: number;
  other_costs: number;
}

export interface Offer extends PriceBreakdown {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  full_description?: string;
  country: string;
  destination: string;
  region?: string;
  trip_types: TripType[];
  transport_type: TransportType;
  departure_city: string;
  departure_airport?: string;
  airline?: string;
  stops?: StopsType;
  departure_date: string; // ISO date
  return_date: string; // ISO date
  duration_days: number;
  duration_nights: number;
  accommodation_included: boolean;
  hotel_name?: string;
  hotel_stars?: number;
  number_of_nights?: number;
  meal_type?: MealType;
  total_price: number;
  currency: Currency;
  price_type: PriceType;
  number_of_people?: number;
  provider_name: string;
  offer_url: string;
  is_affiliate_link: boolean;
  main_image_url: string;
  gallery_images?: string[];
  offer_score: number; // 1 - 10
  score_reason?: string;
  status: OfferStatus;
  expires_at?: string;
  last_checked_at: string;
  created_at: string;
  click_count?: number;
}

export interface SearchFilters {
  departure_city?: string;
  max_budget?: number;
  month?: string;
  duration?: string;
  trip_type?: string;
  country?: string;
  destination?: string;
  transport_type?: string;
  min_score?: number;
  sort?: SortOption;
}

export type SortOption = 'recommended' | 'price_asc' | 'price_desc' | 'score' | 'newest';

export interface Alert {
  id: string;
  email: string;
  departure_city: string;
  max_budget: number;
  country?: string;
  trip_type?: string;
  month?: string;
  duration?: string;
  frequency: AlertFrequency;
  consent: boolean;
  status: AlertStatus;
  created_at: string;
}

export interface ClickEvent {
  id: string;
  offer_id: string;
  offer_slug: string;
  action: 'view' | 'check_offer';
  timestamp: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}
