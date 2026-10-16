import { Link } from "react-router-dom";
import { cx } from "../../lib/cx";

/* ------------------------------------------------------------------ */
/* Layout primitives                                                    */
/* ------------------------------------------------------------------ */

export function Container({ className, children }) {
  return (
    <div className={cx("mx-auto w-full max-w-6xl px-5 sm:px-8", className)}>
      {children}
    </div>
  );
}

export function Section({ className, children, id }) {
  return (
    <section id={id} className={cx("py-16 sm:py-20 lg:py-24", className)}>
      {children}
    </section>
  );
}

/** Page header used at the top of every inner page. */
export function PageHeader({ eyebrow, title, lead, children }) {
  return (
    <header className="relative overflow-hidden border-b border-white/[0.07] bg-ink-900">
      <div className="absolute inset-0 bg-field-glow" aria-hidden="true" />
      <div className="diag-stripes absolute inset-0 opacity-60" aria-hidden="true" />
      <Container className="relative py-14 sm:py-20">
        <p className="eyebrow animate-fade-up">{eyebrow}</p>
        <h1 className="headline mt-4 animate-fade-up text-5xl sm:text-6xl lg:text-7xl">
          {title}
        </h1>
        {lead && (
          <p className="mt-6 max-w-2xl animate-fade-up text-base leading-7 text-slate-400 sm:text-lg">
            {lead}
          </p>
        )}
        {children && <div className="mt-8 animate-fade-up">{children}</div>}
      </Container>
    </header>
  );
}

/** Smaller heading used for sections inside a page. */
export function SectionHeading({ eyebrow, title, lead, action, className }) {
  return (
    <div
      className={cx(
        "flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="headline mt-3 text-3xl sm:text-4xl lg:text-5xl">{title}</h2>
        {lead && <p className="mt-4 text-[15px] leading-7 text-slate-400">{lead}</p>}
      </div>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Atoms                                                                */
/* ------------------------------------------------------------------ */

export function Badge({ children, accent, className }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-widest",
        className
      )}
      style={
        accent
          ? {
              borderColor: `${accent}55`,
              backgroundColor: `${accent}1f`,
              color: accent,
            }
          : undefined
      }
    >
      {children}
    </span>
  );
}

/** Big number tile — the backbone of the broadcast look. */
export function StatTile({ value, label, note, accent = "#e8b234" }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900 p-6 transition duration-300 hover:border-white/20">
      <div
        className="absolute inset-x-0 top-0 h-[2px] opacity-70"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
        aria-hidden="true"
      />
      <p className="font-display text-5xl font-bold leading-none text-white sm:text-6xl">
        {value}
      </p>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-ultra text-slate-500">
        {label}
      </p>
      {note && <p className="mt-2 text-sm text-slate-500">{note}</p>}
    </div>
  );
}

export function ArrowLink({ to, href, children, className }) {
  const content = (
    <>
      {children}
      <span
        aria-hidden="true"
        className="transition-transform duration-200 group-hover/link:translate-x-1"
      >
        →
      </span>
    </>
  );
  const classes = cx(
    "group/link inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-gold-300 transition hover:text-gold-200",
    className
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={classes}>
        {content}
      </a>
    );
  }
  return (
    <Link to={to} className={classes}>
      {content}
    </Link>
  );
}

/** Empty / not-yet-recorded placeholder. */
export function EmptyState({ title, text, icon = "◇" }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
      <p className="text-2xl text-gold-400/70" aria-hidden="true">
        {icon}
      </p>
      <p className="mt-3 font-display text-2xl font-semibold uppercase tracking-wide text-white">
        {title}
      </p>
      {text && (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{text}</p>
      )}
    </div>
  );
}

/** Horizontal-scrolling stats table with a sticky first column. */
export function DataTable({ columns, rows, caption }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900">
      {caption && (
        <div className="border-b border-white/[0.08] px-6 py-5">
          <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
            {caption}
          </h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead>
            <tr className="bg-white/[0.03]">
              {columns.map((column, index) => (
                <th
                  key={column}
                  scope="col"
                  className={cx(
                    "whitespace-nowrap px-5 py-3.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-slate-400",
                    index === 0 && "sticky left-0 z-10 bg-ink-850"
                  )}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-t border-white/[0.06] transition hover:bg-white/[0.03]"
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={cx(
                      "whitespace-nowrap px-5 py-4 font-mono text-sm",
                      cellIndex === 0
                        ? "sticky left-0 z-10 bg-ink-900 font-semibold text-white"
                        : "text-slate-300"
                    )}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Label + value row used on profile/overview panels. */
export function DetailRow({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-white/[0.06] py-3 last:border-0">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        {label}
      </span>
      <span className="text-right text-sm font-medium text-white">{value ?? "—"}</span>
    </div>
  );
}
