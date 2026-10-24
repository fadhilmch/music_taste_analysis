import { describe, expect, it } from 'vitest';
import { zipSync, strToU8 } from 'fflate';
import { classifyFile, extractZipJson, isZipName } from '../data/importFiles';
import { parseStreamingHistoryMulti } from '../data/parseExport';
import { coverageLabel, looksLikePartialHistory, monthsBetween } from '../data/coverage';

function extPlay(ts: string, artist = 'Artist', track = 'Song', ms = 120000) {
  return { ts, ms_played: ms, master_metadata_track_name: track, master_metadata_album_artist_name: artist };
}
function legPlay(endTime: string, artist = 'Artist', track = 'Song', ms = 120000) {
  return { endTime, msPlayed: ms, trackName: track, artistName: artist };
}

describe('classifyFile', () => {
  it('recognizes an extended history file by its rows', () => {
    const r = classifyFile({
      name: 'Streaming_History_Audio_2024.json',
      text: JSON.stringify([extPlay('2024-01-01T10:00:00Z')]),
    });
    expect(r).toEqual({
      name: 'Streaming_History_Audio_2024.json',
      status: 'loaded',
      format: 'extended',
      rows: 1,
    });
  });
  it('recognizes a legacy endsong file by its rows', () => {
    const r = classifyFile({ name: 'endsong_0.json', text: JSON.stringify([legPlay('2024-01-01 10:00')]) });
    expect(r.status).toBe('loaded');
    expect(r.format).toBe('legacy');
  });
  it('recognizes history even under an unrelated filename', () => {
    const r = classifyFile({
      name: 'whatever.json',
      text: JSON.stringify([extPlay('2024-01-01T10:00:00Z')]),
    });
    expect(r.status).toBe('loaded');
  });
  it('marks account-data side files as not-history', () => {
    for (const [name, text] of [
      ['Userdata.json', JSON.stringify({ username: 'x', email: 'x@x.com' })],
      ['Playlist1.json', JSON.stringify({ playlists: [{ name: 'mix', items: [] }] })],
      ['SearchQueries.json', JSON.stringify([{ platform: 'iOS', searchQuery: 'tulus' }])],
      ['empty.json', '[]'],
    ]) {
      expect(classifyFile({ name, text }).status).toBe('not-history');
    }
  });
  it('marks invalid JSON as unreadable', () => {
    expect(classifyFile({ name: 'broken.json', text: '{nope' }).status).toBe('unreadable');
  });
});

describe('extractZipJson', () => {
  it('extracts JSON entries from nested folders, skipping metadata and non-JSON', () => {
    const zip = zipSync({
      'My Spotify Data/Streaming_History_Audio_2024.json': strToU8(
        JSON.stringify([extPlay('2024-01-01T10:00:00Z')]),
      ),
      'My Spotify Data/Userdata.json': strToU8('{}'),
      'My Spotify Data/ReadMeFirst.pdf': strToU8('pdf'),
      '__MACOSX/._Streaming_History_Audio_2024.json': strToU8('junk'),
    });
    const files = extractZipJson(zip);
    expect(files.map((f) => f.name).sort()).toEqual(['Streaming_History_Audio_2024.json', 'Userdata.json']);
    expect(JSON.parse(files.find((f) => f.name.startsWith('Streaming'))!.text)).toHaveLength(1);
  });
  it('throws a readable error for a non-ZIP file', () => {
    expect(() => extractZipJson(strToU8('not a zip'))).toThrow(/could not be read/);
  });
  it('throws when the ZIP holds no JSON', () => {
    const zip = zipSync({ 'note.txt': strToU8('hi') });
    expect(() => extractZipJson(zip)).toThrow(/no JSON files/);
  });
  it('detects zip names case-insensitively', () => {
    expect(isZipName('MyData.ZIP')).toBe(true);
    expect(isZipName('endsong_0.json')).toBe(false);
  });
});

describe('parseStreamingHistoryMulti cross-package overlap', () => {
  it('drops legacy plays that exactly match an extended play, keeps the rest', () => {
    const extended = [
      extPlay('2024-03-04T21:05:07Z', 'Tulus', 'Hati-Hati di Jalan', 200000),
      extPlay('2024-03-04T21:09:12Z', 'Tulus', 'Interaksi', 180000),
    ];
    const legacy = [
      legPlay('2024-03-04 21:05', 'Tulus', 'Hati-Hati di Jalan', 200000), // same play as extended row 1
      legPlay('2024-03-05 08:00', 'Tulus', 'Only in legacy', 90000), // no extended counterpart
    ];
    const s = parseStreamingHistoryMulti([extended, legacy]);
    expect(s.crossPackageDuplicates).toBe(1);
    expect(s.eventCount).toBe(3);
    expect(s.format).toBeNull(); // mixed package
  });
  it('keeps a legacy row when milliseconds differ (not confident it is the same play)', () => {
    const extended = [extPlay('2024-03-04T21:05:07Z', 'Tulus', 'Song', 200000)];
    const legacy = [legPlay('2024-03-04 21:05', 'Tulus', 'Song', 199500)];
    const s = parseStreamingHistoryMulti([extended, legacy]);
    expect(s.crossPackageDuplicates).toBeUndefined();
    expect(s.eventCount).toBe(2);
  });
  it('does no cross-package matching for single-package imports', () => {
    const s = parseStreamingHistoryMulti([[legPlay('2024-03-04 21:05'), legPlay('2024-03-04 21:05')]]);
    expect(s.duplicates).toBe(1);
    expect(s.crossPackageDuplicates).toBeUndefined();
  });
});

describe('coverage helpers', () => {
  it('labels spans by month and year', () => {
    expect(coverageLabel('2016-06-21T14:32:07Z')).toBe('Jun 2016');
    expect(monthsBetween('2016-06-01T00:00:00Z', '2026-10-01T00:00:00Z')).toBe(125);
  });
  it('flags a legacy-only import of about a year as partial', () => {
    expect(
      looksLikePartialHistory({
        format: 'legacy',
        firstTs: '2025-10-01T00:00:00Z',
        lastTs: '2026-10-01T00:00:00Z',
      }),
    ).toBe(true);
  });
  it('does not flag extended or long-span imports', () => {
    expect(
      looksLikePartialHistory({
        format: 'extended',
        firstTs: '2025-10-01T00:00:00Z',
        lastTs: '2026-10-01T00:00:00Z',
      }),
    ).toBe(false);
    expect(
      looksLikePartialHistory({
        format: 'legacy',
        firstTs: '2016-06-01T00:00:00Z',
        lastTs: '2026-10-01T00:00:00Z',
      }),
    ).toBe(false);
  });
});
