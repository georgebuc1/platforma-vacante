/**
 * Travelpayouts API Service
 * Handles fetching travel offers from Travelpayouts API
 */

import { API_CONFIG } from '@/lib/apiConfig';
import type { Offer } from '@/types';

/**
 * Travelpayouts API response types
 * Based on typical Travelpayouts API structure
 */
interface TravelpayoutsFlightData {
  value: number; // price
  depart_date: string; // YYYY-MM-DD
  return_date: string; // YYYY-MM-DD
  expires_at: string; // YYYY-MM-DD
  gateway: string; // IATA code
}

interface TravelpayoutsHotelData {
  value: number; // price per night
  check_in: string; // YYYY-MM-DD
  check_out: string; // YYYY-MM-DD
  expires_at: string; // YYYY-MM-DD
  hotel: string; // hotel name or ID
}

interface TravelpayoutsOfferResponse {
  data: {
    [key: string]: TravelpayoutsFlightData | TravelpayoutsHotelData | number;
  };
}

/**
 * Transform Travelpayouts data to internal Offer format
 */
export class TravelpayoutsService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = API_CONFIG.travelpayouts.apiKey;
    this.baseUrl = API_CONFIG.travelpayouts.baseUrl;
    console.log('Travelpayouts API key loaded:', this.apiKey ? this.apiKey.substring(0, 5) + '...' : 'undefined');
  }

  /**
   * Fetch flight prices from Travelpayouts
   * @param params - Origin, destination, and date parameters
   */
  async fetchFlightPrices(params: {
    origin: string; // IATA or city code
    destination: string; // IATA or city code
    departure_date?: string; // YYYY-MM-DD
    return_date?: string; // YYYY-MM-DD
    period?: string; // 'year', 'month'
    one_way?: boolean;
    token?: string; // API token override
  }): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Travelpayouts API key not configured');
    }

    const queryParams = new URLSearchParams({
      origin: params.origin,
      destination: params.destination,
      token: params.token || this.apiKey,
      ...(params.departure_date && { depart_date: params.departure_date }),
      ...(params.return_date && { return_date: params.return_date }),
      ...(params.period && { period: params.period }),
      ...(params.one_way && { one_way: 'true' }),
    });

    const url = `${this.baseUrl}calendar?${queryParams.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Travelpayouts API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching from Travelpayouts:', error);
      throw error;
    }
  }

  /**
   * Fetch hotel prices from Travelpayouts
   * @param params - Hotel search parameters
   */
  async fetchHotelPrices(params: {
    destination: string; // IATA or city code
    check_in: string; // YYYY-MM-DD
    check_out: string; // YYYY-MM-DD
    currency?: string; // EUR, USD, etc.
    token?: string; // API token override
  }): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Travelpayouts API key not configured');
    }

    const queryParams = new URLSearchParams({
      destination: params.destination,
      check_in: params.check_in,
      check_out: params.check_out,
      token: params.token || this.apiKey,
      ...(params.currency && { currency: params.currency }),
    });

    const url = `${this.baseUrl}prices/hotels?${queryParams.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Travelpayouts API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching hotel data from Travelpayouts:', error);
      throw error;
    }
  }

  /**
   * Transform Travelpayouts flight data to internal Offer format
   * This is a simplified transformation - real implementation would need more details
   */
  transformFlightToOffer(
    flightData: any,
    originCity: string,
    destinationCity: string
  ): Offer | null {
    try {
      // This is a placeholder transformation
      // Real implementation would need to map Travelpayouts response to our Offer type
      // based on actual API documentation

      // For now, return null to indicate this needs real implementation
      // when we have access to the actual API and can see the response structure
      return null;
    } catch (error) {
      console.error('Error transforming flight data to offer:', error);
      return null;
    }
  }

  /**
   * Transform Travelpayouts hotel data to internal Offer format
   */
  transformHotelToOffer(
    hotelData: any,
    destinationCity: string
  ): Offer | null {
    try {
      // Placeholder transformation
      return null;
    } catch (error) {
      console.error('Error transforming hotel data to offer:', error);
      return null;
    }
  }

  /**
   * Fetch roundtrip flight offers for a destination from a fixed origin (București)
   * @param destination - Destination city name (will be mapped to IATA code)
   * @param departureDate - Optional departure date (YYYY-MM-DD), defaults to next weekend
   * @param returnDate - Optional return date (YYYY-MM-DD), defaults to departure + 7 days
   */
  async fetchRoundtripOffers(
    destination: string,
    departureDate?: string,
    returnDate?: string
  ): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Travelpayouts API key not configured');
    }

    // Map city names to IATA codes (simplified mapping)
    const cityToIata: Record<string, string> = {
      'Istanbul': 'IST',
      'Dubai': 'DXB',
      'Antalya': 'AYT',
      'Barcelona': 'BCN',
      'Roma': 'FCO',
      'Creta': 'HER', // Heraklion
      'Paris': 'CDG',
      'Londra': 'LHR',
      'Budapesta': 'BUD',
      'Viena': 'VIE',
      'Praga': 'PRG',
      'Sofia': 'SOF',
      'București': 'BUH',
      'Cluj-Napoca': 'CLJ',
      'Timișoara': 'TSR',
      'Iași': 'IAS',
      'Sibiu': 'SBZ'
    };

    const originIata = cityToIata['București'] || 'BUH';
    const destIata = cityToIata[destination] || destination.toUpperCase();

    // Set default dates if not provided
    let depDate = departureDate;
    let retDate = returnDate;

    if (!depDate) {
      // Default to next Saturday
      const today = new Date();
      const day = today.getDay();
      const diffToSaturday = (6 - day + 7) % 7; // 6 is Saturday, 0 is Sunday
      const nextSaturday = new Date(today);
      nextSaturday.setDate(today.getDate() + (diffToSaturday === 0 ? 7 : diffToSaturday));
      depDate = nextSaturday.toISOString().split('T')[0];
    }

    if (!retDate) {
      const dep = new Date(depDate);
      dep.setDate(dep.getDate() + 7); // 7 days later
      retDate = dep.toISOString().split('T')[0];
    }

    const queryParams = new URLSearchParams({
      origin: originIata,
      destination: destIata,
      depart_date: depDate,
      return_date: retDate,
      token: this.apiKey,
      // Optional: period='month' to get a month of prices
      // We'll use specific dates for now
    });

    const url = `${this.baseUrl}calendar?${queryParams.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Travelpayouts API error: ${response.status} - ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching Travelpayouts data for ${destination}:`, error);
      throw error;
    }
  }
}

// Export a singleton instance
export const travelpayoutsService = new TravelpayoutsService();