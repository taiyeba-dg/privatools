import { cn } from "@/lib/utils";

interface SkeletonProps {
    className?: string;
}

/** Basic shimmer skeleton block */
export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-xl bg-secondary/30",
                className
            )}
        >
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
        </div>
    );
}

/** Tool card skeleton — matches the ToolCard layout */
export function ToolCardSkeleton() {
    return (
        <div className="rounded-2xl border border-border/30 bg-card/30 p-5 space-y-3">
            <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-xl" />
                <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
        </div>
    );
}

/** Grid of tool card skeletons */
export function ToolGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: count }).map((_, i) => (
                <ToolCardSkeleton key={i} />
            ))}
        </div>
    );
}
