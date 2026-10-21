// Mood matching: rank catalogue tracks by similarity to a target mood.
// Pure functions, no DOM access, so they are unit-testable.

// Target and track features are 0..1 for energy, danceability and valence.
export function matchScore(track, target) {
  const distance = Math.sqrt(
    (track.energy - target.energy) ** 2 +
    (track.danceability - target.danceability) ** 2 +
    (track.valence - target.valence) ** 2,
  );
  return Math.max(0, Math.round((1 - distance / Math.sqrt(3)) * 100));
}

// Returns the top `limit` entries of `catalogue` (items shaped {track}) ranked
// by match score, highest first. Ties keep catalogue order.
export function rankMatches(catalogue, target, limit = 3) {
  return catalogue
    .map((entry, index) => ({ entry, index, score: matchScore(entry.track, target) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(({ entry, score }) => ({ ...entry, score }));
}
