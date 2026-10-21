import type { MonthBucket } from '../data/types';
import { useAppStore } from '../state/store';
import { topArtists } from '../data/stats';
import type { PlayAggregate } from '../data/types';
import { artistBackground } from './theme';

export function PlayerBar({ months, aggs }: { months: MonthBucket[]; aggs: PlayAggregate[] }) {
  const month = useAppStore((s) => s.month);
  const setMonth = useAppStore((s) => s.setMonth);
  const playing = useAppStore((s) => s.playing);
  const setPlaying = useAppStore((s) => s.setPlaying);

  const idx = Math.max(0, months.findIndex((m) => m.key === (month ?? months[months.length - 1]?.key)));
  const cur = months[idx];
  const topArtist = cur ? topArtists(aggs.filter((a) => a.month === cur.key), 1)[0] : undefined;

  if (!cur) return null;
  return (
    <div className="tj-player">
      <span className="tj-thumb" style={{ background: artistBackground(topArtist?.name ?? '?') }} />
      <div className="tj-player-mid">
        <p className="tj-player-title">{cur.label}{topArtist ? ` - ${topArtist.name}` : ''}</p>
        <input
          type="range"
          min={0}
          max={months.length - 1}
          value={idx}
          aria-label="Scrub through months"
          aria-valuetext={cur.label}
          onChange={(e) => { setMonth(months[Number(e.target.value)].key); setPlaying(false); }}
        />
      </div>
      <button
        type="button"
        className="tj-play"
        onClick={() => setPlaying(!playing)}
        aria-label={playing ? 'Pause the journey' : 'Play the journey'}
      >
        {playing ? '❚❚' : '▶'}
      </button>
    </div>
  );
}
