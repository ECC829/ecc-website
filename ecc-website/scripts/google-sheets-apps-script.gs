/**
 * ECC website → Google Sheets
 *
 * Paste this whole file into Extensions → Apps Script of the club's Google Sheet,
 * then Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone).
 * See docs/google-sheets-setup.md for the full steps.
 *
 * Each website form sends { sheet: "<tab name>", fields: { Column: value, ... } }.
 * Only the tabs and fields listed in FORMS below are accepted; the tab is
 * created automatically and the first row becomes the column headers.
 */

/** Bump this when the script changes, to confirm the new version is live. */
const SCRIPT_VERSION = 9;

/** Tab where the organisers' captain draw result is stored (organiser key only). */
const DRAW_TAB = "Captain Draw";

/** Tab where the player auction is backed up after every sale (organiser key only). */
const AUCTION_TAB = "Auction Results";

/** Tab where live match scores are stored (scorer or organiser key to write, public to read). */
const MATCH_TAB = "Live Matches";

/**
 * The only tabs this script will write to or read from, and the only fields
 * each one accepts. Anything else sent to the web app is ignored, so nobody
 * can create new tabs, add columns, or read other tabs in the Sheet.
 * To add a form later, add an entry here and redeploy.
 */
const FORMS = {
  "Internal Tournament 2026": {
    fields: {
      Name: { required: true, max: 80 },
      Email: { required: true, max: 120, type: "email" },
      Phone: { required: true, max: 30, type: "phone" },
      Role: { required: true, max: 40 },
      "Captain nomination": { required: true, max: 3 },
      "Available on": { max: 40 },
      Notes: { max: 500 },
    },
    maxRows: 400, // stop accepting once the tab is this full (flood protection)
    publicNames: true, // allow the website to show "first name + last initial"
  },
};

/** At most this many sign-ups per minute across the whole site. */
const MAX_PER_MINUTE = 20;

