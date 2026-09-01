/**
 * API Configuration for Travelpayouts and other travel APIs
 * Load API keys from environment variables
 */

export const TRAVELPAYOUTS_CONFIG = {
  apiKey: import.meta.env.VITE_TRAVELPAYOUTS_API_KEY || '',
  baseUrl: import.meta.env.DEV ? '/api/travelpayouts/v2/prices/' : 'https://api.travelpayouts.com/v2/prices/',
  // Alternative endpoints based on what we need:
  // flights: 'https://api.travelpayouts.com/v1/prices/cheap',
  // hotels: 'https://api.travelpayouts.com/v1/hotel_prices/',
  // For now, we'll use the prices endpoint which can give us flight/hotel packages
};

export const API_CONFIG = {
  travelpayouts: TRAVELPAYOUTS_CONFIG,
  // Add other APIs here as needed
  // skyscanner: { ... },
  // amadeus: { ... }
};