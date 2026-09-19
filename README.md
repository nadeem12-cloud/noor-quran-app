# Noor — Quran Verses

A React + Vite web app that delivers a daily Quran verse, lets you explore
and search the full text, save favorites, and read fully offline. Built
mobile-first as an installable PWA.

## Features

- **Verse of the Day** — picked deterministically from a curated pool of
  ~50 verses chosen to make sense standalone (not a blind random pull,
  which can cut a verse out of its surrounding context). Same verse for
  everyone on a given calendar day.
- **Random verse** — explores the full 6,236-verse index.
- **Daily context notes** — a short, factual blurb per curated verse (see
  the caution note below).
- **Favorites** — saved locally (IndexedDB via Dexie), available offline.
- **Search** — by keyword (English translation text), surah name, or a
  direct verse key like `2:255`.
- **Arabic + English + Urdu** — swap translation from Settings.
- **Offline** — chapters you open are cached automatically; a "Save all"
  button in Settings downloads the entire Quran for offline reading. A
  service worker (Workbox via `vite-plugin-pwa`) precaches the app shell.
- **Accessible & responsive** — `lang="ar"`/`dir="rtl"` on Arabic text,
  visible focus states, adjustable font size, reduced-motion support,
  mobile-first layout up to desktop width.

## Data source & licensing

- **Arabic text** (Uthmani script): The Noble Qur'an Encyclopedia
  (quranenc.com).
- **Transliteration**: Tanzil Project (tanzil.net).
- **English & Urdu translations**: quranenc.com.
- Packaged and distributed via the open-source
  [`quran-json`](https://github.com/risan/quran-json) npm package,
  **licensed CC BY-4.0**. Attribution is shown in-app under
  Settings -> About the text — keep it there if you publish this.
- The 50-verse Verse-of-the-Day pool and its context notes
  (`public/data/votd-pool.json`) were written for this project.

**Before a public launch:** have someone with Islamic-studies grounding
review the VOTD context notes and confirm the translation attributions
(translator names can be sourced differently across quranenc.com
editions). Getting this wrong is the one bug in this app that's a real
trust problem, not just an inconvenience.

## Tech stack

- React 19 + Vite
- Zustand (state)
- Dexie.js (IndexedDB — favorites, cached chapters, settings)
- Fuse.js (client-side fuzzy search)
- vite-plugin-pwa / Workbox (offline app shell + data caching)
- Plain CSS with design tokens (no UI framework) — see `src/index.css`
- Fonts: Noto Naskh Arabic, Literata, IBM Plex Sans (Google Fonts)

No backend — the entire Quran (Arabic + 2 translations) is bundled as
static JSON and fetched client-side, so there's nothing to host or pay
for beyond static file hosting.

## Running it

Requires Node.js 18 or later.

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Open the URL it prints (usually http://localhost:5173).

**To build for production / test the real offline behavior:**

```bash
npm run build
npm run preview
```

`npm run dev` does not register the offline service worker — you need
`build` + `preview` (or a real deployment) to see offline mode working.

**Deploying:** `npm run build` produces a static `dist/` folder — drag it
into Vercel, Netlify, GitHub Pages, or any static host. No environment
variables or backend needed.

### Regenerating the Quran data (optional)

The JSON in `public/data/` is already generated and committed, so you
don't need to do this to run the app. If you update the `quran-json`
package or want to adjust the merge logic:

```bash
npm run prepare-data
```

This reads from `node_modules/quran-json/dist` and rewrites
`public/data/surahs.json`, `public/data/chapters/*.json`, and
`public/data/search-index.json`.

## Project structure

```
public/data/
  surahs.json             # 114 surahs: names, verse counts, revelation place
  chapters/{1..114}.json  # full text per surah: Arabic + transliteration + en/ur
  search-index.json       # flattened verse list for client-side search
  votd-pool.json          # curated Verse-of-the-Day pool + context notes
scripts/
  prepare-data.mjs        # regenerates the above from the quran-json package
src/
  lib/
    db.js                 # Dexie schema (favorites, cached chapters, settings)
    quranData.js          # fetch + IndexedDB-cache helpers
    dailyVerse.js         # DailyVerseScheduler — deterministic VOTD pick
  store/useStore.js       # Zustand: view state, favorites, settings
  components/
    Home.jsx              # Verse of the Day + random verse
    VotdBanner.jsx
    VerseCard.jsx         # the reusable verse unit (Arabic/translation/actions)
    SurahList.jsx         # Browse
    VerseViewer.jsx       # Reader for one surah
    SearchView.jsx
    FavoritesTray.jsx     # bottom-sheet quick-access tray
    Settings.jsx
    Header.jsx / BottomNav.jsx
```

## What's not included (roadmap)

Scoped out of this MVP on purpose:

- **Accounts / cross-device sync** — everything is local-only right now.
  Fastest path to add it: Supabase or Firebase Auth, then mirror the
  `favorites` table to a `user_favorites` table server-side.
- **Tafsir** — would need its own licensed source and UI (an expandable
  panel per verse).
- **Audio recitation** — AlQuran Cloud's API has free audio editions if
  you want to add this without building your own hosting.
- **Push/local notifications** for the daily verse.
- **More translation languages** — `quran-json` already ships Bengali,
  Spanish, French, Indonesian, Russian, Swedish, Turkish, and Chinese;
  wiring in more is mostly repeating the `prepare-data.mjs` merge step.
