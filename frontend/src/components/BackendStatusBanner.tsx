import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, RefreshCcw, ServerCrash } from "lucide-react";

type HealthState = "unknown" | "online" | "offline";

export function BackendStatusBanner() {
  const [status, setStatus] = useState<HealthState>("unknown");
  const [checking, setChecking] = useState(false);

  const checkHealth = useCallback(async () => {
    setChecking(true);
    try {
      const response = await fetch("/api/health", {
        method: "GET",
        cache: "no-store",
      });
      setStatus(response.ok ? "online" : "offline");
    } catch {
      setStatus("offline");
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const pollId = window.setInterval(checkHealth, 45000);

    const handleOnline = () => {
      checkHealth();
    };
    const handleOffline = () => {
      setStatus("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.clearInterval(pollId);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [checkHealth]);

  if (status !== "offline") {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-[120] sm:inset-x-auto sm:right-4 sm:w-[420px]">
      <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 shadow-xl backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-md bg-amber-500/20 p-1.5 text-amber-300">
            {checking ? <RefreshCcw size={14} className="animate-spin" /> : <ServerCrash size={14} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-amber-200">Processing server unavailable</p>
            <p className="mt-0.5 text-xs leading-relaxed text-amber-100/80">
              File tools cannot run right now. Start your backend service and retry.
            </p>
          </div>
          <button
            onClick={checkHealth}
            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-amber-400/40 px-2 py-1 text-xs font-medium text-amber-200 transition-colors hover:bg-amber-500/10"
            disabled={checking}
          >
            {checking ? <RefreshCcw size={12} className="animate-spin" /> : <AlertTriangle size={12} />}
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}

