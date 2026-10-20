import { useState } from "react";

/**
 * Small controlled-form helper: holds values, per-field errors, and
 * clears a field's error as soon as the field is edited.
 */
export function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error

  const setField = (field, value, extra = {}) => {
    setValues((prev) => ({ ...prev, [field]: value, ...extra }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setStatus("idle");
  };

  return { values, setValues, errors, setErrors, setField, status, setStatus, reset };
}

export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

export const digitCount = (value) => (value.match(/\d/g) ?? []).length;

/** Builds a mailto: link so forms work without a backend. */
export function mailtoLink({ to, subject, fields }) {
  const body = Object.entries(fields)
    .filter(([, value]) => value !== "" && value != null)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Sends a form submission to the Google Apps Script web app, which appends it
 * as a row in the named tab of the club's Google Sheet.
 *
 * Uses a "simple" no-cors request (text/plain), which Apps Script accepts
 * without a CORS preflight. The response can't be read, so this resolves once
 * the request has been sent and only throws if the network request fails.
 */
export async function submitToSheet({ endpoint, sheet, fields, website = "" }) {
  await fetch(endpoint, {
    method: "POST",
    mode: "no-cors",
    // keepalive lets the save finish even if the visitor leaves the page.
    keepalive: true,
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ sheet, fields, website }),
  });
}

/**
 * Reads the sign-up counts for one Sheet tab from the Apps Script web app.
 * Returns { count, captains } or null if unavailable.
 */
export async function fetchSheetCounts({ endpoint, sheet }) {
  const url = `${endpoint}?sheet=${encodeURIComponent(sheet)}`;
  // Give up after 12 s so the page never shows loading placeholders forever.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  let res;
  try {
    res = await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.ok || typeof data.count !== "number") return null;
  return {
    count: data.count,
    captains: data.captains ?? 0,
    players: Array.isArray(data.players) ? data.players : null,
  };
}

/**
 * Organiser-only: full names and captain choices for the draw and auction
 * boards. Needs the organiser key (kept in the Apps Script's Script
 * Properties). Returns [{ name, captain }] or throws "wrong-key".
 */
export async function fetchOrganiserRoster({ endpoint, sheet, key }) {
  const url = `${endpoint}?sheet=${encodeURIComponent(sheet)}&key=${encodeURIComponent(key)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    const data = await res.json();
    if (data?.error === "wrong-key") throw new Error("wrong-key");
    if (!data?.ok || !Array.isArray(data.roster)) throw new Error("unavailable");
    return data.roster;
  } finally {
    clearTimeout(timer);
  }
}
