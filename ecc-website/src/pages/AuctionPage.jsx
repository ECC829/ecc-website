import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Container } from "../components/ui";
import { Confetti, CricketBall, SplitFlap } from "../components/DrawEffects";
import { internalTournament as t } from "../data/internalTournament";
import OrganiserLoad from "../components/OrganiserLoad";
import { googleSheetEndpoint } from "../data/forms";
import { fetchOrganiserData, saveAuctionBackup } from "../lib/form";
import { readKey, storeKey } from "../lib/organiserKey";

const SHEET = `${t.shortName} ${t.year}`;
const STORAGE_KEY = `ecc-auction:${SHEET}`;
const DRAW_KEY = `ecc-captain-draw:${SHEET}`;

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

function randomIndex(length) {
  const buf = new Uint32Array(1);
  const limit = Math.floor(0xffffffff / length) * length;
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

function readJSON(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

function fmtClock(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

const blankLot = (player) => ({
  player,
  bids: [], // [{ captain: index, amount }]
  status: "ready", // ready | running | paused | ended
  remainingMs: t.auctionSeconds * 1000,
  endsAt: null,
  extensions: 0,
});

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

export default function AuctionPage() {
  const [saved] = useState(() => readJSON(STORAGE_KEY));

  // The board always opens empty: organisers load the captains (from the
  // draw) and the players (from the sign-ups). An unfinished auction saved on
  // this device can be resumed with one click.
  const [captainsText, setCaptainsText] = useState("");
  const [playersText, setPlayersText] = useState("");
  const [budget, setBudget] = useState(t.captainPoints);
  const [squadSize, setSquadSize] = useState(t.playersToBuy);

  // Auction state
  const [started, setStarted] = useState(false);
  const [teams, setTeams] = useState([]); // [{ name, squad: [{player, price}] }]
  const [pool, setPool] = useState([]);
  // Players who went unsold at least once. They go back into the pool, marked.
  const [unsold, setUnsold] = useState([]);
  const [lot, setLot] = useState(null);
  const [history, setHistory] = useState([]); // undo stack (snapshots)
  const [canResume, setCanResume] = useState(() => Boolean(saved?.started && saved?.teams?.length));
  const [called, setCalled] = useState(""); // amount a captain has called out
  const [banner, setBanner] = useState(null); // { kind: "sold"|"unsold", text }
  const [burst, setBurst] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [roles, setRoles] = useState({}); // lower-case player name -> role from sign-up
  const [backup, setBackup] = useState({ kind: "idle", at: null }); // idle | saving | ok | no-key | error
  const [keyInput, setKeyInput] = useState("");

  const captainNames = useMemo(() => parseNames(captainsText), [captainsText]);
  // Pool names that look like a captain under a different spelling, e.g.
  // captain "VAMSI" vs sign-up "Vamsi D." (same first name, and the rest of
  // the name is missing or matches). Two different people who only share a
  // first name ("Mahesh Mannam" vs "Mahesh Reddy Pesani") are not flagged.
  const lookalikes = useMemo(() => {
    const words = (n) => n.replace(/\./g, " ").toLowerCase().split(/\s+/).filter(Boolean);
    const caps = captainNames.map(words);
    const alike = (a, b) => {
      if (!a.length || !b.length || a[0] !== b[0]) return false;
      const restA = a.slice(1);
      const restB = b.slice(1);
      if (!restA.length || !restB.length) return true; // "Vamsi" vs "Vamsi D"
      return restA.some((x) => restB.some((y) => x.startsWith(y) || y.startsWith(x)));
    };
    return parseNames(playersText).filter((p) => {
      const w = words(p);
      return caps.some((c) => alike(c, w));
    });
  }, [captainNames, playersText]);
  const playerNames = useMemo(() => {
    const caps = new Set(captainNames.map((c) => c.toLowerCase()));
    return parseNames(playersText).filter((p) => !caps.has(p.toLowerCase()));
  }, [playersText, captainNames]);

  // Persist everything so a refresh or a dropped laptop lid loses nothing.
  // Nothing is written until the organiser has loaded or typed something.
  useEffect(() => {
    if (!started && !captainsText && !playersText) return;
    // Don't overwrite an unfinished auction until the organiser chooses
    // "Resume it" or "Start fresh" (or opens a new auction).
    if (!started && canResume) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          captainsText, playersText, budget, squadSize,
          started, teams, pool, unsold, lot, history: history.slice(-30), roles,
        })
      );
    } catch {
      /* storage unavailable */
    }
  }, [captainsText, playersText, budget, squadSize, started, teams, pool, unsold, lot, history, canResume, roles]);

  /* --------------------------- derived ---------------------------- */
  const leading = lot?.bids.length ? lot.bids[lot.bids.length - 1] : null;
  const remainingMs =
    lot?.status === "running" ? Math.max(0, lot.endsAt - now) : lot?.remainingMs ?? 0;

  const spent = (team) => team.squad.reduce((sum, s) => sum + s.price, 0);
  const pointsLeft = (team) => budget - spent(team);
  const slotsLeft = (team) => squadSize - team.squad.length;
  // Keep enough to buy the remaining slots at the minimum bid.
  const maxBid = (team) =>
    slotsLeft(team) <= 0 ? 0 : pointsLeft(team) - t.minBid * (slotsLeft(team) - 1);

  const minNext = leading ? leading.amount + 1 : t.minBid;
  const calledNum = Math.floor(Number(called));
  const nextAmount = called !== "" && calledNum > 0 ? calledNum : minNext;
  const tooLow = called !== "" && calledNum > 0 && calledNum < minNext;
  const allFull = teams.length > 0 && teams.every((tm) => slotsLeft(tm) <= 0);
  const finished = started && !lot && (allFull || pool.length === 0);

  // Save to the Sheet, then read it back to make sure the save really landed.
  const runBackup = async (key, snapshotTeams, complete) => {
    setBackup((b) => ({ ...b, kind: "saving" }));
    try {
      await saveAuctionBackup({ endpoint: googleSheetEndpoint, key, teams: snapshotTeams, budget, complete });
      await new Promise((res) => setTimeout(res, 1200));
      const data = await fetchOrganiserData({ endpoint: googleSheetEndpoint, sheet: SHEET, key });
      const sold = (list) => list.reduce((n, tm) => n + tm.squad.length, 0);
      if (data.auction && data.auction.teams.length === snapshotTeams.length && sold(data.auction.teams) === sold(snapshotTeams)) {
        setBackup({ kind: "ok", at: new Date() });
      } else {
        setBackup({ kind: "error", at: null });
      }
    } catch (err) {
      setBackup({ kind: err.message === "wrong-key" ? "no-key" : "error", at: null });
    }
  };

  // Back up the auction to the Google Sheet whenever the squads change, so a
  // crashed laptop or cleared browser never loses the results.
  const backupSig = started ? JSON.stringify([teams, finished]) : "";
  useEffect(() => {
    if (!backupSig || !teams.length) return undefined;
    const key = readKey();
    const timer = setTimeout(async () => {
      if (!key) {
        setBackup({ kind: "no-key", at: null });
        return;
      }
      runBackup(key, teams, finished);
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backupSig]);
  const freshPool = pool.filter((p) => !unsold.includes(p));

  /* ---------------------------- clock ----------------------------- */
  const endsAt = lot?.status === "running" ? lot.endsAt : null;
  useEffect(() => {
    if (!endsAt) return undefined;
    const id = setInterval(() => {
      const current = Date.now();
      setNow(current);
      // Close the lot when the clock hits zero; the auctioneer then confirms.
      if (current >= endsAt) {
        setLot((l) =>
          l && l.status === "running" && current >= l.endsAt
            ? { ...l, status: "ended", remainingMs: 0, endsAt: null }
            : l
        );
      }
    }, 200);
    return () => clearInterval(id);
  }, [endsAt]);

  const snapshot = useCallback(
    () => ({ teams, pool, unsold, lot }),
    [teams, pool, unsold, lot]
  );

  const finishLot = useCallback(() => {
    if (!lot) return;
    setHistory((h) => [...h, snapshot()]);
    if (leading) {
      setTeams((prev) =>
        prev.map((tm, i) =>
          i === leading.captain
            ? { ...tm, squad: [...tm.squad, { player: lot.player, price: leading.amount }] }
            : tm
        )
      );
      setBanner({
        kind: "sold",
        text: `${lot.player} → ${teams[leading.captain].name} for ${leading.amount}`,
      });
      setBurst((n) => n + 1);
    } else {
      // Unsold players go back into the pool for another round.
      setPool((p) => [...p, lot.player]);
      setUnsold((u) => (u.includes(lot.player) ? u : [...u, lot.player]));
      setBanner({ kind: "unsold", text: `${lot.player} — unsold, back in the pool` });
    }
    setLot(null);
  }, [lot, leading, snapshot, teams]);

  /* --------------------------- actions ---------------------------- */
  const startAuction = () => {
    setCanResume(false);
    setTeams(captainNames.map((name) => ({ name, squad: [] })));
    setPool(playerNames);
    setUnsold([]);
    setLot(null);
    setHistory([]);
    setBanner(null);
    setStarted(true);
  };

  const nextPlayer = () => {
    // Players not yet auctioned come first; unsold players get another go
    // once everyone else has been up.
    const source = freshPool.length ? freshPool : pool;
    if (!source.length) return;
    const player = source[randomIndex(source.length)];
    setBanner(null);
    setPool((p) => p.filter((x) => x !== player));
    setLot(blankLot(player));
    setCalled("");
  };

  const pickPlayer = (player) => {
    if (lot) return;
    setBanner(null);
    setPool((p) => p.filter((x) => x !== player));
    setLot(blankLot(player));
  };

  const startClock = () =>
    setLot((l) => ({ ...l, status: "running", endsAt: Date.now() + l.remainingMs }));

  const pauseClock = () =>
    setLot((l) => ({ ...l, status: "paused", remainingMs: Math.max(0, l.endsAt - Date.now()), endsAt: null }));

  const placeBid = (captainIndex, amount) => {
    if (!lot || lot.status === "ended") return;
    const team = teams[captainIndex];
    if (!team || amount > maxBid(team) || (leading && amount <= leading.amount)) return;
    if (leading && leading.captain === captainIndex) return;
    setLot((l) => {
      let { endsAt, remainingMs: rem, extensions, status } = l;
      // Late bid: add time (up to the allowed number of extensions).
      if (status === "running") {
        const left = endsAt - Date.now();
        if (left <= t.lateBidSeconds * 1000 && extensions < t.maxExtensions) {
          endsAt += t.extensionSeconds * 1000;
          extensions += 1;
        }
      } else if (status === "ready") {
        status = "running";
        endsAt = Date.now() + rem;
      }
      return { ...l, status, endsAt, remainingMs: rem, extensions, bids: [...l.bids, { captain: captainIndex, amount }] };
    });
    setCalled("");
  };

  const undoBid = () =>
    setLot((l) => (l && l.bids.length ? { ...l, bids: l.bids.slice(0, -1) } : l));

  const passPlayer = () => {
    if (!lot) return;
    setPool((p) => [...p, lot.player]);
    setLot(null);
  };

  const undoLast = () => {
    const prev = history[history.length - 1];
    if (!prev) return;
    setTeams(prev.teams);
    setPool(prev.pool);
    setUnsold(prev.unsold);
    setLot(prev.lot ? { ...prev.lot, status: "paused", endsAt: null } : null);
    setHistory((h) => h.slice(0, -1));
    setBanner(null);
  };

  const assignAtBase = (player, captainIndex) => {
    const team = teams[captainIndex];
    if (!team || maxBid(team) < t.minBid) return;
    setHistory((h) => [...h, snapshot()]);
    setUnsold((u) => u.filter((x) => x !== player));
    setPool((p) => p.filter((x) => x !== player));
    setTeams((prev) =>
      prev.map((tm, i) => (i === captainIndex ? { ...tm, squad: [...tm.squad, { player, price: t.minBid }] } : tm))
    );
  };

  const resetAll = () => {
    if (!window.confirm("Reset the whole auction? All sales will be cleared.")) return;
    setStarted(false);
    setTeams([]);
    setPool([]);
    setUnsold([]);
    setLot(null);
    setHistory([]);
    setBanner(null);
  };

  const copyResults = async () => {
    const text =
      `${t.name} — Auction results\n\n` +
      teams
        .map(
          (tm, i) =>
            `Team ${i + 1} — Captain ${tm.name} (purse left ${pointsLeft(tm)})\n` +
            tm.squad.map((s) => `  • ${s.player} — ${s.price}`).join("\n")
        )
        .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setBanner({ kind: "sold", text: "Results copied — paste them into WhatsApp" });
    } catch {
      /* clipboard unavailable */
    }
  };

  const resume = () => {
    if (!saved) return;
    setCaptainsText(saved.captainsText ?? "");
    setPlayersText(saved.playersText ?? "");
    setBudget(saved.budget ?? t.captainPoints);
    setSquadSize(saved.squadSize ?? t.playersToBuy);
    setTeams(saved.teams ?? []);
    setPool(saved.pool ?? []);
    setUnsold(saved.unsold ?? []);
    setLot(saved.lot ? { ...saved.lot, status: saved.lot.status === "running" ? "paused" : saved.lot.status, endsAt: null, remainingMs: saved.lot.status === "running" ? Math.max(0, (saved.lot.endsAt ?? 0) - Date.now()) : saved.lot.remainingMs } : null);
    setHistory(saved.history ?? []);
    setRoles(saved.roles ?? {});
    setStarted(Boolean(saved.started));
    setCanResume(false);
  };

  const fullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.();
  };


  /* ------------------------------------------------------------------ */
  /* Shared backdrop                                                      */
  /* ------------------------------------------------------------------ */
  const Backdrop = (
    <>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 0%, rgba(246,237,211,0.14), transparent 70%), repeating-linear-gradient(90deg, #0b2416 0 90px, #0d2a1a 90px 180px)",
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" aria-hidden="true" />
    </>
  );

  const pill =
    "rounded-full border border-[#f6edd3]/25 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-[#f6edd3]/80 transition hover:border-[#e8b234] hover:text-[#e8b234] disabled:opacity-40";

  /* ------------------------------------------------------------------ */
  /* Setup                                                                */
  /* ------------------------------------------------------------------ */
  if (!started) {
    const ready = captainNames.length >= 2 && playerNames.length > 0;
    const needed = captainNames.length * squadSize;
    return (
      <section className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-[#06110b]">
        {Backdrop}
        <Container className="relative py-10 sm:py-14">
          <div className="flex flex-wrap items-center gap-5">
            <CricketBall size={56} />
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#e8b234]">
                Organisers · {t.name}
              </p>
              <h1 className="mt-2 font-display text-4xl font-bold uppercase tracking-wide text-[#f6edd3] sm:text-6xl">
                The Player Auction
              </h1>
            </div>
          </div>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#f6edd3]/70">
            Captains come straight from the captain draw, and the player pool loads from
            the sign-up sheet with the captains left out. Check the points and squad size,
            then put the board on the big screen.
          </p>
          {canResume && (
            <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-[#e8b234]/40 bg-[#e8b234]/10 px-4 py-3 text-sm text-[#f6edd3]">
              <span>
                An unfinished auction is saved on this device ({saved.teams.length} teams,{" "}
                {(() => {
                  const sold = saved.teams.reduce((n, tm) => n + tm.squad.length, 0);
                  return `${sold} ${sold === 1 ? "player" : "players"} sold`;
                })()}).
              </span>
              <button type="button" onClick={resume} className="rounded-full bg-[#e8b234] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#14100a]">
                Resume it
              </button>
              <button type="button" onClick={() => setCanResume(false)} className="text-xs uppercase tracking-widest text-[#f6edd3]/60 hover:text-[#e8b234]">
                Start fresh
              </button>
            </div>
          )}

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {[
              {
                title: "Captains",
                count: captainNames.length,
                value: captainsText,
                set: setCaptainsText,
                hint: "Load the captains from the captain draw, or type one per line.",
                fromDraw: true,
                placeholder: "Vamsi\nBala\nAjith…",
              },
              {
                title: "Player pool",
                count: playerNames.length,
                value: playersText,
                set: setPlayersText,
                hint: "Everyone except the captains (captains are removed automatically).",
                organiser: true,
                placeholder: "Ravi K.\nSai P.\nArjun M.…",
              },
            ].map((box) => (
              <div
                key={box.title}
                className="rounded-2xl bg-[#f6edd3] p-6 text-[#1b1a14] shadow-[0_20px_60px_rgba(0,0,0,0.45)] sm:p-8"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#1b1a14]/80 pb-3">
                  <p className="font-display text-2xl font-bold uppercase tracking-[0.15em]">
                    {box.title}
                    <span className="ml-2 font-mono text-sm font-normal text-[#1b1a14]/60">{box.count}</span>
                  </p>
                  {box.action && (
                    <span className="[&>button]:border-[#1b1a14]/30 [&>button]:text-[#1b1a14]">{box.action}</span>
                  )}
                </div>
                <textarea
                  rows={10}
                  value={box.value}
                  onChange={(e) => box.set(e.target.value)}
                  placeholder={box.placeholder}
                  aria-label={box.title}
                  className="mt-4 block w-full resize-y rounded-lg border border-[#1b1a14]/15 bg-[#fbf6e6] px-4 py-3 font-mono text-base uppercase leading-8 tracking-wide placeholder:normal-case placeholder:text-[#1b1a14]/35 focus:border-[#c8102e] focus:outline-none focus:ring-2 focus:ring-[#c8102e]/20"
                />
                <p className="mt-3 text-xs leading-5 text-[#1b1a14]/60">{box.hint}</p>
                {box.fromDraw && (
                  <OrganiserLoad
                    label="Load captains from the draw"
                    onLoaded={(roster, data) => {
                      const drawn = data?.drawn;
                      if (!drawn?.captains?.length) {
                        return "No captain draw saved yet — finish the captain draw first.";
                      }
                      setCaptainsText(drawn.captains.join("\n"));
                      const caps = new Set(drawn.captains.map((c) => c.toLowerCase()));
                      setPlayersText((text) =>
                        parseNames(text).filter((n) => !caps.has(n.toLowerCase())).join("\n")
                      );
                      const when = new Date(drawn.at);
                      const stamp = isNaN(when)
                        ? ""
                        : ` (drawn ${when.toLocaleDateString(undefined, { month: "short", day: "numeric" })}, ${when.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })})`;
                      return `Loaded ${drawn.captains.length} captains from the draw${stamp}.`;
                    }}
                  />
                )}
                {box.organiser && (
                  <OrganiserLoad
                    label="Load players from sign-ups"
                    onLoaded={(roster) => {
                      setRoles(Object.fromEntries(roster.map((r) => [r.name.toLowerCase(), r.role || ""])));
                      const caps = new Set(captainNames.map((c) => c.toLowerCase()));
                      const names = roster.map((r) => r.name).filter((n) => !caps.has(n.toLowerCase()));
                      setPlayersText(names.join("\n"));
                      const removed = roster.length - names.length;
                      return `Loaded ${names.length} players${removed ? ` (${removed} captain${removed === 1 ? "" : "s"} left out)` : ""}.`;
                    }}
                  />
                )}
                {box.title === "Player pool" && lookalikes.length > 0 && (
                  <div className="mt-3 rounded-lg border border-[#c8102e]/30 bg-[#c8102e]/[0.06] p-3 text-xs leading-5 text-[#1b1a14]">
                    <p>
                      These are captains (or look like them): <strong>{lookalikes.join(", ")}</strong>.
                      Captains shouldn't be auctioned.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const drop = new Set(lookalikes.map((x) => x.toLowerCase()));
                        setPlayersText(
                          parseNames(playersText).filter((x) => !drop.has(x.toLowerCase())).join("\n")
                        );
                      }}
                      className="mt-2 rounded-full bg-[#c8102e] px-3 py-1 font-semibold uppercase tracking-widest text-white"
                    >
                      Remove them from the pool
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr_1.2fr]">
            {[
              { label: "Points per captain", value: budget, set: setBudget, min: 1 },
              { label: "Players to buy", value: squadSize, set: setSquadSize, min: 1 },
            ].map((f) => (
              <div
                key={f.label}
                className="rounded-[20px] border-[5px] border-[#2b2b2b] p-5 text-center"
                style={{ background: "linear-gradient(180deg, #1c1c1c, #0e0e0e)" }}
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#f6edd3]/60">{f.label}</p>
                <div className="mt-3 flex items-center justify-center gap-3">
                  <button type="button" className="h-10 w-10 rounded-full border border-[#f6edd3]/25 text-xl text-[#f6edd3] hover:border-[#e8b234]" onClick={() => f.set(Math.max(f.min, Number(f.value) - 1))} aria-label={`Decrease ${f.label}`}>−</button>
                  <span className="min-w-[3ch] font-display text-5xl font-bold text-[#f6edd3]">{f.value}</span>
                  <button type="button" className="h-10 w-10 rounded-full border border-[#f6edd3]/25 text-xl text-[#f6edd3] hover:border-[#e8b234]" onClick={() => f.set(Number(f.value) + 1)} aria-label={`Increase ${f.label}`}>+</button>
                </div>
              </div>
            ))}
            <div className="flex flex-col justify-center gap-3">
              <button
                type="button"
                disabled={!ready}
                onClick={startAuction}
                className="w-full rounded-full bg-[#e8b234] px-8 py-4 font-display text-lg font-bold uppercase tracking-widest text-[#14100a] shadow-[0_8px_30px_rgba(232,178,52,0.35)] transition hover:bg-[#f3c654] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Open the auction →
              </button>
              {captainNames.length > 0 && playerNames.length > 0 && (
                <p className={`text-center text-xs ${playerNames.length < needed ? "text-[#e8b234]" : "text-[#f6edd3]/55"}`}>
                  {captainNames.length} captains × {squadSize} players = {needed} needed · {playerNames.length} in the pool
                  {playerNames.length < needed && " — some squads will be short"}
                </p>
              )}
              <div className="flex justify-center gap-4 text-xs uppercase tracking-widest">
                <Link to="/captain-draw" className="text-[#f6edd3]/50 hover:text-[#e8b234]">← Captain draw</Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Auction board                                                        */
  /* ------------------------------------------------------------------ */
  const low = lot?.status === "running" && remainingMs <= t.lateBidSeconds * 1000;
  const clockPct = lot ? Math.min(100, (remainingMs / (t.auctionSeconds * 1000)) * 100) : 0;

  return (
    <section className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-[#06110b]">
      {Backdrop}
      {burst > 0 && <Confetti key={burst} count={50} />}

      <Container className="relative py-6 sm:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#e8b234]">{t.name}</p>
            <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-[#f6edd3] sm:text-4xl">
              The Player Auction
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-widest ${
                backup.kind === "ok"
                  ? "border-[#7ee2a8]/40 text-[#7ee2a8]"
                  : backup.kind === "no-key" || backup.kind === "error"
                    ? "border-[#ff8a96]/40 text-[#ff8a96]"
                    : "border-[#f6edd3]/20 text-[#f6edd3]/60"
              }`}
              role="status"
              title="Sales are backed up to the Google Sheet (Auction Results tab)"
            >
              {backup.kind === "ok"
                ? `Backed up ✓ ${backup.at.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`
                : backup.kind === "saving"
                  ? "Backing up…"
                  : backup.kind === "no-key"
                    ? "Backup off — no key"
                    : backup.kind === "error"
                      ? "Backup not confirmed"
                      : "Backup on"}
            </span>
            {backup.kind === "error" && (
              <button type="button" onClick={() => runBackup(readKey(), teams, finished)} className={pill}>
                Retry backup
              </button>
            )}
            {backup.kind === "no-key" && (
              <span className="inline-flex items-center gap-1">
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Organiser key"
                  aria-label="Organiser key for backup"
                  className="w-36 rounded-full border border-[#f6edd3]/25 bg-black/40 px-3 py-1.5 text-xs text-[#f6edd3] focus:border-[#e8b234] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!keyInput.trim()) return;
                    storeKey(keyInput.trim());
                    runBackup(keyInput.trim(), teams, finished);
                  }}
                  className={pill}
                >
                  Turn on
                </button>
              </span>
            )}
            <button type="button" onClick={fullscreen} className={pill}>Full screen</button>
            <button type="button" onClick={undoLast} disabled={!history.length || lot?.status === "running"} className={pill}>Undo last sale</button>
            <button type="button" onClick={copyResults} className={pill}>Copy results</button>
            <button type="button" onClick={() => setStarted(false)} disabled={lot?.status === "running"} className={pill}>Setup</button>
            <button type="button" onClick={resetAll} disabled={lot?.status === "running"} className={pill}>Reset</button>
          </div>
        </div>

        {/* Lot sign */}
        <div
          className={`relative mt-6 rounded-[28px] border-[6px] p-5 sm:p-8 ${
            low ? "border-[#c8102e] shadow-[0_0_70px_rgba(200,16,46,0.35)]" : lot?.status === "ended" ? "border-[#e8b234]" : "border-[#2b2b2b]"
          }`}
          style={{ background: "linear-gradient(180deg, #1c1c1c, #0e0e0e)" }}
        >
          {!lot ? (
            <div className="flex flex-col items-center py-6 text-center" aria-live="polite">
              {banner && (
                <p className={`mb-5 rounded-full px-5 py-2 font-display text-xl font-bold uppercase tracking-wider sm:text-2xl ${banner.kind === "sold" ? "bg-[#e8b234] text-[#14100a]" : "bg-white/10 text-[#f6edd3]/80"}`}>
                  {banner.kind === "sold" && banner.text.includes("→") ? "SOLD · " : ""}{banner.text}
                </p>
              )}
              {finished ? (
                <>
                  <p className="font-display text-4xl font-bold uppercase tracking-wide text-[#f6edd3] sm:text-6xl">Auction complete</p>
                  <button type="button" onClick={copyResults} className="mt-6 rounded-full bg-[#e8b234] px-8 py-3 font-display text-lg font-bold uppercase tracking-widest text-[#14100a]">
                    Copy final squads
                  </button>
                </>
              ) : (
                <>
                  <CricketBall size={70} />
                  <p className="mt-4 font-mono text-xs uppercase tracking-[0.35em] text-[#f6edd3]/60">
                    {pool.length} in the pool
                    {pool.length - freshPool.length > 0 ? ` · ${pool.length - freshPool.length} back after going unsold` : ""}
                  </p>
                  <button
                    type="button"
                    onClick={nextPlayer}
                    disabled={!pool.length}
                    className="mt-5 rounded-full bg-[#e8b234] px-10 py-4 font-display text-lg font-bold uppercase tracking-widest text-[#14100a] shadow-[0_8px_30px_rgba(232,178,52,0.35)] transition hover:bg-[#f3c654] disabled:opacity-40"
                  >
                    {freshPool.length ? "Bring out the next player" : "Bring back an unsold player"}
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="grid items-center gap-6 lg:grid-cols-[1.4fr_1fr]">
              <div className="text-center lg:text-left">
                <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#f6edd3]/60">Up for auction</p>
                <div className="mt-4 flex justify-center lg:justify-start">
                  <SplitFlap text={lot.player} />
                </div>
                {roles[lot.player.toLowerCase()] && (
                  <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#e8b234]/50 bg-[#e8b234]/10 px-4 py-1.5 font-display text-lg font-bold uppercase tracking-[0.2em] text-[#e8b234]">
                    {roles[lot.player.toLowerCase()]}
                  </p>
                )}
              </div>

              <div className="rounded-2xl bg-black/40 p-5 text-center">
                <div className="flex items-end justify-center gap-6">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#f6edd3]/50">Current bid</p>
                    <p className="font-display text-6xl font-bold leading-none text-[#e8b234] sm:text-7xl">
                      {leading ? leading.amount : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#f6edd3]/50">Clock</p>
                    <p className={`font-mono text-5xl font-semibold leading-none sm:text-6xl ${low ? "animate-pulse text-[#ff5a6e]" : "text-[#f6edd3]"}`}>
                      {fmtClock(remainingMs)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className={`h-full rounded-full transition-[width] duration-200 ${low ? "bg-[#c8102e]" : "bg-[#e8b234]"}`} style={{ width: `${clockPct}%` }} />
                </div>
                <p className="mt-3 text-sm text-[#f6edd3]/75">
                  {leading ? (
                    <>Leading: <span className="font-semibold text-[#f6edd3]">{teams[leading.captain]?.name}</span></>
                  ) : lot.status === "ready" ? "First bid starts the clock" : "No bids yet"}
                </p>
                <div className="mt-2 flex items-center justify-center gap-1.5" title="Extensions used">
                  {Array.from({ length: t.maxExtensions }, (_, i) => (
                    <span key={i} className={`h-2 w-6 rounded-full ${i < lot.extensions ? "bg-[#c8102e]" : "bg-white/15"}`} />
                  ))}
                  <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-[#f6edd3]/45">+{t.extensionSeconds}s extensions</span>
                </div>

                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {lot.status === "ended" ? (
                    <button type="button" onClick={finishLot} className="rounded-full bg-[#e8b234] px-6 py-2.5 font-display text-base font-bold uppercase tracking-widest text-[#14100a]">
                      {leading ? `Sold to ${teams[leading.captain]?.name}` : "Unsold — back to pool"}
                    </button>
                  ) : (
                    <>
                      {lot.status === "running" ? (
                        <button type="button" onClick={pauseClock} className={pill}>Pause</button>
                      ) : (
                        <button type="button" onClick={startClock} className={pill}>Start clock</button>
                      )}
                      <button type="button" onClick={finishLot} className={pill}>{leading ? "Sold now" : "Unsold — back to pool"}</button>
                      <button type="button" onClick={undoBid} disabled={!lot.bids.length} className={pill}>Undo bid</button>
                      <button type="button" onClick={passPlayer} disabled={lot.bids.length > 0} className={pill}>Back to pool</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Called bid */}
        {lot && lot.status !== "ended" && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-[#f6edd3]/10 bg-black/35 px-4 py-3">
            <label htmlFor="called-bid" className="font-mono text-[11px] uppercase tracking-widest text-[#f6edd3]/70">
              Amount called
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Lower the called amount"
                onClick={() => setCalled(String(Math.max(minNext, nextAmount - 1)))}
                className="h-11 w-11 rounded-full border border-[#f6edd3]/25 text-xl text-[#f6edd3] hover:border-[#e8b234]"
              >
                −
              </button>
              <input
                id="called-bid"
                type="number"
                inputMode="numeric"
                min={minNext}
                value={called}
                placeholder={String(minNext)}
                onChange={(e) => setCalled(e.target.value)}
                className={`h-14 w-28 rounded-xl border-2 bg-[#0e0e0e] text-center font-display text-4xl font-bold text-[#e8b234] placeholder:text-[#e8b234]/40 focus:outline-none ${tooLow ? "border-[#c8102e]" : "border-[#e8b234]/60 focus:border-[#e8b234]"}`}
              />
              <button
                type="button"
                aria-label="Raise the called amount"
                onClick={() => setCalled(String(nextAmount + 1))}
                className="h-11 w-11 rounded-full border border-[#f6edd3]/25 text-xl text-[#f6edd3] hover:border-[#e8b234]"
              >
                +
              </button>
            </div>
            <div className="flex gap-1">
              {[1, 2, 5, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCalled(String((leading ? leading.amount : 0) + n))}
                  className="h-9 rounded-full border border-[#f6edd3]/25 px-3 text-sm font-bold text-[#f6edd3] hover:border-[#e8b234] hover:text-[#e8b234]"
                  title={leading ? `Current bid + ${n}` : `Opening bid of ${n}`}
                >
                  {leading ? `+${n}` : n}
                </button>
              ))}
            </div>
            <span className="text-sm text-[#f6edd3]/70">
              {tooLow ? (
                <span className="text-[#ff5a6e]">Must be at least {minNext}</span>
              ) : (
                <>then tap the captain who called <span className="font-semibold text-[#e8b234]">{nextAmount}</span></>
              )}
            </span>
          </div>
        )}

        {/* Captains */}
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {teams.map((tm, i) => {
            const max = maxBid(tm);
            const isLeading = leading?.captain === i;
            const canBid = lot && lot.status !== "ended" && !isLeading && !tooLow && slotsLeft(tm) > 0 && nextAmount <= max;
            const purse = pointsLeft(tm);
            const afterWin = isLeading ? purse - leading.amount : null;
            return (
              <div
                key={tm.name}
                className={`flex flex-col rounded-2xl border p-3 transition sm:p-4 ${
                  isLeading ? "border-[#e8b234] bg-[#e8b234]/[0.12] shadow-[0_0_30px_rgba(232,178,52,0.25)]" : "border-[#f6edd3]/12 bg-black/35"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#f6edd3]/45">Team {i + 1}</p>
                    <p className="truncate font-display text-xl font-bold uppercase tracking-wide text-[#f6edd3]">{tm.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-[#f6edd3]/55">Purse left</p>
                    <p className="font-display text-5xl font-bold leading-none text-[#e8b234]">{purse}</p>
                  </div>
                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
                  <div className="h-full rounded-full bg-[#e8b234]" style={{ width: `${Math.max(0, (purse / budget) * 100)}%` }} />
                </div>
                <p className="mt-1.5 flex justify-between font-mono text-[10px] uppercase tracking-widest text-[#f6edd3]/55">
                  <span>{slotsLeft(tm) <= 0 ? "Squad full" : `${slotsLeft(tm)} to buy`}</span>
                  <span>{slotsLeft(tm) > 0 ? `Max bid ${max}` : `Spent ${budget - purse}`}</span>
                </p>
                {afterWin !== null && (
                  <p className="mt-2 rounded-md bg-[#e8b234]/15 px-2 py-1 text-center text-xs font-semibold text-[#e8b234]">
                    Bidding {leading.amount} → purse {afterWin} if sold
                  </p>
                )}

                <ul className="mt-3 flex flex-wrap gap-1">
                  {Array.from({ length: squadSize }, (_, s) => {
                    const p = tm.squad[s];
                    return (
                      <li
                        key={s}
                        className={`max-w-full truncate rounded px-1.5 py-0.5 text-[11px] ${p ? "bg-[#f6edd3] font-semibold text-[#0c2a19]" : "border border-dashed border-[#f6edd3]/15 text-[#f6edd3]/25"}`}
                        title={p ? `${p.player} — ${p.price}` : "Empty slot"}
                      >
                        {p ? `${p.player} · ${p.price}` : "·"}
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-auto pt-3">
                  {lot && lot.status !== "ended" ? (
                    <button
                      type="button"
                      disabled={!canBid}
                      onClick={() => placeBid(i, nextAmount)}
                      className="w-full rounded-lg bg-[#e8b234] py-2 font-display text-base font-bold uppercase tracking-widest text-[#14100a] transition hover:bg-[#f3c654] disabled:bg-white/10 disabled:text-[#f6edd3]/35"
                    >
                      {isLeading ? `Leading · ${leading.amount}` : slotsLeft(tm) <= 0 ? "Squad full" : nextAmount > max ? `Can't — max ${max}` : `${tm.name.split(" ")[0]} calls ${nextAmount}`}
                    </button>
                  ) : (
                    <p className="text-center font-mono text-[10px] uppercase tracking-widest text-[#f6edd3]/45">
                      {slotsLeft(tm) <= 0 ? "Squad complete" : "Waiting for next player"}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pool */}
        {!lot && pool.length > 0 && (
          <div className="mt-6 rounded-2xl border border-[#f6edd3]/10 bg-black/30 p-4">
            <p className="font-display text-lg font-bold uppercase tracking-[0.2em] text-[#f6edd3]">
              In the pool <span className="font-mono text-sm font-normal text-[#f6edd3]/60">{pool.length}</span>
            </p>
            <p className="mt-1 text-xs text-[#f6edd3]/50">
              Tap a name to auction that player next instead of a random pick. Unsold players
              come back here; you can also give one to a team with space at the base price ({t.minBid}).
            </p>
            <ul className="mt-3 flex max-h-60 flex-wrap gap-2 overflow-y-auto">
              {pool.map((p) => {
                const wasUnsold = unsold.includes(p);
                return (
                  <li key={p} className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => pickPlayer(p)}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm hover:border-[#e8b234] ${
                        wasUnsold ? "border-[#e8b234]/40 bg-[#e8b234]/10 text-[#f6edd3]" : "border-[#f6edd3]/15 text-[#f6edd3]/85"
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${wasUnsold ? "bg-[#e8b234]" : "bg-[#c8102e]"}`} aria-hidden="true" />
                      {p}
                      {wasUnsold && (
                        <span className="font-mono text-[9px] uppercase tracking-widest text-[#e8b234]">unsold</span>
                      )}
                    </button>
                    {wasUnsold && (
                      <select
                        aria-label={`Give ${p} to a team at the base price`}
                        value=""
                        onChange={(e) => e.target.value !== "" && assignAtBase(p, Number(e.target.value))}
                        className="rounded-full border border-[#f6edd3]/20 bg-black/40 px-2 py-1 text-xs text-[#f6edd3]"
                      >
                        <option value="">Give at {t.minBid} to…</option>
                        {teams.map((tm, i) =>
                          slotsLeft(tm) > 0 && maxBid(tm) >= t.minBid ? (
                            <option key={tm.name} value={i}>{tm.name}</option>
                          ) : null
                        )}
                      </select>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </Container>
    </section>
  );
}