function doPost(e) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) return json({ ok: false, error: "busy" });
  try {
    const raw = (e && e.postData && e.postData.contents) || "";
    if (raw.length > 60000) return json({ ok: false, error: "invalid" });
    const data = JSON.parse(raw || "{}");
    // Only live match saves may be large; everything else stays small.
    if (raw.length > 10000 && data.action !== "saveMatch") return json({ ok: false, error: "invalid" });

    // Spam trap: real visitors never fill the hidden "website" field.
    if (data.website) return json({ ok: true });

    // Organisers save the captain draw so every device can load it.
    if (data.action === "saveCaptains") {
      if (!isOrganiser(data.key)) return json({ ok: false, error: "wrong-key" });
      const captains = (Array.isArray(data.captains) ? data.captains : [])
        .map(function (c) { return clean(String(c).replace(/\s+/g, " ").trim().slice(0, 80)); })
        .filter(String)
        .slice(0, 40);
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const tab = ss.getSheetByName(DRAW_TAB) || ss.insertSheet(DRAW_TAB);
      tab.clear();
      const when = new Date();
      const rows = [["Drawn at", "Team", "Captain"]].concat(
        captains.map(function (c, i) { return [when, i + 1, c]; })
      );
      tab.getRange(1, 1, rows.length, 3).setValues(rows);
      tab.getRange(1, 1, 1, 3).setFontWeight("bold");
      tab.setFrozenRows(1);
      return json({ ok: true, saved: captains.length });
    }

    // Scorers save the match after every ball.
    if (data.action === "saveMatch") {
      if (!isScorer(data.key)) return json({ ok: false, error: "wrong-key" });
      return json(saveMatch(data.match));
    }
    if (data.action === "deleteMatch") {
      if (!isScorer(data.key)) return json({ ok: false, error: "wrong-key" });
      return json(deleteMatch(String(data.id || "")));
    }

    // Organisers back up the auction after every sale.
    if (data.action === "saveAuction") {
      if (!isOrganiser(data.key)) return json({ ok: false, error: "wrong-key" });
      const teams = (Array.isArray(data.teams) ? data.teams : []).slice(0, 40);
      const budget = Number(data.budget) || 0;
      const text = function (v) { return clean(String(v == null ? "" : v).replace(/\s+/g, " ").trim().slice(0, 80)); };
      const rows = [["Saved at", "Team", "Captain", "Player", "Price", "Purse left", "Status"]];
      const when = new Date();
      const status = data.complete ? "Final" : "In progress";
      teams.forEach(function (tm, i) {
        const squad = (Array.isArray(tm.squad) ? tm.squad : []).slice(0, 20);
        const spent = squad.reduce(function (n, s) { return n + (Number(s.price) || 0); }, 0);
        if (!squad.length) rows.push([when, i + 1, text(tm.name), "", "", budget - spent, status]);
        squad.forEach(function (s) {
          rows.push([when, i + 1, text(tm.name), text(s.player), Number(s.price) || 0, budget - spent, status]);
        });
      });
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const tab = ss.getSheetByName(AUCTION_TAB) || ss.insertSheet(AUCTION_TAB);
      tab.clear();
      tab.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
      tab.getRange(1, 1, 1, rows[0].length).setFontWeight("bold");
      tab.setFrozenRows(1);
      return json({ ok: true, saved: rows.length - 1 });
    }

    const sheetName = String(data.sheet || "");
    const form = Object.prototype.hasOwnProperty.call(FORMS, sheetName) ? FORMS[sheetName] : null;
    if (!form) return json({ ok: false, error: "invalid" });

    if (tooManyRecently()) return json({ ok: false, error: "busy" });

    const fields = validate(form, data.fields || {});
    if (!fields) return json({ ok: false, error: "invalid" });

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
    if (sheet.getLastRow() > form.maxRows) return json({ ok: false, error: "full" });

    // Header row: "Submitted at" + the allowed fields (existing columns kept).
    const headers =
      sheet.getLastRow() === 0
        ? ["Submitted at"]
        : sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    Object.keys(form.fields).forEach(function (key) {
      if (headers.indexOf(key) === -1) headers.push(key);
    });
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
    sheet.setFrozenRows(1);

    // Skip duplicates: same phone number (digits only) or same email as an
    // existing row in this tab. The first sign-up is kept.
    if (isDuplicate(sheet, headers, fields)) {
      return json({ ok: true, duplicate: true });
    }

    const row = headers.map(function (header) {
      if (header === "Submitted at") return new Date();
      return clean(fields[header]);
    });
    sheet.appendRow(row);

    return json({ ok: true });
  } catch (err) {
    // Don't reveal internal details to the outside world.
    console.error(err);
    return json({ ok: false, error: "invalid" });
  } finally {
    lock.releaseLock();
  }
}

/** Keeps only allowed fields, trims and length-checks them. Null if invalid. */
function validate(form, input) {
  const out = {};
  const names = Object.keys(form.fields);
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const rule = form.fields[name];
    const value = String(input[name] == null ? "" : input[name]).trim();
    if (rule.required && !value) return null;
    if (value.length > rule.max) return null;
    if (value && rule.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return null;
    if (value && rule.type === "phone" && normalisePhone(value) === "") return null;
    out[name] = value;
  }
  return out;
}

/** Simple site-wide rate limit using the script cache (resets every minute). */
function tooManyRecently() {
  const cache = CacheService.getScriptCache();
  const key = "rate-" + Math.floor(Date.now() / 60000);
  const count = Number(cache.get(key) || 0) + 1;
  cache.put(key, String(count), 120);
  return count > MAX_PER_MINUTE;
}

