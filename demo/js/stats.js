// Pure statistics helpers for the demo. No DOM access, so they are unit-testable.

export function mean(tracks, key) {
  if (!tracks.length) return 0;
  return tracks.reduce((sum, t) => sum + t[key], 0) / tracks.length;
}

export function strongestTrait(tracks, features) {
  let best = null;
  for (const [key, label] of features) {
    const value = mean(tracks, key);
    if (!best || value > best.value) best = { key, label, value };
  }
  return best;
}

export function meanTempo(tracks) {
  return Math.round(mean(tracks, 'tempo'));
}
