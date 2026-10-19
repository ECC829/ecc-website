import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Container } from "../components/ui";
import { TextArea } from "../components/Form";
import { internalTournament as t } from "../data/internalTournament";
import { useSignupCounts } from "../lib/useSignupCounts";
import { Confetti, CricketBall, SplitFlap } from "../components/DrawEffects";

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
  const [phase, setPhase] = useState("idle"); // idle | bowling | flipping
  const [burst, setBurst] = useState(0);
  const pending = useRef(null);
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
    pending.current = pool[randomIndex(pool.length)];
    setSpinning(true);
    setJustPicked(null);
    setReel("");
    setPhase("bowling");
    // The ball spins for a moment, then the board flips to the name.
    timer.current = setTimeout(() => {
      setPhase("flipping");
      setReel(pending.current);
    }, 1700);
  }, [pool, spinning]);

  const onFlipSettled = useCallback(() => {
    const winner = pending.current;
    if (!winner) return;
    pending.current = null;
    setPicked((prev) => (prev.includes(winner) ? prev : [...prev, winner]));
    setJustPicked(winner);
    setSpinning(false);
    setPhase("idle");
    setBurst((n) => n + 1);
  }, []);

  const reset = () => {
    if (!window.confirm("Start over? This clears the captains drawn so far.")) return;
    clearTimeout(timer.current);
    setPicked([]);
    setStarted(false);
    setSpinning(false);
    setReel("");
    setJustPicked(null);
    setPhase("idle");
    pending.current = null;
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
          <h1 className="headline mt-4 text-5xl sm:text-6xl">The Captain Draw</h1>
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
  const total = Math.min(captainsNeeded, nominees.length);
  const status = done
    ? "All captains drawn"
    : phase === "bowling"
      ? "Into the hat…"
      : phase === "flipping"
        ? "And the captain is…"
        : justPicked
          ? `Team ${picked.length} captain`
          : `Captain ${picked.length + 1} of ${total}`;

  return (
    <section className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-[#06110b]">
      {/* Floodlit outfield */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 0%, rgba(246,237,211,0.16), transparent 70%), repeating-linear-gradient(90deg, #0b2416 0 90px, #0d2a1a 90px 180px)",
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" aria-hidden="true" />
      {burst > 0 && <Confetti key={burst} />}

      <Container className="relative py-8 sm:py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#e8b234]">
              {t.name}
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold uppercase tracking-wide text-[#f6edd3] sm:text-5xl">
              The Captain Draw
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={fullscreen} className="rounded-full border border-[#f6edd3]/25 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-[#f6edd3]/80 transition hover:border-[#e8b234] hover:text-[#e8b234] disabled:opacity-40">
              Full screen
            </button>
            <button
              type="button"
              onClick={() => setStarted(false)}
              disabled={spinning}
              className="rounded-full border border-[#f6edd3]/25 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-[#f6edd3]/80 transition hover:border-[#e8b234] hover:text-[#e8b234] disabled:opacity-40"
            >
              Edit names
            </button>
            <button type="button" onClick={reset} disabled={spinning} className="rounded-full border border-[#f6edd3]/25 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-[#f6edd3]/80 transition hover:border-[#e8b234] hover:text-[#e8b234] disabled:opacity-40">
              Start over
            </button>
          </div>
        </div>

        {/* Stadium sign */}
        <div
          className={`relative mt-8 rounded-[28px] border-[6px] p-6 text-center transition sm:p-10 ${
            justPicked ? "border-[#e8b234] shadow-[0_0_90px_rgba(232,178,52,0.35)]" : "border-[#2b2b2b]"
          }`}
          style={{ background: "linear-gradient(180deg, #1c1c1c, #0e0e0e)" }}
          aria-live="polite"
        >
          {/* bulbs */}
          <div className="pointer-events-none absolute inset-x-6 top-2 flex justify-between" aria-hidden="true">
            {Array.from({ length: 14 }, (_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${
                  spinning ? (i % 2 ? "bg-[#e8b234] animate-pulse" : "bg-[#e8b234]/40") : justPicked ? "bg-[#e8b234]" : "bg-white/15"
                }`}
              />
            ))}
          </div>

          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#f6edd3]/60 sm:text-xs">
            {status}
          </p>

          <div className="mt-6 flex min-h-[clamp(5rem,14vw,9rem)] items-center justify-center">
            {phase === "bowling" ? (
              <CricketBall spinning size={110} />
            ) : reel ? (
              <SplitFlap text={reel} onSettled={phase === "flipping" ? onFlipSettled : undefined} />
            ) : (
              <span className="inline-flex flex-col items-center gap-4 text-[#f6edd3]/40">
                <CricketBall size={84} />
              </span>
            )}
          </div>

          {!done ? (
            <button
              type="button"
              onClick={drawNext}
              disabled={spinning}
              className="mt-8 rounded-full bg-[#e8b234] px-10 py-4 font-display text-lg font-bold uppercase tracking-widest text-[#14100a] shadow-[0_8px_30px_rgba(232,178,52,0.35)] transition hover:bg-[#f3c654] disabled:cursor-wait disabled:opacity-60"
            >
              {spinning ? "Drawing…" : picked.length === 0 ? "Bowl the first draw" : "Bowl the next draw"}
            </button>
          ) : (
            <button
              type="button"
              onClick={copyResults}
              className="mt-8 rounded-full border border-[#e8b234] px-8 py-3 text-sm font-semibold uppercase tracking-widest text-[#e8b234] transition hover:bg-[#e8b234] hover:text-[#14100a]"
            >
              Copy results
            </button>
          )}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.55fr_1fr]">
          {/* Manual scoreboard */}
          <div
            className="rounded-2xl border-[5px] border-[#3a2a17] p-4 shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] sm:p-6"
            style={{ background: "linear-gradient(180deg, #123a24, #0c2a19)" }}
          >
            <div className="flex items-baseline justify-between border-b border-[#f6edd3]/20 pb-3">
              <p className="font-display text-xl font-bold uppercase tracking-[0.2em] text-[#f6edd3]">
                Captains
              </p>
              <p className="font-mono text-sm text-[#f6edd3]/70">
                {String(picked.length).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </p>
            </div>
            <ol className="mt-3 divide-y divide-[#f6edd3]/10">
              {Array.from({ length: total }, (_, i) => {
                const name = picked[i];
                const fresh = name && name === justPicked;
                return (
                  <li key={i} className="flex items-center gap-4 py-2.5">
                    <span className="flex h-9 w-12 shrink-0 items-center justify-center rounded bg-[#0a0a0a] font-mono text-lg font-semibold text-[#e8b234]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#f6edd3]/50">
                      Team
                    </span>
                    <span
                      className={`min-w-0 flex-1 truncate rounded px-3 py-1.5 font-display text-lg font-bold uppercase tracking-wider ${
                        name
                          ? fresh
                            ? "bg-[#f6edd3] text-[#0c2a19]"
                            : "bg-[#0a0a0a]/60 text-[#f6edd3]"
                          : "bg-[#0a0a0a]/30 text-[#f6edd3]/20"
                      }`}
                    >
                      {name || "· · · · · ·"}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* The hat */}
          <div className="rounded-2xl border border-[#f6edd3]/10 bg-black/30 p-4 sm:p-6">
            <p className="font-display text-xl font-bold uppercase tracking-[0.2em] text-[#f6edd3]">
              In the hat
              <span className="ml-2 font-mono text-sm font-normal text-[#f6edd3]/60">{pool.length}</span>
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {nominees.map((n) => {
                const out = picked.includes(n);
                return (
                  <li
                    key={n}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                      out
                        ? "border-[#e8b234]/30 bg-[#e8b234]/10 text-[#e8b234]/80 line-through decoration-[#e8b234]/60"
                        : "border-[#f6edd3]/15 text-[#f6edd3]/85"
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${out ? "bg-[#e8b234]" : "bg-[#c8102e]"}`}
                      aria-hidden="true"
                    />
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
