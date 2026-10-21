import test from 'node:test';
import assert from 'node:assert/strict';
import { mean, strongestTrait, meanTempo } from '../demo/js/stats.js';

const tracks = [
  { energy: 0.4, danceability: 0.6, valence: 0.2, tempo: 100 },
  { energy: 0.8, danceability: 0.2, valence: 0.4, tempo: 121 },
];

test('mean averages a numeric feature', () => {
  assert.ok(Math.abs(mean(tracks, 'energy') - 0.6) < 1e-9);
  assert.equal(mean([], 'energy'), 0);
});

test('strongestTrait picks the feature with the highest mean', () => {
  const best = strongestTrait(tracks, [['energy', 'Energy'], ['danceability', 'Danceability'], ['valence', 'Happiness (valence)']]);
  assert.equal(best.key, 'energy');
  assert.equal(best.label, 'Energy');
  assert.ok(Math.abs(best.value - 0.6) < 1e-9);
});

test('meanTempo rounds to a whole BPM', () => {
  assert.equal(meanTempo(tracks), 111);
});
