import { useMemo, useState } from "react";
import { Container, EmptyState, PageHeader } from "../components/ui";
import { cx } from "../lib/cx";
import PlayerCard from "../components/PlayerCard";
import { countByRole, players, roles } from "../data/players";
import { teams } from "../data/teams";

const teamOptions = ["All", ...teams.map((team) => team.name)];
const roleOptions = ["All", ...roles];

function FilterPills({ label, options, value, onChange }) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={value === option}
            className={cx(
              "rounded-lg border px-4 py-2 text-[12px] font-semibold uppercase tracking-widest transition",
              value === option
                ? "border-gold-400 bg-gold-400 text-ink-950"
                : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/25 hover:text-white"
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PlayersPage() {
  const [search, setSearch] = useState("");
  const [team, setTeam] = useState("All");
  const [role, setRole] = useState("All");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return players.filter((player) => {
      if (team !== "All" && player.team !== team) return false;
      if (role !== "All" && player.role !== role) return false;
      if (!query) return true;
      return `${player.name} ${player.displayName} ${player.team} ${player.role}`
        .toLowerCase()
        .includes(query);
    });
  }, [search, team, role]);

  const counts = countByRole();
  const hasFilters = search !== "" || team !== "All" || role !== "All";

  const reset = () => {
    setSearch("");
    setTeam("All");
    setRole("All");
  };

  return (
    <>
      <PageHeader
        eyebrow="Player directory"
        title="The roster"
        lead={`${players.length} registered players across ${teams.length} squads — ${
          counts.Batsman ?? 0
        } batters, ${counts.Bowler ?? 0} bowlers and ${
          counts.Allrounder ?? 0
        } allrounders. Select any player for their profile.`}
      />

      <Container className="py-12 sm:py-16">
        {/* Filter bar */}
        <div className="rounded-2xl border border-white/[0.08] bg-ink-900 p-6 sm:p-7">
          <label className="block">
            <span className="mb-3 block text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              Search
            </span>
            <div className="relative">
              <span
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                aria-hidden="true"
              >
                ⌕
              </span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, team or role"
                className="field !pl-10"
              />
            </div>
          </label>

          <div className="mt-7 grid gap-7 lg:grid-cols-[1.6fr_1fr]">
            <FilterPills label="Team" options={teamOptions} value={team} onChange={setTeam} />
            <FilterPills label="Role" options={roleOptions} value={role} onChange={setRole} />
          </div>
        </div>

        {/* Results */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-slate-500">
            {filtered.length} {filtered.length === 1 ? "player" : "players"}
            {hasFilters && " matching filters"}
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={reset}
              className="font-mono text-[11px] uppercase tracking-widest text-gold-300 transition hover:text-gold-200"
            >
              Clear filters ✕
            </button>
          )}
        </div>

        <div className="mt-6">
          {filtered.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((player) => (
                <PlayerCard key={player.slug} player={player} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No players found"
              text="Nothing matches that combination. Try a different team, role, or search term."
            />
          )}
        </div>
      </Container>
    </>
  );
}
