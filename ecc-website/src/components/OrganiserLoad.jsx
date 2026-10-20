import { useState } from "react";
import { googleSheetEndpoint } from "../data/forms";
import { internalTournament as t } from "../data/internalTournament";
import { fetchOrganiserRoster } from "../lib/form";

const KEY_STORE = "ecc-organiser-key";

function readKey() {
  try {
    return localStorage.getItem(KEY_STORE) || "";
  } catch {
    return "";
  }
}

/**
 * "Load from sign-ups" button for organiser pages. Asks for the organiser key
 * once (remembered on this device), then hands the full roster to onLoaded.
 */
export default function OrganiserLoad({ label, onLoaded, describe }) {
  const [key, setKey] = useState(readKey);
  const [askKey, setAskKey] = useState(() => !readKey());
  const [status, setStatus] = useState({ kind: "idle", text: "" });

  const load = async () => {
    if (!key.trim()) {
      setAskKey(true);
      return;
    }
    setStatus({ kind: "busy", text: "Loading from the sign-up sheet…" });
    try {
      const roster = await fetchOrganiserRoster({
        endpoint: googleSheetEndpoint,
        sheet: `${t.shortName} ${t.year}`,
        key: key.trim(),
      });
      try {
        localStorage.setItem(KEY_STORE, key.trim());
      } catch {
        /* storage unavailable */
      }
      setAskKey(false);
      const text = onLoaded(roster);
      setStatus({ kind: "ok", text: text || describe?.(roster) || `Loaded ${roster.length} sign-ups.` });
    } catch (err) {
      if (err.message === "wrong-key") {
        setAskKey(true);
        setStatus({ kind: "error", text: "That organiser key isn't right." });
      } else {
        setStatus({ kind: "error", text: "Couldn't reach the sign-up sheet. Try again in a moment." });
      }
    }
  };

  return (
    <div className="mt-4 rounded-lg border border-[#1b1a14]/15 bg-[#1b1a14]/[0.04] p-3">
      <div className="flex flex-wrap items-center gap-2">
        {askKey && (
          <input
            type="password"
            autoComplete="off"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Organiser key"
            aria-label="Organiser key"
            className="min-w-0 flex-1 rounded-full border border-[#1b1a14]/25 bg-white px-4 py-2 text-sm text-[#1b1a14] focus:border-[#c8102e] focus:outline-none"
          />
        )}
        <button
          type="button"
          onClick={load}
          disabled={status.kind === "busy"}
          className="rounded-full bg-[#0c2a19] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#f6edd3] transition hover:bg-[#123a24] disabled:opacity-60"
        >
          {status.kind === "busy" ? "Loading…" : label}
        </button>
        {!askKey && (
          <button
            type="button"
            onClick={() => setAskKey(true)}
            className="text-[11px] uppercase tracking-widest text-[#1b1a14]/50 hover:text-[#c8102e]"
          >
            Change key
          </button>
        )}
      </div>
      {status.text && (
        <p
          className={`mt-2 text-xs ${
            status.kind === "error" ? "text-[#c8102e]" : "text-[#1b1a14]/70"
          }`}
          role="status"
        >
          {status.text}
        </p>
      )}
    </div>
  );
}
