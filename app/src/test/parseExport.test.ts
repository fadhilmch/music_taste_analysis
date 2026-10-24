import { describe, expect, it } from 'vitest';
import { parseStreamingHistory, parseStreamingHistoryMulti } from '../data/parseExport';

const extended = [
  {
    ts: '2024-05-02T10:00:00Z',
    ms_played: 60000,
    master_metadata_track_name: 'A',
    master_metadata_album_artist_name: 'X',
  },
  {
    ts: '2024-05-20T11:00:00Z',
    ms_played: 120000,
    master_metadata_track_name: 'A',
    master_metadata_album_artist_name: 'X',
  },
  {
    ts: '2024-06-01T09:00:00Z',
    ms_played: 60000,
    master_metadata_track_name: 'B',
    master_metadata_album_artist_name: 'Y',
  },
  {
    ts: '2024-06-02T09:00:00Z',
    ms_played: 60000,
    master_metadata_track_name: null,
    master_metadata_album_artist_name: null,
  },
  {
    ts: '2024-06-03T09:00:00Z',
    ms_played: 0,
    master_metadata_track_name: 'C',
    master_metadata_album_artist_name: 'Y',
  },
];

describe('parseStreamingHistory (extended)', () => {
  it('aggregates by month/artist/track and skips non-music rows', () => {
    const s = parseStreamingHistory(extended);
    expect(s.format).toBe('extended');
    expect(s.eventCount).toBe(3);
    expect(s.skipped).toBe(2); // null track + zero ms
    expect(s.firstTs).toBe('2024-05-02T10:00:00Z');
    expect(s.lastTs).toBe('2024-06-01T09:00:00Z');
    const a = s.aggregates.find((r) => r.track === 'A');
    expect(a).toMatchObject({ month: '2024-05', artist: 'X', ms: 180000 });
  });
});

describe('parseStreamingHistory (legacy)', () => {
  it('converts endTime to a month key', () => {
    const s = parseStreamingHistory([
      { endTime: '2019-03-04 21:05', msPlayed: 90000, trackName: 'T', artistName: 'Z' },
    ]);
    expect(s.format).toBe('legacy');
    expect(s.aggregates[0]).toMatchObject({ month: '2019-03', artist: 'Z', track: 'T', ms: 90000 });
  });
});

describe('parseStreamingHistory (invalid)', () => {
  it('rejects non-array input', () => {
    expect(() => parseStreamingHistory({ hello: 1 })).toThrow(/not a Spotify streaming-history/);
  });
  it('rejects files with no music plays', () => {
    expect(() => parseStreamingHistory([{ foo: 'bar' }])).toThrow(/No music plays/);
  });
});

describe('parseStreamingHistoryMulti', () => {
  const play = (ts: string, track: string, artist: string, ms = 60000) => ({
    ts,
    ms_played: ms,
    master_metadata_track_name: track,
    master_metadata_album_artist_name: artist,
  });

  it('combines files into one timeline regardless of period spans', () => {
    const s = parseStreamingHistoryMulti([
      [play('2024-03-01T10:00:00Z', 'A', 'X'), play('2024-03-02T10:00:00Z', 'A', 'X')],
      [play('2022-07-01T10:00:00Z', 'B', 'Y'), play('2026-01-05T10:00:00Z', 'C', 'Z')],
    ]);
    expect(s.eventCount).toBe(4);
    expect(s.files).toBe(2);
    expect(s.duplicates).toBe(0);
    expect(s.firstTs).toBe('2022-07-01T10:00:00Z');
    expect(s.lastTs).toBe('2026-01-05T10:00:00Z');
    // Same month + artist + track across files sums into one aggregate.
    const a = s.aggregates.find((r) => r.track === 'A');
    expect(a).toMatchObject({ month: '2024-03', artist: 'X', ms: 120000 });
  });

  it('removes exact duplicate rows from overlapping export files once', () => {
    const dup = play('2024-01-01T00:00:00Z', 'Same', 'SameArtist', 30000);
    const s = parseStreamingHistoryMulti([[dup, play('2024-01-01T01:00:00Z', 'Other', 'SameArtist')], [dup]]);
    expect(s.eventCount).toBe(2);
    expect(s.duplicates).toBe(1);
    expect(s.events.filter((e) => e.track === 'Same')).toHaveLength(1);
  });

  it('keeps legitimately repeated plays that differ in timestamp', () => {
    const s = parseStreamingHistoryMulti([
      [play('2024-01-01T00:00:00Z', 'Loop', 'X'), play('2024-01-01T00:03:00Z', 'Loop', 'X')],
    ]);
    expect(s.eventCount).toBe(2);
    expect(s.duplicates).toBe(0);
  });

  it('reports no format when extended and legacy files are mixed', () => {
    const s = parseStreamingHistoryMulti([
      [play('2024-01-01T00:00:00Z', 'A', 'X')],
      [{ endTime: '2019-03-04 21:05', msPlayed: 90000, trackName: 'T', artistName: 'Z' }],
    ]);
    expect(s.eventCount).toBe(2);
    expect(s.format).toBeNull();
  });

  it('rejects an empty selection and non-array files', () => {
    expect(() => parseStreamingHistoryMulti([])).toThrow(/at least one/);
    expect(() => parseStreamingHistoryMulti([{ hello: 1 }])).toThrow(/not a Spotify/);
  });
});
