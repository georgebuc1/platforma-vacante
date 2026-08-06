import type { Offer, PriceBreakdown } from '@/types';

export function calculateTotalPrice(prices: PriceBreakdown): number {
  return (
    (prices.transport_price || 0) +
    (prices.accommodation_price || 0) +
    (prices.baggage_price || 0) +
    (prices.transfer_price || 0) +
    (prices.other_costs || 0)
  );
}

export function formatPrice(amount: number, currency: string = 'RON'): string {
  const formatted = new Intl.NumberFormat('ro-RO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
  return `${formatted} ${currency}`;
}

export function formatDate(isoDate: string): string {
  if (!isoDate) return '';
  try {
    return new Intl.DateTimeFormat('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}

export function formatDateShort(isoDate: string): string {
  if (!isoDate) return '';
  try {
    return new Intl.DateTimeFormat('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}

export function calculateDurationDays(departureDate: string, returnDate: string): number {
  if (!departureDate || !returnDate) return 0;
  const diff = new Date(returnDate).getTime() - new Date(departureDate).getTime();
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
}

export function calculateDurationNights(departureDate: string, returnDate: string): number {
  return Math.max(0, calculateDurationDays(departureDate, returnDate) - 1);
}

export function getOfferPrice(offer: Offer): number {
  return offer.total_price || calculateTotalPrice(offer);
}
