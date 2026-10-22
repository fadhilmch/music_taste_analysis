/**
 * Minimal stacked-area path builder (vertical stack + monotone-in-x cubic
 * smoothing), so the spectrum stream needs no chart library at runtime.
 * Same math as the classic Fritsch-Carlson monotone interpolation used by
 * d3-shape's curveMonotoneX.
 */

export interface StackSeries {
  key: string;
  points: Array<[number, number]>; // [y0, y1] per row
}

/** Stack rows (records with numeric values per key) into [y0, y1] layers. */
export function stackRows(rows: Array<Record<string, number>>, keys: string[]): StackSeries[] {
  const series: StackSeries[] = keys.map((key) => ({ key, points: [] }));
  for (const row of rows) {
    let acc = 0;
    for (const s of series) {
      const v = row[s.key] ?? 0;
      s.points.push([acc, acc + v]);
      acc += v;
    }
  }
  return series;
}

function monotoneTangents(x: number[], y: number[]): number[] {
  const n = x.length;
  const d: number[] = new Array(n).fill(0);
  const m: number[] = new Array(n - 1);
  for (let i = 0; i < n - 1; i += 1) m[i] = (y[i + 1] - y[i]) / (x[i + 1] - x[i] || 1e-9);
  d[0] = m[0];
  d[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i += 1) d[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
  for (let i = 0; i < n - 1; i += 1) {
    if (m[i] === 0) {
      d[i] = 0;
      d[i + 1] = 0;
      continue;
    }
    const a = d[i] / m[i];
    const b = d[i + 1] / m[i];
    const s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      d[i] = t * a * m[i];
      d[i + 1] = t * b * m[i];
    }
  }
  return d;
}

function line(x: number[], y: number[]): string {
  const n = x.length;
  if (n === 1) return `M${x[0].toFixed(2)},${y[0].toFixed(2)}`;
  const t = monotoneTangents(x, y);
  let d = `M${x[0].toFixed(2)},${y[0].toFixed(2)}`;
  for (let i = 0; i < n - 1; i += 1) {
    const h = (x[i + 1] - x[i]) / 3;
    d += `C${(x[i] + h).toFixed(2)},${(y[i] + h * t[i]).toFixed(2)},${(x[i + 1] - h).toFixed(2)},${(y[i + 1] - h * t[i + 1]).toFixed(2)},${x[i + 1].toFixed(2)},${y[i + 1].toFixed(2)}`;
  }
  return d;
}

/** Closed SVG path for one stacked layer, top edge smoothed, bottom edge reversed. */
export function layerPath(points: Array<[number, number]>, xs: number[], height: number): string {
  const n = points.length;
  if (n === 0) return '';
  const y1 = points.map((p) => height - p[1] * height);
  const y0 = points.map((p) => height - p[0] * height);
  const top = line(xs, y1);
  const bottom = line([...xs].reverse(), [...y0].reverse()).slice(1); // drop leading M
  return `${top}L${bottom}Z`;
}
