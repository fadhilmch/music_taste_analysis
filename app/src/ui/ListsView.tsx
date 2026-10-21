import { filterToMonths, fmtMinutes, rangeMonthKeys, topArtists, topTracks } from '../data/stats';
import type { MonthBucket, PlayAggregate } from '../data/types';
import { useAppStore } from '../state/store';
import { artistBackground } from './theme';

export function ArtistsView({ months, aggs }: { months: MonthBucket[]; aggs: PlayAggregate[] }) {
  const range = useAppStore((s) => s.range);
  const source = useAppStore((s) => s.source);
  const ranged = filterToMonths(aggs, rangeMonthKeys(months, range));
  const artists = topArtists(ranged, 12);
  const rangeLabel = { '4w': '4 weeks', '6m': '6 months', '1y': '1 year', all: 'All time' }[range] ?? range;

  return (
    <section className="tj-panel" aria-labelledby="tj-artists-h">
      <div className="tj-panel-head">
        <h3 id="tj-artists-h">Top artists</h3>
        <p>{rangeLabel}{source === 'demo' ? ' - demo' : ''}</p>
      </div>
      <div className="tj-grid">
        {artists.map((t, i) => (
          <div key={t.name} className="tj-tile">
            <div className="tj-tile-art" style={{ background: artistBackground(t.name) }} />
            <p className="tj-tile-name">{i + 1}. {t.name}</p>
            <p className="tj-tile-sub">{fmtMinutes(t.minutes)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TracksView({ months, aggs }: { months: MonthBucket[]; aggs: PlayAggregate[] }) {
  const range = useAppStore((s) => s.range);
  const source = useAppStore((s) => s.source);
  const ranged = filterToMonths(aggs, rangeMonthKeys(months, range));
  const tracks = topTracks(ranged, 10);
  const rangeLabel = { '4w': '4 weeks', '6m': '6 months', '1y': '1 year', all: 'All time' }[range] ?? range;

  return (
    <section className="tj-panel" aria-labelledby="tj-tracks-h">
      <div className="tj-panel-head">
        <h3 id="tj-tracks-h">Top tracks</h3>
        <p>{rangeLabel}{source === 'demo' ? ' - demo' : ''}</p>
      </div>
      <ol className="tj-mini tj-tracks">
        {tracks.map((t, i) => (
          <li key={t.artist + t.name}>
            <span className="tj-rank">{i + 1}</span>
            <span className="tj-thumb" style={{ background: artistBackground(t.artist) }} />
            <span className="tj-mini-name">{t.name}<em>{t.artist}</em></span>
            <span className="tj-mini-val">{fmtMinutes(t.minutes)}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
