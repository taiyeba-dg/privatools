/**
 * localStorage-backed form-state cache.
 *
 * Tools persist non-trivial config (page ranges, prefixes, font sizes, etc.)
 * so accidental refresh/back-button doesn't wipe a carefully tuned setup.
 *
 * Storage shape: { v: 1, ts: <ms>, data: <T> } — a versioned envelope makes
 * later migrations possible without losing data. `ts` is exposed for callers
 * that want to invalidate stale snapshots (e.g. show "restored from 3 days ago").
 *
 * Keys are namespaced (PERSIST_PREFIX) so a single `clearAll()` from a
 * "reset everything" debug action wipes only our own keys.
 */

const PERSIST_PREFIX = "privatools_form_";
const SCHEMA_VERSION = 1;

interface Envelope<T> {
    v: number;
    ts: number;
    data: T;
}

/** Returns a namespaced storage key. Kept in one place so a future rename
 *  (e.g. adding a per-user prefix) only changes here. */
export function persistKey(key: string): string {
    return PERSIST_PREFIX + key;
}

/** Best-effort localStorage read. Returns `null` if the key is missing,
 *  the envelope is malformed, or the schema version doesn't match. Never
 *  throws — quota / SecurityError on private-browsing is silently swallowed. */
export function loadPersisted<T>(key: string): T | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(persistKey(key));
        if (!raw) return null;
        const env = JSON.parse(raw) as Envelope<T>;
        if (!env || typeof env !== "object" || env.v !== SCHEMA_VERSION) return null;
        return env.data ?? null;
    } catch {
        return null;
    }
}

/** Best-effort localStorage write. Silently no-ops on QuotaExceeded or
 *  SecurityError. We deliberately do NOT surface persistence failures to
 *  the user — the form still works in memory, it just won't survive a
 *  reload. The benefit of saving is asymmetric to the cost of failing. */
export function savePersisted<T>(key: string, data: T): void {
    if (typeof window === "undefined") return;
    try {
        const env: Envelope<T> = { v: SCHEMA_VERSION, ts: Date.now(), data };
        window.localStorage.setItem(persistKey(key), JSON.stringify(env));
    } catch {
        /* quota / privacy mode — give up silently */
    }
}

/** Remove a single persisted form. Used by the per-tool "Reset to defaults" button. */
export function clearPersisted(key: string): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.removeItem(persistKey(key));
    } catch {
        /* swallow */
    }
}

/** Read the saved timestamp for a key (for "restored from X ago" UI),
 *  or null if no envelope is present. */
export function persistedTimestamp(key: string): number | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(persistKey(key));
        if (!raw) return null;
        const env = JSON.parse(raw) as Envelope<unknown>;
        return typeof env?.ts === "number" ? env.ts : null;
    } catch {
        return null;
    }
}

/** Shallow-equal check tuned for our typical form state — flat objects of
 *  primitives. Used to detect "this matches defaults so don't show the
 *  restore toast". Falls back to JSON.stringify equality for safety. */
export function shallowEqual<T extends Record<string, unknown>>(a: T, b: T): boolean {
    if (a === b) return true;
    if (!a || !b) return false;
    const ak = Object.keys(a);
    const bk = Object.keys(b);
    if (ak.length !== bk.length) return false;
    for (const k of ak) {
        if (a[k] !== b[k]) {
            // Slow fallback: compare via JSON for nested values
            try {
                if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) return false;
            } catch {
                return false;
            }
        }
    }
    return true;
}

// ─── Batch / queue persistence ─────────────────────────────────────────────
//
// BatchPage runs a queue of files that can take minutes to complete. If the
// user navigates away or closes the tab mid-run, we lose the queue (Files
// themselves are non-serialisable). We keep a "marker" so on return we can
// surface a "you had a batch in progress" banner and offer to restart.

const BATCH_MARKER_KEY = "privatools_batch_active";

export interface BatchActiveMarker {
    toolSlug: string;
    toolName: string;
    fileCount: number;
    /** Names only — `File` objects can't be serialised. */
    fileNames: string[];
    startedAt: number;
}

export function setBatchActive(marker: BatchActiveMarker): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(BATCH_MARKER_KEY, JSON.stringify(marker));
    } catch { /* swallow */ }
}

export function getBatchActive(): BatchActiveMarker | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(BATCH_MARKER_KEY);
        if (!raw) return null;
        const m = JSON.parse(raw) as BatchActiveMarker;
        // Defensive: only return well-formed markers younger than 24h.
        if (!m || typeof m.toolSlug !== "string" || typeof m.startedAt !== "number") return null;
        if (Date.now() - m.startedAt > 24 * 60 * 60 * 1000) {
            clearBatchActive();
            return null;
        }
        return m;
    } catch {
        return null;
    }
}

export function clearBatchActive(): void {
    if (typeof window === "undefined") return;
    try { window.localStorage.removeItem(BATCH_MARKER_KEY); } catch { /* swallow */ }
}
