// This file previously contained mock offers for development.
// Now replaced with real offers from APIs via synchronization.
// Keeping the file to avoid import errors, but exporting empty array.

import type { Offer } from '@/types';

// Export empty array - real offers come from Supabase via storageService
export const mockOffers: Offer[] = [];