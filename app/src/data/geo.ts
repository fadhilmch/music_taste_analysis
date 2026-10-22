import {
  COUNTRY_INFO,
  WORLD_COUNTRIES,
  WORLD_H,
  WORLD_SPHERE,
  WORLD_W,
  type WorldCountry,
} from './worldData';

/**
 * World geography, rendered fully offline from precomputed Natural Earth
 * 110m paths (public domain, see worldData.ts). No map tiles, no geocoding
 * service, no network, no geo dependencies at runtime. Positions are
 * COUNTRY CENTROIDS: a pin marks "artists from this country", never a real
 * location or where the user listened.
 */

export { WORLD_W, WORLD_H };

export interface CountryShape {
  /** ISO 3166-1 numeric id as string, from the dataset. */
  id: string;
  name: string;
  centroid: [number, number];
  d: string;
}

interface WorldCache {
  shapes: CountryShape[];
  byNumeric: Map<string, CountryShape>;
  sphere: string;
}

let cache: WorldCache | null = null;

export function worldShapes(): WorldCache {
  if (cache) return cache;
  const shapes: CountryShape[] = WORLD_COUNTRIES.map((c: WorldCountry) => ({
    id: c.id,
    name: c.name,
    centroid: [c.cx, c.cy],
    d: c.d,
  }));
  cache = { shapes, byNumeric: new Map(shapes.map((s) => [s.id, s])), sphere: WORLD_SPHERE };
  return cache;
}

/** Country shape for an ISO alpha-2 code (MusicBrainz `country` field), if it exists on the map. */
export function countryForAlpha2(alpha2: string | null | undefined): CountryShape | null {
  if (!alpha2) return null;
  const info = COUNTRY_INFO[alpha2.toUpperCase()];
  if (!info) return null;
  return worldShapes().byNumeric.get(info.id) ?? null;
}

/** English display name for an ISO alpha-2 code, or the raw code when unknown. */
export function countryName(alpha2: string): string {
  return COUNTRY_INFO[alpha2.toUpperCase()]?.name ?? alpha2.toUpperCase();
}
