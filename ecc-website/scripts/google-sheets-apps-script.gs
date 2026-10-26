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
const SCRIPT_VERSION = 8;

/** Tab where the organisers' captain draw result is stored (organiser key only). */
const DRAW_TAB = "Captain Draw";

/** Tab where the player auction is backed up after every sale (organiser key only). */
const AUCTION_TAB = "Auction Results";

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
    if (raw.length > 10000) return json({ ok: false, error: "invalid" });
    const data = JSON.parse(raw || "{}");

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

/**
 * The organiser key lives in Project Settings → Script Properties as
 * ORGANISER_KEY, never in this file (which is public on GitHub).
 */
function isOrganiser(key) {
  if (!key) return false;
  const secret = PropertiesService.getScriptProperties().getProperty("ORGANISER_KEY");
  if (!secret || secret.length < 12) return false;
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
