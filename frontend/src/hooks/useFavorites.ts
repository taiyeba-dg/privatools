import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "privatools_favorites";

function loadFavorites(): string[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

export function useFavorites() {
    const [favorites, setFavorites] = useState<string[]>(loadFavorites);

    useEffect(() => {
        const handler = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) setFavorites(loadFavorites());
        };
        window.addEventListener("storage", handler);
        return () => window.removeEventListener("storage", handler);
    }, []);

    const toggle = useCallback((slug: string) => {
        setFavorites(prev => {
            const next = prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    const isFavorite = useCallback((slug: string) => favorites.includes(slug), [favorites]);

    return { favorites, toggle, isFavorite };
}
