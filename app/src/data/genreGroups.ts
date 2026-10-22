/**
 * Maps free-form community tags (MusicBrainz) to broad, stable display groups.
 * Analytical choice, documented in app/README.md: the first matching group in
 * this ordered list wins, so "synth-pop" lands in Electronic, not Pop.
 */

/** Tags that describe origin/popularity, not sound. Excluded from grouping. */
const STOP_TAGS = new Set([
  'indonesia',
  'indonesian',
  'british',
  'uk',
  'american',
  'usa',
  'english',
  'swedish',
  'sweden',
  'japanese',
  'korean',
  'german',
  'french',
  'seen live',
  'favorites',
  'favourites',
  'male vocalists',
  'female vocalists',
  '80s',
  '90s',
  '00s',
  '2010s',
  '2000s',
  '70s',
  '60s',
  'all',
  'spotify',
]);

const GROUP_KEYWORDS: ReadonlyArray<readonly [string, string[]]> = [
  ['Hip-hop', ['hip hop', 'hip-hop', 'rap', 'trap', 'grime']],
  [
    'Electronic',
    [
      'electronic',
      'house',
      'techno',
      'edm',
      'dance',
      'dubstep',
      'drum and bass',
      'dnb',
      'trance',
      'electronica',
      'downtempo',
      'chillout',
      'synth-pop',
      'synthpop',
      'electropop',
      'electro',
      'idm',
      'garage',
    ],
  ],
  ['R&B & soul', ['r&b', 'rnb', 'soul', 'neo soul', 'neo-soul', 'funk', 'motown', 'disco']],
  ['Jazz', ['jazz', 'bebop', 'swing']],
  [
    'Rock',
    [
      'rock',
      'metal',
      'punk',
      'grunge',
      'alternative',
      'shoegaze',
      'post-punk',
      'madchester',
      'britpop',
      'emo',
      'hardcore',
      'indie rock',
    ],
  ],
  ['Pop', ['pop', 'boy band', 'girl group', 'k-pop', 'j-pop', 'kpop', 'jpop', 'dangdut']],
  [
    'Folk & acoustic',
    ['folk', 'acoustic', 'singer-songwriter', 'country', 'americana', 'bluegrass', 'indie folk'],
  ],
  [
    'Ambient & classical',
    [
      'ambient',
      'classical',
      'instrumental',
      'soundtrack',
      'score',
      'piano',
      'orchestral',
      'lo-fi',
      'lofi',
      'chillhop',
    ],
  ],
  [
    'Latin & world',
    [
      'latin',
      'reggaeton',
      'reggae',
      'afrobeat',
      'afrobeats',
      'world',
      'ska',
      'bossa nova',
      'samba',
      'cumbia',
      'afropop',
    ],
  ],
];

/** Broad groups for a tag list, in rule order. Empty when nothing matches. */
export function groupsForTags(tags: string[]): string[] {
  const usable = tags.map((t) => t.toLowerCase()).filter((t) => !STOP_TAGS.has(t));
  const out: string[] = [];
  for (const [group, keywords] of GROUP_KEYWORDS) {
    if (usable.some((t) => keywords.some((k) => t.includes(k)))) out.push(group);
  }
  return out;
}
