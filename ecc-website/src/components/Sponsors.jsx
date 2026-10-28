import { sponsors, season } from "../data/club";

function mapsLink(address) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

/** Grid of the current season's sponsors with their locations. */
export default function SponsorGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {sponsors.map((sponsor) => (
        <article
          key={sponsor.name}
          className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900 p-7 transition duration-300 hover:border-white/20"
        >
          <div
            className="absolute inset-x-0 top-0 h-1"
            style={{ background: sponsor.accent }}
            aria-hidden="true"
          />
          {sponsor.logo && (
            <div
              className="mb-6 flex h-44 items-center justify-center overflow-hidden rounded-xl"
              style={{ background: sponsor.logoBg || "#ffffff" }}
            >
              <img
                src={sponsor.logo}
                alt={`${sponsor.name} logo`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-contain"
              />
            </div>
          )}
          <p
            className="font-mono text-[11px] uppercase tracking-widest"
            style={{ color: sponsor.accent }}
          >
            {season.year} sponsor · {sponsor.category}
          </p>
          <h3 className="mt-3 font-display text-2xl font-bold uppercase leading-tight tracking-wide text-white">
            {sponsor.name}
          </h3>
          <ul className="mt-6 space-y-4">
            {sponsor.locations.map((location) => (
              <li key={location.address}>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  {location.label}
                </p>
                <a
                  href={mapsLink(location.address)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block text-sm leading-6 text-slate-300 transition hover:text-gold-300"
                >
                  {location.address}
                </a>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
