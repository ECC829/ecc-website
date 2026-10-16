/**
 * ECC website → Google Sheets
 *
 * Paste this whole file into Extensions → Apps Script of the club's Google Sheet,
 * then Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone).
 * See docs/google-sheets-setup.md for the full steps.
 *
 * Each website form sends { sheet: "<tab name>", fields: { Column: value, ... } }.
 * The tab is created automatically, the first row becomes the column headers,
 * and new columns are added if a form starts sending a new field.
 */

/** Bump this when the script changes, to confirm the new version is live. */
const SCRIPT_VERSION = 3;

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const data = JSON.parse(e.postData.contents || "{}");

    // Spam trap: real visitors never fill the hidden "website" field.
    if (data.website) return json({ ok: true });

    const sheetName = String(data.sheet || "Responses").slice(0, 90);
    const fields = data.fields || {};

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);

    // Header row: "Submitted at" + every field name, adding any new ones.
    let headers =
      sheet.getLastRow() === 0
        ? ["Submitted at"]
        : sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    Object.keys(fields).forEach(function (key) {
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
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/**
 * GET without parameters: health check (open the link in a browser).
 * GET ?sheet=<tab name>: returns sign-up counts only — never names or contacts.
 *   { ok, count, captains }  where captains = rows with "Captain nomination" = Yes
 */
function doGet(e) {
  const sheetName = e && e.parameter && e.parameter.sheet;
  if (!sheetName) {
    return json({ ok: true, version: SCRIPT_VERSION, message: "ECC form endpoint is running." });
  }
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(String(sheetName));
  if (!sheet || sheet.getLastRow() < 2) return json({ ok: true, count: 0, captains: 0 });

  const values = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  const headers = values.shift();
  const nameCol = headers.indexOf("Name");
  const captainCol = headers.indexOf("Captain nomination");
  const rows = values.filter(function (row) {
    return nameCol === -1 || String(row[nameCol]).trim() !== "";
  });
  const captains =
    captainCol === -1
      ? 0
      : rows.filter(function (row) {
          return String(row[captainCol]).trim().toLowerCase() === "yes";
        }).length;
  return json({ ok: true, count: rows.length, captains: captains });
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
