/// <reference lib="webworker" />
import { parseStreamingHistory, parseStreamingHistoryMulti } from '../data/parseExport';

/**
 * Parses export JSON off the main thread so large histories do not freeze the
 * UI. Receives one raw file text or an array of them (Spotify splits exports
 * into several JSON files), reports per-file progress for multi-file reads,
 * and returns the combined ParseSummary.
 */
self.onmessage = (e: MessageEvent<string | string[]>) => {
  try {
    if (Array.isArray(e.data)) {
      const parts: unknown[] = [];
      e.data.forEach((text, i) => {
        parts.push(JSON.parse(text));
        postMessage({ progress: { done: i + 1, total: e.data.length } });
      });
      postMessage({ ok: true, summary: parseStreamingHistoryMulti(parts) });
    } else {
      const json = JSON.parse(e.data) as unknown;
      const summary = parseStreamingHistory(json);
      postMessage({ ok: true, summary });
    }
  } catch (err) {
    postMessage({ ok: false, error: err instanceof Error ? err.message : String(err) });
  }
};
