// Demo dataset for the interactive music-taste demo.
// Every track, artist and profile below is invented for demonstration.
// No real playlist or personal data is included.

export const PROFILES = {
  you: {
    label: 'You (demo)',
    blurb: 'Mellow groove with an energetic streak.',
    tracks: [
      { name: 'Velvet Static', artist: 'Monochrome Club', vibe: 'groovy, laid-back', acousticness: 0.22, danceability: 0.71, energy: 0.62, instrumentalness: 0.01, liveness: 0.11, speechiness: 0.05, valence: 0.58, tempo: 118 },
      { name: 'Kopi Pagi', artist: 'Senja Radio', vibe: 'warm, jazzy', acousticness: 0.48, danceability: 0.64, energy: 0.52, instrumentalness: 0.04, liveness: 0.13, speechiness: 0.06, valence: 0.61, tempo: 104 },
      { name: 'Slow Fever', artist: 'The Night Market', vibe: 'sultry, mid-tempo', acousticness: 0.19, danceability: 0.68, energy: 0.66, instrumentalness: 0.0, liveness: 0.09, speechiness: 0.07, valence: 0.44, tempo: 110 },
      { name: 'Glasshouse', artist: 'Ivory Coastline', vibe: 'bright, melodic', acousticness: 0.31, danceability: 0.59, energy: 0.71, instrumentalness: 0.02, liveness: 0.17, speechiness: 0.05, valence: 0.72, tempo: 124 },
      { name: 'Kartika', artist: 'Pantai Ensemble', vibe: 'folksy, heartfelt', acousticness: 0.66, danceability: 0.51, energy: 0.44, instrumentalness: 0.03, liveness: 0.21, speechiness: 0.04, valence: 0.49, tempo: 96 },
      { name: 'Neon Sahur', artist: 'Kota Lights', vibe: 'funky, playful', acousticness: 0.12, danceability: 0.78, energy: 0.74, instrumentalness: 0.0, liveness: 0.12, speechiness: 0.09, valence: 0.83, tempo: 122 },
      { name: 'Paper Boats', artist: 'Arunika', vibe: 'soft, nostalgic', acousticness: 0.58, danceability: 0.47, energy: 0.38, instrumentalness: 0.06, liveness: 0.15, speechiness: 0.04, valence: 0.36, tempo: 88 },
      { name: 'Rooftop Letters', artist: 'Monochrome Club', vibe: 'breezy, romantic', acousticness: 0.35, danceability: 0.62, energy: 0.57, instrumentalness: 0.01, liveness: 0.1, speechiness: 0.05, valence: 0.66, tempo: 112 },
    ],
  },
  friendA: {
    label: 'Friend A (demo)',
    blurb: 'Big festival energy, all day.',
    tracks: [
      { name: 'Overdrive', artist: 'Voltage Park', vibe: 'euphoric, loud', acousticness: 0.03, danceability: 0.74, energy: 0.95, instrumentalness: 0.11, liveness: 0.19, speechiness: 0.08, valence: 0.81, tempo: 128 },
      { name: 'Strobe Garden', artist: 'Laserfield', vibe: 'pulsing, hypnotic', acousticness: 0.01, danceability: 0.82, energy: 0.91, instrumentalness: 0.34, liveness: 0.14, speechiness: 0.06, valence: 0.64, tempo: 126 },
      { name: 'Confetti Cannon', artist: 'Pop Meridian', vibe: 'anthemic, glossy', acousticness: 0.05, danceability: 0.79, energy: 0.88, instrumentalness: 0.0, liveness: 0.22, speechiness: 0.07, valence: 0.9, tempo: 124 },
      { name: 'Bassline Carousel', artist: 'DJ Rantai', vibe: 'heavy, bouncy', acousticness: 0.02, danceability: 0.85, energy: 0.89, instrumentalness: 0.28, liveness: 0.1, speechiness: 0.12, valence: 0.58, tempo: 130 },
      { name: 'Midnight Sprint', artist: 'Voltage Park', vibe: 'driving, dark', acousticness: 0.04, danceability: 0.7, energy: 0.93, instrumentalness: 0.18, liveness: 0.16, speechiness: 0.05, valence: 0.41, tempo: 132 },
      { name: 'Hands Up', artist: 'Pop Meridian', vibe: 'feel-good, chant', acousticness: 0.07, danceability: 0.81, energy: 0.84, instrumentalness: 0.0, liveness: 0.25, speechiness: 0.1, valence: 0.87, tempo: 122 },
      { name: 'Turbo Heart', artist: 'Laserfield', vibe: 'fast, sugary', acousticness: 0.02, danceability: 0.77, energy: 0.9, instrumentalness: 0.09, liveness: 0.12, speechiness: 0.06, valence: 0.76, tempo: 134 },
      { name: 'Final Drop', artist: 'DJ Rantai', vibe: 'explosive, rave', acousticness: 0.01, danceability: 0.83, energy: 0.97, instrumentalness: 0.41, liveness: 0.09, speechiness: 0.11, valence: 0.69, tempo: 136 },
    ],
  },
  friendB: {
    label: 'Friend B (demo)',
    blurb: 'Quiet mornings and fingerpicked guitar.',
    tracks: [
      { name: 'Mist Over Fields', artist: 'Willow & Pine', vibe: 'gentle, pastoral', acousticness: 0.9, danceability: 0.38, energy: 0.21, instrumentalness: 0.07, liveness: 0.12, speechiness: 0.03, valence: 0.44, tempo: 76 },
      { name: 'Tea at Dawn', artist: 'June Harbor', vibe: 'cozy, soft', acousticness: 0.84, danceability: 0.42, energy: 0.28, instrumentalness: 0.02, liveness: 0.1, speechiness: 0.04, valence: 0.57, tempo: 82 },
      { name: 'River Hymn', artist: 'Willow & Pine', vibe: 'solemn, warm', acousticness: 0.88, danceability: 0.35, energy: 0.24, instrumentalness: 0.12, liveness: 0.14, speechiness: 0.03, valence: 0.38, tempo: 71 },
      { name: 'Wool Sweater', artist: 'June Harbor', vibe: 'intimate, tender', acousticness: 0.81, danceability: 0.46, energy: 0.33, instrumentalness: 0.01, liveness: 0.11, speechiness: 0.05, valence: 0.52, tempo: 90 },
      { name: 'Porch Light', artist: 'The Quiet North', vibe: 'reflective, slow', acousticness: 0.86, danceability: 0.31, energy: 0.19, instrumentalness: 0.05, liveness: 0.13, speechiness: 0.03, valence: 0.33, tempo: 68 },
      { name: 'Cedar Smoke', artist: 'The Quiet North', vibe: 'earthy, calm', acousticness: 0.79, danceability: 0.44, energy: 0.3, instrumentalness: 0.16, liveness: 0.09, speechiness: 0.04, valence: 0.47, tempo: 85 },
      { name: 'First Snow', artist: 'Alda', vibe: 'delicate, wistful', acousticness: 0.92, danceability: 0.29, energy: 0.16, instrumentalness: 0.22, liveness: 0.08, speechiness: 0.03, valence: 0.41, tempo: 63 },
      { name: 'Homeward', artist: 'Alda', vibe: 'hopeful, gentle', acousticness: 0.85, danceability: 0.4, energy: 0.26, instrumentalness: 0.04, liveness: 0.1, speechiness: 0.04, valence: 0.6, tempo: 79 },
    ],
  },
};

export const FEATURES = [
  ['acousticness', 'Acousticness'],
  ['danceability', 'Danceability'],
  ['energy', 'Energy'],
  ['instrumentalness', 'Instrumental'],
  ['liveness', 'Liveness'],
  ['speechiness', 'Speechiness'],
  ['valence', 'Happiness (valence)'],
];

export const ALL_TRACKS = Object.entries(PROFILES).flatMap(([profile, p]) =>
  p.tracks.map((track) => ({ profile, track })),
);
