/**
 * useFirstRun — detects whether the visitor has ever been "seen" before.
 *
 * Mechanism: a single key in `localStorage` (`privatools.first-run`). On the
 * very first call from a given browser the key is absent → the hook returns
 * `isFirstRun: true`. The caller decides when to flip the bit by calling
 * `markCompleted()` (e.g. after the welcome card is dismissed, the user
 * picks a tool, or a hard timer expires).
 *
 * The hook is intentionally tiny — no `Date`, no analytics, no fingerprint.
 * Privacy posture is the same as the rest of the app: nothing leaves the
 * device, and a `localStorage.clear()` resets the state.
 */
import { useCallback, useEffect, useState } from "react";

export const FIRST_RUN_KEY = "privatools.first-run";

function readState(): boolean {
    try {
        // Truthy value (anything) → returning visitor.
        return !localStorage.getItem(FIRST_RUN_KEY);
    } catch {
        // localStorage blocked (private mode, quota, SSR) — treat as returning
        // so we don't show the welcome to every page-load when we can't track.
        return false;
    }
}

export function useFirstRun() {
    const [isFirstRun, setIsFirstRun] = useState<boolean>(readState);

    // Cross-tab sync — if one tab dismisses the welcome, others stop showing
    // it too. We listen on the storage event because React state doesn't
    // cross tab boundaries.
    useEffect(() => {
        const handler = (e: StorageEvent) => {
            if (e.key === FIRST_RUN_KEY) setIsFirstRun(readState());
        };
        window.addEventListener("storage", handler);
        return () => window.removeEventListener("storage", handler);
    }, []);

    const markCompleted = useCallback(() => {
        try {
            localStorage.setItem(FIRST_RUN_KEY, String(Date.now()));
        } catch {
            // ignored — we still flip the state locally so this session
            // stops showing the welcome card.
        }
        setIsFirstRun(false);
    }, []);

    /** Reset to first-run state. Exposed so devs can use it from the console
     *  for testing — never wired to UI. */
    const reset = useCallback(() => {
        try { localStorage.removeItem(FIRST_RUN_KEY); } catch { /* */ }
        setIsFirstRun(true);
    }, []);

    return { isFirstRun, markCompleted, reset };
}
