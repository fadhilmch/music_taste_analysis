import { describe, expect, it } from 'vitest';
import { groupsForTags } from '../data/genreGroups';

describe('groupsForTags', () => {
  it('prefers Electronic over Pop for synth-pop/electropop', () => {
    expect(groupsForTags(['synth-pop', 'pop'])[0]).toBe('Electronic');
    expect(groupsForTags(['electropop'])[0]).toBe('Electronic');
  });
  it('ignores nationality and decade tags', () => {
    expect(groupsForTags(['rock', 'indonesia'])).toEqual(['Rock']);
    expect(groupsForTags(['indonesia'])).toEqual([]);
  });
  it('maps neo soul to R&B & soul', () => {
    expect(groupsForTags(['neo soul', 'jazz-funk'])).toEqual(['R&B & soul', 'Jazz']);
  });
  it('is case-insensitive', () => {
    expect(groupsForTags(['Alternative Rock'])).toEqual(['Rock']);
  });
});
