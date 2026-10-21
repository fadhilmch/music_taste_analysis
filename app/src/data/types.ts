export interface PlayAggregate {
  /** Month key, YYYY-MM */
  month: string;
  artist: string;
  track: string;
  ms: number;
}

export type ExportFormat = 'extended' | 'legacy';

export interface ParseSummary {
  aggregates: PlayAggregate[];
  /** Valid music plays read from the file. */
  eventCount: number;
  /** Rows skipped (non-music rows such as podcast episodes, or invalid rows). */
  skipped: number;
  format: ExportFormat | null;
  firstTs: string | null;
  lastTs: string | null;
}

export interface MonthBucket {
  key: string;
  label: string;
  short: string;
  minutes: number;
}

export interface ArtistTotal { name: string; minutes: number; }
export interface TrackTotal { name: string; artist: string; minutes: number; }
export interface Era { artist: string; from: string; to: string; minutes: number; }

export interface GenreSlice { group: string; minutes: number; }
export interface GenreMix { slices: GenreSlice[]; uncategorized: number; total: number; }

export type GenreSource = 'musicbrainz' | 'demo';

export interface ArtistGenre {
  /** Broad groups derived from raw tags; first is primary. */
  groups: string[];
  /** Raw community tags, most-voted first (capped). */
  tags: string[];
  source: GenreSource;
  /** Artist name as returned by the source. */
  matchedName: string;
}

export type View = 'journey' | 'genres' | 'artists' | 'tracks' | 'share' | 'guide';

export interface Coverage { matched: number; total: number; }
