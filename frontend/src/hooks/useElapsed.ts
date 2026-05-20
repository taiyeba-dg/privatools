import { useEffect, useRef, useState } from "react";

/**
 * `useElapsed(active, opts)` — small RAF-throttled timer that returns a
 * human-friendly elapsed string ("0.4s", "12.7s", "1m 04s") while `active`
 * is true. Resets to 0 the moment `active` flips back to false.
 *
 * Designed for long-running tool jobs where a stationary `Loader2` doesn't
 * tell users anything is happening. Pair with text like
 *   `Processing… <span className="tabular-nums">{elapsed}</span>`
 *
 * Updates every ~120ms (well below RAF cadence) — cheap enough to drop into
 * every tool UI without measurable CPU cost, but slow enough that the
 * numbers don't flicker.
 *
 * Honors `prefers-reduced-motion: reduce` by stopping at 1 fps when the
 * user has motion preferences set — the counter still updates so users
 * know work is happening, just less twitchy.
 */
export function useElapsed(active: boolean): string {
  const [elapsed, setElapsed] = useState("0.0s");
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  useEffect(() => {
    if (!active) {
      // Reset on transition to inactive so the next run starts at 0.
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      startRef.current = null;
      lastTickRef.current = 0;
      setElapsed("0.0s");
      return;
    }

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const tickInterval = reduce ? 1000 : 120;

    startRef.current = performance.now();

    const tick = (now: number) => {
      if (startRef.current === null) return;
      if (now - lastTickRef.current >= tickInterval) {
        lastTickRef.current = now;
        const ms = now - startRef.current;
        setElapsed(format(ms));
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [active]);

  return elapsed;
}

function format(ms: number): string {
  const totalSeconds = ms / 1000;
  if (totalSeconds < 60) {
    return `${totalSeconds.toFixed(1)}s`;
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds - minutes * 60);
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}
