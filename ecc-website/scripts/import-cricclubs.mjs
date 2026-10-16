#!/usr/bin/env node
/**
 * Import player statistics from CricClubs into src/data/recorded-stats.json.
 *
 *   npm run import-stats -- <url-or-file> [options]
 *
 * Input can be any of:
 *   • a CricClubs URL          — fetched directly
 *   • a saved .html file       — use this when the page needs JavaScript:
 *                                open it in your browser, File ▸ Save Page As,
 *                                then point this script at the saved file
 *   • a .csv file              — CricClubs "Export" downloads
 *   • a .json file            — raw API response
 *
 * Options:
 *   --type batting|bowling   Which stats table this is (default: auto-detect)
 *   --season 2026            Tag the rows with a season (default: "Career")
 *   --dry-run                Print what would change without writing
 *   --replace                Discard existing stats instead of merging
 *   --dump <file>            Save the raw fetched body for inspection
 *
 * Examples:
 *   npm run import-stats -- "https://cricclubs.com/<league>/battingRecords.do?clubId=123" --season 2026
 *   npm run import-stats -- ~/Downloads/batting.csv --type batting --season 2026
 *   npm run import-stats -- ~/Downloads/saved-page.html --dry-run
 */

import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, "..");
const ROSTER_FILE = resolve(ROOT, "src/data/players.js");
const OUT_FILE = resolve(ROOT, "src/data/recorded-stats.json");

/* ------------------------------------------------------------------ */
/* Column aliases — CricClubs header text → our field names            */
/* ------------------------------------------------------------------ */

const BATTING_COLUMNS = {
  player: ["player", "name", "playername", "batsman", "batter"],
  mat: ["mat", "matches", "m", "played"],
  inns: ["inns", "innings", "i"],
  no: ["no", "notout", "notouts"],
  runs: ["runs", "r"],
  hs: ["hs", "highscore", "highest", "best"],
  avg: ["avg", "average", "ave"],
  bf: ["bf", "balls", "ballsfaced"],
  sr: ["sr", "strikerate", "s/r"],
  fifties: ["50", "50s", "fifties", "fifty"],
  hundreds: ["100", "100s", "hundreds", "hundred"],
  fours: ["4s", "4", "fours"],
  sixes: ["6s", "6", "sixes"],
  ct: ["ct", "catches", "c"],
};

const BOWLING_COLUMNS = {
  player: ["player", "name", "playername", "bowler"],
  mat: ["mat", "matches", "m", "played"],
  inns: ["inns", "innings", "i"],
  overs: ["overs", "ov", "o"],
  maidens: ["maidens", "md", "m"],
  runs: ["runs", "r", "runsgiven"],
  wkts: ["wkts", "wickets", "w"],
  bbi: ["bbi", "best", "bestbowling", "bb"],
  eco: ["eco", "econ", "economy", "er"],
  avg: ["avg", "average"],
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9/]/g, "");

function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Strips a name down to comparable tokens: "Ghosh, Shubhodeep" → "ghosh shubhodeep" */
function nameKey(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\(.*?\)/g, " ")
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(" ");
}

const num = (value) => {
  if (value == null) return null;
  const cleaned = String(value).replace(/[^0-9.\-]/g, "");
  if (cleaned === "" || cleaned === "-") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};

const text = (value) => {
  const t = String(value ?? "").trim();
  return t === "" || t === "-" || t === "--" ? null : t;
};

/* ------------------------------------------------------------------ */
/* Parsers                                                             */
/* ------------------------------------------------------------------ */

/** Minimal HTML table extractor — returns [{ headers, rows }]. */
function parseHtmlTables(html) {
  const stripTags = (s) =>
    s
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
      .replace(/\s+/g, " ")
      .trim();

  const tables = [];
  for (const [, tableHtml] of html.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/gi)) {
    const rows = [];
    for (const [, rowHtml] of tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
      const cells = [...rowHtml.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((m) =>
        stripTags(m[1])
      );
      if (cells.length) rows.push(cells);
    }
    if (rows.length >= 2) tables.push({ headers: rows[0], rows: rows.slice(1) });
  }
  return tables;
}

