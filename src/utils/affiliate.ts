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

// Same Agoda affiliate CID already used for the Sherpa widget
// (see src/components/search/HeroSearchBar.tsx) — reused here so clicks
// stay attributed even for destinations we don't have a verified
// agodaCityId for.
const AGODA_CID = '1972943';

/**
 * Builds a link straight to agoda.com's own search results for a
 * destination we only know by name (no verified numeric agodaCityId).
 *
 * Why this exists: Agoda's Long Tail Search API (used by agodaService.ts)
 * requires a numeric cityId — it has no public "search by city name"
 * endpoint. Agoda only hands out a cityId lookup table as a data-feed
 * download in the affiliate portal, not as a live API call. Their own
 * website, however, accepts a free-text `textToSearch` query param and
 * resolves it server-side, so that's what we fall back to for any
 * destination outside our verified list.
 */
export function buildAgodaSearchFallbackUrl(params: {
  destinationName: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
}): string {
  const url = new URL('https://www.agoda.com/search');
  url.searchParams.set('textToSearch', params.destinationName);
  url.searchParams.set('checkIn', params.checkInDate);
  url.searchParams.set('checkOut', params.checkOutDate);
  url.searchParams.set('adults', String(params.adults));
  url.searchParams.set('children', String(params.children));
  url.searchParams.set('rooms', '1');
  url.searchParams.set('locale', 'ro-ro');
  url.searchParams.set('cid', AGODA_CID);
  return url.toString();
}
