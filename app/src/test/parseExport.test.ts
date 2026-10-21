import { describe, expect, it } from 'vitest';
import { parseStreamingHistory } from '../data/parseExport';

const extended = [
  { ts: '2024-05-02T10:00:00Z', ms_played: 60000, master_metadata_track_name: 'A', master_metadata_album_artist_name: 'X' },
  { ts: '2024-05-20T11:00:00Z', ms_played: 120000, master_metadata_track_name: 'A', master_metadata_album_artist_name: 'X' },
  { ts: '2024-06-01T09:00:00Z', ms_played: 60000, master_metadata_track_name: 'B', master_metadata_album_artist_name: 'Y' },
  { ts: '2024-06-02T09:00:00Z', ms_played: 60000, master_metadata_track_name: null, master_metadata_album_artist_name: null },
  { ts: '2024-06-03T09:00:00Z', ms_played: 0, master_metadata_track_name: 'C', master_metadata_album_artist_name: 'Y' },
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
