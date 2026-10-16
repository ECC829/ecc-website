import { Link } from "react-router-dom";
import { Badge, Container, PageHeader, Section, StatTile } from "../components/ui";
import { allEvents, cities, tournaments } from "../data/tournaments";
import { teamByName } from "../data/teams";
import { season, showSchedule } from "../data/club";

export default function TournamentsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Competitions"
        title="Where ECC competes"
        lead="The club enters T7, T15, T20 and T40 competitions, plus women's cricket, across Central Ohio, giving players opportunities in both sprint cricket and endurance formats."
      >
        <div className="grid max-w-2xl gap-4 sm:grid-cols-3">
          <StatTile value={allEvents.length} label="Competitions" />
          <StatTile value={cities.length} label="Cities" accent="#2ec4b6" />
          <StatTile value={tournaments.length} label="Format groups" accent="#f97316" />
        </div>
      </PageHeader>

      <Section>
        <Container>
          <div className="space-y-6">
            {tournaments.map((tournament) => (
              <article
                key={tournament.id}
                className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900"
              >
                <span
                  className="absolute inset-y-0 left-0 w-[3px]"
                  style={{ background: tournament.accent }}
                  aria-hidden="true"
                />
                <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-[1fr_1fr]">
                  <div>
                    <Badge accent={tournament.accent}>{tournament.tag}</Badge>
                    <h2 className="headline mt-5 text-4xl sm:text-5xl">
                      {tournament.title}
                    </h2>
                    <p className="mt-5 max-w-lg text-[15px] leading-7 text-slate-400">
                      {tournament.description}
                    </p>

                    <div className="mt-8">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                        ECC teams in this format
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2.5">
                        {tournament.teams.map((teamName) => {
                          const team = teamByName[teamName];
                          return (
                            <Link
                              key={teamName}
                              to={`/teams/${team?.slug ?? ""}`}
                              className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/[0.07]"
                            >
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ background: team?.accent ?? "#e8b234" }}
                                aria-hidden="true"
                              />
                              {teamName}
                              <span
                                aria-hidden="true"
                                className="text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-gold-300"
                              >
                                →
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    <div className="rounded-xl border border-white/[0.07] bg-ink-950 p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                        Format
                      </p>
                      <ul className="mt-4 space-y-2.5">
                        {tournament.formats.map((item) => (
                          <li
                            key={item}
                            className="flex gap-3 text-sm leading-6 text-slate-300"
                          >
                            <span
                              className="mt-2 h-1 w-1 shrink-0 rounded-full"
                              style={{ background: tournament.accent }}
                              aria-hidden="true"
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-xl border border-white/[0.07] bg-ink-950 p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                        Competitions entered
                      </p>
                      <ul className="mt-4 space-y-2.5">
                        {tournament.events.map((event) => (
                          <li
                            key={event}
                            className="flex gap-3 text-sm leading-6 text-slate-300"
                          >
                            <span
                              className="mt-2 h-1 w-1 shrink-0 rounded-full"
                              style={{ background: tournament.accent }}
                              aria-hidden="true"
                            />
                            {event}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {showSchedule && (
      <Section className="border-t border-white/[0.07] bg-ink-900/60">
        <Container>
          <div className="rounded-2xl border border-white/[0.08] bg-ink-950 p-8 sm:p-10">
            <p className="eyebrow">Season note</p>
            <h2 className="headline mt-4 text-3xl sm:text-4xl">
              The {season.year} calendar
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-slate-400">
              Entries and draws for the {season.year} season are being confirmed.
              Fixture dates, venues and results will be published on the home page
              as each competition schedule is released.
            </p>
            <Link to="/" className="btn-ghost mt-7">
              View fixtures
            </Link>
          </div>
        </Container>
      </Section>
      )}
    </>
  );
}
