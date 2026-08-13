import type { Offer, SearchFilters, SortOption } from '@/types';
import { getOfferPrice } from './pricing';

const MONTH_MAP: Record<string, number> = {
  ianuarie: 0,
  februarie: 1,
  martie: 2,
  aprilie: 3,
  mai: 4,
  iunie: 5,
  iulie: 6,
  august: 7,
  septembrie: 8,
  octombrie: 9,
  noiembrie: 10,
  decembrie: 11,
};

const DURATION_RANGES: Record<string, [number, number]> = {
  weekend: [1, 3],
  '3-5': [3, 5],
  '5-7': [5, 7],
  '7-10': [7, 10],
  '10-14': [10, 14],
};

function matchesMonth(offer: Offer, month: string): boolean {
  if (!month || month === 'oricand') return true;
  if (month === 'luna_astazi') {
    const now = new Date();
    const dep = new Date(offer.departure_date);
    return dep.getMonth() === now.getMonth() && dep.getFullYear() === now.getFullYear();
  }
  if (month === 'luna_urmatoare') {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const dep = new Date(offer.departure_date);
    return dep.getMonth() === next.getMonth() && dep.getFullYear() === next.getFullYear();
  }
  const monthIdx = MONTH_MAP[month.toLowerCase()];
  if (monthIdx === undefined) return true;
  const dep = new Date(offer.departure_date);
  return dep.getMonth() === monthIdx;
}

function matchesDuration(offer: Offer, duration: string): boolean {
  if (!duration || duration === 'orice') return true;
  const range = DURATION_RANGES[duration];
  if (!range) return true;
  return offer.duration_days >= range[0] && offer.duration_days <= range[1];
}

export function filterOffers(offers: Offer[], filters: SearchFilters): Offer[] {
  return offers.filter((offer) => {
    if (offer.status !== 'active') return false;

    if (filters.departure_city && filters.departure_city !== 'orice' && offer.departure_city !== filters.departure_city) {
      return false;
    }

    if (filters.max_budget && filters.max_budget > 0) {
      if (getOfferPrice(offer) > filters.max_budget) return false;
    }

    if (filters.month && !matchesMonth(offer, filters.month)) return false;

    if (filters.duration && !matchesDuration(offer, filters.duration)) return false;

    if (filters.trip_type && filters.trip_type !== 'orice') {
      if (!offer.trip_types.includes(filters.trip_type as never)) return false;
    }

    if (filters.country && filters.country !== 'orice' && offer.country !== filters.country) return false;

    if (filters.destination && filters.destination !== 'orice' && offer.destination !== filters.destination) return false;

    if (filters.transport_type && filters.transport_type !== 'orice' && offer.transport_type !== filters.transport_type) return false;

    if (filters.min_score && filters.min_score > 0 && (offer.offer_score || 0) < filters.min_score) return false;

    return true;
  });
}

export function sortOffers(offers: Offer[], sort: SortOption = 'recommended'): Offer[] {
  const sorted = [...offers];
  switch (sort) {
    case 'price_asc':
      return sorted.sort((a, b) => getOfferPrice(a) - getOfferPrice(b));
    case 'price_desc':
      return sorted.sort((a, b) => getOfferPrice(b) - getOfferPrice(a));
    case 'score':
      return sorted.sort((a, b) => (b.offer_score || 0) - (a.offer_score || 0));
    case 'newest':
      return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    case 'recommended':
    default:
      return sorted.sort((a, b) => {
        const scoreDiff = (b.offer_score || 0) - (a.offer_score || 0);
        if (Math.abs(scoreDiff) > 0.5) return scoreDiff;
        return getOfferPrice(a) - getOfferPrice(b);
      });
  }
}

export function getBadge(offer: Offer): { label: string; variant: 'good' | 'low' | 'recommended' } | null {
  if (offer.offer_score >= 9) return { label: 'RECOMANDAREA NOASTRĂ', variant: 'recommended' };
  if (offer.total_price <= 1500) return { label: 'PREȚ MIC', variant: 'low' };
  if (offer.offer_score >= 8) return { label: 'OFERTĂ BUNĂ', variant: 'good' };
  return null;
}

export function getScoreLabel(score: number): string {
  if (score >= 9) return 'Excepțional';
  if (score >= 8) return 'Excelent';
  if (score >= 7) return 'Foarte bine';
  if (score >= 6) return 'Bine';
  return 'Satisfăcător';
}

export function getUniqueCountries(offers: Offer[]): string[] {
  return Array.from(new Set(offers.map((o) => o.country))).sort();
}

export function getUniqueDestinations(offers: Offer[]): string[] {
  return Array.from(new Set(offers.map((o) => o.destination))).sort();
}