/** RFC-ish CSV parser (handles quoted fields and embedded commas). */
function parseCsv(input) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (quoted) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i += 1;
        } else quoted = false;
      } else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (field !== "" || row.length) {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      }
      if (ch === "\r" && input[i + 1] === "\n") i += 1;
    } else field += ch;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }

  const cleaned = rows.filter((r) => r.some((c) => c.trim() !== ""));
  if (cleaned.length < 2) return [];
  return [{ headers: cleaned[0].map((c) => c.trim()), rows: cleaned.slice(1) }];
}

/** Flattens a JSON API response into a header/rows table. */
function parseJsonTable(input) {
  let data;
  try {
    data = JSON.parse(input);
  } catch {
    return [];
  }
  const findArray = (node, depth = 0) => {
    if (depth > 4 || node == null) return null;
    if (Array.isArray(node) && node.length && typeof node[0] === "object") return node;
    if (typeof node === "object") {
      for (const value of Object.values(node)) {
        const found = findArray(value, depth + 1);
        if (found) return found;
      }
    }
    return null;
  };
  const list = findArray(data);
  if (!list) return [];
  const headers = [...new Set(list.flatMap((o) => Object.keys(o)))];
  return [{ headers, rows: list.map((o) => headers.map((h) => o[h])) }];
}

/* ------------------------------------------------------------------ */
/* Table → records                                                     */
/* ------------------------------------------------------------------ */

function mapHeaders(headers, schema) {
  const index = {};
  headers.forEach((header, i) => {
    const key = norm(header);
    for (const [field, aliases] of Object.entries(schema)) {
      if (index[field] != null) continue;
      if (aliases.includes(key)) {
        index[field] = i;
        break;
      }
    }
  });
  return index;
}

function scoreTable(table, schema) {
  const mapped = mapHeaders(table.headers, schema);
  return { mapped, score: Object.keys(mapped).length };
}

/**
 * On a single-player profile page there is no "Player" column — each row is a
 * season for that one player, so we key off a year/season column instead.
 */
const SEASON_COLUMNS = {
  year: ["year", "season", "yr", "tournament", "series", "league", "competition"],
};

/**
 * Picks out the batting and bowling tables on a player profile page.
 * Returns { batting, bowling } — either may be null.
 */
function selectProfileTables(tables) {
  const found = { batting: null, bowling: null };

  for (const table of tables) {
    const yearIdx = mapHeaders(table.headers, SEASON_COLUMNS).year;
    const batting = scoreTable(table, BATTING_COLUMNS);
    const bowling = scoreTable(table, BOWLING_COLUMNS);

    const isBowling = bowling.mapped.wkts != null || bowling.mapped.eco != null;
    const type = isBowling ? "bowling" : "batting";
    const chosen = isBowling ? bowling : batting;

    // Need real stat columns; a year column is preferred but not mandatory
    // (some profiles show a single unlabelled career row).
    const statCount = Object.keys(chosen.mapped).filter((k) => k !== "player").length;
    if (statCount < 3) continue;

    const candidate = { table, type, mapped: chosen.mapped, yearIdx, score: statCount };
    if (!found[type] || candidate.score > found[type].score) found[type] = candidate;
  }

  return found;
}

/** Picks the best table and whether it looks like batting or bowling. */
function selectTable(tables, forcedType) {
  let best = null;
  for (const table of tables) {
    const batting = scoreTable(table, BATTING_COLUMNS);
    const bowling = scoreTable(table, BOWLING_COLUMNS);

    // A bowling table is identifiable by wickets/economy; batting by runs+SR.
    const isBowling = bowling.mapped.wkts != null || bowling.mapped.eco != null;
    const type = forcedType ?? (isBowling ? "bowling" : "batting");
    const chosen = type === "bowling" ? bowling : batting;

    if (chosen.mapped.player == null || chosen.score < 3) continue;
    if (!best || chosen.score > best.score) {
      best = { table, type, mapped: chosen.mapped, score: chosen.score };
    }
  }
  return best;
}

function buildRow(cells, mapped, type, season) {
  const get = (field) => (mapped[field] != null ? cells[mapped[field]] : undefined);

  if (type === "bowling") {
    return {
      year: season,
      mat: num(get("mat")),
      inns: num(get("inns")),
      overs: num(get("overs")),
      runs: num(get("runs")),
      wkts: num(get("wkts")),
      bbi: text(get("bbi")),
      eco: num(get("eco")),
    };
  }
  return {
    year: season,
    mat: num(get("mat")),
    inns: num(get("inns")),
    no: num(get("no")),
    runs: num(get("runs")),
    hs: text(get("hs")),
    avg: num(get("avg")),
    bf: num(get("bf")),
    sr: num(get("sr")),
    fifties: num(get("fifties")),
    fours: num(get("fours")),
    sixes: num(get("sixes")),
    ct: num(get("ct")),
  };
}

