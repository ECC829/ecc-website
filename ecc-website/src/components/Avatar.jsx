import { getTeamAccent } from "../data/teams";
import { cx } from "../lib/cx";

/**
 * Deterministic initial-avatar. No network requests, no identical stock
 * photos — each player gets a monogram tinted with their team colour.
 */
export default function Avatar({ name, initials, team, size = 56, className }) {
  const accent = getTeamAccent(team);
  const label = initials ?? name?.slice(0, 2).toUpperCase() ?? "?";
  const fontSize = Math.round(size * 0.38);

  return (
    <span
      className={cx(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl border",
        className
      )}
      style={{
        width: size,
        height: size,
        borderColor: `${accent}44`,
        background: `linear-gradient(140deg, ${accent}2e 0%, rgba(13,12,17,0.9) 62%)`,
      }}
      aria-hidden="true"
    >
      <span
        className="font-display font-bold uppercase leading-none tracking-wide"
        style={{ fontSize, color: accent }}
      >
        {label}
      </span>
    </span>
  );
}

/** Larger portrait-style block used on the player profile hero. */
export function AvatarPortrait({ name, initials, team, jerseyNo }) {
  const accent = getTeamAccent(team);

  return (
    <div
      className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-2xl border"
      style={{
        borderColor: `${accent}33`,
        background: `radial-gradient(ellipse at 50% 25%, ${accent}30 0%, transparent 62%), linear-gradient(180deg, #131118 0%, #08070a 100%)`,
      }}
    >
      <div className="diag-stripes absolute inset-0 opacity-70" aria-hidden="true" />
      {jerseyNo != null && (
        <span
          className="absolute inset-0 flex items-center justify-center font-display text-[13rem] font-bold leading-none opacity-[0.09]"
          style={{ color: accent }}
          aria-hidden="true"
        >
          {jerseyNo}
        </span>
      )}
      <span
        className="relative font-display text-7xl font-bold uppercase tracking-wide sm:text-8xl"
        style={{ color: accent }}
      >
        {initials ?? name?.slice(0, 2).toUpperCase()}
      </span>
      <span className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-950 to-transparent" />
    </div>
  );
}
