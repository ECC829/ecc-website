import { Link } from "react-router-dom";
import { Container, PageHeader, Section, SectionHeading } from "../components/ui";
import { club, clubValues, formats, season, timeline } from "../data/club";
import { cities } from "../data/tournaments";
import { teams } from "../data/teams";
import { players } from "../data/players";

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About the club"
        title={
          <>
            Easton–Emeralds
            <br />
            Cricket Club
          </>
        }
        lead="One club formed from two Central Ohio cricket groups, now fielding nine teams across four formats."
      />

      <Section>
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6 text-base leading-8 text-slate-400">
              <p className="text-xl leading-9 text-slate-200">
                ECC is a unified cricket club formed by bringing together players
                from the Easton and Emeralds teams — two passionate cricket groups
                in the Central Ohio community.
              </p>
              <p>
                Over the years the club has grown into a recognised name in Central
                Ohio cricket, taking part in tournaments across Columbus, Dublin,
                Dayton and Cincinnati. What began as weekend cricket between
                friends now runs as a structured club with dedicated squads for
                every format of the game.
              </p>
              <p>
                The club's focus is straightforward: competitive cricket, genuine
                community, player development, and building something with
                staying power. Whether a player is chasing a spot in a leather
                ball XI or turning out for a seven-over side on a Saturday, there
                is a place for them here.
              </p>
              <div className="flex flex-wrap gap-3 pt-4">
                <Link to="/teams" className="btn-primary">
                  See the squads
                </Link>
                <Link to="/register" className="btn-ghost">
                  Join ECC
                </Link>
              </div>
            </div>

            <aside className="h-fit rounded-2xl border border-white/[0.08] bg-ink-900 p-7">
              <p className="eyebrow">Club file</p>
              <dl className="mt-6 space-y-4">
                {[
                  { label: "Full name", value: club.name },
                  { label: "Based in", value: club.base },
                  { label: "Teams", value: `${teams.length} squads` },
                  { label: "Roster", value: `${players.length} players` },
                  { label: "Formats", value: formats.map((f) => f.code).join(" · ") },
                  { label: "Competing in", value: cities.join(", ") },
                  { label: "Current season", value: season.label },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="border-b border-white/[0.06] pb-4 last:border-0 last:pb-0"
                  >
                    <dt className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                      {row.label}
                    </dt>
                    <dd className="mt-1.5 text-sm font-medium text-white">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </aside>
          </div>
        </Container>
      </Section>

      <Section className="border-y border-white/[0.07] bg-ink-900/60">
        <Container>
          <SectionHeading
            eyebrow="Our story"
            title="How ECC came together"
          />
          <ol className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.07] md:grid-cols-2 lg:grid-cols-4">
            {timeline.map((item, index) => (
              <li key={item.title} className="relative bg-ink-950 p-7">
                <span className="font-mono text-[11px] uppercase tracking-widest text-gold-400">
                  {item.period}
                </span>
                <p className="mt-4 font-display text-2xl font-bold uppercase leading-tight tracking-wide text-white">
                  {item.title}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-400">{item.text}</p>
                <span
                  className="absolute right-6 top-6 font-display text-5xl font-bold leading-none text-white/[0.05]"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeading
            eyebrow="What we stand for"
            title="Four things that define the club"
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {clubValues.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-white/[0.08] bg-ink-900 p-7 transition duration-300 hover:border-gold-400/30"
              >
                <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
                  {value.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">{value.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="border-t border-white/[0.07] bg-ink-900/60">
        <Container>
          <SectionHeading
            eyebrow="Formats"
            title="The cricket we play"
            lead="Each format asks something different of a squad — ECC fields sides in all four."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {formats.map((format) => (
              <div
                key={format.code}
                className="rounded-2xl border border-white/[0.08] bg-ink-950 p-7"
              >
                <p className="font-display text-5xl font-bold leading-none text-gold-400/80">
                  {format.code}
                </p>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  {format.overs} · {format.squad}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-400">{format.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