/**
 * GET without parameters: health check (open the link in a browser).
 * GET ?sheet=<tab name>: returns sign-up counts plus a public list of names.
 *   { ok, count, captains, players: [{ name }] }
 *   Names are shortened to first name + last initial ("Ravi K."). Emails,
 *   phone numbers, roles, captain choices and notes are never returned.
 */
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.checkScorer) {
    if (isScorer(p.checkScorer)) return json({ ok: true });
    Utilities.sleep(1500); // slow down key guessing
    return json({ ok: false, error: "wrong-key" });
  }
  if (p.matches) return json({ ok: true, matches: listMatches() });
  if (p.match) {
    const m = readMatch(String(p.match));
    return json(m ? { ok: true, match: m } : { ok: false, error: "not-found" });
  }
  const sheetName = e && e.parameter && e.parameter.sheet;
  if (!sheetName) {
    return json({ ok: true, version: SCRIPT_VERSION, message: "ECC form endpoint is running." });
  }
  const form = Object.prototype.hasOwnProperty.call(FORMS, sheetName) ? FORMS[sheetName] : null;
  if (!form) return json({ ok: false, error: "invalid" });
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(String(sheetName));
  const hasRows = sheet && sheet.getLastRow() >= 2;
  if (!hasRows && !e.parameter.key) {
    return json({ ok: true, count: 0, captains: 0, players: [] });
  }

  const values = hasRows
    ? sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues()
    : [["Name", "Captain nomination"]];
  const headers = values.shift();
  const nameCol = headers.indexOf("Name");
  const captainCol = headers.indexOf("Captain nomination");
  const roleCol = headers.indexOf("Role");
  const rows = values.filter(function (row) {
    return nameCol === -1 || String(row[nameCol]).trim() !== "";
  });
  const captains =
    captainCol === -1
      ? 0
      : rows.filter(function (row) {
          return String(row[captainCol]).trim().toLowerCase() === "yes";
        }).length;
  // Organisers (with the secret key) get full names and captain choices for
  // the captain draw and auction boards. Everyone else gets short names only.
  if (isOrganiser(e.parameter.key)) {
    const roster = rows.map(function (row) {
      return {
        name: String(row[nameCol]).replace(/\s+/g, " ").trim(),
        captain: captainCol !== -1 && String(row[captainCol]).trim().toLowerCase() === "yes",
        role: roleCol === -1 ? "" : String(row[roleCol]).trim(),
      };
    });
    return json({
      ok: true,
      organiser: true,
      count: rows.length,
      captains: captains,
      roster: roster,
      drawn: readDrawnCaptains(ss),
      auction: readAuction(ss, false),
    });
  }
  if (e.parameter.key) {
    Utilities.sleep(1500); // slow down key guessing
    return json({ ok: false, error: "wrong-key" });
  }

  const players = rows.map(function (row) {
    return { name: form.publicNames ? publicName(row[nameCol]) : "" };
  });
  return json({
    ok: true,
    count: rows.length,
    captains: captains,
    players: players,
    squads: form.publicNames ? readAuction(ss, true) : null,
  });
}

/**
 * The backed-up auction: { at, status, teams: [{ name, purseLeft, squad: [{ player, price }] }] }.
 * The public version (for the website's Teams section) shortens names and
 * leaves out prices and purses.
 */
