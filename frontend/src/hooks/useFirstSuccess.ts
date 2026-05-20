/**
 * useFirstSuccess — fires a one-time celebration the first time a user
 * completes a tool job. Subsequent successes are silent.
 *
 * Mechanism: a `localStorage` key (`privatools.first-success`) records the
 * date of the first success. The hook exposes `celebrate()` which:
 *   1. No-ops if the key is already set.
 *   2. Sets the key.
 *   3. Pops a workshop-styled toast.
 *
 * It deliberately stays close to the rest of the UX — no global confetti
 * pop; the accent-pulse animation is owned by each tool's success card,
 * we just add an explicit toast so the moment is felt.
 *
 * Toolside usage:
 *   const { celebrate } = useFirstSuccess();
 *   // …in the success branch:
 *   celebrate("Compress PDF");
 */
import { useCallback } from "react";
import { toast } from "sonner";

export const FIRST_SUCCESS_KEY = "privatools.first-success";

function alreadyCelebrated(): boolean {
    try {
        return !!localStorage.getItem(FIRST_SUCCESS_KEY);
    } catch {
        // Pretend it has happened — we'd rather skip the celebration than
        // hit the user with the same toast on every job.
        return true;
    }
}

export function useFirstSuccess() {
    const celebrate = useCallback((_toolLabel?: string) => {
        if (alreadyCelebrated()) return;
        try { localStorage.setItem(FIRST_SUCCESS_KEY, String(Date.now())); } catch { /* */ }
        // Keep the message centered on the *privacy* claim — that's the
        // entire reason we're celebrating job #1.
        toast.success("First job done", {
            description: "Your file was processed and discarded. Try another tool — nothing is logged.",
            duration: 5500,
        });
    }, []);

    return { celebrate };
}

/** Convenience: tool components can fire this event instead of importing the
 *  hook directly. A single global listener (mounted in App) dispatches the
 *  celebration. We export the event name as a constant so misspellings fail
 *  at typecheck time. */
export const TOOL_SUCCESS_EVENT = "privatools:tool-success";

/** Fire a tool-success event from anywhere. The label is shown in the toast
 *  (currently unused but kept for future analytics-friendly events). */
export function emitToolSuccess(toolLabel?: string) {
    try {
        window.dispatchEvent(new CustomEvent(TOOL_SUCCESS_EVENT, { detail: { tool: toolLabel } }));
    } catch { /* */ }
}
