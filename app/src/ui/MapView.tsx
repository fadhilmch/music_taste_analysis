import React from 'react';
import { chapters, filterToMonths, fmtMinutes, rangeMonthKeys, topArtists } from '../data/stats';
import type { MonthBucket, PlayAggregate } from '../data/types';
import { useAppStore } from '../state/store';
import { groupHue } from './theme';

interface Node {
  artist: string;
  group: string;
  minutes: number;
  x: number;
  y: number;
  r: number;
}

const W = 720;
const H = 470;

/** Deterministic cluster layout: groups on an ellipse, artists on a golden-angle spiral. */
function layout(aggs: PlayAggregate[], genres: Record<string, { groups: string[] } | undefined>): { nodes: Node[]; groups: string[] } {
  const top = topArtists(aggs, 42);
  if (top.length === 0) return { nodes: [], groups: [] };
  const byGroup = new Map<string, typeof top>();
  for (const a of top) {
    const g = genres[a.name]?.groups[0] ?? 'Uncategorized';
    const arr = byGroup.get(g) ?? [];
    arr.push(a);
    byGroup.set(g, arr);
  }
  const groups = [...byGroup.entries()]
    .sort((x, y) => y[1].reduce((s, a) => s + a.minutes, 0) - x[1].reduce((s, a) => s + a.minutes, 0))
    .map(([g]) => g);
  const clustered = groups.filter((g) => g !== 'Uncategorized');
  const maxMin = Math.max(...top.map((a) => a.minutes));
  const nodes: Node[] = [];
  groups.forEach((g) => {
    const members = byGroup.get(g) ?? [];
    let cx: number; let cy: number; let spread: number;
    if (g === 'Uncategorized') {
      cx = W / 2; cy = H - 34; spread = Math.min(300, 46 * members.length);
    } else {
      const angle = (clustered.indexOf(g) / Math.max(1, clustered.length)) * Math.PI * 2 - Math.PI / 2;
      cx = W / 2 + Math.cos(angle) * W * 0.31;
      cy = H / 2 - 20 + Math.sin(angle) * H * 0.3;
      spread = 26 + members.length * 15;
    }
    members.forEach((a, i) => {
      const ga = i * 2.39996; // golden angle
      const rad = 14 + Math.sqrt(i) * (spread / Math.max(2, Math.sqrt(members.length)));
      nodes.push({
        artist: a.name,
        group: g,
        minutes: a.minutes,
        x: cx + Math.cos(ga) * rad * (g === 'Uncategorized' ? spread / 60 : 1),
        y: g === 'Uncategorized' ? cy + Math.sin(ga) * 10 : cy + Math.sin(ga) * rad,
        r: 5 + 13 * Math.sqrt(a.minutes / maxMin),
      });
    });
  });
  return { nodes, groups };
}

