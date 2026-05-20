/**
 * Service worker registration — production only.
 *
 * Registers /sw.js after the page has loaded so the SW install doesn't
 * fight the critical path on first paint. In dev mode this is a no-op:
 * Vite serves modules through a different transform pipeline that the
 * SW would interfere with, and HMR can't talk through a cached shell.
 *
 * Imported by main.tsx. Safe to call multiple times — the browser
 * dedupes registrations for the same scope/script.
 */
export function registerServiceWorker(): void {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (!import.meta.env.PROD) return;

    // Wait until after the page is interactive so we don't compete with
    // first-paint resources.
    const register = () => {
        navigator.serviceWorker.register("/sw.js").then((reg) => {
            // When a new SW takes over, reload once so the user is on the
            // fresh shell. Avoid infinite loops with the `refreshed` flag.
            let refreshed = false;
            navigator.serviceWorker.addEventListener("controllerchange", () => {
                if (refreshed) return;
                refreshed = true;
                window.location.reload();
            });
            // If a waiting SW exists, ask it to skip waiting so the new
            // version activates on next reload instead of after a tab close.
            if (reg.waiting) reg.waiting.postMessage("SKIP_WAITING");
        }).catch(() => {
            // Swallow — SW failures should never break the app.
        });
    };

    if (document.readyState === "complete") {
        register();
    } else {
        window.addEventListener("load", register, { once: true });
    }
}
