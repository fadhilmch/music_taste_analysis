import {
  chapters, discoveries, fmtMinutes, hourHistogram, mixStats, monthLabel, sessions, skipStats, weekdayHistogram,
} from '../data/stats';
import type { Chapter, MonthBucket, PlayAggregate } from '../data/types';
import { useAppStore } from '../state/store';
import { artistBackground } from './theme';

const KIND_LABEL: Record<Chapter['kind'], string> = {
  first: 'First obsession',
  takeover: 'The takeover',
  phase: 'A new phase',
  comeback: 'The comeback',
};

const WEEKDAY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function hourLabel(h: number): string {
  const from = h % 12 === 0 ? 12 : h % 12;
  const to = (h + 1) % 12 === 0 ? 12 : (h + 1) % 12;
  const ampm = h < 12 ? 'am' : 'pm';
  return `${from}-${to} ${ampm}`;
}

function MiniBars({ values, labels, ariaLabel }: { values: number[]; labels: string[]; ariaLabel: string }) {
  const max = Math.max(1, ...values);
  return (
    <div className="tj-minibars" role="img" aria-label={ariaLabel}>
      {values.map((v, i) => (
        <div key={labels[i]} className="tj-minibar-col">
          <div className="tj-minibar" style={{ height: `${Math.max(3, (v / max) * 100)}%` }} />
          <span className="tj-minibar-x">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

export function StoryView({ months, aggs }: { months: MonthBucket[]; aggs: PlayAggregate[] }) {
  const events = useAppStore((s) => s.events);
  const setMonth = useAppStore((s) => s.setMonth);
  const setPlaying = useAppStore((s) => s.setPlaying);
  const setView = useAppStore((s) => s.setView);

  const ch = chapters(months, aggs);
  const clock = hourHistogram(events);
  const week = weekdayHistogram(events);
  const peakHour = clock.indexOf(Math.max(...clock));
  const skips = skipStats(events);
  const disc = discoveries(aggs);
  const sess = sessions(events);
  const mix = mixStats(events);

  const playStory = () => {
    if (ch.length > 0) {
      setMonth(ch[0].from);
      setPlaying(true);
    }
  };

  return (
    <>
      <section className="tj-panel" aria-labelledby="tj-chapters-h">
        <div className="tj-panel-head">
          <h3 id="tj-chapters-h">Your story in chapters</h3>
          <button type="button" className="tj-btn" onClick={playStory}>Play the story</button>
        </div>
        <p className="tj-note">
          Chapters are stretches where one artist led your listening. Labels come only from
          your minutes - nothing is invented. Playing scrubs the timeline from chapter one.
        </p>
        <ol className="tj-chapters">
          {ch.map((c, i) => (
            <li key={c.artist + c.from}>
              <button
                type="button"
                className="tj-chapter"
                onClick={() => { setMonth(c.from); setPlaying(false); setView('journey'); }}
                aria-label={`Chapter ${i + 1}: ${c.artist}, ${monthLabel(c.from).label} to ${monthLabel(c.to).label}`}
              >
                <span className="tj-chapter-num">{i + 1}</span>
                <span className="tj-thumb" style={{ background: artistBackground(c.artist) }} />
                <span className="tj-chapter-body">
                  <span className="tj-chapter-kind">{KIND_LABEL[c.kind]}{c.current ? ' - where you are now' : ''}</span>
                  <span className="tj-chapter-artist">{c.artist}</span>
                  <span className="tj-chapter-meta">
                    {monthLabel(c.from).label} - {monthLabel(c.to).label} · {fmtMinutes(c.minutes)} ·{' '}
                    {Math.round(c.share * 100)}% of those months
                    {c.topTrack ? ` · top track: ${c.topTrack}` : ''}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </section>

      <section className="tj-panel" aria-labelledby="tj-clock-h">
        <div className="tj-panel-head">
          <h3 id="tj-clock-h">Listening clock</h3>
          <p>{events.length > 0 ? `Peak: ${hourLabel(peakHour)}` : ''}</p>
        </div>
        {events.length > 0 ? (
          <>
            <MiniBars values={clock} labels={Array.from({ length: 24 }, (_, h) => (h % 6 === 0 ? String(h) : ''))} ariaLabel="Minutes per hour of day" />
            <MiniBars values={week} labels={WEEKDAY} ariaLabel="Minutes per weekday" />
          </>
        ) : (
          <p className="tj-note">Per-play timestamps appear here once an export is loaded.</p>
        )}
      </section>

      <section className="tj-panel" aria-labelledby="tj-disc-h">
        <div className="tj-panel-head">
          <h3 id="tj-disc-h">Discoveries</h3>
          <p>{disc.totalArtists} artists on record</p>
        </div>
        <MiniBars
          values={disc.byMonth.map((m) => m.count)}
          labels={disc.byMonth.map((m) => monthLabel(m.month).short)}
          ariaLabel="New artists heard for the first time per month"
        />
        <ul className="tj-facts">
          <li><strong>{disc.keepers}</strong> keepers - heard in at least three different months</li>
          <li><strong>{disc.oneMonthWonders}</strong> one-month wonders - heard in a single month</li>
          {disc.latest.length > 0 && (
            <li>Latest first-listens: {disc.latest.slice(0, 3).map((l) => l.artist).join(', ')}</li>
          )}
        </ul>
      </section>

      <section className="tj-panel" aria-labelledby="tj-skip-h">
        <div className="tj-panel-head">
          <h3 id="tj-skip-h">Skips and sessions</h3>
          {skips.hasFlags && <p>{Math.round(skips.rate * 100)}% of plays skipped</p>}
        </div>
        {skips.hasFlags ? (
          <>
            {skips.byArtist.length > 0 && (
              <ol className="tj-mini">
                {skips.byArtist.slice(0, 3).map((a, i) => (
                  <li key={a.artist}>
                    <span className="tj-rank">{i + 1}</span>
                    <span className="tj-thumb" style={{ background: artistBackground(a.artist) }} />
                    <span className="tj-mini-name">{a.artist}</span>
                    <span className="tj-mini-val">{Math.round(a.skipRate * 100)}% skipped</span>
                  </li>
                ))}
              </ol>
            )}
            <p className="tj-note">
              Skipped is Spotify&apos;s own flag on each play; only artists with 20+ flagged plays are ranked.
            </p>
          </>
        ) : (
          <p className="tj-note">This file carries no skip flags (older exports don&apos;t), so skip stats stay blank rather than guessed.</p>
        )}
        {sess.count > 0 && (
          <ul className="tj-facts">
            <li><strong>{sess.count.toLocaleString()}</strong> listening sessions (a gap of 30+ minutes splits them)</li>
            <li>Longest session: <strong>{fmtMinutes(sess.longestMin)}</strong> across <strong>{sess.activeDays.toLocaleString()}</strong> active days</li>
          </ul>
        )}
      </section>

      {(mix.shuffleShare !== null || mix.platforms.length > 0) && (
        <section className="tj-panel" aria-labelledby="tj-mix-h2">
          <div className="tj-panel-head">
            <h3 id="tj-mix-h2">How you listened</h3>
          </div>
          <ul className="tj-facts">
            {mix.shuffleShare !== null && <li>Shuffle on for <strong>{Math.round(mix.shuffleShare * 100)}%</strong> of flagged plays</li>}
            {mix.offlineShare !== null && <li><strong>{Math.round(mix.offlineShare * 100)}%</strong> of flagged plays were offline</li>}
            {mix.platforms.length > 0 && (
              <li>
                By minutes: {mix.platforms.slice(0, 4).map((p) => `${p.name} ${Math.round(p.share * 100)}%`).join(' · ')}
              </li>
            )}
          </ul>
        </section>
      )}

      <section className="tj-panel tj-narrator" aria-labelledby="tj-narr-h">
        <div className="tj-panel-head">
          <h3 id="tj-narr-h">Narration - not enabled yet</h3>
        </div>
        <p className="tj-note">
          A narrator could turn these computed facts into written chapters and answers. Two routes
          are possible: a small model that runs inside this browser (free and private, but needs a
          multi-GB download and a recent device), or a hosted API (stronger writing, costs money,
          and sends only a computed fact sheet - never your raw export - to a third party).
          Neither is wired up. Nothing is downloaded, shared, or paid for from this app; choosing
          a route is a conversation, not a setting here.
        </p>
      </section>
    </>
  );
}
