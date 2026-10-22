import { create } from 'zustand';
import { buildDemoAggregates, buildDemoEvents, DEMO_GENRES } from '../data/demoData';
import { matchArtists } from '../data/genreService';
import type { ParseSummary } from '../data/types';
import { uniqueArtists } from '../data/stats';
import type { ArtistGenre, PlayAggregate, PlayEvent, View } from '../data/types';

export type Source = 'demo' | 'export' | null;
export type MatchState = 'idle' | 'matching' | 'done' | 'error';

export interface CardBits { artist: boolean; track: boolean; minutes: boolean; genre: boolean; eras: boolean; }

interface AppState {
  source: Source;
  fileName: string | null;
  parseInfo: Omit<ParseSummary, 'aggregates' | 'events'> | null;
  aggregates: PlayAggregate[];
  events: PlayEvent[];
  genres: Record<string, ArtistGenre>;
  genresAreDemo: boolean;
  matchState: MatchState;
  matchProgress: { done: number; total: number };
  matchError: string | null;
  loading: boolean;
  error: string | null;
  view: View;
  range: string;
  month: string | null;
  playing: boolean;
  cardBits: CardBits;

  loadDemo: () => void;
  loadFile: (file: File) => Promise<void>;
  startMatching: () => Promise<void>;
  setView: (v: View) => void;
  setRange: (r: string) => void;
  setMonth: (m: string) => void;
  setPlaying: (p: boolean) => void;
  toggleCardBit: (k: keyof CardBits) => void;
  clearError: () => void;
  reset: () => void;
}

let matchAbort: AbortController | null = null;

// Raw errors (SyntaxError from JSON.parse, URL/Worker failures) mean nothing to
// someone picking a file - translate them into what to do next.
export function friendlyImportError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/streaming-history export|No music plays found/i.test(msg)) return msg;
  if (/JSON|Unexpected token|parse/i.test(msg)) {
    return 'That file is not valid JSON. Pick a Streaming_History_Audio JSON file from your Spotify export.';
  }
  return 'That file could not be read as a Spotify export. Pick a Streaming_History_Audio JSON file from your Spotify export.';
}

export const useAppStore = create<AppState>((set, get) => ({
  source: null,
  fileName: null,
  parseInfo: null,
  aggregates: [],
  events: [],
  genres: {},
  genresAreDemo: false,
  matchState: 'idle',
  matchProgress: { done: 0, total: 0 },
  matchError: null,
  loading: false,
  error: null,
  view: 'journey',
  range: 'all',
  month: null,
  playing: false,
  cardBits: { artist: true, track: true, minutes: true, genre: true, eras: false },

  loadDemo: () => {
    matchAbort?.abort();
    const aggregates = buildDemoAggregates();
    set({
      source: 'demo',
      fileName: null,
      parseInfo: null,
      aggregates,
      events: buildDemoEvents(),
      genres: { ...DEMO_GENRES },
      genresAreDemo: true,
      matchState: 'done',
      matchProgress: { done: 0, total: 0 },
      matchError: null,
      loading: false,
      error: null,
      month: null,
      playing: false,
    });
  },

  loadFile: async (file: File) => {
    matchAbort?.abort();
    set({ loading: true, error: null, playing: false });
    try {
      const text = await file.text();
      const summary = await new Promise<ParseSummary>((resolve, reject) => {
        const worker = new Worker(new URL('../workers/parseWorker.ts', import.meta.url), { type: 'module' });
        worker.onmessage = (e: MessageEvent<{ ok: boolean; summary?: ParseSummary; error?: string }>) => {
          worker.terminate();
          if (e.data.ok && e.data.summary) resolve(e.data.summary);
          else reject(new Error(e.data.error ?? 'Could not parse this file.'));
        };
        worker.onerror = () => {
          worker.terminate();
          reject(new Error('Could not parse this file.'));
        };
        worker.postMessage(text);
      });
      const { aggregates, events, ...parseInfo } = summary;
      set({
        source: 'export',
        fileName: file.name,
        parseInfo,
        aggregates,
        events,
        genres: {},
        genresAreDemo: false,
        matchState: 'idle',
        matchProgress: { done: 0, total: 0 },
        matchError: null,
        loading: false,
        error: null,
        month: null,
      });
      // No genre matching here on purpose: matching sends artist names to
      // MusicBrainz, so it only starts after explicit opt-in (Genres view).
    } catch (err) {
      set({ loading: false, error: friendlyImportError(err) });
    }
  },

  startMatching: async () => {
    const { aggregates, matchState } = get();
    if (aggregates.length === 0 || matchState === 'matching') return;
    matchAbort?.abort();
    const controller = new AbortController();
    matchAbort = controller;
    const names = uniqueArtists(aggregates);
    set({ matchState: 'matching', matchProgress: { done: 0, total: names.length }, matchError: null });
    try {
      const found = await matchArtists(names, {
        signal: controller.signal,
        onProgress: (done, total) => {
          set((s) => ({ matchProgress: { done, total }, genres: { ...s.genres } }));
        },
      });
      if (controller.signal.aborted) return;
      set((s) => ({ genres: { ...s.genres, ...found }, matchState: 'done' }));
    } catch (err) {
      if (controller.signal.aborted) return;
      set({
        matchState: 'error',
        matchError: err instanceof Error ? err.message : 'Genre matching failed.',
      });
    }
  },

  setView: (view) => set({ view }),
  setRange: (range) => set({ range }),
  setMonth: (month) => set({ month }),
  setPlaying: (playing) => set({ playing }),
  toggleCardBit: (k) => set((s) => ({ cardBits: { ...s.cardBits, [k]: !s.cardBits[k] } })),

  clearError: () => set({ error: null }),
  reset: () => {
    matchAbort?.abort();
    set({
      source: null, fileName: null, parseInfo: null, aggregates: [], events: [], genres: {},
      genresAreDemo: false, matchState: 'idle', matchProgress: { done: 0, total: 0 },
      matchError: null, loading: false, error: null, month: null, playing: false,
    });
  },
}));
