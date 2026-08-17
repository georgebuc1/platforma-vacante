import type { Offer, TripType, TransportType, MealType, Currency, PriceType, OfferStatus } from '@/types';
import { generateSlug } from '@/utils/slugify';
import { calculateDurationDays, calculateDurationNights } from '@/utils/pricing';

/**
 * Column order for the CSV template. Keep in sync with parseCsvRow below.
 * Required columns are marked; everything else can be left blank in the file.
 */
export const CSV_COLUMNS = [
  'title', // required
  'short_description', // required
  'full_description',
  'country', // required
  'destination', // required
  'region',
  'trip_types', // required, semicolon-separated e.g. "beach;all_inclusive"
  'transport_type', // required: avion|autocar|masina|tren|avion_transfer
  'departure_city', // required
  'departure_airport',
  'airline',
  'stops',
  'departure_date', // required, YYYY-MM-DD
  'return_date', // required, YYYY-MM-DD
  'accommodation_included', // true|false
  'hotel_name',
  'hotel_stars',
  'number_of_nights',
  'meal_type',
  'total_price', // required, number
  'currency', // required: RON|EUR
  'price_type', // required: per_person|total
  'number_of_people',
  'transport_price',
  'accommodation_price',
  'baggage_price',
  'transfer_price',
  'other_costs',
  'provider_name', // required
  'offer_url', // required
  'is_affiliate_link', // true|false
  'main_image_url', // required
  'gallery_images', // semicolon-separated URLs
  'offer_score',
  'score_reason',
  'status', // required: draft|active
  'expires_at', // YYYY-MM-DD, optional
] as const;

const REQUIRED_COLUMNS = [
  'title', 'short_description', 'country', 'destination', 'trip_types',
  'transport_type', 'departure_city', 'departure_date', 'return_date',
  'total_price', 'currency', 'price_type', 'provider_name', 'offer_url',
  'main_image_url', 'status',
] as const;

const VALID_TRIP_TYPES: TripType[] = ['beach', 'city_break', 'mountain', 'all_inclusive', 'family', 'romantic', 'adventure', 'weekend'];
const VALID_TRANSPORT: TransportType[] = ['avion', 'autocar', 'masina', 'tren', 'avion_transfer'];
const VALID_MEAL: MealType[] = ['fara_masa', 'mic_dejun', 'demipensiune', 'pensiune_completa', 'all_inclusive'];
const VALID_CURRENCY: Currency[] = ['RON', 'EUR'];
const VALID_PRICE_TYPE: PriceType[] = ['per_person', 'total'];
const VALID_STATUS: OfferStatus[] = ['draft', 'active'];

export interface ParsedRow {
  rowNumber: number; // 1-indexed, matching what the person sees in a spreadsheet (header = row 1)
  raw: Record<string, string>;
  offer: Offer | null;
  errors: string[];
}

/** Minimal RFC4180-ish CSV parser: handles quoted fields, escaped quotes, and commas inside quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  // Normalize line endings and strip BOM
  const input = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const next = input[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') { field += '"'; i++; }
      else if (char === '"') { inQuotes = false; }
      else { field += char; }
    } else {
      if (char === '"') { inQuotes = true; }
      else if (char === ',') { row.push(field); field = ''; }
      else if (char === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else { field += char; }
    }
  }
  // Flush the last field/row if the file doesn't end with a newline
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

function toBool(value: string | undefined): boolean {
  if (!value) return false;
  return ['true', '1', 'da', 'yes'].includes(value.trim().toLowerCase());
}

function toNumber(value: string | undefined, fallback = 0): number {
  if (!value || value.trim() === '') return fallback;
  const n = Number(value.replace(',', '.').trim());
  return isNaN(n) ? fallback : n;
}

/**
 * Parses raw CSV text into validated Offer objects.
 * `existingSlugs` should contain every slug already in the database so
 * duplicates within the same import batch AND against existing offers are
 * both avoided.
 */
