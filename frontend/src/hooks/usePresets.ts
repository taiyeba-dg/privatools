import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "privatools_presets";

export interface Preset {
    id: string;
    name: string;
    tools: string[]; // Array of tool slugs
    createdAt: number;
}

function loadPresets(): Preset[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

export function usePresets() {
    const [presets, setPresets] = useState<Preset[]>(loadPresets);

    useEffect(() => {
        const handler = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) setPresets(loadPresets());
        };
        window.addEventListener("storage", handler);
        return () => window.removeEventListener("storage", handler);
    }, []);

    const save = useCallback((name: string, tools: string[]) => {
        const preset: Preset = {
            id: Math.random().toString(36).slice(2),
            name,
            tools,
            createdAt: Date.now(),
        };
        setPresets(prev => {
            const next = [...prev, preset].slice(-20); // Max 20 presets
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
        return preset;
    }, []);

    const remove = useCallback((id: string) => {
        setPresets(prev => {
            const next = prev.filter(p => p.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    return { presets, save, remove };
}
