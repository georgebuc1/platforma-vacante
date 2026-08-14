import type { Offer } from '@/types';

export function getStopsLabel(stops?: Offer['stops']): string {
  if (stops === 'o_escala') return '1 escală';
  if (stops === 'mai_multe_escale') return 'Mai multe escale';
  return 'Direct';
}

export function buildIncludedItems(offer: Offer): string[] {
  const items: string[] = [];
  if (offer.transport_type) {
    const transport = { avion: 'Transport cu avionul', autocar: 'Transport cu autocarul', masina: 'Transport cu mașina', tren: 'Transport cu trenul', avion_transfer: 'Avion + transfer' }[offer.transport_type];
    if (transport) items.push(transport);
  }
  if (offer.departure_airport) items.push(`Plecare: ${offer.departure_airport}`);
  if (offer.airline) items.push(`Companie aeriană: ${offer.airline}`);
  if (offer.stops) items.push(getStopsLabel(offer.stops));
  if (offer.accommodation_included) items.push(offer.hotel_name ? `Cazare: ${offer.hotel_name}` : 'Cazare inclusă');
  if (offer.accommodation_included && offer.number_of_nights) items.push(`${offer.number_of_nights} nopți de cazare`);
  const meals: Record<string, string> = { mic_dejun: 'Mic dejun inclus', demipensiune: 'Demipensiune inclusă', pensiune_completa: 'Pensiune completă inclusă', all_inclusive: 'All Inclusive inclus', fara_masa: '' };
  if (offer.meal_type && meals[offer.meal_type]) items.push(meals[offer.meal_type]);
  if (offer.transfer_price > 0) items.push('Transfer inclus în preț');
  if (offer.baggage_price > 0) items.push('Bagaj inclus în preț');
  if (offer.other_costs > 0) items.push('Alte costuri incluse în preț');
  return Array.from(new Set(items));
}
