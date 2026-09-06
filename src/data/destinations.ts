// Curated list of destinations used across the site:
// - autocomplete suggestions in the hero search bar
// - kept in sync (by city name) with the DESTINATIONS map in the
//   supabase/functions/import-travelpayouts* edge functions, so a
//   destination picked here matches offer.destination exactly.

export interface DestinationOption {
  iata: string;
  city: string;
  country: string;
  /**
   * Agoda's own numeric city ID (NOT the IATA code) — required to call the
   * Long Tail Search API for this destination. Agoda doesn't publish a
   * lookup table; the reliable way to get one is to search the city on
   * agoda.com and read the "city=" parameter from the resulting URL (or
   * ask your Agoda account manager). Left undefined until verified —
   * destinations without one are skipped by the live search box.
   */
  agodaCityId?: number;
}

export const DESTINATIONS: DestinationOption[] = [
  { iata: 'AYT', city: 'Antalya', country: 'Turcia' },
  { iata: 'HRG', city: 'Hurghada', country: 'Egipt' },
  { iata: 'SSH', city: 'Sharm El Sheikh', country: 'Egipt' },
  { iata: 'BCN', city: 'Barcelona', country: 'Spania' },
  { iata: 'ATH', city: 'Atena', country: 'Grecia' },
  { iata: 'HER', city: 'Creta (Heraklion)', country: 'Grecia' },
  { iata: 'MLA', city: 'Malta', country: 'Malta' },
  // Sourced from a third-party Agoda scraping tool's public docs, not from
  // Agoda directly — double check it against a real search before relying
  // on it (see the note on DestinationOption.agodaCityId above).
  { iata: 'DXB', city: 'Dubai', country: 'Emiratele Arabe Unite', agodaCityId: 2994 },
  { iata: 'LIS', city: 'Lisabona', country: 'Portugalia' },
  { iata: 'RHO', city: 'Rhodos', country: 'Grecia' },
];

function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function searchDestinations(query: string, limit = 8): DestinationOption[] {
  const q = normalize(query.trim());
  if (!q) return DESTINATIONS.slice(0, limit);

  return DESTINATIONS
    .filter((d) => normalize(d.city).includes(q) || normalize(d.country).includes(q) || d.iata.toLowerCase() === q)
    .slice(0, limit);
}
