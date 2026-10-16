import { useCallback, useEffect, useState } from "react";
import { googleSheetEndpoint } from "../data/forms";
import { fetchSheetCounts } from "./form";

/*
 * Google Apps Script takes 1–3 s to answer, so counts are cached:
 *  - in memory, shared across pages (Home → Internal T7 is instant), and
 *  - in localStorage, so a returning visitor sees the last numbers at once.
 * The cached value is shown immediately and refreshed in the background.
 */
const memory = new Map(); // sheet -> counts
const inflight = new Map(); // sheet -> Promise
const storageKey = (sheet) => `ecc-signups:${sheet}`;

function readStored(sheet) {
  if (memory.has(sheet)) return memory.get(sheet);
  try {
    const raw = localStorage.getItem(storageKey(sheet));
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed.count === "number") return parsed;
  } catch {
    /* storage unavailable */
  }
  return null;
}

function store(sheet, counts) {
  memory.set(sheet, counts);
  try {
    localStorage.setItem(storageKey(sheet), JSON.stringify(counts));
  } catch {
    /* storage unavailable */
  }
}

function load(sheet, { fresh = false } = {}) {
  if (fresh) inflight.delete(sheet);
  if (!inflight.has(sheet)) {
    const request = fetchSheetCounts({ endpoint: googleSheetEndpoint, sheet })
      .then((result) => {
        if (result) store(sheet, result);
        return result;
      })
      .catch(() => null)
      .finally(() => {
        // Allow a fresh fetch on the next page visit after ~30 s.
        setTimeout(() => inflight.delete(sheet), 30000);
      });
    inflight.set(sheet, request);
  }
  return inflight.get(sheet);
}

/** Start fetching early (e.g. on hover of a link) so the page opens with numbers. */
export function prefetchSignupCounts(sheet) {
  if (googleSheetEndpoint) load(sheet);
}

/**
 * Live sign-up counts for a Sheet tab.
 * `counts` is the latest known value (cached or fresh), or null if none yet.
 * `loading` is true until the first answer from Google arrives.
 */
export function useSignupCounts(sheet) {
  const [counts, setCounts] = useState(() => readStored(sheet));
  const [loading, setLoading] = useState(Boolean(googleSheetEndpoint));

  useEffect(() => {
    if (!googleSheetEndpoint) return undefined;
    let cancelled = false;
    load(sheet).then((result) => {
      if (cancelled) return;
      if (result) setCounts(result);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [sheet]);

  const addOne = useCallback(
    (isCaptain) => {
      setCounts((prev) => {
        const base = prev ?? { count: 0, captains: 0, players: null };
        const next = {
          ...base,
          count: base.count + 1,
          captains: base.captains + (isCaptain ? 1 : 0),
        };
        store(sheet, next);
        return next;
      });
    },
    [sheet]
  );

  /** Re-read the real numbers from the Sheet (e.g. after a save finishes). */
  const refresh = useCallback(() => {
    if (!googleSheetEndpoint) return;
    load(sheet, { fresh: true }).then((result) => {
      if (result) setCounts(result);
    });
  }, [sheet]);

  return { counts, loading, addOne, refresh };
}
