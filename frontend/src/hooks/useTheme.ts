import { useState, useEffect, useCallback } from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "privatools_theme";

function getInitialTheme(): Theme {
    try {
        const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
        if (stored === "light" || stored === "dark") return stored;
    } catch { }
    // Default to dark
    return "dark";
}

function applyTheme(theme: Theme) {
    const root = document.documentElement;
    if (theme === "light") {
        root.classList.add("light");
    } else {
        root.classList.remove("light");
    }
}

export function useTheme() {
    const [theme, setThemeState] = useState<Theme>(getInitialTheme);

    // Apply on mount
    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const setTheme = useCallback((t: Theme) => {
        setThemeState(t);
        applyTheme(t);
        try {
            localStorage.setItem(STORAGE_KEY, t);
        } catch { }
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(theme === "dark" ? "light" : "dark");
    }, [theme, setTheme]);

    return { theme, setTheme, toggleTheme };
}
