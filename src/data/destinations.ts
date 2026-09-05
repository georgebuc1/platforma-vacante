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
  { iata: 'BKK', city: 'Bangkok', country: 'Thailanda', agodaCityId: 9395 },
  { iata: 'LIS', city: 'Lisabona', country: 'Portugalia' },
  { iata: 'RHO', city: 'Rhodos', country: 'Grecia' },

  // Restul lumii — fără agodaCityId verificat. Apar în autocomplete și pot fi
  // alese, dar căutarea de cazări pentru ele se face direct pe agoda.com
  // (vezi buildAgodaFallbackSearchUrl în TripSearchBar), nu prin API-ul
  // Long Tail Search, pentru că acela cere obligatoriu un cityId numeric pe
  // care Agoda nu îl expune printr-un API public de căutare după nume —
  // doar ca descărcare de date din portalul de afiliați.
  { iata: 'PAR', city: 'Paris', country: 'Franța' },
  { iata: 'LON', city: 'Londra', country: 'Marea Britanie' },
  { iata: 'ROM', city: 'Roma', country: 'Italia' },
  { iata: 'MIL', city: 'Milano', country: 'Italia' },
  { iata: 'VCE', city: 'Veneția', country: 'Italia' },
  { iata: 'FLR', city: 'Florența', country: 'Italia' },
  { iata: 'NAP', city: 'Napoli', country: 'Italia' },
  { iata: 'MAD', city: 'Madrid', country: 'Spania' },
  { iata: 'SVQ', city: 'Sevilla', country: 'Spania' },
  { iata: 'AGP', city: 'Malaga', country: 'Spania' },
  { iata: 'PMI', city: 'Palma de Mallorca', country: 'Spania' },
  { iata: 'IBZ', city: 'Ibiza', country: 'Spania' },
  { iata: 'OPO', city: 'Porto', country: 'Portugalia' },
  { iata: 'FAO', city: 'Faro', country: 'Portugalia' },
  { iata: 'AMS', city: 'Amsterdam', country: 'Olanda' },
  { iata: 'BRU', city: 'Bruxelles', country: 'Belgia' },
  { iata: 'BER', city: 'Berlin', country: 'Germania' },
  { iata: 'MUC', city: 'München', country: 'Germania' },
  { iata: 'FRA', city: 'Frankfurt', country: 'Germania' },
  { iata: 'HAM', city: 'Hamburg', country: 'Germania' },
  { iata: 'VIE', city: 'Viena', country: 'Austria' },
  { iata: 'SZG', city: 'Salzburg', country: 'Austria' },
  { iata: 'ZRH', city: 'Zürich', country: 'Elveția' },
  { iata: 'GVA', city: 'Geneva', country: 'Elveția' },
  { iata: 'PRG', city: 'Praga', country: 'Cehia' },
  { iata: 'BUD', city: 'Budapesta', country: 'Ungaria' },
  { iata: 'WAW', city: 'Varșovia', country: 'Polonia' },
  { iata: 'KRK', city: 'Cracovia', country: 'Polonia' },
  { iata: 'CPH', city: 'Copenhaga', country: 'Danemarca' },
  { iata: 'OSL', city: 'Oslo', country: 'Norvegia' },
  { iata: 'ARN', city: 'Stockholm', country: 'Suedia' },
  { iata: 'HEL', city: 'Helsinki', country: 'Finlanda' },
  { iata: 'DUB', city: 'Dublin', country: 'Irlanda' },
  { iata: 'EDI', city: 'Edinburgh', country: 'Marea Britanie' },
  { iata: 'REK', city: 'Reykjavik', country: 'Islanda' },
  { iata: 'IST', city: 'Istanbul', country: 'Turcia' },
  { iata: 'SAW', city: 'Antalya (Alanya)', country: 'Turcia' },
  { iata: 'ZAG', city: 'Zagreb', country: 'Croația' },
  { iata: 'SPU', city: 'Split', country: 'Croația' },
  { iata: 'DBV', city: 'Dubrovnik', country: 'Croația' },
  { iata: 'TIA', city: 'Tirana', country: 'Albania' },
  { iata: 'SKG', city: 'Salonic', country: 'Grecia' },
  { iata: 'JMK', city: 'Mykonos', country: 'Grecia' },
  { iata: 'JTR', city: 'Santorini', country: 'Grecia' },
  { iata: 'CFU', city: 'Corfu', country: 'Grecia' },
  { iata: 'LCA', city: 'Larnaca', country: 'Cipru' },
  { iata: 'TLV', city: 'Tel Aviv', country: 'Israel' },
  { iata: 'CAI', city: 'Cairo', country: 'Egipt' },
  { iata: 'MRU', city: 'Mauritius', country: 'Mauritius' },
  { iata: 'SEZ', city: 'Seychelles', country: 'Seychelles' },
  { iata: 'MLE', city: 'Maldive', country: 'Maldive' },
  { iata: 'CMB', city: 'Colombo', country: 'Sri Lanka' },
  { iata: 'DEL', city: 'Delhi', country: 'India' },
  { iata: 'BOM', city: 'Mumbai', country: 'India' },
  { iata: 'GOI', city: 'Goa', country: 'India' },
  { iata: 'KTM', city: 'Kathmandu', country: 'Nepal' },
  { iata: 'DPS', city: 'Bali (Denpasar)', country: 'Indonezia' },
  { iata: 'SIN', city: 'Singapore', country: 'Singapore' },
  { iata: 'KUL', city: 'Kuala Lumpur', country: 'Malaezia' },
  { iata: 'HKT', city: 'Phuket', country: 'Thailanda' },
  { iata: 'HAN', city: 'Hanoi', country: 'Vietnam' },
  { iata: 'SGN', city: 'Ho Și Min', country: 'Vietnam' },
  { iata: 'MNL', city: 'Manila', country: 'Filipine' },
  { iata: 'HKG', city: 'Hong Kong', country: 'China' },
  { iata: 'PEK', city: 'Beijing', country: 'China' },
  { iata: 'PVG', city: 'Shanghai', country: 'China' },
  { iata: 'NRT', city: 'Tokyo', country: 'Japonia' },
  { iata: 'ICN', city: 'Seul', country: 'Coreea de Sud' },
  { iata: 'DOH', city: 'Doha', country: 'Qatar' },
  { iata: 'AUH', city: 'Abu Dhabi', country: 'Emiratele Arabe Unite' },
  { iata: 'MCT', city: 'Muscat', country: 'Oman' },
  { iata: 'NYC', city: 'New York', country: 'SUA' },
  { iata: 'MIA', city: 'Miami', country: 'SUA' },
  { iata: 'LAX', city: 'Los Angeles', country: 'SUA' },
  { iata: 'LAS', city: 'Las Vegas', country: 'SUA' },
  { iata: 'YYZ', city: 'Toronto', country: 'Canada' },
  { iata: 'CUN', city: 'Cancun', country: 'Mexic' },
  { iata: 'PUJ', city: 'Punta Cana', country: 'Republica Dominicană' },
  { iata: 'HAV', city: 'Havana', country: 'Cuba' },
  { iata: 'GRU', city: 'São Paulo', country: 'Brazilia' },
  { iata: 'RIO', city: 'Rio de Janeiro', country: 'Brazilia' },
  { iata: 'BUE', city: 'Buenos Aires', country: 'Argentina' },
  { iata: 'CPT', city: 'Cape Town', country: 'Africa de Sud' },
  { iata: 'JNB', city: 'Johannesburg', country: 'Africa de Sud' },
  { iata: 'NBO', city: 'Nairobi', country: 'Kenya' },
  { iata: 'ZNZ', city: 'Zanzibar', country: 'Tanzania' },
  { iata: 'MAR', city: 'Marrakech', country: 'Maroc' },
  { iata: 'RAK', city: 'Agadir', country: 'Maroc' },
  { iata: 'TUN', city: 'Tunis', country: 'Tunisia' },
  { iata: 'SYD', city: 'Sydney', country: 'Australia' },
  { iata: 'MEL', city: 'Melbourne', country: 'Australia' },
  { iata: 'AKL', city: 'Auckland', country: 'Noua Zeelandă' },
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