function readAuction(ss, forPublic) {
  const tab = ss.getSheetByName(AUCTION_TAB);
  if (!tab || tab.getLastRow() < 2) return null;
  const rows = tab.getRange(2, 1, tab.getLastRow() - 1, 7).getValues();
  const strip = function (v) { return String(v).replace(/^'/, ""); };
  const teams = [];
  rows.forEach(function (r) {
    const idx = Number(r[1]) - 1;
    if (idx < 0) return;
    if (!teams[idx]) teams[idx] = { name: strip(r[2]), purseLeft: Number(r[5]) || 0, squad: [] };
    if (r[3] !== "") teams[idx].squad.push({ player: strip(r[3]), price: Number(r[4]) || 0 });
  });
  const list = teams.filter(Boolean);
  const at = rows[0][0] instanceof Date ? rows[0][0].toISOString() : String(rows[0][0]);
  const status = String(rows[0][6] || "");
  if (!forPublic) return { at: at, status: status, teams: list };
  return {
    at: at,
    status: status,
    teams: list.map(function (tm) {
      return {
        captain: publicName(tm.name),
        players: tm.squad.map(function (s) { return publicName(s.player); }),
      };
    }),
  };
}

/** The last saved captain draw: { at, captains: [...] } or null. */
function readDrawnCaptains(ss) {
  const tab = ss.getSheetByName(DRAW_TAB);
  if (!tab || tab.getLastRow() < 2) return null;
  const rows = tab.getRange(2, 1, tab.getLastRow() - 1, 3).getValues();
  const captains = rows.map(function (r) { return String(r[2]).replace(/^'/, ""); }).filter(String);
  const at = rows[0][0] instanceof Date ? rows[0][0].toISOString() : String(rows[0][0]);
  return captains.length ? { at: at, captains: captains } : null;
}

/* ------------------------------------------------------------------ */
/* Live scoring                                                         */
/* ------------------------------------------------------------------ */

const MATCH_ID = /^[a-z0-9-]{6,40}$/;

function matchTab(create) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let tab = ss.getSheetByName(MATCH_TAB);
  if (!tab && create) {
    tab = ss.insertSheet(MATCH_TAB);
    tab.getRange(1, 1, 1, 7).setValues([["Match id", "Updated", "Status", "Match", "Rev", "Summary", "Data"]]).setFontWeight("bold");
    tab.setFrozenRows(1);
  }
  return tab;
}

function matchRow(tab, id) {
  if (!tab || tab.getLastRow() < 2) return -1;
  const ids = tab.getRange(2, 1, tab.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) if (String(ids[i][0]) === id) return i + 2;
  return -1;
}

/** Keeps only what a match needs and checks its size. Null if invalid. */
function cleanMatch(m) {
  if (!m || typeof m !== "object" || !MATCH_ID.test(String(m.id || ""))) return null;
  const text = function (v, max) { return String(v == null ? "" : v).replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max); };
  const teams = (Array.isArray(m.teams) ? m.teams : []).slice(0, 2).map(function (t) {
    return {
      name: text(t && t.name, 40),
      players: (Array.isArray(t && t.players) ? t.players : []).slice(0, 15).map(function (n) { return text(n, 40); }),
    };
  });
  if (teams.length !== 2) return null;
  const events = (Array.isArray(m.events) ? m.events : []).slice(0, 800).map(function (ev) {
    return (Array.isArray(ev) ? ev : []).slice(0, 7).map(function (x) {
      return typeof x === "number" ? Math.max(-1, Math.min(99, Math.round(x))) : text(x, 3);
    });
  });
  const out = {
    id: String(m.id),
    rev: Math.max(0, Math.floor(Number(m.rev) || 0)),
    ground: text(m.ground, 40),
    overs: Math.max(1, Math.min(50, Math.floor(Number(m.overs) || 7))),
    maxBowlerOvers: Math.max(0, Math.min(50, Math.floor(Number(m.maxBowlerOvers) || 0))),
    battingFirst: m.battingFirst === 1 ? 1 : 0,
    toss: m.toss ? { winner: m.toss.winner === 1 ? 1 : 0, choice: m.toss.choice === "bowl" ? "bowl" : "bat" } : null,
    teams: teams,
    events: events,
    createdAt: text(m.createdAt, 40),
  };
  return out;
}

function cleanSummary(s) {
  const text = function (v, max) { return String(v == null ? "" : v).replace(/[<>]/g, "").slice(0, max); };
  s = s || {};
  return {
    title: text(s.title, 90),
    ground: text(s.ground, 40),
    status: ["setup", "live", "break", "done"].indexOf(s.status) >= 0 ? s.status : "setup",
    note: text(s.note, 120),
    lines: (Array.isArray(s.lines) ? s.lines : []).slice(0, 2).map(function (l) {
      return { team: text(l && l.team, 40), score: text(l && l.score, 10), overs: text(l && l.overs, 8) };
    }),
  };
}

function saveMatch(input) {
  const m = cleanMatch(input);
  if (!m) return { ok: false, error: "invalid" };
  const summary = cleanSummary(input && input.summary);
  const data = JSON.stringify(m);
  if (data.length > 45000) return { ok: false, error: "too-big" };
  const tab = matchTab(true);
  let row = matchRow(tab, m.id);
  if (row > 0) {
    const stored = Number(tab.getRange(row, 5).getValue()) || 0;
    // An older phone must never overwrite newer scoring.
    if (m.rev < stored) return { ok: false, error: "stale", rev: stored };
  } else {
    if (tab.getLastRow() > 300) return { ok: false, error: "full" };
    row = tab.getLastRow() + 1;
  }
  const values = [[m.id, new Date().toISOString(), summary.status, summary.title, m.rev, JSON.stringify(summary), data]];
  tab.getRange(row, 1, 1, 7).setNumberFormat("@").setValues(values);
  const cache = CacheService.getScriptCache();
  cache.put("match:" + m.id, data, 21600);
  cache.remove("matches");
  return { ok: true, rev: m.rev };
}

function deleteMatch(id) {
  if (!MATCH_ID.test(id)) return { ok: false, error: "invalid" };
  const tab = matchTab(false);
  const row = matchRow(tab, id);
  if (row > 0) tab.deleteRow(row);
  const cache = CacheService.getScriptCache();
  cache.remove("match:" + id);
  cache.remove("matches");
  return { ok: true };
}

function readMatch(id) {
  if (!MATCH_ID.test(id)) return null;
  const cache = CacheService.getScriptCache();
  const hit = cache.get("match:" + id);
  if (hit) return JSON.parse(hit);
  const tab = matchTab(false);
  const row = matchRow(tab, id);
  if (row < 0) return null;
  const data = String(tab.getRange(row, 7).getValue());
  cache.put("match:" + id, data, 21600);
  return JSON.parse(data);
}

/** Most recent matches first: [{ id, updated, rev, title, ground, status, note, lines }]. */
function listMatches() {
  const cache = CacheService.getScriptCache();
  const hit = cache.get("matches");
  if (hit) return JSON.parse(hit);
  const tab = matchTab(false);
  if (!tab || tab.getLastRow() < 2) return [];
  const rows = tab.getRange(2, 1, tab.getLastRow() - 1, 6).getValues();
  const list = rows
    .filter(function (r) { return MATCH_ID.test(String(r[0])); })
    .map(function (r) {
      let s = {};
      try { s = JSON.parse(String(r[5])); } catch (err) { s = {}; }
      const updated = r[1] instanceof Date ? r[1].toISOString() : String(r[1]);
      return Object.assign(cleanSummary(s), { id: String(r[0]), updated: updated, rev: Number(r[4]) || 0 });
    })
    .sort(function (a, b) { return a.updated < b.updated ? 1 : -1; })
    .slice(0, 30);
  cache.put("matches", JSON.stringify(list), 300);
  return list;
}

/** Scorers may use SCORER_KEY (Script Properties) or the organiser key. */
function isScorer(key) {
  if (isOrganiser(key)) return true;
  return sameSecret(key, PropertiesService.getScriptProperties().getProperty("SCORER_KEY"));
}

/**
 * The organiser key lives in Project Settings → Script Properties as
 * ORGANISER_KEY, never in this file (which is public on GitHub).
 */
function isOrganiser(key) {
  return sameSecret(key, PropertiesService.getScriptProperties().getProperty("ORGANISER_KEY"));
}

/** Constant-time comparison of a key with a stored secret (12+ characters). */
function sameSecret(key, secret) {
  if (!key || !secret || secret.length < 12) return false;
  const a = String(key);
  if (a.length !== secret.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ secret.charCodeAt(i);
  return diff === 0;
}

/** "Ravi Kumar Reddy" -> "Ravi R." — first name plus last initial only. */
function publicName(value) {
  const parts = String(value || "").trim().split(/\s+/).filter(String);
  if (parts.length === 0) return "";
  const first = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  if (parts.length === 1) return first;
  return first + " " + parts[parts.length - 1].charAt(0).toUpperCase() + ".";
}

/** True if a row with the same phone (last 10 digits) or email already exists. */
function isDuplicate(sheet, headers, fields) {
  if (sheet.getLastRow() < 2) return false;
  const phoneCol = headers.indexOf("Phone");
  const emailCol = headers.indexOf("Email");
  const phone = normalisePhone(fields.Phone);
  const email = String(fields.Email || "").trim().toLowerCase();
  if (!phone && !email) return false;

  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();
  return rows.some(function (row) {
    if (phone && phoneCol !== -1 && normalisePhone(row[phoneCol]) === phone) return true;
    if (email && emailCol !== -1 && String(row[emailCol]).trim().toLowerCase() === email)
      return true;
    return false;
  });
}

function normalisePhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : "";
}

/** Stops values like "=SUM(...)" being treated as spreadsheet formulas. */
function clean(value) {
  if (value === undefined || value === null) return "";
  const text = String(value).slice(0, 5000);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
