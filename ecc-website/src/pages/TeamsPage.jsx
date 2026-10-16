import { Link } from "react-router-dom";
import { Container, PageHeader, Section } from "../components/ui";
import { teamBySlug, teamGroups } from "../data/teams";
import { players } from "../data/players";

function TeamCard({ team }) {
  const squadSize = players.filter((p) => p.team === team.name).length;

  return (
    <Link
      to={`/teams/${team.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-950 p-7 transition duration-300 hover:-translate-y-1 hover:border-white/20"
    >
      <span
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: team.accent }}
        aria-hidden="true"
      />
      <div
        className="absolute -right-14 -top-14 h-36 w-36 rounded-full opacity-0 blur-3xl transition duration-500 group-hover:opacity-50"
        style={{ background: team.accent }}
        aria-hidden="true"
      />

      <div className="relative flex-1">
        <p className="font-mono text-[11px] uppercase tracking-widest text-slate-500">
          {team.format}
        </p>
        <h3 className="mt-3 font-display text-4xl font-bold uppercase tracking-wide text-white">
          {team.name}
        </h3>
        <p className="mt-4 text-sm leading-6 text-slate-400">{team.summary}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {team.traits.map((trait) => (
            <span
              key={trait}
              className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500"
            >
              {trait}
            </span>
          ))}
        </div>
      </div>

      <div className="relative mt-7 flex items-center justify-between border-t border-white/[0.07] pt-5">
        <span className="font-mono text-[11px] uppercase tracking-widest text-slate-500">
          {squadSize > 0 ? `${squadSize} players` : "Squad TBC"}
        </span>
        <span className="text-sm font-semibold uppercase tracking-widest text-gold-300 transition group-hover:translate-x-1">
          View squad →
        </span>
      </div>
    </Link>
  );
}

export default function TeamsPage() {
  return (
    <>
      <PageHeader
        eyebrow="The squads"
        title="ECC teams by format"
        lead="Teams are grouped by the format they compete in, so it's clear which side plays where. Kurralu appears twice — the squad competes in both T7 and T15 cricket."
      />

      {teamGroups.map((group, index) => (
        <Section
          key={group.id}
          className={
            index % 2 === 1 ? "border-y border-white/[0.07] bg-ink-900/60" : ""
          }
        >
          <Container>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="eyebrow">{group.format}</p>
                <h2 className="headline mt-3 text-3xl sm:text-4xl">{group.title}</h2>
                <p className="mt-3 text-[15px] leading-7 text-slate-400">
                  {group.description}
                </p>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-widest text-slate-600">
                {group.slugs.length} {group.slugs.length === 1 ? "team" : "teams"}
              </span>
            </div>

            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.slugs.map((slug) => (
                <TeamCard key={`${group.id}-${slug}`} team={teamBySlug[slug]} />
              ))}
            </div>
          </Container>
        </Section>
      ))}
    </>
  );
}
