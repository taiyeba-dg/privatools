import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight, Clock, Command } from "lucide-react";
import { cn } from "@/lib/utils";
import { tools, categoryMeta, Category } from "@/data/tools";
import { nonPdfTools, nonPdfCategoryMeta, NonPdfCategory } from "@/data/non-pdf-tools";
import { useHistory } from "@/hooks/useHistory";

// Build searchable index once
const allTools = [
    ...tools.map(t => ({
        slug: t.slug, name: t.name, description: t.description, icon: t.icon,
        href: `/tool/${t.slug}`,
        iconBg: categoryMeta[t.category as Category]?.iconBg ?? "bg-blue-500/10",
        iconColor: categoryMeta[t.category as Category]?.iconColor ?? "text-blue-400",
    })),
    ...nonPdfTools.map(t => ({
        slug: t.slug, name: t.name, description: t.description, icon: t.icon,
        href: `/tools/${t.slug}`,
        iconBg: nonPdfCategoryMeta[t.category as NonPdfCategory]?.iconBg ?? "bg-pink-500/10",
        iconColor: nonPdfCategoryMeta[t.category as NonPdfCategory]?.iconColor ?? "text-pink-400",
    })),
];

export default function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { history } = useHistory();

    const go = useCallback((href: string) => {
        setOpen(false);
        navigate(href);
    }, [navigate]);

    // Global keyboard shortcut
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setOpen(prev => !prev);
            }
            if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    // Focus input when opened
    useEffect(() => {
        if (open) {
            setQuery("");
            setSelected(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    // Search results
    const results = useMemo(() => {
        if (!query.trim()) {
            // Show recent tools when no query
            if (history.length > 0) {
                return history.slice(0, 8).map(h => {
                    const tool = allTools.find(t => t.slug === h.slug);
                    return tool ? { ...tool, isRecent: true } : null;
                }).filter(Boolean) as (typeof allTools[0] & { isRecent?: boolean })[];
            }
            return allTools.slice(0, 8);
        }
        const q = query.toLowerCase();
        return allTools
            .filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
            .slice(0, 12);
    }, [query, history]);

    // Keyboard navigation
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelected(prev => Math.min(prev + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelected(prev => Math.max(prev - 1, 0));
            } else if (e.key === "Enter" && results[selected]) {
                e.preventDefault();
                go(results[selected].href);
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, selected, results, go]);

    // Scroll selected into view
    useEffect(() => {
        if (!listRef.current) return;
        const item = listRef.current.children[selected] as HTMLElement;
        item?.scrollIntoView({ block: "nearest" });
    }, [selected]);

    if (!open) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md animate-in fade-in-0 duration-150"
                onClick={() => setOpen(false)}
            />

            {/* Palette */}
            <div className="fixed inset-x-0 top-[12vh] z-[101] mx-auto w-full max-w-xl px-4 animate-in fade-in-0 slide-in-from-top-4 duration-200">
                <div className="rounded-2xl border border-border/50 bg-card/95 backdrop-blur-2xl shadow-2xl shadow-black/60 overflow-hidden">

                    {/* Animated gradient line */}
                    <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-60 animate-pulse" />

                    {/* Search input */}
                    <div className="flex items-center gap-3.5 px-5 py-4 border-b border-border/40">
                        <Search size={20} strokeWidth={2} className="shrink-0 text-muted-foreground/50" />
                        <input
                            ref={inputRef}
                            className="flex-1 bg-transparent outline-none text-base text-foreground placeholder:text-muted-foreground/40"
                            placeholder="Search tools…"
                            value={query}
                            onChange={e => { setQuery(e.target.value); setSelected(0); }}
                        />
                        <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] text-muted-foreground/40 font-mono bg-secondary/40 rounded-md px-2 py-1">
                            ESC
                        </kbd>
                    </div>

                    {/* Results */}
                    <div ref={listRef} className="max-h-[55vh] overflow-y-auto py-2 px-2">
                        {!query.trim() && history.length > 0 && (
                            <div className="flex items-center gap-1.5 px-3 py-2">
                                <Clock size={11} className="text-muted-foreground/40" />
                                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">Recent</span>
                            </div>
                        )}

                        {results.length > 0 ? (
                            results.map((tool, i) => {
                                const Ic = tool.icon;
                                return (
                                    <button
                                        key={tool.slug}
                                        onClick={() => go(tool.href)}
                                        onMouseEnter={() => setSelected(i)}
                                        className={cn(
                                            "flex items-center gap-3.5 w-full px-3.5 py-3 rounded-xl text-left transition-colors",
                                            i === selected ? "bg-primary/8" : "hover:bg-secondary/50"
                                        )}
                                    >
                                        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", tool.iconBg)}>
                                            <Ic size={15} strokeWidth={1.75} className={tool.iconColor} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-heading font-semibold text-foreground truncate">{tool.name}</p>
                                            <p className="text-[11px] text-muted-foreground/50 truncate">{tool.description}</p>
                                        </div>
                                        {i === selected && <ArrowRight size={13} className="shrink-0 text-primary/60" />}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="py-12 text-center">
                                <p className="text-sm text-muted-foreground/50">No tools found</p>
                            </div>
                        )}
                    </div>

                    {/* Footer hint */}
                    <div className="px-5 py-2.5 border-t border-border/30 flex items-center gap-5">
                        <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground/35">
                            <kbd className="font-mono bg-secondary/40 rounded-md px-1.5 py-0.5">↑↓</kbd> navigate
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground/35">
                            <kbd className="font-mono bg-secondary/40 rounded-md px-1.5 py-0.5">↵</kbd> open
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground/35">
                            <kbd className="font-mono bg-secondary/40 rounded-md px-1.5 py-0.5">esc</kbd> close
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}