export function MapView({ months, aggs }: { months: MonthBucket[]; aggs: PlayAggregate[] }) {
  const genres = useAppStore((s) => s.genres);
  const genresAreDemo = useAppStore((s) => s.genresAreDemo);
  const matchState = useAppStore((s) => s.matchState);
  const startMatching = useAppStore((s) => s.startMatching);
  const source = useAppStore((s) => s.source);
  const setMonth = useAppStore((s) => s.setMonth);
  const setPlaying = useAppStore((s) => s.setPlaying);
  const setView = useAppStore((s) => s.setView);

  const range = useAppStore((s) => s.range);
  const needsOptIn = source === 'export' && matchState === 'idle';
  const rangeKeys = rangeMonthKeys(months, range);
  const rangedMonths = months.filter((m) => rangeKeys.has(m.key));
  const rangedAggs = filterToMonths(aggs, rangeKeys);
  const { nodes, groups } = React.useMemo(() => layout(rangedAggs, genres), [rangedAggs, genres]);
  const ch = React.useMemo(() => chapters(rangedMonths, rangedAggs), [rangedMonths, rangedAggs]);
  const route = ch.map((c, i) => ({ n: i + 1, c, node: nodes.find((nd) => nd.artist === c.artist) })).filter((r) => r.node) as Array<{ n: number; c: (typeof ch)[number]; node: Node }>;

  if (needsOptIn) {
    return (
      <section className="tj-panel tj-optin" aria-labelledby="tj-map-optin-h">
        <div className="tj-panel-head">
          <h3 id="tj-map-optin-h">The map needs the genre lookup</h3>
        </div>
        <p className="tj-note">
          Artists are clustered by MusicBrainz listener tags, so the same one-time opt-in as the
          Genres view applies: each artist&apos;s name - only the name, never your plays, dates, or
          the file itself - goes to musicbrainz.org, about one request per second, cached on this
          device. Unmatched artists sit outside the clusters rather than being guessed.
        </p>
        <button type="button" className="tj-btn" onClick={() => void startMatching()}>
          Enable genre lookup
        </button>
      </section>
    );
  }

  return (
    <>
      <section className="tj-panel" aria-labelledby="tj-map-h">
        <div className="tj-panel-head">
          <h3 id="tj-map-h">Taste map</h3>
          <p>{genresAreDemo ? 'Demo tags' : 'MusicBrainz listener tags'}</p>
        </div>
        {nodes.length === 0 ? (
          <p className="tj-note">Load some listening first.</p>
        ) : (
          <svg viewBox={`0 0 ${W} ${H}`} className="tj-map" role="img" aria-label="Artist clusters with the era route drawn across them">
            {route.length > 1 && (
              <path
                d={route.map((r, i) => `${i === 0 ? 'M' : 'L'} ${r.node.x.toFixed(1)} ${r.node.y.toFixed(1)}`).join(' ')}
                fill="none"
                stroke="rgba(246,246,246,0.75)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="1 6"
              />
            )}
            {nodes.map((nd) => (
              <circle
                key={nd.artist}
                cx={nd.x}
                cy={nd.y}
                r={nd.r}
                fill={nd.group === 'Uncategorized' ? 'rgba(167,167,167,0.35)' : `hsl(${groupHue(nd.group)} 70% 55% / 0.85)`}
                stroke="rgba(0,0,0,0.4)"
                strokeWidth="1"
              >
                <title>{`${nd.artist} - ${nd.group}, ${fmtMinutes(nd.minutes)}`}</title>
              </circle>
            ))}
            {route.map((r) => (
              <g key={r.n} onClick={() => { setMonth(r.c.from); setPlaying(false); setView('journey'); }} style={{ cursor: 'pointer' }}>
                <circle cx={r.node.x} cy={r.node.y} r={r.node.r + 6} fill="none" stroke="#f6f6f6" strokeWidth="1.5" />
                <text x={r.node.x} y={r.node.y + 4} textAnchor="middle" fontSize="11" fontWeight="800" fill="#0b0b0b" stroke="#f6f6f6" strokeWidth="3" paintOrder="stroke">
                  {r.n}
                </text>
                <title>{`Chapter ${r.n}: ${r.c.artist}`}</title>
              </g>
            ))}
          </svg>
        )}
        <div className="tj-map-legend">
          {groups.filter((g) => g !== 'Uncategorized').slice(0, 6).map((g) => (
            <span key={g} className="tj-map-chip">
              <span className="tj-map-dot" style={{ background: `hsl(${groupHue(g)} 70% 55%)` }} />
              {g}
            </span>
          ))}
          {groups.includes('Uncategorized') && (
            <span className="tj-map-chip">
              <span className="tj-map-dot" style={{ background: 'rgba(167,167,167,0.5)' }} />
              Uncategorized
            </span>
          )}
        </div>
        <p className="tj-note">
          Closeness means artists share listener tags on MusicBrainz - it is not measured sound.
          Bigger dot, more minutes. Numbered rings are your chapters, in order; tap one to jump
          the timeline there.
        </p>
      </section>
    </>
  );
}
