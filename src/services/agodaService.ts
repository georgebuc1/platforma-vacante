/**
 * Agoda API Service (client-side)
 *
 * IMPORTANT: This service never talks to Agoda directly. It invokes our own
 * Supabase Edge Function (supabase/functions/agoda-search/index.ts), which
 * holds the secret siteid/apikey (via `supabase secrets set`) and forwards
 * the request server-side. Required because Agoda's API needs a secret
 * Authorization header, has no CORS support for browsers, and enforces IP
 * allow-listing — none of which can live in frontend code.
 *
 * Flow: Browser -> supabase.functions.invoke('agoda-search') -> Agoda API
 */

import { supabase } from '@/lib/supabase';

export interface AgodaHotelResult {
  hotelId: number;
  hotelName: string;
  roomtypeName?: string;
  starRating: number;
  reviewScore: number;
  reviewCount: number;
  currency: string;
  dailyRate: number;
  crossedOutRate: number;
  discountPercentage: number;
  imageURL: string;
  landingURL: string;
  includeBreakfast: boolean;
  freeWifi: boolean;
}

interface AgodaSuccessResponse {
  results: AgodaHotelResult[];
}

interface AgodaErrorResponse {
  error: { id: number; message: string } | string;
}

type AgodaResponse = AgodaSuccessResponse | AgodaErrorResponse;

export interface CitySearchParams {
  cityId: number;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  currency?: string; // default RON
  language?: string; // default ro-ro
  maxResult?: number; // default 20, max 30
  minimumStarRating?: number;
  minimumReviewScore?: number;
  dailyRateMin?: number;
  dailyRateMax?: number;
  sortBy?:
    | 'Recommended'
    | 'PriceAsc'
    | 'PriceDesc'
    | 'StarRatingDesc'
    | 'StarRatingAsc'
    | 'AllGuestsReviewScore';
  discountOnly?: boolean;
  numberOfAdult?: number;
  numberOfChildren?: number;
  childrenAges?: number[];
}

export interface HotelListSearchParams {
  hotelId: number[];
  checkInDate: string;
  checkOutDate: string;
  currency?: string;
  language?: string;
  discountOnly?: boolean;
  numberOfAdult?: number;
  numberOfChildren?: number;
  childrenAges?: number[];
}

function isErrorResponse(data: AgodaResponse): data is AgodaErrorResponse {
  return (data as AgodaErrorResponse).error !== undefined;
}

class AgodaService {
  /**
   * City search: find available hotels for a destination (by Agoda cityId).
   */
  async searchCity(params: CitySearchParams): Promise<AgodaHotelResult[]> {
    return this.invoke({ type: 'city', ...params });
  }

  /**
   * Hotel list search: fetch live pricing for a specific list of Agoda hotelIds.
   */
  async searchHotels(params: HotelListSearchParams): Promise<AgodaHotelResult[]> {
    return this.invoke({ type: 'hotel', ...params });
  }

  private async invoke(
    body: (CitySearchParams & { type: 'city' }) | (HotelListSearchParams & { type: 'hotel' })
  ): Promise<AgodaHotelResult[]> {
    const { data, error } = await supabase.functions.invoke<AgodaResponse>('agoda-search', {
      body,
    });

    if (error) {
      throw new Error(`Agoda edge function error: ${error.message}`);
    }
    if (!data) {
      throw new Error('Agoda edge function returned no data');
    }
    if (isErrorResponse(data)) {
      const message = typeof data.error === 'string' ? data.error : data.error.message;
      throw new Error(message);
    }

    return data.results || [];
  }
}

export const agodaService = new AgodaService();
