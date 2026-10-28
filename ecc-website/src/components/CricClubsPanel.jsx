import { cricclubs, leagueUrl } from "../data/cricclubs";

const ext = { target: "_blank", rel: "noopener noreferrer" };

function Arrow() {
  return <span aria-hidden="true" className="transition group-hover:translate-x-0.5">↗</span>;
}

/** Links to ECC's live scores, schedules and stats on CricClubs. */
export default function CricClubsPanel({ compact = false }) {
  const current = cricclubs.leagues.find((l) => l.current) ?? cricclubs.leagues[0];
  return (
    <div className="space-y-6">
      {current && (
        <div className="relative overflow-hidden rounded-2xl border border-gold-400/25 bg-gradient-to-br from-gold-400/[0.10] via-ink-900 to-ink-900 p-6 sm:p-8">
          {current.sponsor && (
            <div className="mb-5 flex items-center gap-3 sm:absolute sm:right-8 sm:top-1/2 sm:mb-0 sm:-translate-y-1/2 sm:flex-col sm:gap-2">
              <img
                src={current.sponsor.logo}
                alt={`${current.sponsor.name} logo`}
                loading="lazy"
                decoding="async"
                className="h-20 w-20 object-contain drop-shadow-[0_6px_18px_rgba(232,178,52,0.25)] sm:h-36 sm:w-36"
              />
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 sm:text-center">
                Presented by
                <br className="hidden sm:block" /> Supreme Fresh
              </span>
            </div>
          )}
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-gold-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-gold-400" aria-hidden="true" />
            Current league
          </p>
          <h3 className="mt-3 font-display text-3xl sm:pr-48 font-bold uppercase leading-tight tracking-wide text-white sm:text-4xl">
            {current.name}
          </h3>
          <div className="mt-6 flex flex-wrap gap-3 sm:pr-48">
            <a {...ext} href={leagueUrl(current.id)} className="btn-primary group">
              League home <Arrow />
            </a>
            <a {...ext} href={leagueUrl(current.id, "viewPointsTable")} className="btn-ghost group">
              Points table <Arrow />
            </a>
            <a {...ext} href={leagueUrl(current.id, "battingRecords")} className="btn-ghost group">
              Batting <Arrow />
            </a>
            <a {...ext} href={leagueUrl(current.id, "bowlingRecords")} className="btn-ghost group">
              Bowling <Arrow />
            </a>
          </div>
        </div>
      )}

      <div className={`grid gap-3 ${compact ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6" : "grid-cols-2 lg:grid-cols-3"}`}>
        {cricclubs.links.map((l) => (
          <a
            key={l.label}
            {...ext}
            href={l.href}
            className="group rounded-xl border border-white/[0.08] bg-ink-900 p-4 transition hover:border-gold-400/40 hover:bg-ink-850"
          >
            <span className="flex items-center justify-between font-display text-lg font-bold uppercase tracking-wide text-white">
              {l.label} <span className="text-gold-300"><Arrow /></span>
            </span>
            <span className="mt-1 block text-xs text-slate-500">{l.note}</span>
          </a>
        ))}
      </div>

      {!compact && cricclubs.leagues.length > 1 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Past leagues</p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {cricclubs.leagues
              .filter((l) => l !== current)
              .map((l) => (
                <a
                  key={l.id}
                  {...ext}
                  href={leagueUrl(l.id)}
                  className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/[0.07]"
                >
                  {l.name} <span className="text-slate-500"><Arrow /></span>
                </a>
              ))}
          </div>
        </div>
      )}

      <p className="text-xs text-slate-500">
        Scores, schedules and stats are kept on{" "}
        <a {...ext} href={cricclubs.home} className="text-gold-300 underline underline-offset-2">
          CricClubs
        </a>{" "}
        and open in a new tab.
      </p>
    </div>
  );
}
