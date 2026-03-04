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
            // Remove duplicate, add to front
            const filtered = prev.filter(e => e.slug !== entry.slug);
            const updated = [{ ...entry, timestamp: Date.now() }, ...filtered].slice(0, MAX_ENTRIES);
            saveHistory(updated);
            return updated;
        });
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    return { history, addEntry, clearHistory };
}
