/**
 * Helpers for building Booking.com affiliate ("aid") links.
 *
 * How Booking.com affiliate links work:
 * 1. You join the Booking.com Affiliate Partner Program and receive
 *    a personal Affiliate ID ("aid") from the Partner Hub.
 * 2. Any Booking.com property/search URL becomes an affiliate link
 *    once you append `aid=<your-id>` (and optionally `label=<tag>`)
 *    as query parameters.
 * 3. Clicks and bookings made through that link are tracked and
 *    attributed to your account — no API access is required for this.
 *
 * This does NOT pull live data/prices from Booking.com — it only
 * turns a Booking.com URL you paste in (e.g. from a hotel page) into
 * a trackable affiliate link that you save on the offer.
 */

export const BOOKING_PROVIDER_NAME = 'Booking.com';

const LOCAL_STORAGE_AID_KEY = 'vacantamea_booking_aid';

export function isBookingComUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    return host === 'booking.com' || host.endsWith('.booking.com');
  } catch {
    return false;
  }
}

export function buildBookingAffiliateUrl(
  propertyUrl: string,
  aid: string,
  label?: string
): string {
  if (!propertyUrl.trim()) return '';

  let url: URL;
  try {
    url = new URL(propertyUrl.trim());
  } catch {
    return propertyUrl;
  }

  if (aid.trim()) {
    url.searchParams.set('aid', aid.trim());
  }

  if (label?.trim()) {
    url.searchParams.set('label', label.trim());
  }

  return url.toString();
}

export function saveStoredAffiliateId(aid: string): void {
  try {
    window.localStorage.setItem(LOCAL_STORAGE_AID_KEY, aid);
  } catch {
    // localStorage unavailable (private mode etc.) — ignore silently
  }
}

export function getStoredAffiliateId(): string {
  try {
    return window.localStorage.getItem(LOCAL_STORAGE_AID_KEY) || '';
  } catch {
    return '';
  }
}
