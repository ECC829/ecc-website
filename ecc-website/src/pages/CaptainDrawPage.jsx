import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Container } from "../components/ui";
import { TextArea } from "../components/Form";
import { internalTournament as t } from "../data/internalTournament";
import { useSignupCounts } from "../lib/useSignupCounts";

const STORAGE_KEY = `ecc-captain-draw:${t.shortName} ${t.year}`;

/** Fair random index using the browser's cryptographic random generator. */
function randomIndex(length) {
  const buf = new Uint32Array(1);
  const limit = Math.floor(0xffffffff / length) * length; // avoid modulo bias
  do {
    crypto.getRandomValues(buf);
  } while (buf[0] >= limit);
  return buf[0] % length;
}

function parseNames(text) {
  const seen = new Set();
  return text
    .split(/\n|,/)
    .map((n) => n.replace(/\s+/g, " ").trim())
    .filter((n) => {
      const key = n.toLowerCase();
      if (!n || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

export default function CaptainDrawPage() {
  const [saved] = useState(loadSaved);
  const { counts } = useSignupCounts(`${t.shortName} ${t.year}`);

  const [namesText, setNamesText] = useState(saved?.namesText ?? "");
  const [target, setTarget] = useState(saved?.target ?? "");
  const [picked, setPicked] = useState(saved?.picked ?? []);
  const [started, setStarted] = useState(saved?.started ?? false);
  const [spinning, setSpinning] = useState(false);
  const [reel, setReel] = useState("");
  const [justPicked, setJustPicked] = useState(null);
  const timer = useRef(null);

  const nominees = useMemo(() => parseNames(namesText), [namesText]);
  const pool = nominees.filter((n) => !picked.includes(n));
  const suggested = counts ? Math.max(1, Math.floor(counts.count / t.playersPerTeam)) : null;
  const captainsNeeded = Number(target) || suggested || 0;
  const done = started && (picked.length >= captainsNeeded || pool.length === 0);

  // Remember progress so a refresh mid-draw doesn't lose anything.
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ namesText, target, picked, started })
      );
    } catch {
      /* storage unavailable */
    }
  }, [namesText, target, picked, started]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const drawNext = useCallback(() => {
    if (spinning || pool.length === 0) return;
    const winner = pool[randomIndex(pool.length)];
    setSpinning(true);
    setJustPicked(null);

    // Spin through names, slowing down, then land on the winner.
    let delay = 45;
    const tick = () => {
      if (delay > 320) {
        setReel(winner);
        setPicked((prev) => [...prev, winner]);
        setJustPicked(winner);
        setSpinning(false);
        return;
      }
      setReel(pool[randomIndex(pool.length)]);
      delay *= 1.12;
      timer.current = setTimeout(tick, delay);
    };
    tick();
  }, [pool, spinning]);

  const reset = () => {
    if (!window.confirm("Start over? This clears the captains drawn so far.")) return;
    clearTimeout(timer.current);
    setPicked([]);
    setStarted(false);
    setSpinning(false);
    setReel("");
    setJustPicked(null);
  };

  const fullscreen = () => {
    const el = document.documentElement;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else el.requestFullscreen?.();
  };

  const copyResults = async () => {
    const text = `${t.name} — Captains\n` + picked.map((n, i) => `Team ${i + 1}: ${n}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard unavailable */
    }
  };

  /* ---------------------------- Setup screen ---------------------------- */
  if (!started) {
    return (
      <section className="relative overflow-hidden border-b border-white/[0.07] bg-ink-900">
        <div className="absolute inset-0 bg-field-glow" aria-hidden="true" />
        <Container className="relative py-12 sm:py-16">
          <p className="eyebrow">Organisers · {t.name}</p>
          <h1 className="headline mt-4 text-5xl sm:text-6xl">Captain draw</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
            Paste the players who nominated themselves as captain — copy them from the
            Google Sheet (filter “Captain nomination” to Yes). Then put this page on the
            big screen and draw the captains live.
          </p>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl border border-white/[0.08] bg-ink-950 p-6 sm:p-8">
              <label className="block">
                <span className="mb-2 flex items-baseline justify-between text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  Captain nominees
                  <span className="normal-case tracking-normal text-slate-500">
                    one name per line · {nominees.length} entered
                  </span>
                </span>
                <TextArea
                  rows={10}
                  value={namesText}
                  onChange={(e) => setNamesText(e.target.value)}
                  placeholder={"Ravi Kumar\nSai Prasad\nArjun Mehta\n…"}
                />
              </label>
              <p className="mt-2 text-xs text-slate-500">
                Duplicate names are removed automatically. Nothing here is sent anywhere —
                it stays in this browser.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border border-white/[0.08] bg-ink-950 p-6 sm:p-8">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                    Captains to draw
                  </span>
                  <input
                    type="number"
                    min="1"
                    inputMode="numeric"
                    className="field"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder={suggested ? String(suggested) : "e.g. 10"}
                  />
                </label>
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  {counts
                    ? `${counts.count} players signed up → ${suggested} teams of ${t.playersPerTeam}. Leave blank to use ${suggested}.`
                    : `One captain per team of ${t.playersPerTeam}.`}
                </p>
              </div>

              <button
                type="button"
                className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
                disabled={nominees.length === 0 || captainsNeeded < 1}
                onClick={() => setStarted(true)}
              >
                Open the draw board
              </button>
              {nominees.length > 0 && captainsNeeded > nominees.length && (
                <p className="text-center text-xs text-amber-300">
                  Only {nominees.length} nominees for {captainsNeeded} captains — everyone
                  nominated will be drawn.
                </p>
              )}
              <Link
                to="/internal-tournament"
                className="text-center text-xs uppercase tracking-widest text-slate-500 hover:text-gold-300"
              >
                ← Back to tournament page
              </Link>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  /* ----------------------------- Draw board ----------------------------- */
  return (
    <section className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-ink-950">
      <div className="absolute inset-0 bg-field-glow opacity-70" aria-hidden="true" />
      <div className="diag-stripes absolute inset-0 opacity-40" aria-hidden="true" />
      <Container className="relative py-8 sm:py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">{t.name}</p>
            <h1 className="headline mt-2 text-4xl sm:text-6xl">Captain draw</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={fullscreen} className="btn-ghost !px-4 !py-2 !text-xs">
              Full screen
            </button>
            <button
              type="button"
              onClick={() => setStarted(false)}
              disabled={spinning}
              className="btn-ghost !px-4 !py-2 !text-xs"
            >
              Edit names
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={spinning}
              className="btn-ghost !px-4 !py-2 !text-xs"
            >
              Start over
            </button>
          </div>
        </div>

        {/* Reveal box */}
        <div
          className={`mt-8 rounded-3xl border p-8 text-center transition sm:p-12 ${
            justPicked
              ? "border-gold-400/70 bg-gold-400/[0.10] shadow-[0_0_80px_rgba(232,178,52,0.25)]"
              : "border-white/[0.1] bg-ink-900/80"
          }`}
          aria-live="polite"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-slate-400">
            {done
              ? "All captains drawn"
              : spinning
                ? "Drawing…"
                : justPicked
                  ? `Team ${picked.length} captain`
                  : `Captain ${picked.length + 1} of ${Math.min(captainsNeeded, nominees.length)}`}
          </p>
          <p
            className={`headline mt-4 min-h-[1.2em] break-words text-5xl sm:text-7xl lg:text-8xl ${
              justPicked ? "text-gold-300" : spinning ? "text-white/80" : "text-slate-600"
            }`}
          >
            {reel || "?"}
          </p>
          {!done && (
            <button
              type="button"
              onClick={drawNext}
              disabled={spinning}
              className="btn-primary mt-8 !px-10 !py-4 !text-base disabled:cursor-wait disabled:opacity-60"
            >
              {spinning ? "Drawing…" : picked.length === 0 ? "Draw first captain" : "Draw next captain"}
            </button>
          )}
          {done && (
            <button type="button" onClick={copyResults} className="btn-ghost mt-8">
              Copy results
            </button>
          )}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Captains board */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              Captains · {picked.length} / {Math.min(captainsNeeded, nominees.length)}
            </p>
            <ol className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Array.from({ length: Math.min(captainsNeeded, nominees.length) }, (_, i) => {
                const name = picked[i];
                return (
                  <li
                    key={i}
                    className={`flex items-center gap-4 rounded-xl border p-4 transition ${
                      name
                        ? name === justPicked
                          ? "border-gold-400/70 bg-gold-400/[0.12]"
                          : "border-gold-400/25 bg-ink-900"
                        : "border-dashed border-white/10 bg-transparent"
                    }`}
                  >
                    <span className="font-display text-3xl font-bold leading-none text-gold-400/80">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                        Team {i + 1}
                      </span>
                      <span
                        className={`block truncate text-lg font-semibold ${
                          name ? "text-white" : "text-slate-600"
                        }`}
                      >
                        {name || "—"}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Remaining pool */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              Still in the hat · {pool.length}
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {nominees.map((n) => {
                const out = picked.includes(n);
                return (
                  <li
                    key={n}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      out
                        ? "border-gold-400/30 bg-gold-400/10 text-gold-300 line-through decoration-gold-400/60"
                        : n === reel && spinning
                          ? "border-white/40 bg-white/10 text-white"
                          : "border-white/10 text-slate-300"
                    }`}
                  >
                    {n}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
