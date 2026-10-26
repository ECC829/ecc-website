# ECC — Easton–Emeralds Cricket Club

The club website for ECC, a Central Ohio cricket club fielding nine teams across
T7, T15, T20 and T40 formats.

Built with React 19, Vite, Tailwind CSS and React Router.

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build into dist/
npm run preview  # preview the production build
npm run lint     # eslint
```

## Project structure

```
src/
├─ main.jsx              # entry point, mounts the HashRouter
├─ App.jsx               # route table
├─ index.css             # Tailwind layers + design-system component classes
├─ data/                 # all site content lives here — edit these, not the pages
│  ├─ club.js            # club details, season, formats, fixtures, socials, sponsor tiers
│  ├─ players.js         # the roster + per-player profiles
│  ├─ teams.js           # the nine squads, their colours and format groupings
│  └─ tournaments.js     # competitions entered, grouped by format
├─ components/
│  ├─ Layout.jsx         # page shell (header + footer + scroll reset)
│  ├─ Header.jsx         # sticky nav with mobile drawer
│  ├─ Footer.jsx
│  ├─ Avatar.jsx         # initial-based player avatars, tinted by team colour
│  ├─ PlayerCard.jsx
│  ├─ Form.jsx           # form primitives + the `useForm` helper
│  └─ ui/index.jsx       # layout and presentational primitives
└─ pages/                # one file per route
```

## Updating content

Almost everything on the site is driven by the files in `src/data/`. Common edits:

**Add or move a player** — edit the `roster` array in `src/data/players.js`. Each
entry needs `name`, `team` and `role`; `short`, `jerseyNo`, `email` and `phone`
are optional. A profile page is generated automatically at
`/players/<slug-of-name>`.

**Add real statistics for a player** — edit `src/data/recorded-stats.json`,
keyed by the player's slug (the lowercase, hyphenated version of their full
name), or import them from CricClubs (below). Players without an entry show a
"stats not yet recorded" state rather than invented numbers.

## Importing per-player stats from CricClubs

The usual route. `data/cricclubs-profiles.txt` lists all 38 players; paste each
one's CricClubs profile URL after the `=`, then:

```bash
npm run import-stats -- --profiles data/cricclubs-profiles.txt --dry-run
```

`--dry-run` reports how many batting and bowling rows it found per player and
flags anything it couldn't read, without writing. When the output looks right,
run it again without `--dry-run`.

You don't need all 38 URLs to start — players with a blank URL are skipped, so
you can fill the file in over time and re-run. Each player's own profile page
carries their full season-by-season history, which is what the Batting and
Bowling tabs display.

If a page comes back as "no stats tables found", it needs JavaScript to render.
Open it in your browser, **File ▸ Save Page As…**, and point that line at the
saved file instead:

```
Umesh = ~/Downloads/umesh.html
```

## Importing whole-club stats tables

```bash
npm run import-stats -- <url-or-file> [--type batting|bowling] [--season 2026] [--dry-run]
```

The script reads a CricClubs stats table, matches the names against the roster,
and merges the numbers into `src/data/recorded-stats.json`. It accepts a URL, a
saved `.html` page, a `.csv` export, or a `.json` API response.

CricClubs renders most pages with JavaScript, so fetching a URL directly often
returns an empty shell. If that happens, either use the **Export / CSV** button
on the CricClubs stats page, or open the page in your browser and use
**File ▸ Save Page As…**, then point the script at the downloaded file:

```bash
npm run import-stats -- ~/Downloads/batting.csv --season 2026 --dry-run
npm run import-stats -- ~/Downloads/batting.csv --season 2026
```

Start with `--dry-run` — it prints which players matched and which names it
couldn't place, without writing anything. Batting and bowling are separate
tables, so run it once for each. Names are matched exactly, then by `short`
nickname, then by token overlap ("Ghosh, Shubhodeep" finds "Shubhodeep Ghosh").
For a name it can't place, add a `short:` field to that player in
`players.js` matching CricClubs' spelling and re-run.

**Change a team's colour or description** — edit `src/data/teams.js`. The
`accent` colour flows through to avatars, badges, team pages and cards.

**Update fixtures** — edit the `fixtures` array in `src/data/club.js`.

**Roll over the season** — change `season` in `src/data/club.js`; the year and
start date are referenced throughout the site.

## Notes

- Player email addresses and phone numbers are **not** stored in `src/` — anything
  there is bundled into the public site. They live in `private/player-contacts.csv`,
  which is git-ignored and never published.
- Pages have clean addresses (e.g. `/internal-tournament`). `npm run build` also
  writes one HTML file per page (`scripts/build-meta.mjs`, using
  `src/data/pageMeta.js`) so shared links show that page's title and preview
  image. Old `/#/page` links are redirected automatically. Vercel serves any
  other address with `index.html` (see `vercel.json`).
- The contact, sponsor and registration forms open the visitor's email client
  with the submission pre-filled — no backend required. The leadership
  nomination form posts to a Google Apps Script endpoint (see
  `src/pages/LeadershipPage.jsx`).
