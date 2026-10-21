import { artistEras, filterToMonths, fmtMinutes, monthLabel, rangeMonthKeys, topArtists } from '../data/stats';
import type { MonthBucket, PlayAggregate } from '../data/types';
import { useAppStore } from '../state/store';
import { artistBackground } from './theme';

export function JourneyView({ months, aggs }: { months: MonthBucket[]; aggs: PlayAggregate[] }) {
  const range = useAppStore((s) => s.range);
  const month = useAppStore((s) => s.month);
  const setMonth = useAppStore((s) => s.setMonth);
  const setPlaying = useAppStore((s) => s.setPlaying);

  const rangeKeys = rangeMonthKeys(months, range);
  const ranged = filterToMonths(aggs, rangeKeys);
  const total = ranged.reduce((s, a) => s + a.ms, 0) / 60000;
  const maxMin = Math.max(1, ...months.map((m) => m.minutes));
  const curKey = month ?? months[months.length - 1]?.key;
  const cur = months.find((m) => m.key === curKey) ?? months[months.length - 1];
  const curAggs = cur ? aggs.filter((a) => a.month === cur.key) : [];
  const curTop = topArtists(curAggs, 3);
  const eras = artistEras(months, aggs);
  const rangeLabel = { '4w': '4 weeks', '6m': '6 months', '1y': '1 year', all: 'All time' }[range] ?? range;

  return (
    <>
      <section className="tj-panel" aria-labelledby="tj-journey-h">
        <div className="tj-panel-head">
          <h3 id="tj-journey-h">Listening over time</h3>
          <p>{fmtMinutes(total)} - {rangeLabel}</p>
        </div>
        <div className="tj-chart" role="img" aria-label="Monthly listening minutes">
          {months.map((m) => (
            <button
              key={m.key}
              type="button"
              className={'tj-bar' + (m.key === cur?.key ? ' is-on' : '') + (rangeKeys.has(m.key) ? '' : ' is-dim')}
              style={{ height: `${Math.max(6, (m.minutes / maxMin) * 100)}%` }}
              onClick={() => { setMonth(m.key); setPlaying(false); }}
              aria-label={`${m.label}, ${fmtMinutes(m.minutes)}`}
            />
          ))}
        </div>
        <div className="tj-chart-x">
          <span>{months[0]?.label}</span>
          <span>{months[months.length - 1]?.label}</span>
        </div>
      </section>

      {cur && (
        <section className="tj-panel" aria-labelledby="tj-month-h">
          <div className="tj-panel-head">
            <h3 id="tj-month-h">{cur.label}</h3>
            <p>{fmtMinutes(cur.minutes)}</p>
          </div>
          {curTop.length > 0 ? (
            <ol className="tj-mini">
              {curTop.map((t, i) => (
                <li key={t.name}>
                  <span className="tj-rank">{i + 1}</span>
                  <span className="tj-thumb" style={{ background: artistBackground(t.name) }} />
                  <span className="tj-mini-name">{t.name}</span>
                  <span className="tj-mini-val">{fmtMinutes(t.minutes)}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="tj-note">No listening recorded this month.</p>
          )}
        </section>
      )}

      <section className="tj-panel" aria-labelledby="tj-eras-h">
        <div className="tj-panel-head">
          <h3 id="tj-eras-h">Artist eras</h3>
          <p>Who defined each stretch</p>
        </div>
        <div className="tj-eras">
          {eras.map((e) => (
            <button
              key={e.artist + e.from}
              type="button"
              className="tj-era"
              onClick={() => { setMonth(e.to); setPlaying(false); }}
            >
              <span className="tj-thumb tj-era-art" style={{ background: artistBackground(e.artist) }} />
              <span className="tj-era-name">{e.artist}</span>
              <span className="tj-era-when">
                {monthLabel(e.from).label}{e.to !== e.from ? ` - ${monthLabel(e.to).label}` : ''}
              </span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
