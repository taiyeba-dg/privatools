import { Link, useLocation } from "react-router-dom";
import { Home, Search, Layers, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Search", path: "search" },
    { icon: Layers, label: "Batch", path: "/batch" },
    { icon: GitBranch, label: "Pipeline", path: "/pipeline" },
];

export function MobileNav() {
    const { pathname } = useLocation();

    const handleClick = (path: string) => {
        if (path === "search") {
            // Trigger command palette
            window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
        }
    };

    return (
        <nav className="fixed bottom-0 inset-x-0 z-[90] sm:hidden bg-card/95 backdrop-blur-2xl border-t border-border/30 pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center justify-around h-16">
                {navItems.map(item => {
                    const Icon = item.icon;
                    const isSearch = item.path === "search";
                    const isActive = !isSearch && pathname === item.path;

                    if (isSearch) {
                        return (
                            <button
                                key={item.label}
                                onClick={() => handleClick(item.path)}
                                className="flex flex-col items-center gap-0.5 px-3 py-1"
                            >
                                <Icon size={20} strokeWidth={1.75} className="text-muted-foreground" />
                                <span className="text-[10px] text-muted-foreground">{item.label}</span>
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            className="flex flex-col items-center gap-0.5 px-3 py-1"
                        >
                            <Icon
                                size={20}
                                strokeWidth={isActive ? 2 : 1.75}
                                className={cn(isActive ? "text-primary" : "text-muted-foreground")}
                            />
                            <span className={cn("text-[10px] relative", isActive ? "text-primary font-semibold" : "text-muted-foreground")}>
                                {item.label}
                                {item.label === "Pipeline" && (
                                    <span className="absolute -top-1 -right-2 w-1.5 h-1.5 rounded-full bg-primary" />
                                )}
                            </span>
                            {isActive && (
                                <span className="w-1 h-1 rounded-full bg-primary" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