/* ------------------------------------------------------------------ */
/* Roster matching                                                     */
/* ------------------------------------------------------------------ */

/** Reads names out of players.js without importing the ES module. */
async function loadRoster() {
  const source = await readFile(ROSTER_FILE, "utf8");
  const roster = [];
  for (const [, name] of source.matchAll(/\{\s*name:\s*"([^"]+)"/g)) {
    roster.push({ name, slug: slugify(name), key: nameKey(name) });
  }
  // `short` nicknames are useful fallbacks for matching scorecard names.
  const shorts = [...source.matchAll(/name:\s*"([^"]+)",\s*short:\s*"([^"]+)"/g)];
  for (const [, name, short] of shorts) {
    const entry = roster.find((r) => r.name === name);
    if (entry) entry.short = nameKey(short);
  }
  return roster;
}

function matchPlayer(rawName, roster) {
  const key = nameKey(rawName);
  if (!key) return null;

  const exact = roster.find((r) => r.key === key);
  if (exact) return { player: exact, confidence: "exact" };

  const byShort = roster.find((r) => r.short && r.short === key);
  if (byShort) return { player: byShort, confidence: "nickname" };

  // Token containment: every token of one name appears in the other.
  const tokens = key.split(" ");
  const candidates = roster.filter((r) => {
    const rt = r.key.split(" ");
    const shorter = tokens.length <= rt.length ? tokens : rt;
    const longer = shorter === tokens ? rt : tokens;
    return shorter.length >= 1 && shorter.every((t) => longer.includes(t));
  });
  if (candidates.length === 1) return { player: candidates[0], confidence: "partial" };
  return null;
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

function parseArgs(argv) {
  const opts = { season: "Career", dryRun: false, replace: false };
  const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") opts.dryRun = true;
    else if (arg === "--replace") opts.replace = true;
    else if (arg === "--type") opts.type = argv[++i];
    else if (arg === "--season") opts.season = argv[++i];
    else if (arg === "--dump") opts.dump = argv[++i];
    else if (arg === "--profiles") opts.profiles = argv[++i];
    else if (arg.startsWith("--")) throw new Error(`Unknown option: ${arg}`);
    else positional.push(arg);
  }
  opts.source = positional[0];
  return opts;
}

