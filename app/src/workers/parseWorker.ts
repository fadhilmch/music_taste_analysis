/// <reference lib="webworker" />
import { parseStreamingHistory } from '../data/parseExport';

/**
 * Parses export JSON off the main thread so large histories do not freeze the
 * UI. Receives the raw file text, returns the ParseSummary.
 */
self.onmessage = (e: MessageEvent<string>) => {
  try {
    const json = JSON.parse(e.data) as unknown;
    const summary = parseStreamingHistory(json);
    postMessage({ ok: true, summary });
  } catch (err) {
    postMessage({ ok: false, error: err instanceof Error ? err.message : String(err) });
  }
};
