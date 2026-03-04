import { cn } from "@/lib/utils";

interface ProgressBarProps {
    percent: number; // 0–100
    className?: string;
    showLabel?: boolean;
}

export function ProgressBar({ percent, className, showLabel = true }: ProgressBarProps) {
    const clamped = Math.min(100, Math.max(0, percent));

    return (
        <div className={cn("w-full", className)}>
            <div className="relative h-2 rounded-full bg-secondary/50 overflow-hidden">
                <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-300 ease-out"
                    style={{ width: `${clamped}%` }}
                />
                {clamped > 0 && clamped < 100 && (
                    <div
                        className="absolute inset-y-0 left-0 rounded-full bg-primary/20 animate-pulse"
                        style={{ width: `${clamped}%` }}
                    />
                )}
            </div>
            {showLabel && (
                <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[11px] text-muted-foreground/60">
                        {clamped < 100 ? "Uploading…" : "Processing…"}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground/60">{clamped}%</span>
                </div>
            )}
        </div>
    );
}
