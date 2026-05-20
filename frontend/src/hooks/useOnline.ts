/**
 * useOnline — track network connectivity.
 *
 * Returns `true` when the browser believes it's online, `false` otherwise.
 * Reads `navigator.onLine` at mount, then listens for "online" / "offline"
 * window events. Initialised optimistically (true) on the server / non-browser
 * environments so SSR doesn't render an "offline" banner.
 *
 * Note: `navigator.onLine` is famously unreliable — it tells you the OS
 * thinks the network is up, not that any actual server is reachable. Pair
 * with the backend ping (BackendStatusBanner) for a stronger signal.
 */
import { useEffect, useState } from "react";

export function useOnline(): boolean {
    const [online, setOnline] = useState<boolean>(() => {
        if (typeof navigator === "undefined") return true;
        // navigator.onLine is `true` by default if the property isn't supported
        return navigator.onLine !== false;
    });

    useEffect(() => {
        if (typeof window === "undefined") return;
        const handleOnline = () => setOnline(true);
        const handleOffline = () => setOnline(false);
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        // Re-check on mount in case state changed before the listener attached.
        setOnline(navigator.onLine !== false);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    return online;
}
