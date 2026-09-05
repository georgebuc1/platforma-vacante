/**
 * Autocomplete pentru TOATE orașele lumii, folosind pachetul `cities.json`
 * (date GeoNames, ~130.000 de localități — nume, țară, coordonate; licență
 * CC-BY-3.0, credit: geonames.org).
 *
 * De ce separat de src/data/destinations.ts:
 *  - destinations.ts e lista noastră curată (~100 orașe populare), din care
 *    unele au și un agodaCityId verificat -> pentru alea căutarea de cazări
 *    rămâne 100% pe site (API-ul Agoda Long Tail, ca până acum).
 *  - fișierul ăsta acoperă restul orașelor din lume, DOAR pentru sugestii în
 *    câmpul „Destinație” — nu vine cu un agodaCityId, pentru că Agoda nu are
 *    un API public prin care să afli id-ul unui oraș după nume (îl obții
 *    doar dintr-un fișier de referință descărcat din portalul lor de
 *    afiliați). De-asta, pentru un oraș ales de aici fără id, pagina de
 *    rezultate arată un mesaj clar în loc să te scoată pe agoda.com cu o
 *    potrivire ghicită (care putea nimeri alt oraș, exact ce reclamai).
 *
 * Dataset-ul e mare, așa că îl încărcăm cu import dinamic, o singură dată,
 * abia când utilizatorul chiar dă click/scrie în câmpul de destinație — nu
 * la încărcarea inițială a paginii.
 */

import { normalize } from '@/data/destinations';

export interface WorldCity {
  name: string;
  countryCode: string; // cod ISO 3166-1 alpha-2, ex. "FR"
}

interface RawCityEntry {
  name: string;
  country: string;
  lat: string;
  lng: string;
  admin1?: string;
  admin2?: string;
}

let cache: WorldCity[] | null = null;
let loadingPromise: Promise<WorldCity[]> | null = null;

async function loadAll(): Promise<WorldCity[]> {
  if (cache) return cache;
  if (loadingPromise) return loadingPromise;

  loadingPromise = import('cities.json').then((mod) => {
    const raw = (mod.default ?? mod) as unknown as RawCityEntry[];
    cache = raw.map((c) => ({ name: c.name, countryCode: c.country }));
    return cache;
  });

  return loadingPromise;
}

/** Preîncarcă datasetul din fundal (ex. la focus pe câmpul de destinație), fără să blocheze UI-ul. */
export function preloadWorldCities(): void {
  void loadAll();
}

/**
 * Caută orașe după prefixul scris de utilizator. Întoarce imediat (sincron)
 * dacă datasetul e deja încărcat; altfel întoarce listă goală și declanșează
 * încărcarea, apoi apelantul poate re-interoga când promisiunea se rezolvă.
 */
export function searchWorldCitiesSync(query: string, limit = 8): WorldCity[] {
  if (!cache) return [];
  const q = normalize(query.trim());
  if (q.length < 3) return []; // sub 3 litere ar da prea multe potriviri irelevante într-un dataset de 130k

  const results: WorldCity[] = [];
  for (const city of cache) {
    if (normalize(city.name).startsWith(q)) {
      results.push(city);
      if (results.length >= limit * 4) break; // suficient, deduplicăm/tăiem la limit după
    }
  }
  return results;
}

export async function searchWorldCities(query: string, limit = 8): Promise<WorldCity[]> {
  await loadAll();
  return searchWorldCitiesSync(query, limit);
}
