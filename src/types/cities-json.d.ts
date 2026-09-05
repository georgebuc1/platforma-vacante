// `cities.json` (https://www.npmjs.com/package/cities.json) ships plain JSON
// with no TypeScript types of its own — this just describes its shape so
// `import('cities.json')` in src/utils/worldCities.ts type-checks.
declare module 'cities.json' {
  interface CitiesJsonEntry {
    name: string;
    lat: string;
    lng: string;
    country: string;
    admin1?: string;
    admin2?: string;
  }

  const cities: CitiesJsonEntry[];
  export default cities;
}
