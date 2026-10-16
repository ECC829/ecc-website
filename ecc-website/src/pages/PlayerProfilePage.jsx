import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge, Container, DataTable, DetailRow, EmptyState, Section } from "../components/ui";
import { cx } from "../lib/cx";
import { AvatarPortrait } from "../components/Avatar";
import { playerBySlug } from "../data/players";
import { teamByName } from "../data/teams";
import { season } from "../data/club";
import NotFoundPage from "./NotFoundPage";

const tabs = [
  { key: "batting", label: "Batting" },
  { key: "bowling", label: "Bowling" },
  { key: "about", label: "About" },
];

function HeroStat({ value, label, accent }) {
  return (
    <div className="border-b border-r border-white/[0.08] p-5 last:border-r-0 sm:p-6">
      <p
        className="font-display text-4xl font-bold leading-none sm:text-5xl"
        style={{ color: value === "—" ? "#475569" : accent }}
      >
        {value}
      </p>
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-ultra text-slate-500">
        {label}
      </p>
    </div>
  );
}

export default function PlayerProfilePage() {
  const { slug } = useParams();
  const player = playerBySlug[slug];
  const [tab, setTab] = useState("batting");

  if (!player) return <NotFoundPage />;

  const team = teamByName[player.team];
  const accent = team?.accent ?? "#e8b234";
  const { profile } = player;
  const dash = (value) => (value == null ? "—" : value);
  const hasRows = (which) =>
    (which === "bowling" ? profile.seasonBowling : profile.seasonBatting).length > 0;

  return (
    <>
      {/* Hero */}
      <header className="relative overflow-hidden border-b border-white/[0.07] bg-ink-900">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            background: `radial-gradient(ellipse 60% 70% at 15% 0%, ${accent}, transparent 60%)`,
          }}
          aria-hidden="true"
        />
        <div className="diag-stripes absolute inset-0" aria-hidden="true" />

        <Container className="relative py-12 sm:py-16">
          <Link
            to="/players"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-slate-500 transition hover:text-gold-300"
          >
            ← Player directory
          </Link>

          <div className="mt-9 grid gap-10 lg:grid-cols-[280px_1fr] lg:items-end">
            <div className="mx-auto w-full max-w-[280px] lg:mx-0">
              <AvatarPortrait
                name={player.name}
                initials={player.initials}
                team={player.team}
                jerseyNo={player.jerseyNo}
              />
            </div>

            <div>
              <Link
                to={`/teams/${team?.slug ?? ""}`}
                className="text-[11px] font-semibold uppercase tracking-ultra transition hover:opacity-80"
                style={{ color: accent }}
              >
                ECC {player.team}
              </Link>
              <h1 className="headline mt-3 text-5xl sm:text-6xl lg:text-7xl">
                {player.name}
              </h1>

              <div className="mt-6 flex flex-wrap gap-2.5">
                <Badge accent={accent}>{player.role}</Badge>
                {player.jerseyNo != null && (
                  <Badge className="border-white/10 bg-white/[0.04] text-slate-300">
                    Jersey #{player.jerseyNo}
                  </Badge>
                )}
                <Badge className="border-white/10 bg-white/[0.04] text-slate-300">
                  {team?.format}
                </Badge>
              </div>

              <div className="mt-8 grid grid-cols-2 overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-950/70 sm:grid-cols-4">
                <HeroStat value={dash(profile.matches)} label="Matches" accent={accent} />
                <HeroStat value={dash(profile.runs)} label="Runs" accent={accent} />
                <HeroStat value={dash(profile.wickets)} label="Wickets" accent={accent} />
                <HeroStat
                  value={dash(profile.strikeRate)}
                  label="Strike rate"
                  accent={accent}
                />
              </div>
            </div>
          </div>
        </Container>
      </header>

      {/* Tabs */}
      <div className="sticky top-[72px] z-30 border-b border-white/[0.07] bg-ink-950/90 backdrop-blur-xl">
        <Container>
          <div className="flex gap-1 overflow-x-auto" role="tablist">
            {tabs.map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={tab === item.key}
                onClick={() => setTab(item.key)}
                className={cx(
                  "relative whitespace-nowrap px-5 py-4 text-[13px] font-semibold uppercase tracking-widest transition",
                  tab === item.key ? "text-white" : "text-slate-500 hover:text-slate-300"
                )}
              >
                {item.label}
                <span
                  className={cx(
                    "absolute inset-x-3 bottom-0 h-[2px] origin-center transition-transform duration-300",
                    tab === item.key ? "scale-x-100" : "scale-x-0"
                  )}
                  style={{ background: accent }}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        </Container>
      </div>

      <Section className="!py-12 sm:!py-16">
        <Container>
          {tab !== "about" && !hasRows(tab) && (
            <EmptyState
              title={
                profile.recorded
                  ? `No ${tab} record yet`
                  : "Stats not yet recorded"
              }
              text={
                profile.recorded
                  ? `${player.displayName} has no ${tab} figures logged. They'll appear here once the club records ${tab} data for this player.`
                  : `Match records for ${player.displayName} haven't been logged yet. The club is building its statistics database — figures will appear here as ${season.year} results are recorded.`
              }
            />
          )}

          {hasRows("batting") && tab === "batting" && (
            <DataTable
              caption="Batting & fielding"
              columns={[
                "Year",
                "Mat",
                "Inns",
                "NO",
                "Runs",
                "HS",
                "Avg",
                "BF",
                "SR",
                "50s",
                "4s",
                "6s",
                "Ct",
              ]}
              rows={profile.seasonBatting.map((row) => [
                row.year,
                row.mat,
                row.inns,
                row.no,
                row.runs,
                row.hs,
                row.avg,
                row.bf,
                row.sr,
                row.fifties,
                row.fours,
                row.sixes,
                row.ct,
              ])}
            />
          )}

          {hasRows("bowling") && tab === "bowling" && (
            <DataTable
              caption="Bowling"
              columns={["Year", "Mat", "Inns", "Overs", "Runs", "Wkts", "BBI", "Econ"]}
              rows={profile.seasonBowling.map((row) => [
                row.year,
                row.mat,
                row.inns,
                row.overs,
                row.runs,
                row.wkts,
                row.bbi,
                row.eco,
              ])}
            />
          )}

          {tab === "about" && (
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-white/[0.08] bg-ink-900 p-8">
                <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-white">
                  About
                </h2>
                <p className="mt-5 text-[15px] leading-8 text-slate-400">
                  {profile.about}
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-ink-900 p-8">
                <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
                  Player card
                </h2>
                <div className="mt-5">
                  <DetailRow label="Team" value={`ECC ${player.team}`} />
                  <DetailRow label="Role" value={player.role} />
                  <DetailRow label="Batting style" value={profile.battingStyle} />
                  <DetailRow label="Bowling style" value={profile.bowlingStyle} />
                  <DetailRow label="Jersey" value={player.jerseyNo != null ? `#${player.jerseyNo}` : null} />
                  <DetailRow label="ECC debut" value={profile.debutSeason} />
                  <DetailRow label="Best batting" value={profile.bestBatting} />
                  <DetailRow label="Best bowling" value={profile.bestBowling} />
                </div>
              </div>
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
