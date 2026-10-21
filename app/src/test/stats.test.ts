import { describe, expect, it } from 'vitest';
import { artistEras, buildMonths, coverage, genreMix, monthKeyOfTs, topArtists, topTracks } from '../data/stats';
import type { ArtistGenre, PlayAggregate } from '../data/types';

const aggs: PlayAggregate[] = [
  { month: '2024-01', artist: 'A', track: 't1', ms: 60000 },
  { month: '2024-01', artist: 'B', track: 't2', ms: 120000 },
  { month: '2024-03', artist: 'A', track: 't3', ms: 60000 },
  { month: '2024-03', artist: 'A', track: 't1', ms: 60000 },
];

describe('buildMonths', () => {
  it('fills gaps and keeps chronological order', () => {
    const months = buildMonths(aggs);
    expect(months.map((m) => m.key)).toEqual(['2024-01', '2024-02', '2024-03']);
    expect(months[0].minutes).toBe(3);
    expect(months[1].minutes).toBe(0);
    expect(months[0].label).toBe('Jan 2024');
  });
});

describe('top lists', () => {
  it('ranks artists and tracks by minutes', () => {
    expect(topArtists(aggs, 2).map((a) => a.name)).toEqual(['A', 'B']);
    expect(topArtists(aggs, 2)[0].minutes).toBe(3);
    expect(topTracks(aggs, 2)[0]).toMatchObject({ name: 't1', artist: 'A', minutes: 2 });
  });
});

describe('artistEras', () => {
  it('merges consecutive months with the same leader', () => {
    const months = buildMonths(aggs);
    const eras = artistEras(months, aggs);
    expect(eras).toHaveLength(2);
    expect(eras[0]).toMatchObject({ artist: 'B', from: '2024-01', to: '2024-01' });
    expect(eras[1]).toMatchObject({ artist: 'A', from: '2024-03', to: '2024-03' });
  });
});

describe('genreMix + coverage', () => {
  const genres: Record<string, ArtistGenre> = {
    A: { groups: ['Rock'], tags: ['rock'], source: 'musicbrainz', matchedName: 'A' },
  };
  it('weights by minutes and never guesses unmatched artists', () => {
    const mix = genreMix(aggs, genres);
    expect(mix.slices).toEqual([{ group: 'Rock', minutes: 3 }]);
    expect(mix.uncategorized).toBe(2);
    expect(mix.total).toBe(5);
    const cov = coverage(aggs, genres);
    expect(cov).toEqual({ matched: 3, total: 5 });
  });
});

describe('monthKeyOfTs', () => {
  it('slices ISO timestamps', () => {
    expect(monthKeyOfTs('2024-11-30T23:59:59Z')).toBe('2024-11');
  });
});
