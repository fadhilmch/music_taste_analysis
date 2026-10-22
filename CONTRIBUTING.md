# Contributing

Thanks for taking a look. This repo holds the Taste Journey web app (`app/`) and the
original 2019 analysis notebooks. Contributions are welcome as pull requests.

## Setup

You need Node.js 22 (20.19 or newer works) and npm. Then:

```sh
cd app
npm install
npm run dev
```

The app opens with built-in demo data, so you can explore every screen without any
Spotify account or personal data. To test with a real export, download your Spotify
account data (Privacy page -> Download your data) and import the
`Streaming_History_Audio*.json` files - they are read locally in your browser and never
uploaded.

## Before opening a PR

CI (GitHub Actions, free on this public repo) runs the same checks you can run locally
from `app/`:

```sh
npm run lint           # eslint, zero warnings allowed
npm run format:check   # prettier - run npm run format to fix
npm test               # vitest unit + component tests
npm run build          # type-check + production build
```

Please keep these green. If you change a shared UI primitive in
`src/ui/primitives.tsx`, extend `src/test/primitives.test.tsx` and check the styling
conventions in [app/README.md](app/README.md#styling-conventions).

## Ground rules

- **Privacy is the feature.** Never commit Spotify credentials, `credential.json`,
  `.env` files, or personal listening exports. The app must keep working fully
  on-device; any network call needs an explicit user opt-in (see the MusicBrainz
  section of app/README.md for how the existing one works).
- **Honest UI.** Demo data stays clearly labeled as demo; unmatched metadata stays
  visibly uncategorized instead of being guessed.
- **Notebooks stay as written.** The 2019 notebooks are an archive - please don't
  reformat them. If you get them running again, pinning versions in
  `requirements-notebooks.txt` is the place to help.
- Small, focused PRs with a clear description of the change and why.
