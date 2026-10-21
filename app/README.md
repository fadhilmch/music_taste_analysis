# Taste Journey (app/)

A private, browser-only listening-history explorer in a Spotify-inspired visual language.
Two data sources, always clearly labeled:

- **Demo data** - invented artists and plays that share the shape of a real export, so every
  screen can be reviewed without touching personal data. Every demo screen carries a
  `DEMO DATA` marker.
- **Your export** - the `Streaming_History_Audio*.json` files from Spotify's account data
  export (Privacy page -> Download your data). Files are read **locally in your browser**
  and are never uploaded anywhere. There is no server and no tracking.

## What it shows

- **Journey** - minutes listened per month, selectable time ranges (4 weeks / 6 months /
  1 year / all time), top artists per selected month, and "artist eras" (who defined each
  stretch of your history).
- **Genres** - genre mix weighted by minutes, over time and per month. Genres are community
  tags matched per artist from MusicBrainz, not measured sound. Artists with no confident
  metadata match stay visibly **Uncategorized** - never guessed. The match coverage
  (e.g. "88% of minutes matched") is always shown next to the numbers.
- **Artists / Tracks** - ranked lists with first-appearance dates from your own history.
- **Share** - a shareable PNG card drawn on your device. You pick which fields it shows;
  your raw history never appears on it and nothing is posted for you.

## Stack and why

- **Vite + React 19 + TypeScript** - fast dev loop, typed data model end to end, tiny
  production bundle (~55 kB gzip JS). The app is a static site: no backend, no build-time
  secrets.
- **zustand** - one small store for source/filter state; no boilerplate.
- **Web Worker** (`src/workers/parseWorker.ts`) - parsing multi-year exports can be tens of
  MB of JSON; it runs off the main thread so the UI stays responsive, with visible
  loading/error/empty states.
- **@fontsource/nunito** - self-hosted Nunito (rounded, matches the design language); no
  Google Fonts request, so fonts work offline and leak nothing.
- **Vitest + Testing Library** - unit tests for parsing, stats, genre grouping and the genre
  service, plus component smoke tests for the app shell.
- Charts are hand-drawn DOM/SVG-free bars (flex divs) - dependency-free, responsive, and
  enough for this data shape.

## Genre metadata: MusicBrainz (opt-in)

Nothing is sent anywhere until you explicitly enable genre lookup (a button in the Genres
view, shown for exports only). When enabled, the only data that leaves the device is each
artist's *name* as a search query (`GET /ws/2/artist/?query=artist:"<name>"&fmt=json&limit=1`)
- never plays, timestamps, track titles, or the file itself. Demo mode is fully offline and
never calls MusicBrainz.

Artist genre tags come from the [MusicBrainz](https://musicbrainz.org) API (`ws/2/artist`),
queried directly from the browser (CORS is open). Constraints we honor:

- **Rate limiting** - about 1 request/second per IP; the app fetches tags lazily, per
  artist, and caches results.
- **License** - MusicBrainz tags (including genre associations) are **CC BY-NC-SA 3.0**,
  not CC0. That is a non-commercial, share-alike license: fine for a personal/portfolio
  tool with attribution, but it constrains commercial reuse and relicensing of derived
  data. MusicBrainz is credited in the UI next to genre figures.
- Tags are community metadata; coverage gaps are shown, not filled with guesses.

## Deliberately not included (and why)

- **Spotify login / Web API** - Spotify deprecated Audio Features, Audio Analysis,
  Recommendations and the artist `genres` field for newly created and development-mode
  apps (Nov 27, 2024), removed bulk catalog endpoints (Feb 2026), and there is **no
  listening-history endpoint at all** - the account data export is the only complete
  timeline. Development mode is capped at 5 authorized users total with a Premium owner,
  so login cannot serve a public tool. An optional display-only login may come later; it
  is intentionally out of scope now.
- **iTunes Search API fallback** - possible coverage filler, but Apple ties it to affiliate
  / promo-content terms and ~20 calls/min; excluded until that use is explicitly cleared.
- **Audio analysis / ML on Spotify content** - prohibited by Spotify policy.
- **Server upload of the export** - privacy is the feature: everything stays on-device.

## Development

```sh
npm install
npm run dev        # local dev server
npm test           # vitest run
npm run build      # type-check + production build to dist/
npm run preview    # serve the production build
```

`vite.preview.config.ts` is an extra config that bundles the app into a single
self-contained `dist/index.html` (used for review/demo links); the shipped build remains
the standard multi-asset output of `npm run build`.

## Repo notes

- The legacy static demo lives in `demo/` (branch `demo/interactive-music-taste`, PR #1).
- `playlist_fadel.xlsx` (2019 playlist snapshot) has no timestamps; it is archived in the
  repo and intentionally not part of the interactive app, which needs dated history.
- The original analysis notebooks are untouched.
