import type { ExportFormat, ParseSummary, PlayAggregate, PlayEvent } from './types';

/**
 * Parses Spotify account-data exports into month/artist/track aggregates.
 *
 * Supported shapes:
 * - Extended streaming history (Streaming_History_Audio_*.json):
 *   { ts, ms_played, master_metadata_track_name, master_metadata_album_artist_name, ... }
 * - Legacy "endsong" history (endsong_*.json):
 *   { endTime: "YYYY-MM-DD HH:MM", msPlayed, trackName, artistName }
 *
 * Rows without a track and artist name (podcast episodes, audiobooks,
 * unknown-track rows) are skipped and counted. Only listening fields are
 * read; any other fields in the export (IP addresses, device info, ...) are
 * ignored and never stored.
 */

interface ExtendedRow {
  ts?: unknown;
  ms_played?: unknown;
  master_metadata_track_name?: unknown;
  master_metadata_album_artist_name?: unknown;
  skipped?: unknown;
  reason_end?: unknown;
  shuffle?: unknown;
  offline?: unknown;
  platform?: unknown;
}

interface LegacyRow {
  endTime?: unknown;
  msPlayed?: unknown;
  trackName?: unknown;
  artistName?: unknown;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function detectFormat(row: unknown): ExportFormat | null {
  if (!isRecord(row)) return null;
  if (typeof row.ts === 'string' && typeof row.ms_played === 'number') return 'extended';
  if (typeof row.endTime === 'string' && typeof row.msPlayed === 'number') return 'legacy';
  return null;
}

/** "2019-03-04 21:05" -> "2019-03" ; ISO strings slice to the same key. */
function monthKey(ts: string): string | null {
  const key = ts.slice(0, 7);
  return /^\d{4}-\d{2}$/.test(key) ? key : null;
}

export function parseStreamingHistory(json: unknown): ParseSummary {
  if (!Array.isArray(json)) {
    throw new Error('This file is not a Spotify streaming-history export (expected a JSON array).');
  }
  let format: ExportFormat | null = null;
  let eventCount = 0;
  let skipped = 0;
  let firstTs: string | null = null;
  let lastTs: string | null = null;
  const acc = new Map<string, PlayAggregate>();
  const events: PlayEvent[] = [];

  for (const row of json) {
    const rowFormat = detectFormat(row);
    if (rowFormat === null) { skipped += 1; continue; }
    format = format ?? rowFormat;
    let ts: string;
    let ms: number;
    let track: unknown;
    let artist: unknown;
    let ev: PlayEvent | null = null;
    if (rowFormat === 'extended') {
      const r = row as ExtendedRow;
      ts = r.ts as string;
      ms = r.ms_played as number;
      track = r.master_metadata_track_name;
      artist = r.master_metadata_album_artist_name;
      ev = {
        ts,
        artist: artist as string,
        track: track as string,
        ms,
        skipped: typeof r.skipped === 'boolean' ? r.skipped : null,
        reasonEnd: typeof r.reason_end === 'string' ? r.reason_end : null,
        shuffle: typeof r.shuffle === 'boolean' ? r.shuffle : null,
        offline: typeof r.offline === 'boolean' ? r.offline : null,
        platform: typeof r.platform === 'string' ? r.platform : null,
      };
    } else {
      const r = row as LegacyRow;
      ts = (r.endTime as string).replace(' ', 'T');
      ms = r.msPlayed as number;
      track = r.trackName;
      artist = r.artistName;
    }
    if (typeof track !== 'string' || typeof artist !== 'string' || track === '' || artist === '') {
      skipped += 1;
      continue;
    }
    const month = monthKey(ts);
    if (month === null || !(ms > 0)) { skipped += 1; continue; }
    eventCount += 1;
    if (firstTs === null || ts < firstTs) firstTs = ts;
    if (lastTs === null || ts > lastTs) lastTs = ts;
    const key = `${month}${artist}${track}`;
    const cur = acc.get(key);
    if (cur) cur.ms += ms;
    else acc.set(key, { month, artist, track, ms });
    events.push(ev ?? { ts, artist, track, ms, skipped: null, reasonEnd: null, shuffle: null, offline: null, platform: null });
  }

  if (eventCount === 0) {
    throw new Error('No music plays found in this file. Pick a Streaming_History_Audio JSON file from your Spotify export.');
  }
  return { aggregates: [...acc.values()], events, eventCount, skipped, format, firstTs, lastTs };
}
