import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbProps {
    items: { label: string; href?: string }[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
    return (
        <nav className="flex items-center gap-1 text-[12px] text-muted-foreground/50 mb-4 flex-wrap">
            <Link to="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
                <Home size={11} />
                <span>Home</span>
            </Link>
            {items.map((item, i) => (
                <span key={i} className="flex items-center gap-1">
                    <ChevronRight size={10} className="shrink-0" />
                    {item.href ? (
                        <Link to={item.href} className="hover:text-foreground transition-colors">{item.label}</Link>
                    ) : (
                        <span className="text-foreground/70 font-medium">{item.label}</span>
                    )}
                </span>
            ))}
        </nav>
    );
}
