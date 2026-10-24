/**
 * Honest date-coverage handling: say what span was actually loaded, and flag
 * when a thin package makes the timeline shorter than the real history.
 */

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2016-06-21..." -> "Jun 2016" */
export function coverageLabel(ts: string): string {
  const y = Number(ts.slice(0, 4));
  const m = Number(ts.slice(5, 7));
  return `${MONTH_NAMES[m - 1] ?? ''} ${y}`.trim();
}

/** Inclusive month count between two ISO-ish timestamps. */
export function monthsBetween(firstTs: string, lastTs: string): number {
  const fy = Number(firstTs.slice(0, 4));
  const fm = Number(firstTs.slice(5, 7));
  const ly = Number(lastTs.slice(0, 4));
  const lm = Number(lastTs.slice(5, 7));
  return (ly - fy) * 12 + (lm - fm) + 1;
}

/**
 * The legacy "Account data" package carries only the past year of listening,
 * so a legacy-only import of roughly a year means the full journey needs the
 * Extended streaming history package instead. Said out loud rather than
 * letting the short timeline read as the whole story.
 */
export function looksLikePartialHistory(parseInfo: {
  format: string | null;
  firstTs: string | null;
  lastTs: string | null;
}): boolean {
  if (parseInfo.format !== 'legacy' || !parseInfo.firstTs || !parseInfo.lastTs) return false;
  return monthsBetween(parseInfo.firstTs, parseInfo.lastTs) <= 13;
}
