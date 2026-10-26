import { Link } from "react-router-dom";
import { useState } from "react";
import { Container, Section, SectionHeading } from "../components/ui";
import {
  Field,
  Select,
  SuccessPanel,
  TextArea,
  TextInput,
  ToggleGroup,
} from "../components/Form";
import { digitCount, isEmail, mailtoLink, submitToSheet, useForm } from "../lib/form";
import { googleSheetEndpoint } from "../data/forms";
import { useSignupCounts } from "../lib/useSignupCounts";
import { club } from "../data/club";
import { roles } from "../data/players";
import {
  auctionRules,
  internalTournament as t,
  tournamentSteps,
} from "../data/internalTournament";

function TeamEstimator() {
  const [count, setCount] = useState("70");
  const signups = Math.max(0, Math.floor(Number(count) || 0));
  const teamCount = Math.floor(signups / t.playersPerTeam);
  const spare = signups % t.playersPerTeam;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-ink-900 p-8">
      <p className="eyebrow">Team estimator</p>
      <h3 className="mt-3 font-display text-2xl font-bold uppercase tracking-wide text-white">
        How many teams?
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Enter a number of sign-ups to see how the teams split at {t.playersPerTeam} players
        each.
      </p>
      <label className="mt-6 block">
        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          Sign-ups
        </span>
        <TextInput
          type="number"
          min="0"
          inputMode="numeric"
          value={count}
          onChange={(e) => setCount(e.target.value)}
        />
      </label>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/[0.07] bg-ink-950 p-4">
          <p className="font-display text-4xl font-bold leading-none text-gold-300">
            {teamCount}
          </p>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Teams of {t.playersPerTeam}
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.07] bg-ink-950 p-4">
          <p className="font-display text-4xl font-bold leading-none text-slate-300">
            {spare}
          </p>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Players left over
          </p>
        </div>
      </div>
      {spare > 0 && (
        <p className="mt-4 text-xs leading-5 text-slate-500">
          Left-over players are placed by the organisers once sign-ups close.
        </p>
      )}
    </div>
  );
}

function LiveCount({ counts, loading }) {
  if (!googleSheetEndpoint || (!counts && !loading)) return null;
  const show = (n) =>
    counts ? n : <span className="inline-block h-8 w-7 animate-pulse rounded bg-white/10 align-middle" />;
  const items = [
    {
      value: show(counts?.count),
      label: counts?.count === 1 ? "Player signed up" : "Players signed up",
    },
    { value: show(counts?.captains), label: "Captain nominees" },
    {
      value: show(Math.floor((counts?.count ?? 0) / t.playersPerTeam)),
      label: `Teams of ${t.playersPerTeam} so far`,
    },
  ];
  return (
    <div className="rounded-2xl border border-gold-400/25 bg-gold-400/[0.06] p-5">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold-400" />
        </span>
        <span className="font-mono text-[11px] uppercase tracking-widest text-gold-300">
          {loading && counts ? "Updating…" : "Live sign-ups"}
        </span>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.label}>
            <dt className="sr-only">{item.label}</dt>
            <dd className="font-display text-4xl font-bold leading-none text-white">
              {item.value}
            </dd>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              {item.label}
            </p>
          </div>
        ))}
      </dl>
    </div>
  );
}

const signedUpKey = `ecc-signed-up:${t.shortName} ${t.year}`;

function readSignedUp() {
  try {
    return JSON.parse(localStorage.getItem(signedUpKey) || "null");
  } catch {
    return null;
  }
}

