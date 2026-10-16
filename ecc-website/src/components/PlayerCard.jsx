import { Link } from "react-router-dom";
import Avatar from "./Avatar";
import { Badge } from "./ui";
import { getTeamAccent } from "../data/teams";

export default function PlayerCard({ player }) {
  const accent = getTeamAccent(player.team);
  const { profile } = player;

  return (
    <Link
      to={`/players/${player.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900 p-5 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-ink-850"
    >
      <span
        className="absolute inset-x-0 top-0 h-[2px] scale-x-0 opacity-0 transition duration-300 group-hover:scale-x-100 group-hover:opacity-100"
        style={{ background: accent }}
        aria-hidden="true"
      />

      <div className="flex items-center gap-4">
        <Avatar
          name={player.name}
          initials={player.initials}
          team={player.team}
          size={52}
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-xl font-bold uppercase leading-tight tracking-wide text-white">
            {player.displayName}
          </h3>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            ECC {player.team}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <Badge accent={accent}>{player.role}</Badge>
        {profile.runs != null || profile.wickets != null ? (
          <div className="flex items-center gap-4 font-mono text-sm">
            {profile.runs != null && (
              <span className="text-slate-500">
                <span className="text-white">{profile.runs}</span> runs
              </span>
            )}
            {profile.wickets != null && (
              <span className="text-slate-500">
                <span className="text-white">{profile.wickets}</span> wkts
              </span>
            )}
          </div>
        ) : (
          <span className="font-mono text-[11px] uppercase tracking-widest text-slate-600">
            Profile →
          </span>
        )}
      </div>
    </Link>
  );
}
