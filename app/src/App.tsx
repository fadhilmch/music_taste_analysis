import React from 'react';
import { buildMonths } from './data/stats';
import type { View } from './data/types';
import { useAppStore } from './state/store';
import { ArtistsView, TracksView } from './ui/ListsView';
import { GenresView } from './ui/GenresView';
import { GuideView } from './ui/GuideView';
import { JourneyView } from './ui/JourneyView';
import { PlayerBar } from './ui/PlayerBar';
import { ShareView } from './ui/ShareView';
import { SourceBar } from './ui/SourceBar';
import { EmptyState, ErrorState, LoadingState } from './ui/states';

const RANGES = [
  { id: '4w', label: '4 weeks' },
  { id: '6m', label: '6 months' },
  { id: '1y', label: '1 year' },
  { id: 'all', label: 'All time' },
];

const TABS: Array<[View, string]> = [
  ['journey', 'Journey'],
  ['genres', 'Genres'],
  ['artists', 'Artists'],
  ['tracks', 'Tracks'],
  ['share', 'Share'],
  ['guide', 'Guide'],
];

export default function App() {
  const source = useAppStore((s) => s.source);
  const loading = useAppStore((s) => s.loading);
  const error = useAppStore((s) => s.error);
  const aggregates = useAppStore((s) => s.aggregates);
  const parseInfo = useAppStore((s) => s.parseInfo);
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);
  const range = useAppStore((s) => s.range);
  const setRange = useAppStore((s) => s.setRange);
  const month = useAppStore((s) => s.month);
  const setMonth = useAppStore((s) => s.setMonth);
  const playing = useAppStore((s) => s.playing);
  const setPlaying = useAppStore((s) => s.setPlaying);

  const months = React.useMemo(() => buildMonths(aggregates), [aggregates]);

  // Playback: advance the selected month on a timer.
  React.useEffect(() => {
    if (!playing || months.length === 0) return;
    const t = setInterval(() => {
      const idx = months.findIndex((m) => m.key === (month ?? months[months.length - 1].key));
      const cur = idx < 0 ? months.length - 1 : idx;
      if (cur >= months.length - 1) {
        setPlaying(false);
      } else {
        setMonth(months[cur + 1].key);
      }
    }, 900);
    return () => clearInterval(t);
  }, [playing, months, month, setMonth, setPlaying]);

  return (
    <div className="tj">
      <div className="tj-chrome">
        <div className="tj-side">
          <p className="tj-brand">Taste Journey</p>
          <nav className="tj-nav" aria-label="Views">
            {TABS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={'tj-tab' + (view === id ? ' is-on' : '')}
                onClick={() => setView(id)}
                aria-pressed={view === id}
              >
                {label}
              </button>
            ))}
          </nav>
          {source === 'demo' && <p className="tj-demo-pill">Demo data</p>}
        </div>

        <div className="tj-main">
          <SourceBar />

          {loading && <LoadingState label="Reading your export in this tab - nothing is uploaded." />}
          {error && <ErrorState title="That file did not work" detail={error} />}

          {view === 'guide' && <GuideView />}

          {!loading && !error && view !== 'guide' && source === null && (
            <EmptyState
              title="Start with the demo or your own export"
              detail="The demo shows every screen on invented data. Your export is read locally and never uploaded."
              action={{ label: 'How to get your export', onClick: () => setView('guide') }}
            />
          )}

          {!loading && !error && view !== 'guide' && source !== null && aggregates.length > 0 && (
            <>
              {parseInfo && (
                <p className="tj-note">
                  {parseInfo.eventCount.toLocaleString()} plays read
                  {parseInfo.format ? ` (${parseInfo.format === 'extended' ? 'extended' : 'legacy'} export)` : ''}
                  {parseInfo.skipped > 0 ? `, ${parseInfo.skipped.toLocaleString()} non-music or invalid rows skipped` : ''}.
                </p>
              )}
              <div className="tj-ranges" role="group" aria-label="Time range">
                {RANGES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className={'tj-chip' + (range === r.id ? ' is-on' : '')}
                    onClick={() => setRange(r.id)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              {view === 'journey' && <JourneyView months={months} aggs={aggregates} />}
              {view === 'genres' && <GenresView months={months} aggs={aggregates} />}
              {view === 'artists' && <ArtistsView months={months} aggs={aggregates} />}
              {view === 'tracks' && <TracksView months={months} aggs={aggregates} />}
              {view === 'share' && <ShareView months={months} aggs={aggregates} />}
            </>
          )}
        </div>
      </div>

      {source !== null && aggregates.length > 0 && <PlayerBar months={months} aggs={aggregates} />}
    </div>
  );
}
