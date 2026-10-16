import { cx } from "../lib/cx";

export function Field({ label, error, children, hint, required }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-baseline gap-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
        {label}
        {required && <span className="text-gold-400">*</span>}
        {hint && <span className="normal-case tracking-normal text-slate-600">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-1.5 block text-xs text-red-400">{error}</span>}
    </label>
  );
}

export function TextInput({ error, className, ...rest }) {
  return <input className={cx("field", error && "field-error", className)} {...rest} />;
}

export function TextArea({ error, className, ...rest }) {
  return (
    <textarea className={cx("field resize-y", error && "field-error", className)} {...rest} />
  );
}

export function Select({ error, className, children, ...rest }) {
  return (
    <select className={cx("field appearance-none", error && "field-error", className)} {...rest}>
      {children}
    </select>
  );
}

/** Yes / No segmented control used throughout the leadership form. */
export function ToggleGroup({ value, onChange, options = ["Yes", "No"], error, name }) {
  return (
    <div
      role="radiogroup"
      aria-label={name}
      className={cx(
        "inline-flex rounded-xl border p-1",
        error ? "border-red-500/60 bg-red-500/[0.07]" : "border-white/10 bg-white/[0.03]"
      )}
    >
      {options.map((option) => {
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option)}
            className={cx(
              "rounded-lg px-6 py-2 text-sm font-semibold uppercase tracking-widest transition",
              active
                ? "bg-gold-400 text-ink-950"
                : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

export function SuccessPanel({ title, text, onReset }) {
  return (
    <div className="rounded-2xl border border-gold-400/30 bg-gold-400/[0.06] p-8 text-center">
      <p className="text-3xl text-gold-400" aria-hidden="true">
        ✓
      </p>
      <h3 className="mt-3 font-display text-2xl font-bold uppercase tracking-wide text-white">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">{text}</p>
      {onReset && (
        <button type="button" onClick={onReset} className="btn-ghost mt-6">
          Send another
        </button>
      )}
    </div>
  );
}

