import { googleSheetEndpoint } from "../data/forms";

/*
 * Live scoring ↔ Google Apps Script.
 * Reads are public. Saving needs the scorer key (or the organiser key).
 */

const endpoint = googleSheetEndpoint;

async function getJSON(params, timeout = 12000) {
  if (!endpoint) throw new Error("unavailable");
  const qs = new URLSearchParams({ ...params, t: String(Date.now()) });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(`${endpoint}?${qs}`, { signal: controller.signal, cache: "no-store" });
    if (!res.ok) throw new Error("unavailable");
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/** Recent matches, newest first. */
export async function fetchMatches() {
  const data = await getJSON({ matches: "1" });
  if (!data?.ok || !Array.isArray(data.matches)) throw new Error("unavailable");
  return data.matches;
}

/** One full match (setup + events), or null if it doesn't exist. */
export async function fetchMatch(id) {
  const data = await getJSON({ match: id });
  if (data?.error === "not-found") return null;
  if (!data?.ok || !data.match) throw new Error("unavailable");
  return data.match;
}

/** True if the key may save scores. */
export async function checkScorerKey(key) {
  const data = await getJSON({ checkScorer: key }, 15000);
  return Boolean(data?.ok);
}

async function post(body) {
  if (!endpoint) throw new Error("unavailable");
  await fetch(endpoint, {
    method: "POST",
    mode: "no-cors",
    keepalive: true,
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(body),
  });
}

export const postMatch = (key, match, summary) => post({ action: "saveMatch", key, match: { ...match, summary } });

export const postDeleteMatch = (key, id) => post({ action: "deleteMatch", key, id });

/* ---- Scorer device storage ---- */

export const SCORER_KEY_STORE = "ecc-scorer-key";
const MATCHES_STORE = "ecc-score:matches";

export function readScorerKey() {
  try {
    return localStorage.getItem(SCORER_KEY_STORE) || localStorage.getItem("ecc-organiser-key") || "";
  } catch {
    return "";
  }
}

export function storeScorerKey(key) {
  try {
    if (key) localStorage.setItem(SCORER_KEY_STORE, key);
    else localStorage.removeItem(SCORER_KEY_STORE);
  } catch {
    /* storage unavailable */
  }
}

export function readLocalMatches() {
  try {
    const parsed = JSON.parse(localStorage.getItem(MATCHES_STORE) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function storeLocalMatch(match) {
  try {
    const all = readLocalMatches();
    all[match.id] = match;
    localStorage.setItem(MATCHES_STORE, JSON.stringify(all));
  } catch {
    /* storage unavailable */
  }
}

export function removeLocalMatch(id) {
  try {
    const all = readLocalMatches();
    delete all[id];
    localStorage.setItem(MATCHES_STORE, JSON.stringify(all));
  } catch {
    /* storage unavailable */
  }
}

export function newMatchId() {
  const rand = Math.random().toString(36).slice(2, 8);
  const d = new Date();
  return `m${d.getMonth() + 1}${String(d.getDate()).padStart(2, "0")}-${rand}`;
}
