import { useState, useEffect, useCallback } from "react";

export interface HistoryEntry {
    slug: string;
    name: string;
    href: string;
    timestamp: number;
}

const STORAGE_KEY = "privatools_history";
const MAX_ENTRIES = 20;

function loadHistory(): HistoryEntry[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const entries = JSON.parse(raw) as HistoryEntry[];
        return entries.filter(e => e.slug && e.name && e.href && e.timestamp);
    } catch {
        return [];
    }
}

function saveHistory(entries: HistoryEntry[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
    } catch {
        // localStorage full or unavailable
    }
}

export function useHistory() {
    const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);

    // Sync across tabs
    useEffect(() => {
        const handler = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) setHistory(loadHistory());
        };
        window.addEventListener("storage", handler);
        return () => window.removeEventListener("storage", handler);
    }, []);

    const addEntry = useCallback((entry: Omit<HistoryEntry, "timestamp">) => {
        setHistory(prev => {
            // De-dupe by slug. If the existing entry is < 10s old, skip the
            // re-render entirely — useEffect-driven addEntry calls (page mount,
            // hot-reload, navigation back) shouldn't churn localStorage every
            // time. We still bump the timestamp for older revisits.
            const existing = prev.find(e => e.slug === entry.slug);
            if (existing && Date.now() - existing.timestamp < 10_000) {
                return prev;
            }
            const filtered = prev.filter(e => e.slug !== entry.slug);
            const updated = [{ ...entry, timestamp: Date.now() }, ...filtered].slice(0, MAX_ENTRIES);
            saveHistory(updated);
            return updated;
        });
    }, []);

    const removeEntry = useCallback((slug: string) => {
        setHistory(prev => {
            const updated = prev.filter(e => e.slug !== slug);
            saveHistory(updated);
            return updated;
        });
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
        try { localStorage.removeItem(STORAGE_KEY); } catch { /* */ }
    }, []);

    return { history, addEntry, removeEntry, clearHistory };
}

/**
 * Format a timestamp as "just now", "10 min ago", "2 hr ago", "Mar 5".
 * Resolution is intentionally coarse — sidebar entries don't need second-level
 * precision and refreshing every second would be wasteful.
 */
export function formatRelativeTime(ts: number, now: number = Date.now()): string {
    const seconds = Math.max(0, Math.floor((now - ts) / 1000));
    if (seconds < 30) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    // Older than a week → just show the date
    return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
