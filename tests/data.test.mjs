import test from 'node:test';
import assert from 'node:assert/strict';
import { PROFILES, FEATURES, ALL_TRACKS } from '../demo/js/data.js';

const FEATURE_KEYS = FEATURES.map(([key]) => key);

test('every profile has a label, blurb and tracks', () => {
  for (const profile of Object.values(PROFILES)) {
    assert.ok(profile.label);
    assert.ok(profile.blurb);
    assert.ok(profile.tracks.length >= 5);
  }
});

test('every track has all features within 0..1 and a positive tempo', () => {
  for (const { track } of ALL_TRACKS) {
    assert.ok(track.name && track.artist && track.vibe);
    for (const key of FEATURE_KEYS) {
      assert.ok(track[key] >= 0 && track[key] <= 1, `${track.name} ${key} out of range`);
    }
    assert.ok(track.tempo > 0);
  }
});

test('catalogue covers every profile track exactly once', () => {
  const total = Object.values(PROFILES).reduce((n, p) => n + p.tracks.length, 0);
  assert.equal(ALL_TRACKS.length, total);
});
