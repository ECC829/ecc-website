import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Container } from "../components/ui";
import { fetchMatch, fetchMatches } from "../lib/liveApi";
import { computeMatch, teamName } from "../lib/scoring";
import { AtTheCrease, InningsCard, ScoreHeader, ThisOver } from "../components/scoring/ScoreBits";

/* Public live scores: /live (all matches) and /live/:id (one scorecard). */

const outfield = {
  background:
    "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(246,237,211,0.16), transparent 70%), repeating-linear-gradient(90deg, #0f2e1c 0 90px, #123521 90px 180px)",
};
const cream = "rounded-2xl bg-[#f6edd3] text-[#1b1a14] shadow-[0_18px_50px_rgba(0,0,0,0.35)]";

/** Polls `load` every `ms` while the tab is visible. */
function usePoll(load, ms, deps) {
  const [data, setData] = useState(undefined);
  const [error, setError] = useState(false);
  const [at, setAt] = useState(null);
  useEffect(() => {
    let cancelled = false;
    let timer;
    const tick = async () => {
      if (document.visibilityState === "visible") {
        try {
          const d = await load();
          if (cancelled) return;
          setData(d);
          setError(false);
          setAt(new Date());
        } catch {
          if (!cancelled) setError(true);
        }
      }
      if (!cancelled) timer = setTimeout(tick, ms);
    };
    tick();
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        clearTimeout(timer);
        tick();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, error, at };
}

const timeText = (d) => (d ? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" }) : "");

function StatusChip({ status, dark = false }) {
  const quiet = dark ? "bg-[#f6edd3]/15 text-[#f6edd3]" : "bg-[#1b1a14]/10 text-[#1b1a14]/70";
  const map = {
    live: ["bg-[#c8102e] text-white", "Live"],
    break: ["bg-[#e8b234] text-[#14100a]", "Innings break"],
    done: [quiet, "Result"],
    setup: [quiet, "Starting soon"],
  };
  const [cls, text] = map[status] || map.setup;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest ${cls}`}>
      {status === "live" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />}
      {text}
    </span>
  );
}

function Shell({ eyebrow, title, children, right }) {
  return (
    <section className="relative min-h-[70vh] overflow-hidden py-12 sm:py-16">
      <div className="absolute inset-0" style={outfield} aria-hidden="true" />
      <Container className="relative">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#e8b234]">{eyebrow}</p>
            <h1 className="mt-3 font-display text-4xl font-bold uppercase tracking-wide text-[#f6edd3] sm:text-5xl">{title}</h1>
          </div>
          {right}
        </div>
        <div className="mt-8">{children}</div>
      </Container>
    </section>
  );
}

const Updated = ({ at, error }) => (
  <p className="font-mono text-[11px] uppercase tracking-widest text-[#f6edd3]/60">
    {error ? "Reconnecting…" : at ? `Updated ${timeText(at)} · refreshes automatically` : "Loading…"}
  </p>
);

export function LiveListPage() {
  const { data, error, at } = usePoll(fetchMatches, 15000, []);
  const order = { live: 0, break: 1, setup: 2, done: 3 };
  const list = [...(data || [])].sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));
  return (
    <Shell eyebrow="ECC Internal T7" title="Live scores" right={<Updated at={at} error={error && !data} />}>
      {data && list.length === 0 && (
        <div className={`${cream} p-8 text-center`}>
          <p className="font-display text-2xl font-bold uppercase">No matches yet</p>
          <p className="mt-2 text-sm text-[#1b1a14]/65">Scores appear here as soon as the first ball is bowled.</p>
        </div>
      )}
      {!data && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-[#f6edd3]/20" />
          ))}
        </div>
      )}
      {!data && error && (
        <div className={`${cream} p-8 text-center text-sm`}>Couldn't load the scores. Trying again…</div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => (
          <Link key={s.id} to={`/live/${s.id}`} className={`${cream} block p-5 transition hover:-translate-y-0.5`}>
            <div className="flex items-center justify-between gap-2">
              <StatusChip status={s.status} />
              {s.ground && <span className="truncate font-mono text-[11px] uppercase tracking-widest text-[#1b1a14]/55">{s.ground}</span>}
            </div>
            <p className="mt-3 font-display text-xl font-bold uppercase tracking-wide">{s.title}</p>
            <div className="mt-2 space-y-1">
              {s.lines.map((l, i) => (
                <p key={i} className="flex items-baseline justify-between gap-2">
                  <span className="truncate font-semibold">{l.team}</span>
                  <span className="font-mono tabular-nums">
                    <strong className="text-lg">{l.score}</strong>{" "}
                    <span className="text-sm text-[#1b1a14]/60">({l.overs})</span>
                  </span>
                </p>
              ))}
            </div>
            {s.note && <p className="mt-3 border-t border-[#1b1a14]/10 pt-2 text-sm font-medium text-[#1b1a14]/75">{s.note}</p>}
          </Link>
        ))}
      </div>
    </Shell>
  );
}

export function LiveMatchPage() {
  const { id = "" } = useParams();
  const { data: m, error, at } = usePoll(() => fetchMatch(id), 10000, [id]);
  const [tab, setTab] = useState(null);

  if (m === null) {
    return (
      <Shell eyebrow="Live scores" title="Match not found">
        <div className={`${cream} p-8 text-center`}>
          <p className="text-sm">This match doesn't exist or was removed.</p>
          <Link to="/live" className="mt-4 inline-block font-semibold underline">
            See all matches
          </Link>
        </div>
      </Shell>
    );
  }
  if (!m) {
    return (
      <Shell eyebrow="Live scores" title="Loading…" right={<Updated at={at} error={error} />}>
        <div className="h-60 animate-pulse rounded-2xl bg-[#f6edd3]/20" />
      </Shell>
    );
  }

  const state = computeMatch(m);
  const inn = state.current;
  const shown = tab ?? Math.max(0, state.innings.length - 1);
  const status = state.status;

  return (
    <Shell
      eyebrow={m.ground ? `Live scores · ${m.ground}` : "Live scores"}
      title={`${teamName(m, 0)} v ${teamName(m, 1)}`}
      right={<Updated at={at} error={error} />}
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#f6edd3]/15 bg-black/25 p-5 backdrop-blur-sm">
            <div className="mb-3">
              <StatusChip status={status} dark />
            </div>
            <ScoreHeader m={m} state={state} dark />
            {state.result && (
              <p className="mt-4 rounded-xl bg-[#e8b234] px-3 py-2 text-center font-display text-xl font-bold uppercase text-[#14100a]">
                {state.result.text}
              </p>
            )}
            {state.innings.length === 2 && (
              <p className="mt-3 font-mono text-xs uppercase tracking-wider text-[#f6edd3]/70">
                {teamName(m, state.innings[0].bat)} {state.innings[0].runs}/{state.innings[0].wkts} (
                {Math.floor(state.innings[0].balls / 6)}.{state.innings[0].balls % 6})
              </p>
            )}
          </div>
          {inn && !inn.done && (
            <div className={`${cream} space-y-2 p-4`}>
              <AtTheCrease m={m} inn={inn} />
              <div className="border-t border-[#1b1a14]/10 pt-2">
                <ThisOver inn={inn} />
              </div>
            </div>
          )}
          <Link to="/live" className="inline-block font-mono text-xs uppercase tracking-widest text-[#f6edd3]/80 underline">
            ← All matches
          </Link>
        </div>

        <div className={`${cream} p-5`}>
          {state.innings.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#1b1a14]/65">The scorecard appears once the first ball is bowled.</p>
          ) : (
            <>
              {state.innings.length > 1 && (
                <div className="mb-4 grid grid-cols-2 gap-2">
                  {state.innings.map((i) => (
                    <button
                      key={i.index}
                      type="button"
                      onClick={() => setTab(i.index)}
                      className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                        shown === i.index ? "bg-[#0f2e1c] text-[#f6edd3]" : "bg-[#1b1a14]/[0.06]"
                      }`}
                    >
                      {teamName(m, i.bat)} {i.runs}/{i.wkts}
                    </button>
                  ))}
                </div>
              )}
              {state.innings[shown] && <InningsCard m={m} inn={state.innings[shown]} />}
            </>
          )}
        </div>
      </div>
    </Shell>
  );
}
