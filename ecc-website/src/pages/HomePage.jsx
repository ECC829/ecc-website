import { Link } from "react-router-dom";
import {
  ArrowLink,
  Badge,
  Container,
  Section,
  SectionHeading,
  StatTile,
} from "../components/ui";
import { club, season, fixtures, formats, showSchedule } from "../data/club";
import { teams } from "../data/teams";
import { players, countByRole } from "../data/players";
import { allEvents, cities } from "../data/tournaments";
import SponsorGrid from "../components/Sponsors";
import { captionOf, featuredAchievements, photoUrl } from "../data/achievements";
import { internalTournament as it } from "../data/internalTournament";
import { useSignupCounts } from "../lib/useSignupCounts";
import { useSignupsOpen } from "../lib/useSignupsOpen";
import CricClubsPanel from "../components/CricClubsPanel";

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-white/[0.07]">
      <div className="absolute inset-0 bg-field-glow" aria-hidden="true" />
      <div className="diag-stripes absolute inset-0" aria-hidden="true" />
      <div
        className="absolute -right-32 top-1/2 hidden h-[560px] w-[560px] -translate-y-1/2 rounded-full opacity-[0.14] blur-3xl lg:block"
        style={{
          background:
            "radial-gradient(circle, rgba(232,178,52,0.9) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <Container className="relative py-16 sm:py-24 lg:py-32">
        <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="flex animate-fade-up flex-wrap items-center gap-3">
              <Badge className="border-gold-400/35 bg-gold-400/10 text-gold-300">
                {season.label}
              </Badge>
              <span className="font-mono text-[11px] uppercase tracking-widest text-slate-500">
                First ball · {season.start}
              </span>
            </div>

            <h1 className="headline mt-7 animate-fade-up text-[3.4rem] leading-[0.88] sm:text-7xl lg:text-8xl">
              Nine teams.
              <br />
              Four formats.
              <br />
              <span className="animate-sheen bg-gold-sheen bg-[length:200%_auto] bg-clip-text text-transparent">
                One club.
              </span>
            </h1>

            <p className="mt-8 max-w-xl animate-fade-up text-base leading-7 text-slate-400 sm:text-lg">
              {club.name} is a Central Ohio cricket club competing across T7, T15,
              T20 and T40 cricket — from seven-over sprints to leather ball
              contests in Columbus, Dublin, Dayton and Cincinnati.
            </p>

            <div className="mt-10 flex animate-fade-up flex-wrap gap-4">
              <Link to="/teams" className="btn-primary">
                Explore the squads
              </Link>
              <Link to="/register" className="btn-ghost">
                Play for ECC
              </Link>
            </div>
          </div>

          {/* Crest panel */}
          <div className="relative mx-auto w-full max-w-md">
            <div
              className="absolute inset-0 rounded-[28px] opacity-30 blur-2xl"
              style={{
                background:
                  "radial-gradient(circle at 50% 40%, rgba(232,178,52,0.55), transparent 65%)",
              }}
              aria-hidden="true"
            />
            <div className="relative overflow-hidden rounded-[28px] border border-gold-400/20 bg-ink-900/80 p-8 backdrop-blur">
              <img
                src={club.logo}
                alt={`${club.name} crest`}
                className="mx-auto w-full max-w-[300px] rounded-2xl"
                loading="eager"
              />
              <div className="mt-8 grid grid-cols-3 divide-x divide-white/[0.08] border-t border-white/[0.08] pt-6 text-center">
                {[
                  { value: teams.length, label: "Teams" },
                  { value: players.length, label: "Players" },
                  { value: formats.length, label: "Formats" },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="font-display text-4xl font-bold leading-none text-gold-300">
                      {item.value}
                    </p>
                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-ultra text-slate-500">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Marquee() {
  const items = [...allEvents, ...cities.map((city) => `${city}, OH`)];
  const doubled = [...items, ...items];

  return (
    <div className="overflow-hidden border-b border-white/[0.07] bg-ink-900 py-4">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {doubled.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="flex items-center gap-10 font-mono text-[11px] uppercase tracking-widest text-slate-500"
          >
            {item}
            <span className="text-gold-500/60" aria-hidden="true">
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { counts: signups } = useSignupCounts(`${it.shortName} ${it.year}`);
  const signupsOpen = useSignupsOpen();

  const roleCounts = countByRole();

  return (
    <>
      {/* Recent wins */}
      {featuredAchievements.length > 0 && (
        <Section className="border-b border-white/[0.07] !py-10 sm:!py-14">
          <Container>
            <SectionHeading
              eyebrow="Trophy cabinet"
              title="Recent wins"
              lead="Titles and finals from ECC sides across Central Ohio."
              action={<ArrowLink to="/achievements">All achievements</ArrowLink>}
            />
            <div
              className={`mt-10 grid grid-cols-2 gap-3 sm:gap-4 ${
                featuredAchievements.length === 3 ? "sm:grid-cols-3" : "lg:grid-cols-4"
              }`}
            >
              {featuredAchievements.map((item) => (
                <Link
                  key={item.id}
                  to="/achievements"
                  className="group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900 transition hover:border-gold-400/40"
                >
                  <img
                    src={photoUrl(item.id, "small")}
                    alt={captionOf(item) || "ECC trophy photo"}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-10 sm:p-4">
                    {item.result && (
                      <span className="block font-mono text-[10px] uppercase tracking-widest text-gold-300">
                        {item.result.split(" · ")[0]}
                      </span>
                    )}
                    <span className="mt-1 block font-display text-base font-bold uppercase leading-tight tracking-wide text-white sm:text-lg">
                      {item.tournament || item.team || "ECC trophy win"}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      )}

      <Hero />

      {it.show && (
        <section className="border-b border-white/[0.07] bg-gold-400/[0.06]">
          <Container className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-gold-300">
                Club event · {it.dateLabel}
              </p>
              <p className="mt-1 font-display text-2xl font-bold uppercase tracking-wide text-white">
                {it.name} — {signupsOpen ? `sign-ups close ${it.signupDeadlineLabel}` : "sign-ups closed"}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Captains by lottery, squads by player auction. {it.playersPerTeam} players a side.
              </p>
              {signups && (
                <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-gold-300">
                  {signups.count} {signups.count === 1 ? "player" : "players"} signed up{signupsOpen ? " so far" : ""}
                </p>
              )}
            </div>
            <Link to="/internal-tournament" className="btn-primary shrink-0">
              {signupsOpen ? "Sign up" : "See who's in"}
            </Link>
          </Container>
        </section>
      )}
      <Marquee />

      {/* League on CricClubs */}
      <Section className="border-b border-white/[0.07]">
        <Container>
          <SectionHeading
            eyebrow="Easton Cricket League"
            title="Scores & stats"
            lead="Results, fixtures, the points table and player stats — live on CricClubs."
            action={
              <Link to="/league" className="text-sm font-semibold uppercase tracking-widest text-gold-300 hover:text-gold-200">
                All league links →
              </Link>
            }
          />
          <div className="mt-8">
            <CricClubsPanel compact />
          </div>
        </Container>
      </Section>

      {/* Club at a glance */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Club at a glance"
            title="The numbers behind ECC"
            lead="Squad data updates automatically from the club roster, so these figures always reflect the current season."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile value={teams.length} label="Teams" note="Across four formats" />
            <StatTile
              value={players.length}
              label="Registered players"
              note="On the club roster"
              accent="#2ec4b6"
            />
            <StatTile
              value={roleCounts.Allrounder ?? 0}
              label="Allrounders"
              note="Bat and bowl"
              accent="#7c5cff"
            />
            <StatTile
              value={allEvents.length}
              label="Competitions"
              note="Entered across Ohio"
              accent="#f97316"
            />
          </div>
        </Container>
      </Section>

      {/* Formats */}
      <Section className="border-y border-white/[0.07] bg-ink-900/60">
        <Container>
          <SectionHeading
            eyebrow="How we play"
            title="Four formats, one identity"
            lead="From seven-over sprints to forty-over leather ball cricket, ECC gives players a route into whichever version of the game suits them."
            action={<ArrowLink to="/tournaments">All tournaments</ArrowLink>}
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {formats.map((format) => (
              <div
                key={format.code}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-950 p-6 transition duration-300 hover:border-gold-400/35"
              >
                <p className="font-display text-6xl font-bold leading-none text-white/[0.08] transition group-hover:text-gold-400/25">
                  {format.code}
                </p>
                <h3 className="mt-4 font-display text-2xl font-bold uppercase tracking-wide text-white">
                  {format.name}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{format.text}</p>
                <dl className="mt-5 space-y-1.5 border-t border-white/[0.07] pt-4 font-mono text-[11px] uppercase tracking-widest text-slate-500">
                  <div className="flex justify-between gap-3">
                    <dt>Overs</dt>
                    <dd className="text-slate-300">{format.overs}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Squad</dt>
                    <dd className="text-slate-300">{format.squad}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Ball</dt>
                    <dd className="text-slate-300">{format.ball}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Teams */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="The squads"
            title="Meet the teams"
            lead="Each side has its own identity, format and squad — pick one to see the full roster."
            action={<ArrowLink to="/teams">All teams</ArrowLink>}
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => {
              const squadSize = players.filter((p) => p.team === team.name).length;
              return (
                <Link
                  key={team.slug}
                  to={`/teams/${team.slug}`}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900 p-7 transition duration-300 hover:-translate-y-1 hover:border-white/20"
                >
                  <span
                    className="absolute inset-x-0 top-0 h-[3px]"
                    style={{ background: team.accent }}
                    aria-hidden="true"
                  />
                  <div
                    className="absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-2xl transition duration-500 group-hover:opacity-40"
                    style={{ background: team.accent }}
                    aria-hidden="true"
                  />
                  <p className="relative font-mono text-[11px] uppercase tracking-widest text-slate-500">
                    {team.format}
                  </p>
                  <h3 className="relative mt-3 font-display text-4xl font-bold uppercase tracking-wide text-white">
                    {team.name}
                  </h3>
                  <p className="relative mt-4 text-sm leading-6 text-slate-400">
                    {team.summary}
                  </p>
                  <p className="relative mt-6 font-mono text-[11px] uppercase tracking-widest text-slate-500">
                    {squadSize > 0
                      ? `${squadSize} listed players`
                      : "Squad being finalised"}
                  </p>
                </Link>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Fixtures (hidden while showSchedule is false) */}
      {showSchedule && (
      <Section className="border-t border-white/[0.07] bg-ink-900/60">
        <Container>
          <SectionHeading
            eyebrow="Fixtures & results"
            title={`${season.year} schedule`}
            lead={`The ${season.year} calendar is being confirmed. Fixtures, venues and results will appear here as they are announced.`}
          />
          <div className="mt-10 overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-950">
            {fixtures.map((fixture, index) => (
              <div
                key={fixture.id}
                className={`flex flex-col gap-4 p-6 transition hover:bg-white/[0.02] sm:flex-row sm:items-center sm:gap-8 ${
                  index > 0 ? "border-t border-white/[0.07]" : ""
                }`}
              >
                <div className="w-20 shrink-0">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-gold-400">
                    {fixture.format}
                  </p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-slate-500">
                    #{String(fixture.id).padStart(2, "0")}
                  </p>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
                    vs {fixture.opponent}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {fixture.competition} · {fixture.venue}
                  </p>
                </div>
                <div className="flex items-center gap-6 sm:justify-end">
                  <p className="font-mono text-sm text-slate-300">{fixture.date}</p>
                  <Badge className="border-white/10 bg-white/[0.04] text-slate-400">
                    {fixture.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>
      )}

      {/* Sponsors */}
      <Section className="border-t border-white/[0.07]">
        <Container>
          <SectionHeading
            eyebrow={`${season.year} sponsors`}
            title="Backed by our partners"
            lead="The local businesses supporting ECC this season."
            action={<ArrowLink to="/sponsor">Become a sponsor</ArrowLink>}
          />
          <div className="mt-10">
            <SponsorGrid />
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section>
        <Container>
          <div className="relative overflow-hidden rounded-3xl border border-gold-400/20 bg-ink-900 p-10 text-center sm:p-16">
            <div className="absolute inset-0 bg-field-glow" aria-hidden="true" />
            <div className="diag-stripes absolute inset-0" aria-hidden="true" />
            <div className="relative">
              <p className="eyebrow">Join the club</p>
              <h2 className="headline mt-4 text-4xl sm:text-5xl lg:text-6xl">
                Want to play this season?
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-400">
                ECC is open to cricketers across Central Ohio. Tell us your
                preferred role and format, and the club will be in touch ahead of
                the {season.start} start.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-4">
                <Link to="/register" className="btn-primary">
                  Register interest
                </Link>
                <Link to="/sponsor" className="btn-ghost">
                  Sponsor ECC
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
