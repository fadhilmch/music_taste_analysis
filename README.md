# Music Taste Analysis

An analysis of my music taste through Spotify audio features, plus an interactive demo
built from the same ideas.

- **Interactive demo** (`demo/`): a zero-dependency web page with a taste profile,
  mood map and mood mixer. It runs entirely on invented demo data - no Spotify login
  and no personal playlist data.
- **Notebooks** (`music_taste_analysis.ipynb`, `spotipy_spotify_api.ipynb`): the original
  2019 analysis and the Spotify data-collection pipeline, kept as written.

## Run the demo

The demo is plain HTML/CSS/JS with no build step:

```bash
# from the repo root
python3 -m http.server 8080 --directory demo
# then open http://localhost:8080
```

or open `demo/index.html` through any static server (ES modules need http, not file://).

![Taste profile](docs/screenshots/demo-desktop.png)

![Mood mixer on mobile](docs/screenshots/demo-mobile.png)

### What the demo shows

1. **Taste profile** - average audio features per profile, with the strongest trait highlighted.
2. **Mood map** - tracks scattered by energy against happiness or danceability.
3. **Mood mixer** - set energy, danceability and happiness, and get the closest tracks
   by feature similarity. Match scores are similarity, not predictions of what you will like.

Every track, artist and profile in the demo is invented for demonstration.

## Test

The demo logic (statistics and mood matching) has unit tests with the Node test runner,
no dependencies:

```bash
npm test
```

## Notebooks and Spotify API access

The 2019 notebooks use [spotipy](https://spotipy.readthedocs.io/) to collect albums, tracks
and audio features into `playlist_fadel.xlsx`, then plot feature means, a radar chart and
valence/energy relationships.

Since 27 November 2024, Spotify
[no longer exposes the Audio Features and Audio Analysis endpoints](https://developer.spotify.com/blog/2024-11-27-changes-to-the-web-api)
to new apps or apps still in development mode, so the collection pipeline only runs for
apps that already had extended quota access before that change.

Credentials are read from environment variables, never committed:

```bash
export SPOTIFY_CLIENT_ID=...
export SPOTIFY_CLIENT_SECRET=...
```

## Project structure

```
demo/            interactive demo (plain HTML/CSS/JS modules)
demo/js/data.js    invented demo tracks and profiles
demo/js/stats.js   feature statistics (pure, tested)
demo/js/match.js   mood matching (pure, tested)
demo/js/charts.js  inline-SVG chart renderers
demo/js/app.js     page wiring
tests/           node:test unit tests
music_taste_analysis.ipynb   original analysis (legacy, kept as-is)
spotipy_spotify_api.ipynb    original data collection (legacy, kept as-is)
playlist_fadel.xlsx          original saved dataset (unchanged)
```
