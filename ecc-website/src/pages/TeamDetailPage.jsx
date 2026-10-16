import { Link, useParams } from "react-router-dom";
import {
  Badge,
  Container,
  EmptyState,
  Section,
  StatTile,
} from "../components/ui";
import PlayerCard from "../components/PlayerCard";
import { teamBySlug } from "../data/teams";
import { countByRole, playersByTeam } from "../data/players";
import { season } from "../data/club";
import NotFoundPage from "./NotFoundPage";

export default function TeamDetailPage() {
  const { slug } = useParams();
  const team = teamBySlug[slug];

  if (!team) return <NotFoundPage />;

  const squad = playersByTeam(team.name);
  const roles = countByRole(squad);

  return (
    <>
      <header className="relative overflow-hidden border-b border-white/[0.07] bg-ink-900">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(ellipse 70% 60% at 20% -10%, ${team.accent}, transparent 65%)`,
          }}
          aria-hidden="true"
        />
        <div className="diag-stripes absolute inset-0" aria-hidden="true" />

        <Container className="relative py-14 sm:py-20">
          <Link
            to="/teams"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-slate-500 transition hover:text-gold-300"
          >
            ← All teams
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Badge accent={team.accent}>{team.format}</Badge>
            {team.traits.map((trait) => (
              <span
                key={trait}
                className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500"
              >
                {trait}
              </span>
            ))}
          </div>

          <h1
            className="headline mt-6 text-6xl sm:text-7xl lg:text-8xl"
            style={{ color: team.accent }}
          >
            {team.name}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            {team.story}
          </p>
        </Container>
      </header>

      <Section className="!pb-0">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              value={squad.length}
              label="Squad size"
              note={`${season.year} roster`}
              accent={team.accent}
            />
            <StatTile value={roles.Batsman ?? 0} label="Batters" accent={team.accent} />
            <StatTile value={roles.Bowler ?? 0} label="Bowlers" accent={team.accent} />
            <StatTile
              value={roles.Allrounder ?? 0}
              label="Allrounders"
              accent={team.accent}
            />
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Squad</p>
              <h2 className="headline mt-3 text-3xl sm:text-4xl">
                {team.name} players
              </h2>
            </div>
            {squad.length > 0 && (
              <Link
                to="/players"
                className="hidden font-mono text-[11px] uppercase tracking-widest text-slate-500 transition hover:text-gold-300 sm:block"
              >
                Full directory →
              </Link>
            )}
          </div>

          <div className="mt-9">
            {squad.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {squad.map((player) => (
                  <PlayerCard key={player.slug} player={player} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Squad being finalised"
                text={`The ${team.name} roster for the ${season.year} season hasn't been published yet. Check back closer to ${season.start}.`}
              />
            )}
          </div>
        </Container>
      </Section>
    </>
  );
}
