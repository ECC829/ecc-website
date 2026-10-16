import { useCallback, useEffect, useState } from "react";
import { Container, PageHeader, Section } from "../components/ui";
import { achievements, captionOf, photoUrl } from "../data/achievements";

function Lightbox({ index, onClose, onStep }) {
  const item = achievements[index];

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onStep(1);
      if (event.key === "ArrowLeft") onStep(-1);
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose, onStep]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={captionOf(item) || "Trophy photo"}
      className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <span className="font-mono text-[11px] uppercase tracking-widest text-slate-400">
          {index + 1} / {achievements.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-white transition hover:border-gold-400/60"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16">
        <img
          key={item.id}
          src={photoUrl(item.id)}
          alt={captionOf(item) || "ECC trophy photo"}
          className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        />
        {[
          { dir: -1, label: "Previous photo", icon: "‹", side: "left-2 sm:left-4" },
          { dir: 1, label: "Next photo", icon: "›", side: "right-2 sm:right-4" },
        ].map((btn) => (
          <button
            key={btn.dir}
            type="button"
            aria-label={btn.label}
            onClick={(event) => {
              event.stopPropagation();
              onStep(btn.dir);
            }}
            className={`absolute top-1/2 ${btn.side} flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-2xl text-white transition hover:border-gold-400/60`}
          >
            {btn.icon}
          </button>
        ))}
      </div>

      <div className="px-4 pb-6 pt-4 text-center sm:px-6" onClick={(e) => e.stopPropagation()}>
        {item.result && (
          <p className="font-mono text-[11px] uppercase tracking-widest text-gold-300">
            {item.result}
          </p>
        )}
        <p className="mt-1 font-display text-xl font-bold uppercase tracking-wide text-white sm:text-2xl">
          {item.tournament || "ECC trophy win"}
        </p>
        {(item.team || item.year) && (
          <p className="mt-1 text-sm text-slate-400">
            {[item.team, item.year].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}

export default function AchievementsPage() {
  const [open, setOpen] = useState(null);
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (dir) => setOpen((i) => (i + dir + achievements.length) % achievements.length),
    []
  );

  return (
    <>
      <PageHeader
        eyebrow="Trophy cabinet"
        title="Our achievements"
        lead="Titles, finals and trophy nights from ECC sides across Central Ohio. Tap any photo to see it full size."
      />

      <Section>
        <Container>
          <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {achievements.map((item, index) => (
              <li key={item.id} className="mb-4 break-inside-avoid">
                <button
                  type="button"
                  onClick={() => setOpen(index)}
                  className="group relative block w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900 text-left transition hover:border-gold-400/40"
                >
                  <img
                    src={photoUrl(item.id, "small")}
                    alt={captionOf(item) || "ECC trophy photo"}
                    width={item.width}
                    height={item.height}
                    loading="lazy"
                    decoding="async"
                    className="block h-auto w-full transition duration-500 group-hover:scale-[1.03]"
                  />
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-12">
                    {item.result && (
                      <span className="inline-block rounded-full border border-gold-400/50 bg-gold-400/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-gold-300">
                        {item.result}
                      </span>
                    )}
                    {(item.tournament || item.team || item.year) && (
                      <span className="mt-2 block font-display text-lg font-bold uppercase leading-tight tracking-wide text-white">
                        {item.tournament || item.team}
                      </span>
                    )}
                    {item.tournament && (item.team || item.year) && (
                      <span className="mt-0.5 block text-xs text-slate-300">
                        {[item.team, item.year].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {open !== null && <Lightbox index={open} onClose={close} onStep={step} />}
    </>
  );
}
