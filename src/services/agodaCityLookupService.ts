/**
 * Global Agoda city search for the destination autocomplete.
 *
 * Agoda's Long Tail Search API has no live autocomplete endpoint of its
 * own — it only accepts a numeric cityId you already know. `agoda_cities`
 * is a reference table meant to be bulk-loaded from Agoda's affiliate city
 * list (see the migration that creates it); until it's populated, this
 * quietly falls back to just the curated DESTINATIONS list so the search
 * box still works for the handful of destinations already wired up.
 */

import { supabase } from '@/lib/supabase';
import { DESTINATIONS, type DestinationOption } from '@/data/destinations';

export interface AgodaCityOption {
  agodaCityId: number;
  city: string;
  country: string;
}

function fromDestination(d: DestinationOption): AgodaCityOption | null {
  if (!d.agodaCityId) return null;
  return { agodaCityId: d.agodaCityId, city: d.city, country: d.country };
}

export async function searchAgodaCities(query: string, limit = 8): Promise<AgodaCityOption[]> {
  const q = query.trim();

  const localMatches = (q
    ? DESTINATIONS.filter((d) => d.city.toLowerCase().includes(q.toLowerCase()))
    : DESTINATIONS
  )
    .map(fromDestination)
    .filter((d): d is AgodaCityOption => d !== null);

  if (!q) return localMatches.slice(0, limit);

  let remoteMatches: AgodaCityOption[] = [];
  try {
    const { data, error } = await supabase
      .from('agoda_cities')
      .select('agoda_city_id, city_name, country_name')
      .ilike('city_name', `%${q}%`)
      .limit(limit);

    if (!error && data) {
      remoteMatches = data.map((row) => ({
        agodaCityId: row.agoda_city_id,
        city: row.city_name,
        country: row.country_name,
      }));
    }
  } catch {
    // agoda_cities not populated yet or unreachable — local list still works
  }

  const merged = [...localMatches];
  for (const r of remoteMatches) {
    if (!merged.some((m) => m.agodaCityId === r.agodaCityId)) merged.push(r);
  }

  return merged.slice(0, limit);
}
