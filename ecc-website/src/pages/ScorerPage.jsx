import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { allowedWickets, computeMatch, oversText, playerName, summarise, teamName, WICKETS } from "../lib/scoring";
import {
  checkScorerKey,
  fetchMatch,
  fetchMatches,
  newMatchId,
  postDeleteMatch,
  postMatch,
  readLocalMatches,
  readScorerKey,
  removeLocalMatch,
  storeLocalMatch,
  storeScorerKey,
} from "../lib/liveApi";
import { useSignupCounts } from "../lib/useSignupCounts";
import { internalTournament as t } from "../data/internalTournament";
import { AtTheCrease, InningsCard, ScoreHeader, ThisOver } from "../components/scoring/ScoreBits";

/*
 * /score — the scorer's app. Works on a phone at the ground, can be added to
 * the home screen, keeps every ball on the phone and sends it to the Sheet so
 * the public /live pages update.
 */

const card = "rounded-2xl bg-white/70 p-4 shadow-[0_1px_0_rgba(27,26,20,0.08),0_8px_24px_rgba(27,26,20,0.06)]";
const btn =
  "inline-flex items-center justify-center rounded-xl px-4 py-3 font-semibold transition active:scale-[0.98] disabled:opacity-35 disabled:active:scale-100";
const btnDark = `${btn} bg-[#0f2e1c] text-[#f6edd3] hover:bg-[#123d25]`;
const btnLight = `${btn} border border-[#1b1a14]/15 bg-white text-[#1b1a14] hover:border-[#1b1a14]/35`;
const label = "font-mono text-[11px] font-semibold uppercase tracking-widest text-[#1b1a14]/55";
const input =
  "w-full rounded-xl border border-[#1b1a14]/15 bg-white px-3 py-3 text-[16px] text-[#1b1a14] outline-none focus:border-[#0f2e1c]";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ */
/* Install (add to home screen)                                         */
/* ------------------------------------------------------------------ */

function useInstallable() {
  const [prompt, setPrompt] = useState(null);
  useEffect(() => {
    // Manifest + offline support only for the scorer app.
    let link = document.querySelector('link[rel="manifest"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "manifest";
      link.href = "/scorer.webmanifest";
      document.head.appendChild(link);
    }
    for (const [name, content] of [
      ["apple-mobile-web-app-capable", "yes"],
      ["mobile-web-app-capable", "yes"],
      ["apple-mobile-web-app-title", "ECC Scorer"],
    ]) {
      if (!document.querySelector(`meta[name="${name}"]`)) {
        const meta = document.createElement("meta");
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
      }
    }
    const prevTitle = document.title;
    document.title = "ECC Scorer";
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
    const onPrompt = (e) => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      document.title = prevTitle;
    };
  }, []);
  return prompt;
}

/* ------------------------------------------------------------------ */
/* Sync                                                                 */
/* ------------------------------------------------------------------ */

