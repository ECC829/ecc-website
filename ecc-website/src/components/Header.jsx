import { useCallback, useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { club, season, showLeadership } from "../data/club";
import { cx } from "../lib/cx";
import { internalTournament } from "../data/internalTournament";
import { prefetchSignupCounts } from "../lib/useSignupCounts";

const tournamentSheet = `${internalTournament.shortName} ${internalTournament.year}`;

const navItems = [
  { to: "/", label: "Home", end: true, mobileOnly: true },
  { to: "/about", label: "About" },
  { to: "/tournaments", label: "Tournaments" },
  { to: "/achievements", label: "Trophies" },
  ...(internalTournament.show
    ? [
        { to: "/internal-tournament", label: "Internal T7" },
        { to: "/live", label: "Live" },
      ]
    : []),
  { to: "/teams", label: "Teams" },
  { to: "/players", label: "Players" },
  { to: "/leadership", label: "Leadership" },
  { to: "/contact", label: "Contact" },
].filter((item) => showLeadership || item.to !== "/leadership");

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const linkClass = ({ isActive }) =>
    cx(
      "relative whitespace-nowrap px-1 py-2 text-[13px] font-semibold uppercase tracking-widest transition",
      isActive ? "text-gold-300" : "text-slate-400 hover:text-white"
    );

  return (
    <>
      <a
        href="#main"
        onClick={(event) => {
          // Focus the main area directly (the router owns navigation).
          event.preventDefault();
          const main = document.getElementById("main");
          main?.setAttribute("tabindex", "-1");
          main?.focus();
        }}
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-gold-400 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink-950"
      >
        Skip to content
      </a>

      <header
        className={cx(
          "sticky top-0 z-50 border-b transition duration-300",
          scrolled
            ? "border-white/[0.08] bg-ink-950/90 backdrop-blur-xl"
            : "border-transparent bg-ink-950/60 backdrop-blur-md"
        )}
      >
        <div className="mx-auto flex h-[72px] w-full max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
          <Link to="/" className="group flex shrink-0 items-center gap-3">
            <img
              src={club.logo}
              alt=""
              className="h-10 w-10 rounded-lg object-cover ring-1 ring-gold-400/30"
            />
            <span className="leading-none">
              <span className="block font-display text-2xl font-bold uppercase tracking-wide text-white">
                {club.shortName}
              </span>
              <span className="mt-0.5 block whitespace-nowrap text-[10px] lg:hidden font-semibold uppercase tracking-ultra text-slate-500">
                {club.tagline}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-5 lg:flex xl:gap-7" aria-label="Primary">
            {navItems.filter((item) => !item.mobileOnly).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={linkClass}
                onMouseEnter={
                  item.to === "/internal-tournament"
                    ? () => prefetchSignupCounts(tournamentSheet)
                    : undefined
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    <span
                      className={cx(
                        "absolute -bottom-0.5 left-0 h-[2px] w-full origin-left bg-gold-400 transition-transform duration-300",
                        isActive ? "scale-x-100" : "scale-x-0"
                      )}
                      aria-hidden="true"
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link to="/register" className="btn-primary whitespace-nowrap !px-5 !py-2.5 !text-xs">
              Join ECC
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white transition hover:border-gold-400/50 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <span className="relative block h-4 w-5">
              <span
                className={cx(
                  "absolute left-0 block h-[2px] w-5 bg-current transition duration-300",
                  open ? "top-[7px] rotate-45" : "top-0"
                )}
              />
              <span
                className={cx(
                  "absolute left-0 top-[7px] block h-[2px] w-5 bg-current transition duration-200",
                  open && "opacity-0"
                )}
              />
              <span
                className={cx(
                  "absolute left-0 block h-[2px] w-5 bg-current transition duration-300",
                  open ? "top-[7px] -rotate-45" : "top-[14px]"
                )}
              />
            </span>
          </button>
        </div>

        {/* Season strip */}
        <div className="border-t border-white/[0.06] bg-ink-900/70">
          <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-5 py-1.5 sm:px-8">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-400" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
              {season.label} · First ball {season.start} · Central Ohio
            </p>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        id="mobile-nav"
        className={cx(
          "fixed inset-0 z-40 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!open}
      >
        <div
          className={cx(
            "absolute inset-0 bg-ink-950/80 backdrop-blur-sm transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0"
          )}
          onClick={close}
        />
        <nav
          aria-label="Mobile"
          className={cx(
            "absolute right-0 top-0 flex h-full w-[82%] max-w-sm flex-col overflow-y-auto border-l border-white/10 bg-ink-900 px-6 pb-8 pt-36 transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "translate-x-full"
          )}
        >
          <ul className="flex flex-col">
            {navItems.map((item) => (
              <li key={item.to} className="border-b border-white/[0.07]">
                <NavLink
                  to={item.to}
                  end={item.end}
                  tabIndex={open ? 0 : -1}
                  onClick={close}
                  className={({ isActive }) =>
                    cx(
                      "block py-3.5 font-display text-2xl font-bold uppercase tracking-wide transition",
                      isActive ? "text-gold-300" : "text-white hover:text-gold-200"
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <Link
            to="/register"
            tabIndex={open ? 0 : -1}
            onClick={close}
            className="btn-primary mt-8 w-full"
          >
            Join ECC
          </Link>
          <a
            href={`mailto:${club.email}`}
            tabIndex={open ? 0 : -1}
            className="mt-4 text-center font-mono text-xs text-slate-500 hover:text-gold-300"
          >
            {club.email}
          </a>
        </nav>
      </div>
    </>
  );
}
