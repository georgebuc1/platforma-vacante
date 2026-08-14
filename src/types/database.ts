export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      offers: {
        Row: DbOfferRow;
        Insert: Partial<DbOfferRow>;
        Update: Partial<DbOfferRow>;
      };
      alerts: {
        Row: DbAlertRow;
        Insert: Partial<DbAlertRow>;
        Update: Partial<DbAlertRow>;
      };
      clicks: {
        Row: DbClickRow;
        Insert: Partial<DbClickRow>;
        Update: Partial<DbClickRow>;
      };
      admin_access_log: {
        Row: DbAdminAccessLogRow;
        Insert: Partial<DbAdminAccessLogRow>;
        Update: Partial<DbAdminAccessLogRow>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_offer_clicks: {
        Args: { offer_row_id: number };
        Returns: null;
      };
    };
    Enums: Record<string, never>;
  };
}

export interface DbOfferRow {
  id: number;
  created_at: string;
  title: string | null;
  slug: string | null;
  short_description: string | null;
  full_description: string | null;
  country: string | null;
  destination: string | null;
  region: string | null;
  trip_types: string[] | null;
  transport_type: string | null;
  departure_city: string | null;
  departure_airport: string | null;
  airport: string | null;
  airline: string | null;
  stops: string | null;
  departure_date: string | null;
  return_date: string | null;
  duration_days: number | null;
  duration_nights: number | null;
  nights: number | null;
  accommodation_included: boolean | null;
  hotel_name: string | null;
  hotel_stars: number | null;
  number_of_nights: number | null;
  meal_type: string | null;
  meal_plan: string | null;
  transport_price: number | null;
  accommodation_price: number | null;
  baggage_price: number | null;
  transfer_price: number | null;
  other_costs: number | null;
  total_price: number | null;
  budget_max: number | null;
  price_per_person: number | null;
  currency: string | null;
  price_type: string | null;
  number_of_people: number | null;
  provider_name: string | null;
  supplier: string | null;
  offer_url: string | null;
  affiliate_url: string | null;
  is_affiliate_link: boolean | null;
  image_url: string | null;
  image_url_2: string | null;
  image_url_3: string | null;
  gallery_images: string[] | null;
  offer_score: number | null;
  score_reason: string | null;
  offer_label: string | null;
  status: string | null;
  active: boolean | null;
  expires_at: string | null;
  last_checked_at: string | null;
  verified_date: string | null;
  verified_time: string | null;
  verified_by: string | null;
  click_count: number | null;
  clicks: number | null;
  vacation_type: string | null;
  featured: boolean | null;
  notes: string | null;
}

export interface DbAlertRow {
  id: string;
  email: string;
  departure_city: string;
  max_budget: number;
  country: string | null;
  trip_type: string | null;
  month: string | null;
  duration: string | null;
  frequency: string;
  consent: boolean;
  status: string;
  created_at: string;
}

export interface DbClickRow {
  id: string;
  offer_id: number | null;
  offer_slug: string;
  action: string;
  timestamp: string;
}

export interface DbAdminAccessLogRow {
  id: string;
  event_type: 'failed_login' | 'unauthorized_access';
  email_attempted: string | null;
  path: string | null;
  user_agent: string | null;
  created_at: string;
}
