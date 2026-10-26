import { dismissalText, oversText, playerName, teamName } from "../../lib/scoring";

/* Shared pieces used by the scorer app and the public live scorecard. */


const rate = (runs, balls) => (balls ? ((runs * 6) / balls).toFixed(2) : "0.00");

/** Colour for a ball in the over strip. */
function chipClass(label) {
  if (label.includes("W")) return "bg-[#c8102e] text-white";
  if (label === "4" || label === "6") return "bg-[#0f2e1c] text-[#e8b234]";
  if (/wd|nb|b|lb/.test(label)) return "bg-[#e8b234]/30 text-[#1b1a14]";
  return "bg-[#1b1a14]/[0.07] text-[#1b1a14]";
}

export function BallChip({ label, small }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-mono font-semibold ${
        small ? "h-7 min-w-7 px-1.5 text-[11px]" : "h-9 min-w-9 px-2 text-xs"
      } ${chipClass(label)}`}
    >
      {label}
    </span>
  );
}

/** The big score block: "45/2 (4.3)", run rates, target line, free hit. */
export function ScoreHeader({ m, state, dark = false }) {
  const inn = state.current;
  const muted = dark ? "text-[#f6edd3]/70" : "text-[#1b1a14]/60";
  const main = dark ? "text-[#f6edd3]" : "text-[#1b1a14]";
  if (!inn) {
    return (
      <div className={main}>
        <p className={`font-mono text-[11px] uppercase tracking-widest ${muted}`}>Not started</p>
        <p className="mt-1 font-display text-3xl font-bold uppercase">
          {teamName(m, 0)} v {teamName(m, 1)}
        </p>
        {m.toss && (
          <p className={`mt-1 text-sm ${muted}`}>
            {teamName(m, m.toss.winner)} won the toss and chose to {m.toss.choice}.
          </p>
        )}
      </div>
    );
  }
  const ballsLeft = m.overs * 6 - inn.balls;
  const chasing = inn.index === 1 && !state.result;
  const need = state.target - inn.runs;
  return (
    <div className={main}>
      <div className="flex items-center justify-between gap-3">
        <p className={`font-mono text-[11px] uppercase tracking-widest ${muted}`}>
          {inn.index === 0 ? "1st innings" : "2nd innings"} · {teamName(m, inn.bat)}
        </p>
        {inn.freeHit && !inn.done && (
          <span className="animate-pulse rounded-full bg-[#c8102e] px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-widest text-white">
            Free hit
          </span>
        )}
      </div>
      <div className="mt-1 flex items-baseline gap-3">
        <span className="font-display text-6xl font-bold leading-none tabular-nums">
          {inn.runs}/{inn.wkts}
        </span>
        <span className={`font-mono text-lg tabular-nums ${muted}`}>
          ({oversText(inn.balls)}/{m.overs})
        </span>
      </div>
      <p className={`mt-2 font-mono text-xs uppercase tracking-wider ${muted}`}>
        Run rate {rate(inn.runs, inn.balls)}
        {chasing && ballsLeft > 0 && <> · Need {rate(need, ballsLeft)}</>}
      </p>
      {chasing && (
        <p className="mt-2 text-[15px] font-semibold">
          {need > 0 ? (
            <>
              Need {need} from {ballsLeft} ball{ballsLeft === 1 ? "" : "s"}{" "}
              <span className={`font-normal ${muted}`}>· Target {state.target}</span>
            </>
          ) : (
            "Target reached"
          )}
        </p>
      )}
      {inn.index === 0 && state.innings[1] === undefined && inn.done && (
        <p className="mt-2 text-[15px] font-semibold">
          {teamName(m, inn.bowl)} need {state.target} to win
        </p>
      )}
    </div>
  );
}

/** Current batters (striker starred) and bowler. */
export function AtTheCrease({ m, inn }) {
  if (!inn) return null;
  const row = (p) => inn.batters.find((b) => b.p === p);
  const bowler = inn.bowler >= 0 ? inn.bowlers.find((b) => b.p === inn.bowler) : null;
  const lastBowler = inn.lastBowler >= 0 ? inn.bowlers.find((b) => b.p === inn.lastBowler) : null;
  const showBowler = bowler || lastBowler;
  return (
    <div className="divide-y divide-[#1b1a14]/10 text-[#1b1a14]">
      {[inn.striker, inn.nonStriker].map((p, i) => {
        const b = p >= 0 ? row(p) : null;
        return (
          <div key={i} className="flex items-center justify-between py-2">
            <span className="flex items-center gap-2 font-semibold">
              <span className="w-3 text-[#c8102e]">{i === 0 && b ? "●" : ""}</span>
              {b ? playerName(m, inn.bat, p) : <span className="font-normal text-[#1b1a14]/40">— new batter —</span>}
            </span>
            {b && (
              <span className="font-mono text-sm tabular-nums">
                <strong className="text-base">{b.r}</strong> ({b.b})
                <span className="ml-2 text-[#1b1a14]/50">
                  {b.f4}×4 {b.f6}×6
                </span>
              </span>
            )}
          </div>
        );
      })}
      {showBowler && (
        <div className="flex items-center justify-between py-2">
          <span className="flex items-center gap-2 font-semibold">
            <span className="w-3 text-[#1b1a14]/40">◆</span>
            {playerName(m, inn.bowl, showBowler.p)}
            {!bowler && <span className="text-xs font-normal text-[#1b1a14]/45">(last over)</span>}
          </span>
          <span className="font-mono text-sm tabular-nums">
            {oversText(showBowler.balls)}-{showBowler.maidens}-{showBowler.runs}-<strong>{showBowler.wkts}</strong>
          </span>
        </div>
      )}
    </div>
  );
}

/** Balls of the current (or last) over. */
export function ThisOver({ inn }) {
  if (!inn || !inn.overs.length) return null;
  const over = inn.overs[inn.overs.length - 1];
  const number = inn.overs.length;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 shrink-0 font-mono text-[11px] uppercase tracking-widest text-[#1b1a14]/50">
        Over {number}
      </span>
      {over.balls.map((b, i) => (
        <BallChip key={i} label={b} />
      ))}
    </div>
  );
}

/** Full batting + bowling card for one innings. */
export function InningsCard({ m, inn }) {
  const ex = inn.extras;
  const extrasTotal = ex.wd + ex.nb + ex.b + ex.lb;
  const yetToBat = (m.teams[inn.bat]?.players || [])
    .map((name, p) => ({ name, p }))
    .filter(({ p }) => !inn.batters.some((b) => b.p === p));
  const th = "py-2 text-right font-mono text-[11px] font-semibold uppercase tracking-wider text-[#1b1a14]/50";
  const td = "py-2 text-right font-mono tabular-nums";
  return (
    <div className="text-[#1b1a14]">
      <div className="flex items-baseline justify-between border-b-2 border-[#1b1a14]/80 pb-2">
        <p className="font-display text-xl font-bold uppercase tracking-wide">{teamName(m, inn.bat)}</p>
        <p className="font-mono text-sm tabular-nums">
          <strong className="text-lg">
            {inn.runs}/{inn.wkts}
          </strong>{" "}
          ({oversText(inn.balls)} ov)
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="mt-1 w-full min-w-[340px] text-sm">
          <thead>
            <tr>
              <th className="py-2 text-left font-mono text-[11px] font-semibold uppercase tracking-wider text-[#1b1a14]/50">
                Batter
              </th>
              <th className={th}>R</th>
              <th className={th}>B</th>
              <th className={th}>4s</th>
              <th className={th}>6s</th>
              <th className={th}>SR</th>
            </tr>
          </thead>
          <tbody>
            {inn.batters.map((b) => {
              const atCrease = !b.out && !inn.done && (b.p === inn.striker || b.p === inn.nonStriker);
              return (
                <tr key={b.p} className="border-t border-[#1b1a14]/10 align-top">
                  <td className="py-2 pr-2">
                    <span className="font-semibold">
                      {playerName(m, inn.bat, b.p)}
                      {atCrease && b.p === inn.striker ? " *" : ""}
                    </span>
                    <span className="block text-xs text-[#1b1a14]/55">{dismissalText(m, inn, b)}</span>
                  </td>
                  <td className={`${td} font-bold`}>{b.r}</td>
                  <td className={td}>{b.b}</td>
                  <td className={td}>{b.f4}</td>
                  <td className={td}>{b.f6}</td>
                  <td className={td}>{b.b ? ((b.r * 100) / b.b).toFixed(0) : "–"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-1 flex justify-between border-t border-[#1b1a14]/10 py-2 text-sm">
        <span className="text-[#1b1a14]/70">
          Extras <span className="text-xs">(wd {ex.wd}, nb {ex.nb}, b {ex.b}, lb {ex.lb})</span>
        </span>
        <span className="font-mono font-bold">{extrasTotal}</span>
      </div>
      {yetToBat.length > 0 && (
        <p className="border-t border-[#1b1a14]/10 py-2 text-xs text-[#1b1a14]/60">
          <span className="font-semibold uppercase tracking-wider">Yet to bat:</span>{" "}
          {yetToBat.map((y) => y.name).join(", ")}
        </p>
      )}
      {inn.fow.length > 0 && (
        <p className="border-t border-[#1b1a14]/10 py-2 text-xs text-[#1b1a14]/60">
          <span className="font-semibold uppercase tracking-wider">Fall of wickets:</span>{" "}
          {inn.fow
            .map((f) => `${f.runs}-${f.wkts} (${playerName(m, inn.bat, f.p)}, ${oversText(f.balls)})`)
            .join(" · ")}
        </p>
      )}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[340px] text-sm">
          <thead>
            <tr className="border-b-2 border-[#1b1a14]/80">
              <th className="py-2 text-left font-mono text-[11px] font-semibold uppercase tracking-wider text-[#1b1a14]/50">
                Bowler
              </th>
              <th className={th}>O</th>
              <th className={th}>M</th>
              <th className={th}>R</th>
              <th className={th}>W</th>
              <th className={th}>Econ</th>
              <th className={th}>Ex</th>
            </tr>
          </thead>
          <tbody>
            {inn.bowlers
              .filter((b) => b.balls || b.runs || b.wd || b.nb)
              .map((b) => (
                <tr key={b.p} className="border-t border-[#1b1a14]/10">
                  <td className="py-2 pr-2 font-semibold">{playerName(m, inn.bowl, b.p)}</td>
                  <td className={td}>{oversText(b.balls)}</td>
                  <td className={td}>{b.maidens}</td>
                  <td className={td}>{b.runs}</td>
                  <td className={`${td} font-bold`}>{b.wkts}</td>
                  <td className={td}>{rate(b.runs, b.balls)}</td>
                  <td className={`${td} text-[#1b1a14]/55`}>
                    {b.wd || b.nb ? `${b.wd}wd ${b.nb}nb` : "–"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {inn.overs.length > 0 && (
        <div className="mt-4 space-y-1.5">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#1b1a14]/50">Overs</p>
          {inn.overs.map((o, i) => (
            <div key={i} className="flex flex-wrap items-center gap-1.5">
              <span className="w-24 shrink-0 truncate text-xs text-[#1b1a14]/60">
                {i + 1}. {playerName(m, inn.bowl, o.bowler)}
              </span>
              {o.balls.map((b, j) => (
                <BallChip key={j} label={b} small />
              ))}
              <span className="ml-auto shrink-0 pl-2 font-mono text-xs text-[#1b1a14]/60">{o.runs}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
