// Klook "Specific City/Category Tours Widget" script URLs (via Travelpayouts),
// one per city currently generated in the Travelpayouts dashboard.
// The `city` field is matched against offer.destination (case-insensitive)
// to decide which widget, if any, to show on an offer's detail page.

export interface KlookCityWidget {
  city: string;
  label: string;
  src: string;
}

export const KLOOK_WIDGETS: KlookCityWidget[] = [
  {
    city: 'Istanbul',
    label: 'Istanbul',
    src: 'https://tpemb.com/content?currency=EUR&trs=565952&shmarker=769203.769203&locale=en&city_id=186&category=3&amount=3&powered_by=true&campaign_id=137&promo_id=4497',
  },
  {
    city: 'Dubai',
    label: 'Dubai',
    src: 'https://tpemb.com/content?currency=EUR&trs=565952&shmarker=769203.769203&locale=en&city_id=78&category=3&amount=3&powered_by=true&campaign_id=137&promo_id=4497',
  },
  {
    city: 'Antalya',
    label: 'Antalya',
    src: 'https://tpemb.com/content?currency=EUR&trs=565952&shmarker=769203.769203&locale=en&city_id=269&category=3&amount=3&powered_by=true&campaign_id=137&promo_id=4497',
  },
];

export function findKlookWidgetForDestination(destination: string | undefined): KlookCityWidget | undefined {
  if (!destination) return undefined;
  const normalized = destination.trim().toLowerCase();
  return KLOOK_WIDGETS.find((w) => normalized.includes(w.city.toLowerCase()));
}
