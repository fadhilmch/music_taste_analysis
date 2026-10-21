import { coverage, filterToMonths, fmtMinutes, genreMix, rangeMonthKeys } from '../data/stats';
import type { MonthBucket, PlayAggregate } from '../data/types';
import { useAppStore } from '../state/store';
import { groupHue } from './theme';

export function GenresView({ months, aggs }: { months: MonthBucket[]; aggs: PlayAggregate[] }) {
  const genres = useAppStore((s) => s.genres);
  const genresAreDemo = useAppStore((s) => s.genresAreDemo);
  const matchState = useAppStore((s) => s.matchState);
  const matchProgress = useAppStore((s) => s.matchProgress);
  const matchError = useAppStore((s) => s.matchError);
  const startMatching = useAppStore((s) => s.startMatching);
  const source = useAppStore((s) => s.source);
  const range = useAppStore((s) => s.range);
  const month = useAppStore((s) => s.month);
  const setMonth = useAppStore((s) => s.setMonth);
  const setPlaying = useAppStore((s) => s.setPlaying);

  const rangeKeys = rangeMonthKeys(months, range);
  const curKey = month ?? months[months.length - 1]?.key;
  const cur = months.find((m) => m.key === curKey) ?? months[months.length - 1];
  const curAggs = cur ? aggs.filter((a) => a.month === cur.key) : [];
  const curMix = genreMix(curAggs, genres);
  const cov = coverage(filterToMonths(aggs, rangeKeys), genres);

  const groups = [...new Set(
    Object.values(genres).flatMap((g) => g.groups),
  )];

  return (
    <>
      {source === 'export' && matchState === 'idle' && (
        <section className="tj-panel tj-optin" aria-labelledby="tj-optin-h">
          <div className="tj-panel-head">
            <h3 id="tj-optin-h">Genre lookup is off until you enable it</h3>
          </div>
          <p className="tj-note">
            Genre tags come from MusicBrainz, a public music encyclopedia. Enabling this sends each
            artist&apos;s name - only the name, never your plays, dates, or the file itself - to
            musicbrainz.org, one request per artist at about one per second. Matches are cached on
            this device. Until then, everything below stays uncategorized rather than guessed.
          </p>
          <button type="button" className="tj-btn" onClick={() => void startMatching()}>
            Enable genre lookup
          </button>
        </section>
      )}
      {matchState === 'matching' && (
        <p className="tj-note" role="status">
          Matching genres with MusicBrainz - {matchProgress.done} of {matchProgress.total} artists,
          paced at about one request per second. Unmatched artists stay uncategorized.
        </p>
      )}
      {matchState === 'error' && (
        <p className="tj-note tj-note-error" role="alert">
          Genre matching stopped{matchError ? `: ${matchError}` : ''}.{' '}
          <button type="button" className="tj-linkbtn" onClick={() => void startMatching()}>Resume</button>
        </p>
      )}

      <section className="tj-panel" aria-labelledby="tj-mix-h">
        <div className="tj-panel-head">
          <h3 id="tj-mix-h">Genre mix over time</h3>
          <p>Share of each month's minutes{genresAreDemo ? ' - demo' : ''}</p>
        </div>
        <div className="tj-chart" role="img" aria-label="Genre mix per month">
          {months.map((m) => {
            const mix = genreMix(aggs.filter((a) => a.month === m.key), genres);
            return (
              <button
                key={m.key}
                type="button"
                className={'tj-bar tj-stack' + (m.key === cur?.key ? ' is-on' : '') + (rangeKeys.has(m.key) ? '' : ' is-dim')}
                onClick={() => { setMonth(m.key); setPlaying(false); }}
                aria-label={`${m.label} genre mix`}
              >
                {mix.slices.map((s) => (
                  <span
                    key={s.group}
                    className="tj-seg"
                    style={{ height: `${(s.minutes / Math.max(1, mix.total)) * 100}%`, background: `hsl(${groupHue(s.group)} 60% 52%)` }}
                  />
                ))}
                <span
                  className="tj-seg tj-seg-unc"
                  style={{ height: `${(mix.uncategorized / Math.max(1, mix.total)) * 100}%` }}
                />
              </button>
            );
          })}
        </div>
        <div className="tj-chart-x">
          <span>{months[0]?.label}</span>
          <span>{months[months.length - 1]?.label}</span>
        </div>
        <div className="tj-legend">
          {groups.map((g) => (
            <span key={g}><i className="tj-dot" style={{ background: `hsl(${groupHue(g)} 60% 52%)` }} />{g}</span>
          ))}
          <span><i className="tj-dot tj-dot-unc" />Uncategorized</span>
        </div>
      </section>

      {cur && (
        <section className="tj-panel" aria-labelledby="tj-breakdown-h">
          <div className="tj-panel-head">
            <h3 id="tj-breakdown-h">{cur.label} - genre breakdown</h3>
            <p>
              {curMix.total > 0 ? Math.round(((curMix.total - curMix.uncategorized) / curMix.total) * 100) : 0}% of minutes matched
            </p>
          </div>
          <ol className="tj-mini">
            {curMix.slices.map((s, i) => (
              <li key={s.group}>
                <span className="tj-rank">{i + 1}</span>
                <span className="tj-thumb tj-genre-thumb" style={{ background: `hsl(${groupHue(s.group)} 60% 52%)` }} />
                <span className="tj-mini-name">{s.group}</span>
                <span className="tj-mini-val">
                  {Math.round((s.minutes / Math.max(1, curMix.total)) * 100)}% - {fmtMinutes(s.minutes)}
                </span>
              </li>
            ))}
            {curMix.uncategorized > 0 && (
              <li>
                <span className="tj-rank">?</span>
                <span className="tj-thumb tj-genre-thumb tj-seg-unc" />
                <span className="tj-mini-name">
                  Uncategorized
                  <em>no genre metadata match - left blank, never guessed</em>
                </span>
                <span className="tj-mini-val">{Math.round((curMix.uncategorized / Math.max(1, curMix.total)) * 100)}%</span>
              </li>
            )}
          </ol>
          <p className="tj-note">
            {genresAreDemo
              ? 'Demo genres are invented. With a real export, genres are community tags matched per artist from MusicBrainz (CC BY-NC-SA, credited), not measured sound.'
              : `Genres are community tags matched per artist from MusicBrainz (CC BY-NC-SA), not measured sound. Coverage for the current range: ${cov.matched.toLocaleString()} of ${cov.total.toLocaleString()} minutes.`}
          </p>
        </section>
      )}
    </>
  );
}
