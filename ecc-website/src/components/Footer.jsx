import { Link } from "react-router-dom";
import { club, season, showLeadership, socialLinks } from "../data/club";
import { teams } from "../data/teams";
import { internalTournament } from "../data/internalTournament";

const columns = [
  {
    title: "Club",
    links: [
      { label: "About ECC", to: "/about" },
      { label: "Tournaments", to: "/tournaments" },
      { label: "Teams", to: "/teams" },
      { label: "Players", to: "/players" },
    ],
  },
  {
    title: "Get Involved",
    links: [
      ...(internalTournament.show
        ? [{ label: "Internal Tournament Sign-up", to: "/internal-tournament" }]
        : []),
      { label: "Player Registration", to: "/register" },
      { label: "Sponsor ECC", to: "/sponsor" },
      ...(showLeadership
        ? [{ label: "Leadership Nominations", to: "/leadership" }]
        : []),
      { label: "Contact", to: "/contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.08] bg-ink-900">
      <div className="diag-stripes absolute inset-0 opacity-50" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <img
                src={club.logo}
                alt=""
                className="h-12 w-12 rounded-lg object-cover ring-1 ring-gold-400/30"
              />
              <div>
                <p className="font-display text-2xl font-bold uppercase tracking-wide text-white">
                  {club.shortName}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-ultra text-slate-500">
                  {club.tagline}
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-6 text-slate-500">
              {club.name} — nine teams across four formats, competing throughout
              Central Ohio.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400 transition hover:border-gold-400/50 hover:text-gold-300"
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-[11px] font-semibold uppercase tracking-ultra text-gold-400">
                {column.title}
              </p>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-slate-400 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-ultra text-gold-400">
              Squads
            </p>
            <ul className="mt-5 space-y-3">
              {teams.map((team) => (
                <li key={team.slug}>
                  <Link
                    to={`/teams/${team.slug}`}
                    className="group flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: team.accent }}
                      aria-hidden="true"
                    />
                    {team.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 hairline" />

        <div className="mt-8 flex flex-col gap-4 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono uppercase tracking-widest">
            © {season.year} {club.shortName} · {club.base}
          </p>
          <div className="flex flex-wrap gap-6 font-mono uppercase tracking-widest">
            <a href={`mailto:${club.email}`} className="transition hover:text-gold-300">
              {club.email}
            </a>
            <a href={club.phoneHref} className="transition hover:text-gold-300">
              {club.phone}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