export function parseOffersCsv(text: string, existingSlugs: string[]): ParsedRow[] {
  const rows = parseCsv(text);
  if (rows.length === 0) return [];

  const header = rows[0].map((h) => h.trim());
  const dataRows = rows.slice(1);
  const usedSlugs = new Set(existingSlugs);

  return dataRows.map((cells, idx) => {
    const raw: Record<string, string> = {};
    header.forEach((col, i) => { raw[col] = (cells[i] ?? '').trim(); });

    const errors: string[] = [];
    for (const col of REQUIRED_COLUMNS) {
      if (!raw[col] || raw[col].trim() === '') errors.push(`Lipsește "${col}"`);
    }

    const tripTypesRaw = (raw.trip_types || '').split(';').map((t) => t.trim()).filter(Boolean);
    const tripTypes = tripTypesRaw.filter((t): t is TripType => VALID_TRIP_TYPES.includes(t as TripType));
    if (raw.trip_types && tripTypes.length === 0) errors.push(`"trip_types" invalid: ${raw.trip_types}`);

    if (raw.transport_type && !VALID_TRANSPORT.includes(raw.transport_type as TransportType)) {
      errors.push(`"transport_type" invalid: ${raw.transport_type}`);
    }
    if (raw.meal_type && !VALID_MEAL.includes(raw.meal_type as MealType)) {
      errors.push(`"meal_type" invalid: ${raw.meal_type}`);
    }
    if (raw.currency && !VALID_CURRENCY.includes(raw.currency as Currency)) {
      errors.push(`"currency" trebuie RON sau EUR, nu: ${raw.currency}`);
    }
    if (raw.price_type && !VALID_PRICE_TYPE.includes(raw.price_type as PriceType)) {
      errors.push(`"price_type" trebuie per_person sau total, nu: ${raw.price_type}`);
    }
    if (raw.status && !VALID_STATUS.includes(raw.status as OfferStatus)) {
      errors.push(`"status" trebuie draft sau active, nu: ${raw.status}`);
    }

    const departureDate = raw.departure_date;
    const returnDate = raw.return_date;
    const validDates = /^\d{4}-\d{2}-\d{2}$/.test(departureDate || '') && /^\d{4}-\d{2}-\d{2}$/.test(returnDate || '');
    if ((departureDate || returnDate) && !validDates) {
      errors.push('Datele trebuie în format YYYY-MM-DD (ex: 2026-09-15)');
    }
    if (validDates && new Date(returnDate) <= new Date(departureDate)) {
      errors.push('"return_date" trebuie să fie după "departure_date"');
    }

    const totalPrice = toNumber(raw.total_price, NaN);
    if (raw.total_price && isNaN(totalPrice)) errors.push(`"total_price" nu e un număr valid: ${raw.total_price}`);

    let offer: Offer | null = null;

    if (errors.length === 0 && validDates) {
      let slug = generateSlug(raw.title);
      let suffix = 2;
      while (usedSlugs.has(slug)) { slug = `${generateSlug(raw.title)}-${suffix}`; suffix++; }
      usedSlugs.add(slug);

      const now = new Date().toISOString();

      offer = {
        id: '',
        title: raw.title,
        slug,
        short_description: raw.short_description,
        full_description: raw.full_description || undefined,
        country: raw.country,
        destination: raw.destination,
        region: raw.region || undefined,
        trip_types: tripTypes,
        transport_type: raw.transport_type as TransportType,
        departure_city: raw.departure_city,
        departure_airport: raw.departure_airport || undefined,
        airline: raw.airline || undefined,
        stops: undefined,
        departure_date: departureDate,
        return_date: returnDate,
        duration_days: calculateDurationDays(departureDate, returnDate),
        duration_nights: calculateDurationNights(departureDate, returnDate),
        accommodation_included: toBool(raw.accommodation_included),
        hotel_name: raw.hotel_name || undefined,
        hotel_stars: raw.hotel_stars ? toNumber(raw.hotel_stars) : undefined,
        number_of_nights: raw.number_of_nights ? toNumber(raw.number_of_nights) : undefined,
        meal_type: (raw.meal_type as MealType) || undefined,
        total_price: totalPrice,
        currency: raw.currency as Currency,
        price_type: raw.price_type as PriceType,
        number_of_people: raw.number_of_people ? toNumber(raw.number_of_people) : undefined,
        transport_price: toNumber(raw.transport_price),
        accommodation_price: toNumber(raw.accommodation_price),
        baggage_price: toNumber(raw.baggage_price),
        transfer_price: toNumber(raw.transfer_price),
        other_costs: toNumber(raw.other_costs),
        provider_name: raw.provider_name,
        offer_url: raw.offer_url,
        is_affiliate_link: toBool(raw.is_affiliate_link),
        main_image_url: raw.main_image_url,
        gallery_images: raw.gallery_images ? raw.gallery_images.split(';').map((s) => s.trim()).filter(Boolean) : undefined,
        offer_score: raw.offer_score ? toNumber(raw.offer_score) : 0,
        score_reason: raw.score_reason || undefined,
        status: raw.status as OfferStatus,
        expires_at: raw.expires_at || undefined,
        last_checked_at: now,
        created_at: now,
      };
    }

    return { rowNumber: idx + 2, raw, offer, errors };
  });
}

export function buildCsvTemplate(): string {
  const header = CSV_COLUMNS.join(',');
  const example = [
    'Sejur all-inclusive Antalya, 7 nopți',
    'Vacanță relaxantă la mare, cu tot inclus',
    'Cazare 4 stele, plajă privată, piscină pentru copii',
    'Turcia',
    'Antalya',
    'Riviera Turcească',
    'beach;all_inclusive',
    'avion',
    'Bucuresti',
    'OTP',
    'Turkish Airlines',
    'direct',
    '2026-09-10',
    '2026-09-17',
    'true',
    'Sunset Resort',
    '4',
    '7',
    'all_inclusive',
    '650',
    'EUR',
    'per_person',
    '2',
    '150', '400', '20', '15', '0',
    'Booking.com',
    'https://www.booking.com/hotel/tr/example.html?aid=123456',
    'true',
    'https://example.com/poza1.jpg',
    'https://example.com/poza2.jpg;https://example.com/poza3.jpg',
    '8.7',
    'Bazat pe recenzii Booking.com',
    'active',
    '2026-09-01',
  ];
  const exampleRow = example.map((v) => (v.includes(',') ? `"${v}"` : v)).join(',');
  return `${header}\n${exampleRow}\n`;
}
