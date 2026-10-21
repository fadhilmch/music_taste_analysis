# Music Taste Analysis

A browser app for exploring your Spotify listening history, plus the original 2019
analysis notebooks.

- **Taste Journey app** (`app/`): a private, browser-only listening explorer. Includes
  demo data. If you import your own Spotify export, the files are read locally in your
  browser; nothing is sent anywhere unless you explicitly enable the optional genre
  lookup (which sends artist names to MusicBrainz). Setup, privacy notes and the import
  guide: [app/README.md](app/README.md).
- **Notebooks** (`music_taste_analysis.ipynb`, `spotipy_spotify_api.ipynb`): the original
  2019 analysis and the data-collection pipeline, kept as written. They use
  [spotipy](https://spotipy.readthedocs.io/) with `playlist_fadel.xlsx`.

Notebook caveat: since 27 November 2024, Spotify
[restricts several endpoints](https://developer.spotify.com/blog/2024-11-27-changes-to-the-web-api),
including Audio Features, for new apps and apps still in development mode. The pipeline's
audio-features step needs an app outside those restrictions; its metadata steps (search,
artist, album and track lookups) are unaffected.
