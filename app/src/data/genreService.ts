import { get as idbGet, set as idbSet } from 'idb-keyval';
import { groupsForTags } from './genreGroups';
import type { ArtistGenre } from './types';

/**
 * Genre lookup against the MusicBrainz live API.
 *
 * Constraints honored here (see app/README.md):
 * - About 1 request/second, sequential, with backoff on 503 (their rate rule).
 * - Results cached persistently in IndexedDB (including misses), so a second
 *   visit makes no repeat calls.
 * - Only artist name -> tags + origin area is read; tags are CC BY-NC-SA
 *   metadata shown with credit inside the app. No dataset is bundled or
 *   republished.
 * - iTunes is deliberately NOT queried: its published terms do not clearly
 *   cover bulk metadata reuse.
 *
 * Note: browsers cannot set a custom User-Agent header; MusicBrainz answers
 * browser-originated calls (CORS enabled), and we keep well under the limits.
 */

const MB_ENDPOINT = 'https://musicbrainz.org/ws/2/artist/';
const RATE_MS = 1100;
const MAX_RETRIES = 3;

export interface CacheStore {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<unknown>;
}

const idbCache: CacheStore = {
  get: (k) => idbGet(k),
  set: (k, v) => idbSet(k, v),
};

interface CachedEntry { genre: ArtistGenre | null }

export function normalizeArtistName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

interface MbArtistHit {
  name?: string;
  tags?: Array<{ name: string; count: number }>;
  country?: string;
  area?: { name?: string };
}

export async function lookupArtistGenre(
  name: string,
  fetcher: typeof fetch = fetch,
): Promise<ArtistGenre | null> {
  const q = encodeURIComponent(`artist:"${name.replace(/"/g, '')}"`);
  const res = await fetcher(`${MB_ENDPOINT}?query=${q}&fmt=json&limit=1`);
  if (!res.ok) throw new Error(`MusicBrainz responded ${res.status}`);
  const data = (await res.json()) as { artists?: MbArtistHit[] };
  const top = data.artists?.[0];
  if (!top?.name) return null;
  if (normalizeArtistName(top.name) !== normalizeArtistName(name)) return null;
  const tags = (top.tags ?? [])
    .slice()
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((t) => t.name);
  const groups = groupsForTags(tags);
  if (groups.length === 0) return null;
  const origin = { country: top.country ?? null, area: top.area?.name ?? null };
  return { groups, tags, source: 'musicbrainz', matchedName: top.name, origin };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface MatcherOptions {
  cache?: CacheStore;
  fetcher?: typeof fetch;
  onProgress?: (done: number, total: number) => void;
  signal?: AbortSignal;
  /** Override for tests. */
  rateMs?: number;
  sleepFn?: (ms: number) => Promise<void>;
}

/** Match a list of artist names sequentially, paced under the rate limit. */
export async function matchArtists(
  names: string[],
  opts: MatcherOptions = {},
): Promise<Record<string, ArtistGenre>> {
  const cache = opts.cache ?? idbCache;
  const fetcher = opts.fetcher ?? fetch;
  const rateMs = opts.rateMs ?? RATE_MS;
  const sleepFn = opts.sleepFn ?? sleep;
  const out: Record<string, ArtistGenre> = {};
  let done = 0;
  let lastCall = 0;

  for (const name of names) {
    if (opts.signal?.aborted) break;
    const key = `mb-artist-v2:${normalizeArtistName(name)}`;
    let entry: CachedEntry | undefined;
    try {
      entry = (await cache.get(key)) as CachedEntry | undefined;
    } catch { /* cache read failure is not fatal */ }
    if (!entry) {
      let genre: ArtistGenre | null = null;
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
        const wait = Math.max(0, rateMs - (Date.now() - lastCall));
        if (wait > 0) await sleepFn(wait);
        if (opts.signal?.aborted) break;
        lastCall = Date.now();
        try {
          genre = await lookupArtistGenre(name, fetcher);
          break;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes('503') && attempt < MAX_RETRIES) {
            await sleepFn(rateMs * (attempt + 1) * 2);
            continue;
          }
          throw err;
        }
      }
      entry = { genre };
      try {
        await cache.set(key, entry);
      } catch { /* cache write failure is not fatal */ }
    }
    if (entry.genre) out[name] = entry.genre;
    done += 1;
    opts.onProgress?.(done, names.length);
  }
  return out;
}
