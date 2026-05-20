/**
 * useFormPersist — useState replacement that auto-saves to localStorage.
 *
 *   const [opts, setOpts, { reset, restored }] = useFormPersist("compress", {
 *     level: "recommended",
 *     quality: 75,
 *   });
 *
 * Behaviour:
 *   - On mount, reads the persisted snapshot (if any). If it differs from
 *     defaults, state initialises from the snapshot and `restored` is `true`
 *     for the first render only (a toast or banner can read it).
 *   - On every state change, schedules a debounced write (400ms). This
 *     prevents thrashing localStorage on every keystroke in a controlled
 *     text input.
 *   - `reset()` clears the persisted snapshot AND resets state to defaults.
 *
 * Why a fixed namespace?  Each tool gets a stable string key (e.g. "compress",
 * "bates"). Reusing the same key from two unrelated tools would conflict —
 * pick a unique slug.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { clearPersisted, loadPersisted, savePersisted, shallowEqual } from "@/lib/persistence";

const DEBOUNCE_MS = 400;

export interface UseFormPersistResult<T> {
    /** True iff the initial state was loaded from a non-default persisted snapshot.
     *  Only `true` on the first render after mount; subsequent renders are `false`. */
    restored: boolean;
    /** Drop the persisted snapshot and reset state to defaults. */
    reset: () => void;
    /** Force-write the current state immediately, bypassing the debounce.
     *  Useful in `onbeforeunload` style code paths. */
    flush: () => void;
}

export function useFormPersist<T extends Record<string, unknown>>(
    key: string,
    defaults: T,
): [T, React.Dispatch<React.SetStateAction<T>>, UseFormPersistResult<T>] {
    // Initial load: read snapshot synchronously so we never render the
    // default state and then flicker into the restored values.
    const initialRef = useRef<{ state: T; restored: boolean }>();
    if (!initialRef.current) {
        const stored = loadPersisted<T>(key);
        if (stored && !shallowEqual(stored, defaults)) {
            // Merge to be resilient against added defaults — old snapshots
            // missing newer fields just fall through to the defaults.
            initialRef.current = { state: { ...defaults, ...stored }, restored: true };
        } else {
            initialRef.current = { state: defaults, restored: false };
        }
    }

    const [state, setState] = useState<T>(initialRef.current.state);
    const [restored, setRestored] = useState<boolean>(initialRef.current.restored);

    // After the first render, restored is always false — it's a one-shot
    // signal to consumers that "this mount loaded snapshot data".
    useEffect(() => {
        if (restored) {
            // Schedule on next tick so a parent component can read it once.
            const id = window.setTimeout(() => setRestored(false), 0);
            return () => window.clearTimeout(id);
        }
    }, [restored]);

    // Debounced write
    const writeTimerRef = useRef<number | null>(null);
    const latestStateRef = useRef<T>(state);
    latestStateRef.current = state;

    useEffect(() => {
        if (writeTimerRef.current !== null) window.clearTimeout(writeTimerRef.current);
        writeTimerRef.current = window.setTimeout(() => {
            // Don't write if it matches defaults — keep localStorage clean
            // for users who never customised anything.
            if (shallowEqual(latestStateRef.current as Record<string, unknown>, defaults as Record<string, unknown>)) {
                clearPersisted(key);
            } else {
                savePersisted<T>(key, latestStateRef.current);
            }
            writeTimerRef.current = null;
        }, DEBOUNCE_MS);
        return () => {
            if (writeTimerRef.current !== null) {
                window.clearTimeout(writeTimerRef.current);
                writeTimerRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);

    const reset = useCallback(() => {
        clearPersisted(key);
        setState(defaults);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    const flush = useCallback(() => {
        if (writeTimerRef.current !== null) {
            window.clearTimeout(writeTimerRef.current);
            writeTimerRef.current = null;
        }
        if (!shallowEqual(latestStateRef.current as Record<string, unknown>, defaults as Record<string, unknown>)) {
            savePersisted<T>(key, latestStateRef.current);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    return [state, setState, { restored, reset, flush }];
}
