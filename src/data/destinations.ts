// Curated list of destinations used across the site:
// - autocomplete suggestions in the hero search bar
// - kept in sync (by city name) with the DESTINATIONS map in the
//   supabase/functions/import-travelpayouts* edge functions, so a
//   destination picked here matches offer.destination exactly.

export interface DestinationOption {
  iata: string;
  city: string;
  country: string;
}

export const DESTINATIONS: DestinationOption[] = [
  { iata: 'AYT', city: 'Antalya', country: 'Turcia' },
  { iata: 'HRG', city: 'Hurghada', country: 'Egipt' },
  { iata: 'SSH', city: 'Sharm El Sheikh', country: 'Egipt' },
  { iata: 'BCN', city: 'Barcelona', country: 'Spania' },
  { iata: 'ATH', city: 'Atena', country: 'Grecia' },
  { iata: 'HER', city: 'Creta (Heraklion)', country: 'Grecia' },
  { iata: 'MLA', city: 'Malta', country: 'Malta' },
  { iata: 'DXB', city: 'Dubai', country: 'Emiratele Arabe Unite' },
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
