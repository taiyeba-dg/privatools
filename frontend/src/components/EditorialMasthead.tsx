import { Link, useLocation } from "react-router-dom";
import { Search, Sun, Moon, Github } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "ALL TOOLS", href: "/" },
  { label: "BATCH", href: "/batch" },
  { label: "PIPELINE", href: "/pipeline" },
  { label: "BLOG", href: "/blog" },
  { label: "COMPARE", href: "/compare" },
];

export function EditorialMasthead() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
      {/* Top accent rule */}
      <div className="h-[3px] bg-primary" />

      {/* Masthead title */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-4 pb-3 text-center">
        <Link to="/" className="inline-block">
          <h1 className="masthead-title text-foreground">PRIVATOOLS</h1>
        </Link>
        <p className="masthead-meta mt-1">
          EST. 2026 · FREE · OPEN SOURCE · PRIVACY-FIRST
        </p>
      </div>

      {/* Navigation rule */}
      <div className="rule-thin mx-4 sm:mx-6" />

      {/* Navigation bar */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center justify-between py-2.5">
          {/* Nav links */}
          <nav className="masthead-nav flex items-center gap-1 overflow-x-auto no-scrollbar">
            {navLinks.map((link, i) => (
              <span key={link.label} className="flex items-center gap-1">
                {i > 0 && <span className="text-muted-foreground/30 mx-1">·</span>}
                <Link
                  to={link.href}
                  className={cn(
                    "px-2 py-1 transition-colors whitespace-nowrap inline-flex items-center gap-1.5",
                    location.pathname === link.href && "active"
                  )}
                >
                  {link.label}
                  {link.label === "PIPELINE" && (
                    <span className="inline-flex items-center px-1.5 py-0.5 text-[8px] font-bold tracking-wider bg-primary text-primary-foreground rounded-sm leading-none">
                      NEW
                    </span>
                  )}
                </Link>
              </span>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <a
              href="https://github.com/taiyeba-dg/privatools"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              title="View on GitHub"
            >
              <Github size={15} />
            </a>
          </div>
        </div>
      </div>

      {/* Dateline rule */}
      <div className="rule-thin mx-4 sm:mx-6" />

      {/* Dateline bar */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center justify-between py-1.5">
          <span className="masthead-meta">
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="masthead-meta">
            107 Tools for Every File Task
          </span>
        </div>
      </div>

      <div className="rule-thin mx-4 sm:mx-6" />
    </header>
  );
}
