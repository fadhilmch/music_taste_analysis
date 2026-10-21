import { describe, expect, it, vi } from 'vitest';
import { lookupArtistGenre, matchArtists, normalizeArtistName } from '../data/genreService';

function mockFetch(payload: unknown, status = 200): typeof fetch {
  return vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  })) as unknown as typeof fetch;
}

const noDelay = async () => {};

describe('normalizeArtistName', () => {
  it('normalizes case, curly apostrophes and whitespace', () => {
    expect(normalizeArtistName('Maliq & D’Essentials')).toBe(normalizeArtistName("maliq  &  d'essentials"));
  });
});

describe('lookupArtistGenre', () => {
  it('returns grouped tags on an exact name match', async () => {
    const g = await lookupArtistGenre('Tom Misch', mockFetch({
      artists: [{ name: 'Tom Misch', tags: [{ name: 'neo soul', count: 10 }, { name: 'jazz-funk', count: 5 }] }],
    }));
    expect(g).toMatchObject({ groups: ['R&B & soul', 'Jazz'], source: 'musicbrainz', matchedName: 'Tom Misch' });
  });
  it('rejects a fuzzy name mismatch', async () => {
    const g = await lookupArtistGenre('HONNE', mockFetch({ artists: [{ name: 'Lb Honne', tags: [{ name: 'electronic', count: 3 }] }] }));
    expect(g).toBeNull();
  });
  it('returns null when no usable tags exist', async () => {
    const g = await lookupArtistGenre('X', mockFetch({ artists: [{ name: 'X', tags: [] }] }));
    expect(g).toBeNull();
  });
  it('throws on server errors', async () => {
    await expect(lookupArtistGenre('X', mockFetch({}, 500))).rejects.toThrow('500');
  });
});

describe('matchArtists', () => {
  it('uses the cache on the second run and reports progress', async () => {
    const store = new Map<string, unknown>();
    const cache = { get: async (k: string) => store.get(k), set: async (k: string, v: unknown) => { store.set(k, v); return v; } };
    const fetcher = mockFetch({ artists: [{ name: 'A', tags: [{ name: 'rock', count: 1 }] }] });
    const progress: number[] = [];
    const opts = { cache, fetcher, rateMs: 0, sleepFn: noDelay, onProgress: (d: number) => progress.push(d) };
    const first = await matchArtists(['A', 'Missing'], opts);
    expect(first.A.groups).toEqual(['Rock']);
    expect(progress).toEqual([1, 2]);
    expect(fetcher).toHaveBeenCalledTimes(2);
    const second = await matchArtists(['A', 'Missing'], opts);
    expect(second.A.groups).toEqual(['Rock']);
    expect(fetcher).toHaveBeenCalledTimes(2); // both served from cache
  });
  it('retries on 503 then succeeds', async () => {
    const store = new Map<string, unknown>();
    const cache = { get: async (k: string) => store.get(k), set: async (k: string, v: unknown) => { store.set(k, v); return v; } };
    let calls = 0;
    const fetcher = vi.fn(async () => {
      calls += 1;
      if (calls === 1) return { ok: false, status: 503, json: async () => ({}) };
      return { ok: true, status: 200, json: async () => ({ artists: [{ name: 'A', tags: [{ name: 'pop', count: 1 }] }] }) };
    }) as unknown as typeof fetch;
    const out = await matchArtists(['A'], { cache, fetcher, rateMs: 0, sleepFn: noDelay });
    expect(out.A.groups).toEqual(['Pop']);
    expect(calls).toBe(2);
  });
});
