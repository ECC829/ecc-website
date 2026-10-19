import { useEffect, useRef, useState } from "react";

const FLAP_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Split-flap ("stadium board") text. When `text` changes, every tile cycles
 * through random letters and settles left to right, then calls onSettled.
 */
export function SplitFlap({ text, onSettled, size = "lg" }) {
  const target = (text || "").toUpperCase();
  const [shown, setShown] = useState(target);
  const settledRef = useRef(onSettled);
  useEffect(() => {
    settledRef.current = onSettled;
  }, [onSettled]);

  useEffect(() => {
    if (!target) return undefined;
    const start = performance.now();
    const perTile = 70; // stagger between tiles
    const base = 650; // how long the first tile flips
    let frame;
    let last = 0;
    const step = (now) => {
      const elapsed = now - start;
      if (now - last > 55) {
        last = now;
        let allDone = true;
        const next = target
          .split("")
          .map((ch, i) => {
            if (ch === " " || elapsed > base + i * perTile) return ch;
            allDone = false;
            return FLAP_CHARS[Math.floor(Math.random() * FLAP_CHARS.length)];
          })
          .join("");
        setShown(next);
        if (allDone) {
          settledRef.current?.();
          return;
        }
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  const words = (target ? shown : "").split(" ");
  const tile =
    size === "lg"
      ? "h-[clamp(2.6rem,7vw,5.5rem)] w-[clamp(1.9rem,5vw,4rem)] text-[clamp(1.7rem,4.6vw,3.8rem)]"
      : "h-8 w-6 text-lg";

  return (
    <span className="inline-flex flex-wrap justify-center gap-x-[clamp(0.6rem,2vw,1.5rem)] gap-y-3" aria-label={text}>
      {words.map((word, w) => (
        <span key={w} className="inline-flex gap-[3px] sm:gap-1" aria-hidden="true">
          {word.split("").map((ch, i) => (
            <span
              key={i}
              className={`relative inline-flex items-center justify-center overflow-hidden rounded-[6px] bg-[#141414] font-display font-bold leading-none text-[#f6edd3] shadow-[inset_0_-2px_0_rgba(0,0,0,0.6),0_2px_6px_rgba(0,0,0,0.5)] ${tile}`}
            >
              {ch}
              <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-black/70" />
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}

/** A spinning red cricket ball with a stitched seam. */
export function CricketBall({ spinning, size = 96 }) {
  return (
    <span
      className={`relative inline-block rounded-full ${spinning ? "animate-[spin_0.45s_linear_infinite]" : ""}`}
      style={{
        width: size,
        height: size,
        background:
          "radial-gradient(circle at 32% 28%, #ff7a6b 0%, #c8102e 38%, #7a0a1b 78%, #4a0610 100%)",
        boxShadow: "0 10px 30px rgba(200,16,46,0.35), inset -6px -8px 18px rgba(0,0,0,0.45)",
      }}
      aria-hidden="true"
    >
      <span
        className="absolute inset-y-[6%] left-1/2 w-[18%] -translate-x-1/2 rounded-full border-x-2 border-dashed border-[#f6edd3]/80"
        style={{ borderTop: 0, borderBottom: 0 }}
      />
    </span>
  );
}

const CONFETTI_COLOURS = ["#e8b234", "#f6edd3", "#c8102e", "#2ec4b6", "#ffffff"];

/** One-shot confetti burst; remount (change `key`) to fire again. */
export function Confetti({ count = 70 }) {
  const [pieces] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.25,
      duration: 1.6 + Math.random() * 1.4,
      drift: (Math.random() - 0.5) * 220,
      rotate: Math.random() * 720 - 360,
      size: 6 + Math.random() * 8,
      colour: CONFETTI_COLOURS[i % CONFETTI_COLOURS.length],
      round: Math.random() > 0.6,
    }))
  );
  return (
    <span className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 block"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 0.45,
            background: p.colour,
            borderRadius: p.round ? "999px" : "2px",
            animation: `ecc-confetti ${p.duration}s ${p.delay}s cubic-bezier(.2,.6,.4,1) forwards`,
            "--drift": `${p.drift}px`,
            "--rot": `${p.rotate}deg`,
          }}
        />
      ))}
    </span>
  );
}
