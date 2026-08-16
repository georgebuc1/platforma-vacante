import type { Offer } from '@/types';
import { formatPrice, getOfferPrice } from '@/utils/pricing';

const TRIP_TYPE_EMOJI: Record<string, string> = {
  beach: '🏖️',
  city_break: '🏙️',
  mountain: '⛰️',
  all_inclusive: '🍹',
  family: '👨‍👩‍👧',
  romantic: '💑',
  adventure: '🧗',
  weekend: '🧳',
};

const SITE_ORIGIN = 'https://ofertevacante.netlify.app';

/**
 * Builds a ready-to-copy social media caption for an offer — short, with
 * emojis, the price, and a link back to our own offer page (not the
 * Booking.com affiliate link directly), so the click is tracked on our
 * site first and the visitor sees the full listing before continuing.
 */
export function buildSocialCaption(offer: Offer): string {
  const emoji = offer.trip_types.map((t) => TRIP_TYPE_EMOJI[t]).find(Boolean) || '✈️';
  const price = getOfferPrice(offer);
  const priceLabel = offer.price_type === 'total' ? 'total' : '/ persoană';
  const nights = offer.duration_nights ? `${offer.duration_nights} nopți` : '';
  const link = `${SITE_ORIGIN}/oferte/${offer.slug}`;

  const lines: string[] = [
    `${emoji} ${offer.title}`,
    '',
    `📍 ${offer.destination}, ${offer.country}`,
    ...(nights ? [`🗓️ ${nights}`] : []),
    `💰 ${formatPrice(price, offer.currency)} ${priceLabel}`,
    '',
    `👉 Vezi oferta completă: ${link}`,
    '',
    '#vacanta #oferte #vacantamea',
  ];

  return lines.join('\n');
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for browsers/contexts where the Clipboard API is blocked
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      return false;
    }
  }
}
