// Supabase Edge Function: agoda-search
//
// Why this exists (do NOT call Agoda directly from the browser):
//  - Agoda requires an Authorization header "siteid:apikey" that must stay secret.
//  - Agoda's affiliate API is server-to-server only (no CORS for browsers).
//  - Agoda restricts requests by source IP.
//
// Flow:  Browser (agodaService.ts) -> supabase.functions.invoke('agoda-search')
//        -> this Edge Function -> http://affiliateapi7643.agoda.com/affiliateservice/lt_v1
//
// Secrets (set with `supabase secrets set`, never in the frontend):
//   AGODA_SITE_ID
//   AGODA_API_KEY
//   AGODA_API_URL   (optional override)
//
// Deploy:
//   supabase functions deploy agoda-search
//   supabase secrets set AGODA_SITE_ID=123456 AGODA_API_KEY=00000000-0000-0000-0000-000000000000

import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';

const AGODA_URL =
  Deno.env.get('AGODA_API_URL') || 'http://affiliateapi7643.agoda.com/affiliateservice/lt_v1';

// Supabase's own CORS headers — required because supabase-js calls this
// from the browser with an `apikey` / `authorization` header.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CitySearchInput {
  type: 'city';
  cityId: number;
  checkInDate: string;
  checkOutDate: string;
  currency?: string;
  language?: string;
  maxResult?: number;
  minimumStarRating?: number;
  minimumReviewScore?: number;
  dailyRateMin?: number;
  dailyRateMax?: number;
  sortBy?: string;
  discountOnly?: boolean;
  numberOfAdult?: number;
  numberOfChildren?: number;
  childrenAges?: number[];
}

interface HotelListSearchInput {
  type: 'hotel';
  hotelId: number[];
  checkInDate: string;
  checkOutDate: string;
  currency?: string;
  language?: string;
  discountOnly?: boolean;
  numberOfAdult?: number;
  numberOfChildren?: number;
  childrenAges?: number[];
}

type SearchInput = CitySearchInput | HotelListSearchInput;

function buildRequestBody(input: SearchInput) {
  const additional: Record<string, unknown> = {
    currency: input.currency || 'RON',
    discountOnly: input.discountOnly ?? false,
    language: input.language || 'ro-ro',
    occupancy: {
      numberOfAdult: input.numberOfAdult ?? 2,
      numberOfChildren: input.numberOfChildren ?? 0,
      ...(input.childrenAges ? { childrenAges: input.childrenAges } : {}),
    },
  };

  if (input.type === 'city') {
    Object.assign(additional, {
      maxResult: input.maxResult ?? 20,
      minimumStarRating: input.minimumStarRating ?? 0,
      minimumReviewScore: input.minimumReviewScore ?? 0,
      sortBy: input.sortBy || 'Recommended',
      dailyRate: {
        minimum: input.dailyRateMin ?? 0,
        maximum: input.dailyRateMax ?? 100000,
      },
    });

    return {
      criteria: {
        additional,
        checkInDate: input.checkInDate,
        checkOutDate: input.checkOutDate,
        cityId: input.cityId,
      },
    };
  }

  return {
    criteria: {
      additional,
      checkInDate: input.checkInDate,
      checkOutDate: input.checkOutDate,
      hotelId: input.hotelId,
    },
  };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const siteId = Deno.env.get('AGODA_SITE_ID');
  const apiKey = Deno.env.get('AGODA_API_KEY');

  if (!siteId || !apiKey) {
    return json({ error: 'Agoda credentials not configured on the server' }, 500);
  }

  let input: SearchInput;
  try {
    input = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  if (!input?.type || (input.type !== 'city' && input.type !== 'hotel')) {
    return json({ error: 'input.type must be "city" or "hotel"' }, 400);
  }
  if (!input.checkInDate || !input.checkOutDate) {
    return json({ error: 'checkInDate and checkOutDate are required' }, 400);
  }

  const requestBody = buildRequestBody(input);
  const authHeader = `${siteId}:${apiKey}`; // must match siteid/apikey exactly, per Agoda spec

  try {
    const agodaResponse = await fetch(AGODA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip,deflate',
        Authorization: authHeader,
      },
      body: JSON.stringify(requestBody),
    });

    const text = await agodaResponse.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!agodaResponse.ok) {
      return json({ error: 'Agoda API error', status: agodaResponse.status, details: data }, agodaResponse.status);
    }

    return json(data, 200);
  } catch (error) {
    return json(
      { error: 'Failed to reach Agoda API', details: error instanceof Error ? error.message : String(error) },
      502
    );
  }
});
