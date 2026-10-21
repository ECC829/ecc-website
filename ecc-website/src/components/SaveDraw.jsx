import { useEffect, useRef, useState } from "react";
import { googleSheetEndpoint } from "../data/forms";
import { internalTournament as t } from "../data/internalTournament";
import { fetchOrganiserData, saveDrawnCaptains } from "../lib/form";
import { readKey, storeKey } from "../lib/organiserKey";

const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

/**
 * Saves the finished captain draw to the Google Sheet (organiser key needed)
 * so the auction board can load the captains on any device. Saves on its
 * own as soon as the draw is complete, then double-checks the Sheet.
 */
export default function SaveDraw({ captains }) {
  const [key, setKey] = useState(readKey);
  const [status, setStatus] = useState({ kind: "idle", text: "" });
  const lastSaved = useRef("");

  const save = async (useKey = key) => {
    const k = useKey.trim();
    if (!k) {
      setStatus({ kind: "need-key", text: "Enter the organiser key to save these captains for the auction." });
      return;
    }
    setStatus({ kind: "busy", text: "Saving captains to the sign-up sheet…" });
    try {
      await saveDrawnCaptains({ endpoint: googleSheetEndpoint, key: k, captains });
      // The save can't be read back directly, so check the Sheet.
      await new Promise((r) => setTimeout(r, 1500));
      const data = await fetchOrganiserData({
        endpoint: googleSheetEndpoint,
        sheet: `${t.shortName} ${t.year}`,
        key: k,
      });
      if (data.drawn && same(data.drawn.captains, captains)) {
        storeKey(k);
        lastSaved.current = captains.join("|");
        setStatus({ kind: "ok", text: "Saved ✓ — the auction board can load these captains on any device." });
      } else {
        setStatus({ kind: "error", text: "Couldn't confirm the save. Try again." });
      }
    } catch (err) {
      setStatus(
        err.message === "wrong-key"
          ? { kind: "need-key", text: "That organiser key isn't right." }
          : { kind: "error", text: "Couldn't reach the sign-up sheet. Try again." }
      );
    }
  };

  // Save automatically once the draw is complete (if the key is known).
  const signature = captains.join("|");
  useEffect(() => {
    if (!captains.length || lastSaved.current === signature) return;
    lastSaved.current = signature;
    const k = readKey();
    if (k) {
      save(k);
    } else {
      setTimeout(() => setStatus({ kind: "need-key", text: "Enter the organiser key to save these captains for the auction." }), 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  return (
    <div className="mx-auto mt-5 max-w-lg text-sm" role="status">
      {status.kind === "need-key" && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <input
            type="password"
            autoComplete="off"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            placeholder="Organiser key"
            aria-label="Organiser key"
            className="min-w-0 flex-1 rounded-full border border-[#f6edd3]/25 bg-black/40 px-4 py-2 text-[#f6edd3] focus:border-[#e8b234] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => save()}
            className="rounded-full bg-[#e8b234] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#14100a]"
          >
            Save captains
          </button>
        </div>
      )}
      {status.text && (
        <p
          className={`mt-2 ${
            status.kind === "ok" ? "text-[#7ee2a8]" : status.kind === "busy" ? "text-[#f6edd3]/70" : "text-[#ff8a96]"
          }`}
        >
          {status.text}
        </p>
      )}
      {status.kind === "error" && (
        <button type="button" onClick={() => save()} className="mt-2 text-xs uppercase tracking-widest text-[#e8b234] underline">
          Try again
        </button>
      )}
    </div>
  );
}