function initialsOf(name) {
  const parts = name.replace(".", "").split(" ").filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

function PlayerPool({ players, loading }) {
  if (!t.showPlayerNames || !googleSheetEndpoint) return null;
  // Older script versions don't send names: keep the section hidden until they do.
  if (!players && !loading) return null;

  return (
    <Section className="border-b border-white/[0.07]">
      <Container>
        <SectionHeading
          eyebrow="The pool"
          title="Who's signed up"
          lead="Everyone who has signed up for the tournament so far."
          action={
            players && (
              <span className="font-mono text-[11px] uppercase tracking-widest text-slate-500">
                {players.length} {players.length === 1 ? "player" : "players"}
              </span>
            )
          }
        />

        <div className="mt-8">
          {!players && loading && (
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="h-[60px] animate-pulse rounded-xl bg-white/[0.04]" />
              ))}
            </div>
          )}

          {players && players.length === 0 && (
            <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">
              No sign-ups yet — be the first in the pool.
            </p>
          )}

          {players && players.length > 0 && (
            <ul className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
              {players.map((p, i) => (
                <li
                  key={`${p.name}-${i}`}
                  className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-ink-900 p-2.5 sm:gap-3 sm:p-3"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gold-400/25 bg-gold-400/[0.08] font-display text-sm font-bold text-gold-300 sm:h-10 sm:w-10 sm:text-base"
                    aria-hidden="true"
                  >
                    {initialsOf(p.name)}
                  </span>
                  <span className="min-w-0 truncate text-sm font-semibold text-white sm:text-base">
                    {p.name}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </Section>
  );
}

const TEAM_COLOURS = ["#c8102e", "#1f6fd1", "#e8b234", "#2ec4b6", "#7c5cff", "#f97316", "#16a34a", "#ec4899", "#0ea5e9", "#a16207"];

const LIGHT_COLOURS = new Set(["#e8b234", "#2ec4b6", "#0ea5e9"]);

function Squads({ squads }) {
  const teams = (squads?.teams ?? []).filter((tm) => tm.captain);
  if (!teams.length || !teams.some((tm) => tm.players.length)) return null;
  const final = squads.status === "Final";
  return (
    <section className="relative overflow-hidden border-b border-white/[0.07] py-14 sm:py-20">
      {/* Floodlit outfield */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 0%, rgba(246,237,211,0.18), transparent 70%), repeating-linear-gradient(90deg, #0f2e1c 0 90px, #123521 90px 180px)",
        }}
        aria-hidden="true"
      />
      <Container className="relative">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#e8b234]">
              {final ? "After the auction" : "Auction in progress"}
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold uppercase tracking-wide text-[#f6edd3] sm:text-5xl">
              {final ? "The teams" : "Squads so far"}
            </h2>
            <p className="mt-3 max-w-xl text-[15px] leading-7 text-[#f6edd3]/75">
              {final
                ? "Every captain's squad from the player auction."
                : "Squads fill up live as players are sold in the auction."}
            </p>
          </div>
          <span
            className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-widest ${
              final ? "bg-[#e8b234] text-[#14100a]" : "bg-[#c8102e] text-white"
            }`}
          >
            {!final && <span className="h-2 w-2 animate-pulse rounded-full bg-white" aria-hidden="true" />}
            {final ? "Final squads" : "Live"}
          </span>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((tm, i) => {
            const colour = TEAM_COLOURS[i % TEAM_COLOURS.length];
            return (
              <div
                key={`${tm.captain}-${i}`}
                className="overflow-hidden rounded-2xl bg-[#f6edd3] text-[#1b1a14] shadow-[0_18px_50px_rgba(0,0,0,0.35)]"
              >
                <div className="h-2" style={{ background: colour }} aria-hidden="true" />
                <div className="p-5">
                  <div className="flex items-baseline justify-between border-b-2 border-[#1b1a14]/80 pb-2">
                    <p className="font-display text-xl font-bold uppercase tracking-[0.15em]">Team {i + 1}</p>
                    <p className="font-mono text-[11px] uppercase tracking-widest text-[#1b1a14]/55">
                      {tm.players.length + 1} players
                    </p>
                  </div>
                  <ol className="mt-2">
                    <li className="flex items-center gap-3 border-b border-[#1b1a14]/10 py-2">
                      <span className="w-5 font-mono text-xs text-[#1b1a14]/40">1</span>
                      <span className="flex-1 font-display text-lg font-bold uppercase tracking-wide">{tm.captain}</span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                        style={{ background: colour, color: LIGHT_COLOURS.has(colour) ? "#14100a" : "#fff" }}
                      >
                        Captain
                      </span>
                    </li>
                    {tm.players.map((p, j) => (
                      <li key={`${p}-${j}`} className="flex items-center gap-3 border-b border-[#1b1a14]/10 py-2 last:border-0">
                        <span className="w-5 font-mono text-xs text-[#1b1a14]/40">{j + 2}</span>
                        <span className="flex-1 text-[15px] font-medium">{p}</span>
                      </li>
                    ))}
                    {!tm.players.length && (
                      <li className="py-2 text-sm text-[#1b1a14]/45">No players bought yet</li>
                    )}
                  </ol>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

function SignupForm({ onSignedUp, onSaved }) {
  const [previous, setPrevious] = useState(readSignedUp);
  const { values, errors, setErrors, setField, status, setStatus, reset } = useForm({
    name: "",
    email: "",
    phone: "",
    role: "",
    captain: "",
    date: "",
    notes: "",
    website: "",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (status === "submitting") return;
    const next = {};
    if (!values.name.trim()) next.name = "Name is required.";
    if (!values.email.trim()) next.email = "Email is required.";
    else if (!isEmail(values.email)) next.email = "Enter a valid email address.";
    if (!values.phone.trim()) next.phone = "Phone number is required.";
    else if (digitCount(values.phone) < 10) next.phone = "Enter a valid 10-digit number.";
    if (!values.role) next.role = "Please select a role.";
    if (!values.captain) next.captain = "Please choose Yes or No.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const fields = {
      Name: values.name,
      Email: values.email,
      Phone: values.phone,
      Role: values.role,
      "Captain nomination": values.captain,
      "Available on": values.date || "Either day",
      Notes: values.notes,
    };

    const sendByEmail = () => {
      window.location.href = mailtoLink({
        to: club.email,
        subject: `${t.shortName} sign-up — ${values.name}`,
        fields: { ...fields, Notes: values.notes ? `\n${values.notes}` : "" },
      });
    };

    if (!googleSheetEndpoint) {
      sendByEmail();
      setStatus("emailed");
      return;
    }

    // Google takes 2–3 s to save, so confirm straight away and let the save
    // finish in the background. If it fails, fall back to email.
    setStatus("success");
    onSignedUp?.(values.captain === "Yes");
    try {
      localStorage.setItem(signedUpKey, JSON.stringify({ name: values.name }));
    } catch {
      /* storage unavailable */
    }
    try {
      await submitToSheet({
        endpoint: googleSheetEndpoint,
        sheet: `${t.shortName} ${t.year}`,
        fields,
        website: values.website,
      });
      // The Sheet skips duplicates, so replace the instant +1 with the real count.
      onSaved?.();
    } catch {
      sendByEmail();
      setStatus("emailed");
    }
  };

  if (previous && status === "idle") {
    return (
      <div className="rounded-2xl border border-gold-400/30 bg-gold-400/[0.06] p-8 text-center">
        <p className="text-3xl text-gold-400" aria-hidden="true">
          ✓
        </p>
        <h3 className="mt-3 font-display text-2xl font-bold uppercase tracking-wide text-white">
          You're already signed up
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
          {previous.name ? `${previous.name.split(" ")[0]}, your` : "Your"} name is in the
          pool. No need to sign up again.
        </p>
        <button
          type="button"
          onClick={() => setPrevious(null)}
          className="btn-ghost mt-6"
        >
          Sign up someone else
        </button>
      </div>
    );
  }

  if (status === "success") {
    return (
      <SuccessPanel
        title="You're signed up"
        text={`Thanks ${values.name.split(" ")[0]} — your name is in the pool. The organisers will share teams, captains and the auction time in the club group.`}
        onReset={reset}
      />
    );
  }

  if (status === "emailed") {
    return (
      <SuccessPanel
        title="Sign-up ready to send"
        text={`Your email app should have opened with your details pre-filled for ${club.email}. Send it to confirm your spot.`}
        onReset={reset}
      />
    );
  }

  return (
    <>
      <p className="eyebrow">Sign up</p>
      <h2 className="headline mt-3 text-3xl">Put your name in the pool</h2>
      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
        <Field label="Full name" error={errors.name} required>
          <TextInput
            type="text"
            autoComplete="name"
            value={values.name}
            error={errors.name}
            maxLength={80}
            onChange={(e) => setField("name", e.target.value)}
            placeholder="Your full name"
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Email" error={errors.email} required>
            <TextInput
              type="email"
              autoComplete="email"
              value={values.email}
              error={errors.email}
              maxLength={120}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="you@example.com"
            />
          </Field>
          <Field label="Phone" error={errors.phone} required>
            <TextInput
              type="tel"
              autoComplete="tel"
              value={values.phone}
              error={errors.phone}
              maxLength={30}
              onChange={(e) => setField("phone", e.target.value)}
              placeholder="Best number"
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Playing role" error={errors.role} required>
            <Select
              value={values.role}
              error={errors.role}
              onChange={(e) => setField("role", e.target.value)}
            >
              <option value="" className="bg-ink-900">
                Select a role
              </option>
              {[...roles, "Wicket Keeper"].map((role) => (
                <option key={role} value={role} className="bg-ink-900">
                  {role}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Available on" hint="optional">
            <Select value={values.date} onChange={(e) => setField("date", e.target.value)}>
              <option value="" className="bg-ink-900">
                Either day
              </option>
              {t.dateOptions
                .filter((d) => d !== "Either day")
                .map((d) => (
                  <option key={d} value={d} className="bg-ink-900">
                    {d}
                  </option>
                ))}
            </Select>
          </Field>
        </div>

        <div>
          <span className="mb-2 flex items-baseline gap-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            Nominate yourself as captain?
            <span className="text-gold-400">*</span>
          </span>
          <ToggleGroup
            name="Captain nomination"
            value={values.captain}
            error={errors.captain}
            onChange={(v) => setField("captain", v)}
          />
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Captains are drawn by lottery from everyone who says Yes.
          </p>
          {errors.captain && (
            <span className="mt-1.5 block text-xs text-red-400">{errors.captain}</span>
          )}
        </div>

        <Field label="Anything else?" hint="optional">
          <TextArea
            rows={3}
            value={values.notes}
            maxLength={500}
            onChange={(e) => setField("notes", e.target.value)}
            placeholder="Timing constraints, questions for the organisers…"
          />
        </Field>

        {/* Spam trap — hidden from people, filled in by bots */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
          value={values.website}
          onChange={(e) => setField("website", e.target.value)}
        />

        <button
          type="submit"
          className="btn-primary w-full disabled:cursor-wait disabled:opacity-60"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Signing you up…" : "Sign up for the tournament"}
        </button>
        {!googleSheetEndpoint && (
          <p className="text-center text-xs leading-6 text-slate-600">
            This opens your email app with your details pre-filled.
          </p>
        )}
      </form>
    </>
  );
}

export default function InternalTournamentPage() {
  const { counts, loading, addOne, refresh } = useSignupCounts(`${t.shortName} ${t.year}`);

  return (
    <>
      {/* Hero with the sign-up form up top */}
      <header className="relative overflow-hidden border-b border-white/[0.07] bg-ink-900">
        <div className="absolute inset-0 bg-field-glow" aria-hidden="true" />
        <div className="diag-stripes absolute inset-0 opacity-60" aria-hidden="true" />
        <Container className="relative py-10 sm:py-14">
          <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,30rem)] lg:gap-10">
            {/* Title + live count */}
            <div className="lg:col-start-1 lg:row-start-1">
              <p className="eyebrow animate-fade-up">
                Club event · {t.dateLabel}
              </p>
              <h1 className="headline mt-4 animate-fade-up text-5xl sm:text-6xl">
                {t.name}
              </h1>
              <p className="mt-5 max-w-xl animate-fade-up text-base leading-7 text-slate-400">
                A one-day, club-only T7 tournament. Sign up, nominate yourself for captain,
                and get picked in the player auction.
              </p>
              <div className="mt-6 max-w-xl">
                <LiveCount counts={counts} loading={loading} />
              </div>
            </div>

            {/* Sign-up form */}
            <div
              id="signup"
              className="h-fit rounded-2xl border border-gold-400/20 bg-ink-950 p-6 shadow-2xl shadow-black/40 sm:p-8 lg:col-start-2 lg:row-span-2 lg:row-start-1"
            >
              <SignupForm onSignedUp={addOne} onSaved={refresh} />
            </div>

            {/* Key facts */}
            <div className="lg:col-start-1 lg:row-start-2">
              <dl className="grid max-w-xl grid-cols-2 gap-3">
                {[
                  { value: "Oct 31", label: "Date", note: `or Sun Nov 1 · ${t.dateNote.toLowerCase()}` },
                  { value: t.format, label: "Format", note: "7 overs a side" },
                  {
                    value: t.playersPerTeam,
                    label: "Players per team",
                    note: `Captain + ${t.playersToBuy} bought`,
                  },
                  { value: t.captainPoints, label: "Auction points", note: "Per captain" },
                ].map((fact) => (
                  <div
                    key={fact.label}
                    className="rounded-xl border border-white/[0.08] bg-ink-950/70 p-4"
                  >
                    <dt className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                      {fact.label}
                    </dt>
                    <dd className="mt-2 font-display text-3xl font-bold leading-none text-white">
                      {fact.value}
                    </dd>
                    <p className="mt-2 text-xs leading-5 text-slate-500">{fact.note}</p>
                  </div>
                ))}
              </dl>
              <a
                href="#how-it-works"
                onClick={(event) => {
                  event.preventDefault();
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-gold-300 transition hover:text-gold-200"
              >
                How teams & the auction work <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
        </Container>
      </header>

      <Squads squads={counts?.squads} />

      <PlayerPool players={counts?.players ?? null} loading={loading} />

      {/* How it works */}
      <Section id="how-it-works">
        <Container>
          <SectionHeading
            eyebrow="How it works"
            title="From sign-up to squads"
            lead="Teams are built fresh for the day, so everyone gets a fair shot and new team-mates."
          />
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tournamentSteps.map((step, index) => (
              <li
                key={step.title}
                className="rounded-2xl border border-white/[0.08] bg-ink-900 p-7"
              >
                <p className="font-display text-5xl font-bold leading-none text-gold-400/80">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-5 font-display text-xl font-bold uppercase tracking-wide text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{step.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* Auction */}
      <Section className="border-y border-white/[0.07] bg-ink-900/60">
        <Container>
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-2xl border border-white/[0.08] bg-ink-950 p-8 sm:p-10">
              <p className="eyebrow">Auction rules</p>
              <h2 className="headline mt-3 text-3xl sm:text-4xl">How the auction runs</h2>
              <ul className="mt-8 space-y-4">
                {auctionRules.map((rule) => (
                  <li key={rule} className="flex gap-3 text-[15px] leading-7 text-slate-300">
                    <span
                      className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400"
                      aria-hidden="true"
                    />
                    {rule}
                  </li>
                ))}
              </ul>

              <div className="mt-10 rounded-xl border border-white/[0.07] bg-ink-900 p-6">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  The clock on each player
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-sm">
                  <span className="rounded-lg bg-gold-400/15 px-3 py-2 text-gold-300">
                    {t.auctionClock}
                  </span>
                  {Array.from({ length: t.maxExtensions }, (_, i) => (
                    <span key={i} className="flex items-center gap-2">
                      <span className="text-slate-600" aria-hidden="true">
                        +
                      </span>
                      <span className="rounded-lg border border-dashed border-white/15 px-3 py-2 text-slate-400">
                        {t.extension}
                      </span>
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-5 text-slate-500">
                  Each extension only happens if someone bids in the {t.lateBidWindow}. Longest
                  possible bidding on one player: 3 min.
                </p>
                <Link
                  to="/captain-draw"
                  className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold-300 hover:text-gold-200"
                >
                  Organisers: open the captain draw board →
                </Link>
                <Link
                  to="/auction"
                  className="mt-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold-300 hover:text-gold-200"
                >
                  Organisers: open the player auction board →
                </Link>
              </div>
            </div>

            <TeamEstimator />
          </div>
        </Container>
      </Section>

    </>
  );
}