async function readSource(source, dumpTo) {
  if (/^https?:\/\//i.test(source)) {
    console.log(`Fetching ${source}`);
    const response = await fetch(source, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/125.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    const body = await response.text();
    if (dumpTo) {
      await writeFile(dumpTo, body);
      console.log(`Raw response saved to ${dumpTo}`);
    }
    return body;
  }

  const expanded = source.startsWith("~/")
    ? resolve(process.env.HOME ?? "", source.slice(2))
    : source;
  const path = resolve(process.cwd(), expanded);
  if (!existsSync(path)) throw new Error(`File not found: ${path}`);
  console.log(`Reading ${path}`);
  return readFile(path, "utf8");
}

/** Detects and parses whatever a fetched/read body happens to be. */
function parseBody(body) {
  const trimmed = body.trimStart();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return parseJsonTable(body);
  if (/<\s*table/i.test(body)) return parseHtmlTables(body);
  return parseCsv(body);
}

/**
 * --profiles mode: one CricClubs player-profile page per roster player.
 *
 * The list file has one entry per line:
 *   Raavy Pothela = https://cricclubs.com/<league>/viewPlayer.do?playerId=12&clubId=345
 *   Umesh         = ~/Downloads/umesh.html
 * Blank lines and lines starting with # are ignored.
 */
async function runProfiles(opts) {
  const listPath = resolve(process.cwd(), opts.profiles);
  if (!existsSync(listPath)) throw new Error(`List file not found: ${listPath}`);

  const entries = (await readFile(listPath, "utf8"))
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const at = line.indexOf("=");
      if (at < 0) return { name: null, source: line };
      return { name: line.slice(0, at).trim(), source: line.slice(at + 1).trim() };
    });

  if (!entries.length) throw new Error("No entries found in the list file.");
  console.log(`${entries.length} profile(s) to import.\n`);

  const roster = await loadRoster();
  const existing =
    !opts.replace && existsSync(OUT_FILE)
      ? JSON.parse(await readFile(OUT_FILE, "utf8"))
      : {};

  let ok = 0;
  const problems = [];
  const skipped = [];

  for (const entry of entries) {
    const label = entry.name ?? entry.source;

    if (!entry.source) {
      skipped.push(label);
      continue;
    }

    const match = entry.name ? matchPlayer(entry.name, roster) : null;
    if (!match) {
      problems.push(`${label} — no roster match (use "Full Name = URL")`);
      continue;
    }

    let tables;
    try {
      const body = await readSource(entry.source);
      tables = parseBody(body);
    } catch (error) {
      problems.push(`${label} — ${error.message}`);
      continue;
    }

    const { batting, bowling } = selectProfileTables(tables);
    if (!batting && !bowling) {
      problems.push(`${label} — no stats tables found (page may need JavaScript)`);
      continue;
    }

    const slug = match.player.slug;
    const record = (existing[slug] ??= {});

    for (const [type, selected] of [
      ["batting", batting],
      ["bowling", bowling],
    ]) {
      if (!selected) continue;
      const listKey = type === "bowling" ? "seasonBowling" : "seasonBatting";
      const rows = [];

      for (const cells of selected.table.rows) {
        const rawYear =
          selected.yearIdx != null ? text(cells[selected.yearIdx]) : opts.season;
        const year = rawYear ?? opts.season;
        if (/^(total|overall)$/i.test(String(year))) continue;

        const row = buildRow(cells, selected.mapped, type, year);
        if (row.mat == null && row.runs == null && row.wkts == null) continue;
        rows.push(row);
      }
      if (!rows.length) continue;

      rows.sort((a, b) => {
        if (a.year === "Career") return -1;
        if (b.year === "Career") return 1;
        return String(b.year).localeCompare(String(a.year));
      });
      record[listKey] = rows;

      const career = rows.find((r) => r.year === "Career") ?? rows[0];
      if (type === "batting") {
        record.matches = career.mat ?? record.matches ?? null;
        record.runs = career.runs ?? null;
        record.battingAverage = career.avg ?? null;
        record.strikeRate = career.sr ?? null;
        record.bestBatting = career.hs ?? null;
      } else {
        record.matches = record.matches ?? career.mat ?? null;
        record.wickets = career.wkts ?? null;
        record.bowlingEconomy = career.eco ?? null;
        record.bestBowling = career.bbi ?? null;
      }
    }

    const bat = record.seasonBatting?.length ?? 0;
    const bowl = record.seasonBowling?.length ?? 0;
    console.log(`  ✓ ${match.player.name} — ${bat} batting row(s), ${bowl} bowling row(s)`);
    ok += 1;
  }

  if (skipped.length) {
    console.log(
      `\n${skipped.length} player(s) have no URL yet: ${skipped.slice(0, 6).join(", ")}` +
        (skipped.length > 6 ? `, +${skipped.length - 6} more` : "")
    );
  }

  if (problems.length) {
    console.log(`\n⚠ ${problems.length} problem(s):`);
    for (const problem of problems) console.log(`    ${problem}`);
  }

  console.log(
    `\n${ok} of ${entries.length - skipped.length} attempted profile(s) imported.`
  );

  if (ok === 0) {
    console.log("Nothing imported — no file written.");
    return;
  }

  if (opts.dryRun) {
    console.log("Dry run — nothing written.");
    return;
  }
  await writeFile(OUT_FILE, `${JSON.stringify(existing, null, 2)}\n`);
  console.log(`Wrote ${OUT_FILE}`);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.profiles) {
    await runProfiles(opts);
    return;
  }

  if (!opts.source && !opts.profiles) {
    console.error(
      [
        "Usage: npm run import-stats -- <url-or-file> [options]",
        "       npm run import-stats -- --profiles <list-file> [options]",
        "",
        "  --profiles <file>        import one profile page per player;",
        "                           each line is  Full Name = URL-or-file",
        "  --type batting|bowling   force the table type",
        "  --season 2026            label rows with a season (default: Career)",
        "  --dry-run                show changes without writing",
        "  --replace                overwrite instead of merging",
        "  --dump <file>            save the raw response for inspection",
      ].join("\n")
    );
    process.exit(1);
  }

  const body = await readSource(opts.source, opts.dump);

  const tables = parseBody(body);

  if (!tables.length) {
    console.error(
      [
        "",
        "No data tables found in that response.",
        "",
        "CricClubs renders most pages with JavaScript, so fetching the URL",
        "directly often returns an empty shell. Workaround:",
        "",
        "  1. Open the stats page in your browser",
        "  2. File ▸ Save Page As… (choose 'Web Page, Complete' or 'HTML Only')",
        "  3. Re-run this script pointing at the saved .html file",
        "",
        "Or use the Export/CSV button on the CricClubs stats page and pass",
        "the downloaded .csv instead.",
      ].join("\n")
    );
    process.exit(2);
  }

  const selected = selectTable(tables, opts.type);
  if (!selected) {
    console.error(
      `Found ${tables.length} table(s) but none had recognisable stats columns.\n` +
        `Headers seen: ${tables.map((t) => t.headers.join(" | ")).join("\n               ")}`
    );
    process.exit(2);
  }

  console.log(
    `Using a ${selected.type} table (${selected.score} columns matched): ` +
      selected.table.headers.join(" | ")
  );

  const roster = await loadRoster();
  console.log(`Roster has ${roster.length} players.`);

  const existing =
    !opts.replace && existsSync(OUT_FILE)
      ? JSON.parse(await readFile(OUT_FILE, "utf8"))
      : {};

  const listKey = selected.type === "bowling" ? "seasonBowling" : "seasonBatting";
  const unmatched = [];
  let updated = 0;

  for (const cells of selected.table.rows) {
    const rawName = cells[selected.mapped.player];
    if (!rawName || /^total$/i.test(rawName.trim())) continue;

    const match = matchPlayer(rawName, roster);
    if (!match) {
      unmatched.push(rawName);
      continue;
    }

    const slug = match.player.slug;
    const row = buildRow(cells, selected.mapped, selected.type, opts.season);
    if (row.mat == null && row.runs == null && row.wkts == null) continue;

    const entry = (existing[slug] ??= {});
    const list = (entry[listKey] ??= []);
    const at = list.findIndex((r) => String(r.year) === String(opts.season));
    if (at >= 0) list[at] = row;
    else list.push(row);
    list.sort((a, b) => {
      if (a.year === "Career") return -1;
      if (b.year === "Career") return 1;
      return String(b.year).localeCompare(String(a.year));
    });

    // Refresh the headline numbers the player card and hero read from.
    const career = list.find((r) => r.year === "Career") ?? list[0];
    if (selected.type === "batting") {
      entry.matches = career.mat ?? entry.matches ?? null;
      entry.runs = career.runs ?? entry.runs ?? null;
      entry.battingAverage = career.avg ?? entry.battingAverage ?? null;
      entry.strikeRate = career.sr ?? entry.strikeRate ?? null;
      entry.bestBatting = career.hs ?? entry.bestBatting ?? null;
    } else {
      entry.matches = entry.matches ?? career.mat ?? null;
      entry.wickets = career.wkts ?? entry.wickets ?? null;
      entry.bowlingEconomy = career.eco ?? entry.bowlingEconomy ?? null;
      entry.bestBowling = career.bbi ?? entry.bestBowling ?? null;
    }

    updated += 1;
    console.log(
      `  ✓ ${match.player.name}` +
        (match.confidence !== "exact" ? `  (matched "${rawName}" by ${match.confidence})` : "")
    );
  }

  if (unmatched.length) {
    console.log(`\n⚠ ${unmatched.length} name(s) not on the roster:`);
    for (const name of unmatched) console.log(`    ${name}`);
    console.log(
      "  Add them to `roster` in src/data/players.js, or add a `short:` nickname\n" +
        "  matching how CricClubs spells them, then re-run."
    );
  }

  console.log(`\n${updated} player record(s) updated (${selected.type}, ${opts.season}).`);

  if (opts.dryRun) {
    console.log("Dry run — nothing written.");
    return;
  }

  await writeFile(OUT_FILE, `${JSON.stringify(existing, null, 2)}\n`);
  console.log(`Wrote ${OUT_FILE}`);
}

main().catch((error) => {
  console.error(`\nImport failed: ${error.message}`);
  process.exit(1);
});
