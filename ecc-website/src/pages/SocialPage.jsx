import { Container, PageHeader, Section } from "../components/ui";
import { club, socialLinks } from "../data/club";

export default function SocialPage() {
  return (
    <>
      <PageHeader
        eyebrow="Social"
        title="Stay connected"
        lead="Follow ECC for tournament news, squad announcements, match-day posters, highlights and club updates."
      />

      <Section>
        <Container>
          <div className="grid gap-4 sm:grid-cols-2">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900 p-8 transition duration-300 hover:-translate-y-1 hover:border-white/20"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br opacity-0 transition duration-500 group-hover:opacity-100 ${social.accent}`}
                  aria-hidden="true"
                />
                <div className="relative">
                  <p className="text-[11px] font-semibold uppercase tracking-ultra text-gold-400">
                    {social.name}
                  </p>
                  <h2 className="mt-4 font-display text-4xl font-bold uppercase tracking-wide text-white">
                    {social.handle}
                  </h2>
                  <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
                    {social.description}
                  </p>
                  <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-gold-300">
                    Open {social.name}
                    <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">
                      →
                    </span>
                  </span>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-white/[0.08] bg-ink-950 p-8 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-ultra text-slate-500">
              Prefer email?
            </p>
            <a
              href={`mailto:${club.email}`}
              className="mt-3 inline-block font-display text-3xl font-bold uppercase tracking-wide text-white transition hover:text-gold-300"
            >
              {club.email}
            </a>
          </div>
        </Container>
      </Section>
    </>
  );
}