/** Sends the match to the Sheet after every change and confirms it arrived. */
function useSync(match, key) {
  const [sync, setSync] = useState({ state: "idle", rev: 0 });
  const matchRef = useRef(match);
  useEffect(() => {
    matchRef.current = match;
  });
  const rev = match?.rev ?? 0;
  const id = match?.id ?? "";

  useEffect(() => {
    if (!id || !key) return undefined;
    let cancelled = false;
    let timer;
    const attempt = async (n) => {
      if (cancelled) return;
      const m = matchRef.current;
      if (!navigator.onLine) {
        setSync({ state: "offline", rev });
        timer = setTimeout(() => attempt(n + 1), 5000);
        return;
      }
      setSync((s) => ({ ...s, state: "saving" }));
      try {
        await postMatch(key, m, summarise(m));
        await wait(1200 + n * 400);
        const server = await fetchMatch(id);
        if (cancelled) return;
        if (server && server.rev > rev) {
          setSync({ state: "newer", rev, server });
          return;
        }
        if (server && server.rev === rev) {
          setSync({ state: "ok", rev, at: new Date() });
          return;
        }
        throw new Error("not-confirmed");
      } catch {
        if (cancelled) return;
        setSync({ state: "retry", rev, tries: n + 1 });
        timer = setTimeout(() => attempt(n + 1), Math.min(30000, 4000 * (n + 1)));
      }
    };
    timer = setTimeout(() => attempt(0), 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [id, rev, key]);

  return key ? sync : { state: "no-key" };
}

function SyncPill({ sync, onUseServer }) {
  const map = {
    idle: ["bg-[#1b1a14]/10 text-[#1b1a14]/70", "Ready"],
    saving: ["bg-[#e8b234]/30 text-[#1b1a14]", "Sending…"],
    ok: ["bg-[#0f2e1c] text-[#f6edd3]", "Live ✓"],
    offline: ["bg-[#c8102e] text-white", "No signal — saved on phone"],
    retry: ["bg-[#c8102e] text-white", "Not sent yet — retrying"],
    "no-key": ["bg-[#c8102e] text-white", "Not live — add scorer key"],
    newer: ["bg-[#c8102e] text-white", "Newer score on another phone"],
  };
  const [cls, text] = map[sync.state] || map.idle;
  return (
    <span className="flex items-center gap-2">
      <span className={`rounded-full px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider ${cls}`}>
        {text}
        {sync.state === "retry" && sync.tries > 3 ? " (check key)" : ""}
      </span>
      {sync.state === "newer" && (
        <button type="button" className="text-xs font-semibold text-[#c8102e] underline" onClick={onUseServer}>
          Load it
        </button>
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

export default function ScorerPage() {
  const installPrompt = useInstallable();
  const [key, setKey] = useState(() => readScorerKey());
  const [view, setView] = useState("home"); // home | setup | score
  const [match, setMatch] = useState(null);

  const open = (m) => {
    storeLocalMatch(m);
    setMatch(m);
    setView("score");
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-[#f3ead0] text-[#1b1a14]">
      <div className="mx-auto w-full max-w-xl px-4 pb-16 pt-4">
        {view === "home" && (
          <Home
            scorerKey={key}
            onKey={(k) => {
              storeScorerKey(k);
              setKey(k);
            }}
            onNew={() => setView("setup")}
            onOpen={open}
            installPrompt={installPrompt}
          />
        )}
        {view === "setup" && <Setup onCancel={() => setView("home")} onCreate={open} />}
        {view === "score" && match && (
          <Scoring
            match={match}
            scorerKey={key}
            onChange={(m) => {
              storeLocalMatch(m);
              setMatch(m);
            }}
            onExit={() => {
              setView("home");
              setMatch(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Home: key, matches on this phone, matches on the website             */
/* ------------------------------------------------------------------ */

function AppBar({ title, left, right }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        {left}
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#1b1a14]/50">ECC Scorer</p>
          <p className="truncate font-display text-2xl font-bold uppercase leading-tight tracking-wide">{title}</p>
        </div>
      </div>
      {right}
    </div>
  );
}

function KeyBox({ scorerKey, onKey }) {
  const [value, setValue] = useState("");
  const [state, setState] = useState(scorerKey ? "saved" : "idle"); // idle | checking | saved | bad | error
  const [editing, setEditing] = useState(!scorerKey);

  const check = async () => {
    const k = value.trim();
    if (!k) return;
    setState("checking");
    try {
      const ok = await checkScorerKey(k);
      if (ok) {
        onKey(k);
        setState("saved");
        setEditing(false);
        setValue("");
      } else setState("bad");
    } catch {
      setState("error");
    }
  };

  if (!editing) {
    return (
      <div className={`${card} flex items-center justify-between gap-3`}>
        <p className="text-sm">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#16a34a]" />
          Scorer key saved — scores go live on the website.
        </p>
        <button type="button" className="text-xs font-semibold underline" onClick={() => setEditing(true)}>
          Change
        </button>
      </div>
    );
  }
  return (
    <div className={card}>
      <p className={label}>Scorer key</p>
      <p className="mt-1 text-sm text-[#1b1a14]/70">Needed once per phone so your scores show on the website.</p>
      <div className="mt-3 flex gap-2">
        <input
          className={input}
          type="password"
          autoComplete="off"
          placeholder="Scorer key"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && check()}
        />
        <button type="button" className={btnDark} onClick={check} disabled={state === "checking" || !value.trim()}>
          {state === "checking" ? "Checking…" : "Save"}
        </button>
      </div>
      {state === "bad" && <p className="mt-2 text-sm font-semibold text-[#c8102e]">That key isn't right.</p>}
      {state === "error" && (
        <p className="mt-2 text-sm font-semibold text-[#c8102e]">Couldn't check the key — no signal? Try again.</p>
      )}
      {scorerKey && (
        <button type="button" className="mt-2 text-xs underline" onClick={() => setEditing(false)}>
          Keep the current key
        </button>
      )}
    </div>
  );
}

function MatchRow({ s, right, onClick }) {
  const chip =
    s.status === "done"
      ? "bg-[#1b1a14]/10 text-[#1b1a14]/70"
      : s.status === "live"
        ? "bg-[#c8102e] text-white"
        : "bg-[#e8b234]/40 text-[#1b1a14]";
  const word = { done: "Result", live: "Live", break: "Innings break", setup: "Not started" }[s.status] || "";
  return (
    <div className="flex items-center gap-3 border-t border-[#1b1a14]/10 py-3 first:border-0">
      <button type="button" className="min-w-0 flex-1 text-left" onClick={onClick}>
        <p className="flex items-center gap-2">
          <span className="truncate font-semibold">{s.title}</span>
          <span className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${chip}`}>
            {word}
          </span>
        </p>
        <p className="mt-0.5 truncate font-mono text-xs text-[#1b1a14]/60">
          {s.lines.map((l) => `${l.team} ${l.score} (${l.overs})`).join(" · ") || s.ground || "—"}
        </p>
        {s.note && <p className="mt-0.5 truncate text-xs text-[#1b1a14]/60">{s.note}</p>}
      </button>
      {right}
    </div>
  );
}

function Home({ scorerKey, onKey, onNew, onOpen, installPrompt }) {
  const [local, setLocal] = useState(() =>
    Object.values(readLocalMatches()).sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
  );
  const [remote, setRemote] = useState(null);
  const [remoteState, setRemoteState] = useState("loading");
  const [confirmDelete, setConfirmDelete] = useState("");
  const [busy, setBusy] = useState("");

  const loadRemote = async () => {
    setRemoteState("loading");
    try {
      setRemote(await fetchMatches());
      setRemoteState("ok");
    } catch {
      setRemoteState("error");
    }
  };
  useEffect(() => {
    let cancelled = false;
    fetchMatches()
      .then((list) => {
        if (cancelled) return;
        setRemote(list);
        setRemoteState("ok");
      })
      .catch(() => !cancelled && setRemoteState("error"));
    return () => {
      cancelled = true;
    };
  }, []);

  const localIds = new Set(local.map((m) => m.id));
  const takeOver = async (id) => {
    setBusy(id);
    try {
      const m = await fetchMatch(id);
      if (m) onOpen({ ...m, updatedAt: new Date().toISOString() });
    } catch {
      setRemoteState("error");
    } finally {
      setBusy("");
    }
  };
  const deleteRemote = async (id) => {
    setBusy(id);
    try {
      await postDeleteMatch(scorerKey, id);
      await wait(1200);
      removeLocalMatch(id);
      setLocal((l) => l.filter((m) => m.id !== id));
      await loadRemote();
    } finally {
      setBusy("");
      setConfirmDelete("");
    }
  };

  return (
    <>
      <AppBar
        title="Matches"
        left={<img src="/ecc-logo.png" alt="" className="h-11 w-11 rounded-xl" />}
        right={
          <Link to="/live" className="text-sm font-semibold underline">
            Live scores
          </Link>
        }
      />

      <div className="space-y-4">
        <KeyBox scorerKey={scorerKey} onKey={onKey} />

        <button type="button" className={`${btnDark} w-full py-4 text-lg`} onClick={onNew}>
          + New match
        </button>

        {local.length > 0 && (
          <div className={card}>
            <p className={label}>On this phone</p>
            <div className="mt-1">
              {local.map((m) => (
                <MatchRow
                  key={m.id}
                  s={summarise(m)}
                  onClick={() => onOpen(m)}
                  right={
                    <button type="button" className={`${btnLight} px-3 py-2 text-sm`} onClick={() => onOpen(m)}>
                      Score
                    </button>
                  }
                />
              ))}
            </div>
          </div>
        )}

        <div className={card}>
          <div className="flex items-center justify-between">
            <p className={label}>On the website</p>
            <button type="button" className="text-xs font-semibold underline" onClick={loadRemote}>
              Refresh
            </button>
          </div>
          {remoteState === "loading" && <p className="mt-3 text-sm text-[#1b1a14]/60">Loading…</p>}
          {remoteState === "error" && (
            <p className="mt-3 text-sm text-[#c8102e]">Couldn't reach the website. Check your signal.</p>
          )}
          {remoteState === "ok" && remote?.length === 0 && (
            <p className="mt-3 text-sm text-[#1b1a14]/60">No matches yet.</p>
          )}
          <div className="mt-1">
            {(remote || []).map((s) => (
              <MatchRow
                key={s.id}
                s={s}
                onClick={() => window.open(`/live/${s.id}`, "_blank")}
                right={
                  confirmDelete === s.id ? (
                    <span className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        className={`${btn} bg-[#c8102e] px-3 py-2 text-sm text-white`}
                        onClick={() => deleteRemote(s.id)}
                        disabled={busy === s.id || !scorerKey}
                      >
                        {busy === s.id ? "…" : "Delete"}
                      </button>
                      <button type="button" className={`${btnLight} px-3 py-2 text-sm`} onClick={() => setConfirmDelete("")}>
                        Keep
                      </button>
                    </span>
                  ) : (
                    <span className="flex shrink-0 gap-1">
                      {!localIds.has(s.id) && s.status !== "done" && (
                        <button
                          type="button"
                          className={`${btnLight} px-3 py-2 text-sm`}
                          onClick={() => takeOver(s.id)}
                          disabled={busy === s.id}
                        >
                          {busy === s.id ? "…" : "Take over"}
                        </button>
                      )}
                      <button
                        type="button"
                        aria-label="Delete match"
                        className={`${btnLight} px-3 py-2 text-sm`}
                        onClick={() => setConfirmDelete(s.id)}
                      >
                        ✕
                      </button>
                    </span>
                  )
                }
              />
            ))}
          </div>
          <p className="mt-3 text-xs text-[#1b1a14]/55">
            “Take over” continues a match on this phone if the first scorer’s phone dies. ✕ deletes a test match from
            the website.
          </p>
        </div>

        <div className={`${card} text-sm text-[#1b1a14]/75`}>
          <p className={label}>Put the scorer on your home screen</p>
          {installPrompt ? (
            <button type="button" className={`${btnDark} mt-3`} onClick={() => installPrompt.prompt()}>
              Install ECC Scorer
            </button>
          ) : (
            <p className="mt-2">
              iPhone: tap <strong>Share</strong> → <strong>Add to Home Screen</strong>. Android: tap the browser menu{" "}
              <strong>⋮</strong> → <strong>Add to Home screen</strong>.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Setup                                                                */
/* ------------------------------------------------------------------ */

const splitNames = (text) =>
  text
    .split(/\n|,/)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 15);

function TeamEditor({ index, team, onChange, squads }) {
  return (
    <div className={card}>
      <p className={label}>Team {index === 0 ? "A" : "B"}</p>
      {squads.length > 0 && (
        <select
          className={`${input} mt-2`}
          value=""
          onChange={(e) => {
            const sq = squads[Number(e.target.value)];
            if (!sq) return;
            onChange({
              name: `Team ${Number(e.target.value) + 1}`,
              players: [sq.captain, ...sq.players].join("\n"),
            });
          }}
        >
          <option value="">Load a squad from the auction…</option>
          {squads.map((sq, i) => (
            <option key={i} value={i}>
              Team {i + 1} — {sq.captain} (c)
            </option>
          ))}
        </select>
      )}
      <input
        className={`${input} mt-2`}
        placeholder="Team name"
        value={team.name}
        maxLength={40}
        onChange={(e) => onChange({ ...team, name: e.target.value })}
      />
      <textarea
        className={`${input} mt-2 min-h-[170px] font-mono text-sm`}
        placeholder={"Players, one per line\n(captain first)"}
        value={team.players}
        onChange={(e) => onChange({ ...team, players: e.target.value })}
      />
      <p className="mt-1 text-xs text-[#1b1a14]/55">{splitNames(team.players).length} players</p>
    </div>
  );
}

function Stepper({ value, onChange, min, max, title }) {
  return (
    <div className={card}>
      <p className={label}>{title}</p>
      <div className="mt-2 flex items-center justify-between">
        <button type="button" className={`${btnLight} h-12 w-12`} onClick={() => onChange(Math.max(min, value - 1))}>
          −
        </button>
        <span className="font-display text-3xl font-bold tabular-nums">{value}</span>
        <button type="button" className={`${btnLight} h-12 w-12`} onClick={() => onChange(Math.min(max, value + 1))}>
          +
        </button>
      </div>
    </div>
  );
}

function Setup({ onCancel, onCreate }) {
  const { counts } = useSignupCounts(`${t.shortName} ${t.year}`);
  const squads = (counts?.squads?.teams || []).filter((s) => s.captain);
  const [ground, setGround] = useState("");
  const [teams, setTeams] = useState([
    { name: "", players: "" },
    { name: "", players: "" },
  ]);
  const [overs, setOvers] = useState(t.scoringOvers);
  const [maxBowl, setMaxBowl] = useState(t.maxOversPerBowler);
  const [toss, setToss] = useState(0);
  const [choice, setChoice] = useState("bat");

  const lists = teams.map((tm) => splitNames(tm.players));
  const names = teams.map((tm, i) => tm.name.trim() || `Team ${i === 0 ? "A" : "B"}`);
  const ok = lists.every((l) => l.length >= 2);

  const create = () => {
    const now = new Date().toISOString();
    onCreate({
      id: newMatchId(),
      rev: 1,
      createdAt: now,
      updatedAt: now,
      ground: ground.trim(),
      overs,
      maxBowlerOvers: maxBowl,
      toss: { winner: toss, choice },
      battingFirst: choice === "bat" ? toss : 1 - toss,
      teams: names.map((name, i) => ({ name, players: lists[i] })),
      events: [],
    });
  };

  return (
    <>
      <AppBar
        title="New match"
        left={
          <button type="button" className={`${btnLight} h-11 w-11 px-0`} onClick={onCancel} aria-label="Back">
            ‹
          </button>
        }
      />
      <div className="space-y-4">
        <div className={card}>
          <p className={label}>Ground / match (optional)</p>
          <input
            className={`${input} mt-2`}
            placeholder="e.g. Ground 2 · Match 5"
            value={ground}
            maxLength={40}
            onChange={(e) => setGround(e.target.value)}
          />
        </div>
        {teams.map((tm, i) => (
          <TeamEditor
            key={i}
            index={i}
            team={tm}
            squads={squads}
            onChange={(next) => setTeams((all) => all.map((x, j) => (j === i ? next : x)))}
          />
        ))}
        <div className="grid grid-cols-2 gap-4">
          <Stepper title="Overs per side" value={overs} onChange={setOvers} min={1} max={50} />
          <Stepper title="Max overs / bowler" value={maxBowl} onChange={setMaxBowl} min={1} max={50} />
        </div>
        <div className={card}>
          <p className={label}>Toss</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {names.map((n, i) => (
              <button
                key={i}
                type="button"
                className={toss === i ? btnDark : btnLight}
                onClick={() => setToss(i)}
              >
                {n} won
              </button>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {["bat", "bowl"].map((c) => (
              <button key={c} type="button" className={choice === c ? btnDark : btnLight} onClick={() => setChoice(c)}>
                Chose to {c}
              </button>
            ))}
          </div>
        </div>
        <button type="button" className={`${btnDark} w-full py-4 text-lg`} disabled={!ok} onClick={create}>
          Start match →
        </button>
        {!ok && <p className="text-center text-sm text-[#1b1a14]/60">Add at least 2 players to each team.</p>}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Scoring                                                              */
/* ------------------------------------------------------------------ */

function PlayerPicker({ title, names, value, onChange, disabled = () => false, note = () => "" }) {
  return (
    <div>
      <p className={label}>{title}</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {names.map((n, i) => (
          <button
            key={i}
            type="button"
            disabled={disabled(i)}
            onClick={() => onChange(i)}
            className={`${value === i ? btnDark : btnLight} justify-between px-3 py-2.5 text-left text-sm`}
          >
            <span className="truncate">{n}</span>
            {note(i) && <span className="ml-2 shrink-0 font-mono text-[10px] opacity-70">{note(i)}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function Openers({ m, state, onStart }) {
  const innIndex = state.innings.length; // 0 or 1
  const bat = innIndex === 0 ? m.battingFirst : 1 - m.battingFirst;
  const bowl = 1 - bat;
  const [striker, setStriker] = useState(-1);
  const [non, setNon] = useState(-1);
  const [bowler, setBowler] = useState(-1);
  const ready = striker >= 0 && non >= 0 && striker !== non && bowler >= 0;
  return (
    <div className={`${card} space-y-5`}>
      <div>
        <p className="font-display text-2xl font-bold uppercase">
          {innIndex === 0 ? "1st innings" : "2nd innings"}: {teamName(m, bat)} bat
        </p>
        {innIndex === 1 && (
          <p className="text-sm text-[#1b1a14]/70">
            Target {state.target} from {m.overs} overs.
          </p>
        )}
      </div>
      <PlayerPicker title="On strike" names={m.teams[bat].players} value={striker} onChange={setStriker} disabled={(i) => i === non} />
      <PlayerPicker title="Non-striker" names={m.teams[bat].players} value={non} onChange={setNon} disabled={(i) => i === striker} />
      <PlayerPicker title={`Opening bowler (${teamName(m, bowl)})`} names={m.teams[bowl].players} value={bowler} onChange={setBowler} />
      <button type="button" className={`${btnDark} w-full py-4 text-lg`} disabled={!ready} onClick={() => onStart(striker, non, bowler)}>
        Start innings
      </button>
    </div>
  );
}

function NewBatter({ m, inn, onPick }) {
  const used = new Set(inn.batters.map((b) => b.p));
  return (
    <div className={card}>
      <p className="mb-3 font-display text-xl font-bold uppercase">Wicket! Who's in next?</p>
      <PlayerPicker
        title={`${teamName(m, inn.bat)} — yet to bat`}
        names={m.teams[inn.bat].players}
        value={-1}
        onChange={onPick}
        disabled={(i) => used.has(i)}
        note={(i) => (used.has(i) ? "batted" : "")}
      />
    </div>
  );
}

function NewBowler({ m, inn, onPick }) {
  const overs = (p) => Math.floor((inn.bowlers.find((b) => b.p === p)?.balls || 0) / 6);
  const players = m.teams[inn.bowl].players;
  const max = m.maxBowlerOvers || 0;
  const atMax = (p) => max > 0 && overs(p) >= max;
  const everyoneAtMax = players.every((_, p) => p === inn.lastBowler || atMax(p));
  return (
    <div className={card}>
      <p className="mb-3 font-display text-xl font-bold uppercase">Over {inn.overs.length + 1} — who's bowling?</p>
      <PlayerPicker
        title={`${teamName(m, inn.bowl)}${max ? ` · max ${max} over${max === 1 ? "" : "s"} each` : ""}`}
        names={players}
        value={-1}
        onChange={onPick}
        disabled={(p) => p === inn.lastBowler || (!everyoneAtMax && atMax(p))}
        note={(p) => (p === inn.lastBowler ? "last over" : `${overs(p)} ov`)}
      />
    </div>
  );
}

function WicketPanel({ m, inn, extra, onCancel, onConfirm }) {
  const kinds = allowedWickets(extra, inn.freeHit);
  const [kind, setKind] = useState(kinds.length === 1 ? kinds[0] : "");
  const [who, setWho] = useState(inn.striker);
  const [fielder, setFielder] = useState(-1);
  const [runs, setRuns] = useState(0);
  const info = WICKETS[kind] || {};
  return (
    <div className={`${card} space-y-4 ring-2 ring-[#c8102e]`}>
      <div className="flex items-center justify-between">
        <p className="font-display text-2xl font-bold uppercase text-[#c8102e]">Out!</p>
        {(inn.freeHit || extra) && (
          <span className="text-xs text-[#1b1a14]/60">
            {inn.freeHit ? "Free hit: only run out" : extra === "wd" ? "On a wide" : extra === "nb" ? "On a no-ball: only run out" : ""}
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {kinds.map((k) => (
          <button key={k} type="button" className={`${kind === k ? btnDark : btnLight} px-2 py-2.5 text-sm`} onClick={() => setKind(k)}>
            {WICKETS[k].label}
          </button>
        ))}
      </div>
      {info.either && (
        <PlayerPicker
          title="Who is out?"
          names={[playerName(m, inn.bat, inn.striker), playerName(m, inn.bat, inn.nonStriker)]}
          value={who === inn.striker ? 0 : 1}
          onChange={(i) => setWho(i === 0 ? inn.striker : inn.nonStriker)}
        />
      )}
      {info.fielder && (
        <PlayerPicker
          title={kind === "c" ? "Caught by" : kind === "st" ? "Keeper" : "Fielder (optional)"}
          names={m.teams[inn.bowl].players}
          value={fielder}
          onChange={(i) => setFielder(i === fielder ? -1 : i)}
        />
      )}
      {info.runs && (
        <div>
          <p className={label}>Runs completed before the run out</p>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {[0, 1, 2, 3].map((r) => (
              <button key={r} type="button" className={runs === r ? btnDark : btnLight} onClick={() => setRuns(r)}>
                {r}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <button type="button" className={btnLight} onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className={`${btn} bg-[#c8102e] text-white`}
          disabled={!kind}
          onClick={() => onConfirm({ kind, who: info.either ? who : inn.striker, fielder, runs: info.runs ? runs : 0 })}
        >
          Confirm wicket
        </button>
      </div>
    </div>
  );
}

const EXTRAS = [
  { k: "wd", label: "Wide", hint: "Wide = 1 run. Tap the runs they also ran (0 if none, 4 if it went to the boundary)." },
  { k: "nb", label: "No ball", hint: "No-ball = 1 run + free hit. Tap the runs off the bat (0 if none)." },
  { k: "b", label: "Bye", hint: "Tap the byes they ran." },
  { k: "lb", label: "Leg bye", hint: "Tap the leg byes they ran." },
];

function Scoring({ match: m, scorerKey, onChange, onExit }) {
  const state = useMemo(() => computeMatch(m), [m]);
  const sync = useSync(m, scorerKey);
  const [extra, setExtra] = useState("");
  const [wicketOpen, setWicketOpen] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const inn = state.current;

  const push = (ev) =>
    onChange({ ...m, events: [...m.events, ev], rev: (m.rev || 0) + 1, updatedAt: new Date().toISOString() });
  const undo = () => {
    if (!m.events.length) return;
    onChange({ ...m, events: m.events.slice(0, -1), rev: (m.rev || 0) + 1, updatedAt: new Date().toISOString() });
    setExtra("");
    setWicketOpen(false);
  };

  const ball = (r) => {
    if (extra === "wd" || extra === "b" || extra === "lb") push(["b", 0, extra, r, "", -1, -1]);
    else push(["b", r, extra, 0, "", -1, -1]);
    setExtra("");
  };
  const wicket = ({ kind, who, fielder, runs }) => {
    const offBat = extra === "" || extra === "nb";
    push(["b", offBat ? runs : 0, extra, offBat ? 0 : runs, kind, who, fielder]);
    setExtra("");
    setWicketOpen(false);
  };

  const hint = EXTRAS.find((e) => e.k === extra)?.hint;
  const scoring = state.status === "live" && !state.need;

  return (
    <>
      <AppBar
        title={`${teamName(m, 0)} v ${teamName(m, 1)}`}
        left={
          <button type="button" className={`${btnLight} h-11 w-11 px-0`} onClick={onExit} aria-label="Back to matches">
            ‹
          </button>
        }
        right={<SyncPill sync={sync} onUseServer={() => sync.server && onChange({ ...sync.server, updatedAt: new Date().toISOString() })} />}
      />

      <div className="space-y-3">
        <div className="rounded-2xl bg-[#0f2e1c] p-5 shadow-lg">
          <ScoreHeader m={m} state={state} dark />
          {state.result && (
            <p className="mt-3 rounded-xl bg-[#e8b234] px-3 py-2 text-center font-display text-xl font-bold uppercase text-[#14100a]">
              {state.result.text}
            </p>
          )}
        </div>

        {inn && !inn.done && (
          <div className={`${card} space-y-2 py-2`}>
            <AtTheCrease m={m} inn={inn} />
            <div className="border-t border-[#1b1a14]/10 pt-2">
              <ThisOver inn={inn} />
            </div>
          </div>
        )}

        {state.need === "openers" && !state.result && <Openers key={state.innings.length} m={m} state={state} onStart={(s, n, b) => push(["s", s, n, b])} />}
        {state.need === "batter" && inn && <NewBatter m={m} inn={inn} onPick={(p) => push(["n", p])} />}
        {state.need === "bowler" && inn && <NewBowler m={m} inn={inn} onPick={(p) => push(["o", p])} />}

        {scoring && wicketOpen && (
          <WicketPanel key={`${m.events.length}-${extra}`} m={m} inn={inn} extra={extra} onCancel={() => setWicketOpen(false)} onConfirm={wicket} />
        )}

        {scoring && !wicketOpen && (
          <div className={`${card} space-y-3`}>
            <div className="grid grid-cols-4 gap-2">
              {EXTRAS.map((e) => (
                <button
                  key={e.k}
                  type="button"
                  className={`${extra === e.k ? `${btn} bg-[#e8b234] text-[#14100a]` : btnLight} whitespace-nowrap px-1 py-3 text-[13px]`}
                  onClick={() => setExtra(extra === e.k ? "" : e.k)}
                >
                  {e.label}
                </button>
              ))}
            </div>
            {hint && <p className="rounded-lg bg-[#e8b234]/20 px-3 py-2 text-sm">{hint}</p>}
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3, 4, 5, 6].map((r) => (
                <button
                  key={r}
                  type="button"
                  disabled={(extra === "b" || extra === "lb") && r === 0}
                  onClick={() => ball(r)}
                  className={`${btn} h-16 text-2xl font-bold ${
                    r === 4 || r === 6 ? "bg-[#0f2e1c] text-[#e8b234]" : "border border-[#1b1a14]/15 bg-white"
                  }`}
                >
                  {r === 0 && !extra ? "•" : r}
                </button>
              ))}
              <button type="button" onClick={() => setWicketOpen(true)} className={`${btn} h-16 bg-[#c8102e] text-xl font-bold text-white`}>
                OUT
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <button type="button" className={btnLight} onClick={undo} disabled={!m.events.length}>
            ↶ Undo
          </button>
          <button type="button" className={`${btnLight} whitespace-nowrap px-2`} onClick={() => push(["x"])} disabled={!scoring}>
            ⇄ Swap
          </button>
          <button type="button" className={btnLight} onClick={() => setShowCard((v) => !v)} disabled={!state.innings.length}>
            {showCard ? "Hide card" : "Scorecard"}
          </button>
        </div>

        {state.status === "live" && (
          <div className="text-center">
            {confirmEnd ? (
              <span className="inline-flex items-center gap-2 text-sm">
                End this innings now?
                <button
                  type="button"
                  className="font-semibold text-[#c8102e] underline"
                  onClick={() => {
                    push(["e"]);
                    setConfirmEnd(false);
                  }}
                >
                  Yes, end it
                </button>
                <button type="button" className="underline" onClick={() => setConfirmEnd(false)}>
                  No
                </button>
              </span>
            ) : (
              <button type="button" className="text-xs text-[#1b1a14]/60 underline" onClick={() => setConfirmEnd(true)}>
                End innings early
              </button>
            )}
          </div>
        )}

        {(showCard || state.result) && (
          <div className="space-y-3">
            {state.innings.map((i) => (
              <div key={i.index} className={card}>
                <InningsCard m={m} inn={i} />
              </div>
            ))}
          </div>
        )}

        <p className="pt-2 text-center text-xs text-[#1b1a14]/55">
          Public scorecard:{" "}
          <a href={`/live/${m.id}`} target="_blank" rel="noreferrer" className="font-semibold underline">
            eccohiosports.com/live/{m.id}
          </a>
          <br />
          {inn && (
            <>
              {oversText(inn.balls)} overs · {m.events.length} entries saved on this phone
            </>
          )}
        </p>
      </div>
    </>
  );
}
