import test from 'node:test';
import assert from 'node:assert/strict';
import { matchScore, rankMatches } from '../demo/js/match.js';

const catalogue = [
  { track: { name: 'exact', energy: 0.5, danceability: 0.5, valence: 0.5 } },
  { track: { name: 'far', energy: 0.0, danceability: 0.0, valence: 0.0 } },
  { track: { name: 'near', energy: 0.55, danceability: 0.45, valence: 0.5 } },
];

test('matchScore is 100 for an exact match', () => {
  assert.equal(matchScore(catalogue[0].track, { energy: 0.5, danceability: 0.5, valence: 0.5 }), 100);
});

test('matchScore stays within 0..100', () => {
  const low = matchScore(catalogue[1].track, { energy: 1, danceability: 1, valence: 1 });
  assert.ok(low >= 0 && low <= 100);
});

test('rankMatches sorts by score and keeps ties in catalogue order', () => {
  const ranked = rankMatches(catalogue, { energy: 0.5, danceability: 0.5, valence: 0.5 }, 3);
  assert.deepEqual(ranked.map((m) => m.track.name), ['exact', 'near', 'far']);
  assert.ok(ranked[0].score >= ranked[1].score && ranked[1].score >= ranked[2].score);
});

test('rankMatches respects the limit', () => {
  assert.equal(rankMatches(catalogue, { energy: 0.5, danceability: 0.5, valence: 0.5 }, 2).length, 2);
});
