import type {
  ArtistGenre, ArtistTotal, Coverage, Era, GenreMix, MonthBucket, PlayAggregate, TrackTotal,
} from './types';

export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function monthKeyOfTs(ts: string): string {
  return ts.slice(0, 7);
}

export function monthLabel(key: string): { label: string; short: string } {
  const [y, m] = key.split('-').map(Number);
  return { label: `${MONTH_NAMES[m - 1]} ${y}`, short: MONTH_NAMES[m - 1] };
}

/** Contiguous month buckets from first to last play, minutes rounded. */
export function buildMonths(aggs: PlayAggregate[]): MonthBucket[] {
  if (aggs.length === 0) return [];
  const keys = [...new Set(aggs.map((a) => a.month))].sort();
  const out: MonthBucket[] = [];
  let [y, m] = keys[0].split('-').map(Number);
  const [endY, endM] = keys[keys.length - 1].split('-').map(Number);
  const byMonth = new Map<string, number>();
  for (const a of aggs) byMonth.set(a.month, (byMonth.get(a.month) ?? 0) + a.ms);
  while (y < endY || (y === endY && m <= endM)) {
    const key = `${y}-${String(m).padStart(2, '0')}`;
    const { label, short } = monthLabel(key);
    out.push({ key, label, short, minutes: Math.round((byMonth.get(key) ?? 0) / 60000) });
    m += 1;
    if (m > 12) { m = 1; y += 1; }
  }
  return out;
}

export function filterToMonths(aggs: PlayAggregate[], keys: ReadonlySet<string>): PlayAggregate[] {
  return aggs.filter((a) => keys.has(a.month));
}

export function totalMinutes(aggs: PlayAggregate[]): number {
  return Math.round(aggs.reduce((s, a) => s + a.ms, 0) / 60000);
}

export function topArtists(aggs: PlayAggregate[], n: number): ArtistTotal[] {
  const by = new Map<string, number>();
  for (const a of aggs) by.set(a.artist, (by.get(a.artist) ?? 0) + a.ms);
  return [...by.entries()]
    .map(([name, ms]) => ({ name, minutes: Math.round(ms / 60000) }))
    .sort((a, b) => b.minutes - a.minutes || a.name.localeCompare(b.name))
    .slice(0, n);
}

export function topTracks(aggs: PlayAggregate[], n: number): TrackTotal[] {
  const by = new Map<string, TrackTotal & { ms: number }>();
  for (const a of aggs) {
    const key = `${a.artist}${a.track}`;
    const cur = by.get(key) ?? { name: a.track, artist: a.artist, minutes: 0, ms: 0 };
    cur.ms += a.ms;
    by.set(key, cur);
  }
  return [...by.values()]
    .map((t) => ({ name: t.name, artist: t.artist, minutes: Math.round(t.ms / 60000) }))
    .sort((a, b) => b.minutes - a.minutes || a.name.localeCompare(b.name))
    .slice(0, n);
}

/** Consecutive stretches of months led by the same top artist. */
export function artistEras(months: MonthBucket[], aggs: PlayAggregate[]): Era[] {
  const eras: Era[] = [];
  let cur: Era | null = null;
  for (const mo of months) {
    const top = topArtists(aggs.filter((a) => a.month === mo.key), 1)[0];
    if (!top) continue;
    if (cur && cur.artist === top.name) {
      cur.to = mo.key;
      cur.minutes += top.minutes;
    } else {
      if (cur) eras.push(cur);
      cur = { artist: top.name, from: mo.key, to: mo.key, minutes: top.minutes };
    }
  }
  if (cur) eras.push(cur);
  return eras;
}

export function uniqueArtists(aggs: PlayAggregate[]): string[] {
  return [...new Set(aggs.map((a) => a.artist))].sort((a, b) => a.localeCompare(b));
}

/**
 * Genre mix weighted by minutes. Artists with no matched genre contribute to
 * `uncategorized` - never guessed.
 */
export function genreMix(aggs: PlayAggregate[], genres: Record<string, ArtistGenre | undefined>): GenreMix {
  const byGroup = new Map<string, number>();
  let total = 0;
  let matched = 0;
  for (const a of aggs) {
    total += a.ms;
    const g = genres[a.artist];
    if (g && g.groups.length > 0) {
      matched += a.ms;
      byGroup.set(g.groups[0], (byGroup.get(g.groups[0]) ?? 0) + a.ms);
    }
  }
  const slices = [...byGroup.entries()]
    .map(([group, ms]) => ({ group, minutes: Math.round(ms / 60000) }))
    .sort((a, b) => b.minutes - a.minutes || a.group.localeCompare(b.group));
  return {
    slices,
    uncategorized: Math.round((total - matched) / 60000),
    total: Math.round(total / 60000),
  };
}

export function coverage(aggs: PlayAggregate[], genres: Record<string, ArtistGenre | undefined>): Coverage {
  let matched = 0;
  let total = 0;
  for (const a of aggs) {
    total += a.ms;
    const g = genres[a.artist];
    if (g && g.groups.length > 0) matched += a.ms;
  }
  return { matched: Math.round(matched / 60000), total: Math.round(total / 60000) };
}

export function rangeMonthKeys(months: MonthBucket[], range: string): Set<string> {
  const len = range === '4w' ? 1 : range === '6m' ? 6 : range === '1y' ? 12 : months.length;
  return new Set(months.slice(Math.max(0, months.length - len)).map((m) => m.key));
}

export function fmtMinutes(min: number): string {
  if (min >= 60000) return `${(min / 60000).toFixed(1)}k hr`;
  if (min >= 10000) return `${(min / 1000).toFixed(1)}k min`;
  if (min >= 1000) return `${(min / 1000).toFixed(1)}k min`;
  return `${min} min`;
}
