import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search, X, Shield, Github, Menu, FileText, ImageIcon,
  Video, Code2, Archive, BookOpen, ChevronDown, ArrowRight,
  Sun, Moon, Star, Clock, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { tools, categoryMeta, Category } from "@/data/tools";
import { nonPdfTools, nonPdfCategoryMeta, NonPdfCategory } from "@/data/non-pdf-tools";
import { useTheme } from "@/hooks/useTheme";
import { useFavorites } from "@/hooks/useFavorites";
import { useHistory } from "@/hooks/useHistory";
import { SmartFileDetector } from "@/components/SmartFileDetector";

// ── Types & config ─────────────────────────────────────────────────────────────
type Suite = "pdf" | "image" | "video-audio" | "developer" | "archive" | "document-office";

const suites: { id: Suite; label: string; icon: typeof FileText; desc: string; count: () => number }[] = [
  { id: "pdf", label: "PDF", icon: FileText, desc: "60+ tools for every PDF task", count: () => tools.length },
  { id: "image", label: "Image", icon: ImageIcon, desc: "Compress, convert & crop", count: () => nonPdfTools.filter(t => t.category === "image").length },
  { id: "video-audio", label: "Video", icon: Video, desc: "Trim, compress, extract audio", count: () => nonPdfTools.filter(t => t.category === "video-audio").length },
  { id: "developer", label: "Dev", icon: Code2, desc: "JSON, diff, Base64, hashes", count: () => nonPdfTools.filter(t => t.category === "developer").length },
  { id: "archive", label: "Archive", icon: Archive, desc: "ZIP, extract, encrypt", count: () => nonPdfTools.filter(t => t.category === "archive").length },
  { id: "document-office", label: "Docs", icon: BookOpen, desc: "CSV, Markdown, JSON convert", count: () => nonPdfTools.filter(t => t.category === "document-office").length },
];

const pdfCategories: { id: Category; title: string }[] = [
  { id: "organize", title: "Organize & Manage" },
  { id: "edit", title: "Edit Content" },
  { id: "optimize", title: "Optimize & Fix" },
  { id: "security", title: "Security & Privacy" },
  { id: "to-pdf", title: "Convert to PDF" },
  { id: "from-pdf", title: "Convert from PDF" },
  { id: "advanced", title: "Advanced" },
];

const nonPdfSuiteCategories: Partial<Record<Suite, NonPdfCategory>> = {
  image: "image", "video-audio": "video-audio",
  developer: "developer", archive: "archive", "document-office": "document-office",
};

// ── Tool Card ──────────────────────────────────────────────────────────────────
function ToolCard({ name, description, icon: Icon, href, iconBg, iconColor }: {
  name: string; description: string; icon: React.ElementType;
  href: string; iconBg: string; iconColor: string;
}) {
  return (
    <Link
      to={href}
      className="tool-card group relative flex items-center gap-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm px-4 py-4 overflow-hidden"
    >
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", iconBg)}>
        <Icon size={18} strokeWidth={1.75} className={iconColor} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-semibold text-foreground leading-tight truncate">{name}</p>
        <p className="text-[11.5px] text-muted-foreground leading-snug line-clamp-1 mt-0.5">{description}</p>
      </div>
      <ArrowRight size={14} className="shrink-0 text-muted-foreground/0 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
    </Link>
  );
}

// ── Nav Dropdown ───────────────────────────────────────────────────────────────
const pdfDropdownGroups = pdfCategories.map(cat => ({
  title: cat.title, catId: cat.id,
  items: tools.filter(t => t.category === cat.id).slice(0, 4),
}));

function NavDropdown({ suite, setActiveTab, onClose }: {
  suite: typeof suites[0]; setActiveTab: (s: Suite) => void; onClose: () => void;
}) {
  const isPdf = suite.id === "pdf";
  const catId = !isPdf ? suite.id as NonPdfCategory : null;
  const catTools = catId ? nonPdfTools.filter(t => t.category === catId) : [];
  const meta = catId ? nonPdfCategoryMeta[catId] : null;
  const go = (id: Suite) => { setActiveTab(id); window.scrollTo({ top: 0, behavior: "smooth" }); onClose(); };

  if (isPdf) {
    return (
      <div className="w-[580px] rounded-2xl border border-border/60 bg-card/98 backdrop-blur-2xl shadow-2xl shadow-black/50 overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
          <div>
            <p className="text-[13px] font-bold text-foreground font-heading">PDF Tools</p>
            <p className="text-[11px] text-muted-foreground">{tools.length} tools · all local, no uploads</p>
          </div>
          <button onClick={() => go("pdf")} className="flex items-center gap-1 text-[12px] text-primary hover:text-primary/80 font-medium transition-colors">
            Browse all <ArrowRight size={11} />
          </button>
        </div>
        <div className="p-3 grid grid-cols-2 gap-x-2">
          {pdfDropdownGroups.map(group => {
            const m = categoryMeta[group.catId as Category];
            return (
              <div key={group.catId} className="py-1.5">
                <p className={cn("text-[10px] font-bold uppercase tracking-widest mb-1.5 px-2", m.accent)}>{group.title}</p>
                {group.items.map(tool => {
                  const Ic = tool.icon;
                  return (
                    <Link key={tool.slug} to={`/tool/${tool.slug}`} onClick={onClose}
                      className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-primary/8 transition-colors group/i">
                      <div className={cn("flex h-6 w-6 items-center justify-center rounded-md shrink-0", m.iconBg)}>
                        <Ic size={12} strokeWidth={1.75} className={m.iconColor} />
                      </div>
                      <span className="text-[12px] text-muted-foreground group-hover/i:text-foreground leading-tight transition-colors">{tool.name}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-60 rounded-2xl border border-border/60 bg-card/98 backdrop-blur-2xl shadow-2xl shadow-black/50 overflow-hidden animate-scale-in">
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className={cn("flex h-6 w-6 items-center justify-center rounded-lg", meta?.iconBg)}>
            <suite.icon size={12} className={meta?.iconColor} />
          </div>
          <p className="text-[13px] font-bold text-foreground font-heading">{suite.label}</p>
        </div>
        <button onClick={() => go(suite.id)} className="text-[11px] text-primary hover:text-primary/80 font-medium transition-colors">All →</button>
      </div>
      <div className="p-1.5">
        {catTools.map(tool => {
          const Ic = tool.icon;
          return (
            <Link key={tool.slug} to={`/tools/${tool.slug}`} onClick={onClose}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-primary/8 transition-colors group/i">
              <Ic size={14} strokeWidth={1.75} className={cn("shrink-0", meta?.iconColor)} />
              <span className="text-[12px] text-muted-foreground group-hover/i:text-foreground transition-colors">{tool.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ── Navbar ─────────────────────────────────────────────────────────────────────
function Navbar({ query, setQuery, activeTab, setActiveTab }: {
  query: string; setQuery: (q: string) => void; activeTab: Suite; setActiveTab: (s: Suite) => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<Suite | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { theme, toggleTheme } = useTheme();
  const totalTools = tools.length + nonPdfTools.length;

  const open = (id: Suite) => { if (timer.current) clearTimeout(timer.current); setOpenDropdown(id); };
  const close = () => { timer.current = setTimeout(() => setOpenDropdown(null), 140); };
  const hold = () => { if (timer.current) clearTimeout(timer.current); };

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return (
    <header className="sticky top-0 z-50 bg-background/75 backdrop-blur-2xl border-b border-border/30">
      <div className="mx-auto max-w-[1200px] px-5">
        <div className="flex items-center gap-4" style={{ height: "56px" }}>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 logo-animated">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/30">
              <Shield size={14} strokeWidth={2.5} className="text-primary-foreground logo-shield" />
            </div>
            <span className="text-[16px] font-extrabold text-foreground tracking-tight font-heading">PrivaTools</span>
          </Link>

          <div className="hidden lg:block h-5 w-px bg-border/40" />

          {/* Suite nav */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1">
            {suites.map(s => {
              const Ic = s.icon;
              const isOpen = openDropdown === s.id;
              const isActive = activeTab === s.id;
              return (
                <div key={s.id} className="relative" onMouseEnter={() => open(s.id)} onMouseLeave={close}>
                  <button
                    onClick={() => { setActiveTab(s.id); setOpenDropdown(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className={cn(
                      "relative flex items-center gap-1.5 px-3 h-9 rounded-lg text-[13px] font-medium transition-all duration-150",
                      isActive || isOpen
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                  >
                    <Ic size={13} strokeWidth={2} className="shrink-0" />
                    {s.label}
                    <ChevronDown size={10} strokeWidth={2.5} className={cn(
                      "shrink-0 transition-transform duration-150",
                      isOpen ? "rotate-180 opacity-80" : "opacity-30"
                    )} />
                  </button>
                  {isOpen && (
                    <div className="absolute top-full left-0 mt-2 z-50"
                      onMouseEnter={hold} onMouseLeave={close}>
                      <NavDropdown suite={s} setActiveTab={setActiveTab} onClose={() => setOpenDropdown(null)} />
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto">
            <div className={cn(
              "hidden sm:flex items-center gap-2 h-9 rounded-xl border border-border/40 bg-secondary/25 px-3 transition-all duration-250",
              "focus-within:border-primary/30 focus-within:bg-secondary/50 focus-within:shadow-sm focus-within:shadow-primary/10",
              "w-40 focus-within:w-56"
            )}>
              <Search size={13} strokeWidth={2.5} className="shrink-0 text-muted-foreground/40" />
              <input
                className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-muted-foreground/35 text-foreground min-w-0"
                placeholder={`Search ${totalTools}+ tools…`}
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              {query && <button onClick={() => setQuery("")} className="shrink-0 text-muted-foreground/40 hover:text-muted-foreground transition-colors"><X size={12} /></button>}
              {!query && (
                <kbd className="hidden md:flex items-center gap-0.5 shrink-0 text-[10px] text-muted-foreground/25 font-mono bg-secondary/40 rounded-md px-1.5 py-0.5">
                  ⌘K
                </kbd>
              )}
            </div>

            <button
              onClick={toggleTheme}
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl border border-border/40 bg-secondary/25 text-muted-foreground hover:text-foreground hover:bg-secondary/50 hover:border-border/60 transition-all"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            <a href="https://github.com/taiyeba-dg/privatools" target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-border/40 bg-secondary/25 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 hover:border-border/60 transition-all">
              <Github size={14} />
              <span className="hidden md:inline">GitHub</span>
            </a>

            {/* Mobile */}
            <div className="flex lg:hidden items-center gap-2">
              <div className="flex items-center gap-1.5 h-9 rounded-xl border border-border/40 bg-secondary/25 px-3 w-36 focus-within:w-48 transition-all focus-within:border-primary/30">
                <Search size={12} className="shrink-0 text-muted-foreground/40" />
                <input className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-muted-foreground/35 text-foreground min-w-0"
                  placeholder="Search…" value={query} onChange={e => setQuery(e.target.value)} />
                {query && <button onClick={() => setQuery("")}><X size={11} className="text-muted-foreground/40" /></button>}
              </div>
              <button onClick={() => setMobileOpen(!mobileOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/40 text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors">
                {mobileOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-border/30 bg-background/95 backdrop-blur-2xl px-5 py-4 animate-slide-down">
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {suites.map(s => {
              const Ic = s.icon;
              return (
                <button key={s.id}
                  onClick={() => { setActiveTab(s.id); setMobileOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className={cn(
                    "flex items-center gap-2.5 px-3.5 py-3 rounded-xl transition-all",
                    activeTab === s.id
                      ? "bg-primary/10 border border-primary/25 text-primary"
                      : "border border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}>
                  <Ic size={14} className="shrink-0" />
                  <span className="text-[13px] font-medium">{s.label}</span>
                  <span className="ml-auto text-[11px] opacity-35 font-mono">{s.count()}</span>
                </button>
              );
            })}
          </div>
          <div className="pt-2.5 border-t border-border/30 flex items-center gap-3">
            <button onClick={toggleTheme} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors">
              {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
              {theme === "dark" ? "Light" : "Dark"}
            </button>
            <a href="https://github.com/taiyeba-dg/privatools" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors">
              <Github size={13} /> GitHub
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function Index() {
  const [activeTab, setActiveTab] = useState<Suite>("pdf");
  const [query, setQuery] = useState("");
  const { favorites } = useFavorites();
  const { history } = useHistory();
  const totalTools = tools.length + nonPdfTools.length;

  const allSearchable = [
    ...tools.map(t => ({ slug: t.slug, name: t.name, description: t.description, icon: t.icon, href: `/tool/${t.slug}`, iconBg: categoryMeta[t.category].iconBg, iconColor: categoryMeta[t.category].iconColor })),
    ...nonPdfTools.map(t => ({ slug: t.slug, name: t.name, description: t.description, icon: t.icon, href: `/tools/${t.slug}`, iconBg: nonPdfCategoryMeta[t.category].iconBg, iconColor: nonPdfCategoryMeta[t.category].iconColor })),
  ];

  const filtered = query.trim()
    ? allSearchable.filter(t => t.name.toLowerCase().includes(query.toLowerCase()) || t.description.toLowerCase().includes(query.toLowerCase()))
    : null;

  const activeSuite = suites.find(s => s.id === activeTab)!;
  const activeNonPdfCat = nonPdfSuiteCategories[activeTab];

  return (
    <div className="min-h-screen bg-background">
      <Navbar query={query} setQuery={setQuery} activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="mx-auto max-w-[1200px] px-5">

        {/* ── Hero ───────────────────────────────────────────────────────────── */}
        {!filtered && (
          <section className="relative pt-16 sm:pt-24 pb-12 sm:pb-16 text-center overflow-hidden">
            {/* Animated gradient mesh background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="mesh-orb absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full"
                style={{ background: "radial-gradient(ellipse at center, hsl(158 64% 48% / 0.1) 0%, transparent 65%)" }} />
              <div className="mesh-orb-2 absolute top-0 left-[15%] w-[350px] h-[250px] rounded-full blur-3xl"
                style={{ background: "hsl(200 50% 50% / 0.04)" }} />
              <div className="mesh-orb-3 absolute top-5 right-[15%] w-[300px] h-[220px] rounded-full blur-3xl"
                style={{ background: "hsl(270 40% 55% / 0.04)" }} />
            </div>

            <div className="relative">
              {/* Floating badge */}
              <div className="animate-float inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-[11px] font-semibold text-primary mb-8 shadow-sm shadow-primary/10">
                <Sparkles size={11} className="text-primary" />
                {totalTools} tools · 100% local processing · no sign-up
              </div>

              <h1 className="font-heading text-[3rem] sm:text-[4.25rem] font-extrabold tracking-[-0.035em] leading-[1.05] max-w-2xl mx-auto">
                <span className="text-foreground">Every file task,</span>
                <br />
                <span className="text-gradient" style={{
                  backgroundImage: "linear-gradient(135deg, hsl(158 64% 48%) 0%, hsl(170 55% 55%) 40%, hsl(200 50% 55%) 100%)",
                }}>
                  done privately.
                </span>
              </h1>

              <p className="mt-6 text-[15px] sm:text-[16px] text-muted-foreground max-w-[440px] mx-auto leading-relaxed">
                PDF, image, video, and developer tools — all running locally on your server. Zero uploads, zero tracking.
              </p>

              {/* Suite selector pills */}
              <div className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-2.5">
                {suites.map(s => {
                  const Ic = s.icon;
                  return (
                    <button
                      key={s.id}
                      onClick={() => { setActiveTab(s.id); document.getElementById("tools-section")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                      className={cn(
                        "group flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[13px] font-medium transition-all duration-200",
                        activeTab === s.id
                          ? "border-primary/35 bg-primary/10 text-primary shadow-md shadow-primary/10"
                          : "border-border/50 bg-card/40 text-muted-foreground hover:border-border hover:bg-card/70 hover:text-foreground hover:shadow-sm"
                      )}
                    >
                      <Ic size={14} strokeWidth={1.75} className="shrink-0" />
                      {s.label}
                      <span className={cn(
                        "text-[11px] font-mono rounded-lg px-1.5 py-0.5 transition-colors",
                        activeTab === s.id ? "bg-primary/15 text-primary" : "bg-secondary/60 text-muted-foreground/50"
                      )}>
                        {s.count()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Search results ─────────────────────────────────────────────────── */}
        {filtered && (
          <section className="py-10">
            <div className="flex items-center gap-3 mb-6">
              <p className="text-sm text-muted-foreground">
                <span className="font-bold text-foreground">{filtered.length}</span> result{filtered.length !== 1 ? "s" : ""} for{" "}
                <span className="font-bold text-foreground">"{query}"</span>
              </p>
              <button onClick={() => setQuery("")} className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-lg px-2 py-1 hover:bg-secondary/50">
                <X size={11} /> Clear
              </button>
            </div>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {filtered.map(t => <ToolCard key={t.slug} {...t} />)}
              </div>
            ) : (
              <div className="py-28 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/60 mb-5">
                  <Search size={24} className="text-muted-foreground/25" />
                </div>
                <p className="text-sm font-bold text-foreground mb-1 font-heading">No tools found</p>
                <p className="text-xs text-muted-foreground">Try a different keyword</p>
              </div>
            )}
          </section>
        )}

        {/* ── Smart File Detector ───────────────────────────────────────────── */}
        {!filtered && (
          <section className="pb-6">
            <SmartFileDetector />
          </section>
        )}

        {/* ── Recently Used ────────────────────────────────────────────────── */}
        {!filtered && history.length > 0 && (() => {
          const recentItems = history.slice(0, 6).map(h => {
            const pdfTool = tools.find(t => t.slug === h.slug);
            const nonPdfTool = nonPdfTools.find(t => t.slug === h.slug);
            if (pdfTool) {
              const m = categoryMeta[pdfTool.category];
              return { slug: pdfTool.slug, name: pdfTool.name, description: pdfTool.description, icon: pdfTool.icon, href: `/tool/${pdfTool.slug}`, iconBg: m.iconBg, iconColor: m.iconColor };
            }
            if (nonPdfTool) {
              const m = nonPdfCategoryMeta[nonPdfTool.category];
              return { slug: nonPdfTool.slug, name: nonPdfTool.name, description: nonPdfTool.description, icon: nonPdfTool.icon, href: `/tools/${nonPdfTool.slug}`, iconBg: m.iconBg, iconColor: m.iconColor };
            }
            return null;
          }).filter(Boolean) as { slug: string; name: string; description: string; icon: React.ElementType; href: string; iconBg: string; iconColor: string }[];
          if (!recentItems.length) return null;
          return (
            <section className="pb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/80">
                  <Clock size={13} className="text-muted-foreground/70" />
                </div>
                <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground font-heading">Recently Used</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-border/40 to-transparent" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {recentItems.map(t => <ToolCard key={t.slug} {...t} />)}
              </div>
            </section>
          );
        })()}

        {/* ── Favorites ───────────────────────────────────────────────────────── */}
        {!filtered && favorites.length > 0 && (() => {
          const favItems = favorites.map(slug => {
            const pdfTool = tools.find(t => t.slug === slug);
            const nonPdfTool = nonPdfTools.find(t => t.slug === slug);
            if (pdfTool) {
              const m = categoryMeta[pdfTool.category];
              return { slug: pdfTool.slug, name: pdfTool.name, description: pdfTool.description, icon: pdfTool.icon, href: `/tool/${pdfTool.slug}`, iconBg: m.iconBg, iconColor: m.iconColor };
            }
            if (nonPdfTool) {
              const m = nonPdfCategoryMeta[nonPdfTool.category];
              return { slug: nonPdfTool.slug, name: nonPdfTool.name, description: nonPdfTool.description, icon: nonPdfTool.icon, href: `/tools/${nonPdfTool.slug}`, iconBg: m.iconBg, iconColor: m.iconColor };
            }
            return null;
          }).filter(Boolean) as { slug: string; name: string; description: string; icon: React.ElementType; href: string; iconBg: string; iconColor: string }[];
          if (!favItems.length) return null;
          return (
            <section className="pb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
                  <Star size={13} className="text-amber-400" />
                </div>
                <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-400/80 font-heading">Favorites</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-amber-500/20 to-transparent" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {favItems.map(t => <ToolCard key={t.slug} {...t} />)}
              </div>
            </section>
          );
        })()}

        {/* ── Tools section ──────────────────────────────────────────────────── */}
        {!filtered && (
          <section id="tools-section">

            {/* Sticky tab bar */}
            <div className="sticky top-[56px] z-40 -mx-5 px-5 pt-3 pb-3 bg-background/80 backdrop-blur-2xl border-b border-border/30 mb-10">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {suites.map(s => {
                  const Ic = s.icon;
                  const isActive = activeTab === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActiveTab(s.id)}
                      className={cn(
                        "flex items-center gap-1.5 whitespace-nowrap h-9 px-4 rounded-xl text-[13px] font-semibold transition-all duration-200 shrink-0",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                      )}
                    >
                      <Ic size={13} strokeWidth={2} />
                      {s.label}
                      <span className={cn(
                        "text-[11px] font-mono ml-0.5",
                        isActive ? "opacity-60" : "text-muted-foreground/35"
                      )}>
                        {s.count()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PDF categories */}
            {activeTab === "pdf" && (
              <div className="space-y-12 pb-24">
                {pdfCategories.map(cat => {
                  const catTools = tools.filter(t => t.category === cat.id);
                  const meta = categoryMeta[cat.id];
                  return (
                    <div key={cat.id}>
                      <div className="flex items-center gap-3.5 mb-5">
                        <div className={cn("flex h-8 w-8 items-center justify-center rounded-xl", meta.iconBg)}>
                          <span className={cn("block h-2.5 w-2.5 rounded-sm", meta.iconBg.replace("/10", ""), meta.iconColor)} />
                        </div>
                        <div className="flex-1">
                          <h2 className={cn("text-[13px] font-bold uppercase tracking-[0.1em] font-heading", meta.accent)}>
                            {cat.title}
                          </h2>
                        </div>
                        <span className="text-[11px] text-muted-foreground/35 font-mono tabular-nums">{catTools.length} tools</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {catTools.map(t => (
                          <ToolCard key={t.slug} name={t.name} description={t.description} icon={t.icon}
                            href={`/tool/${t.slug}`} iconBg={meta.iconBg} iconColor={meta.iconColor} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Non-PDF suites */}
            {activeTab !== "pdf" && activeNonPdfCat && (() => {
              const meta = nonPdfCategoryMeta[activeNonPdfCat];
              const catTools = nonPdfTools.filter(t => t.category === activeNonPdfCat);
              const Ic = activeSuite.icon;
              return (
                <div className="pb-24">
                  <div className="flex items-center gap-4 mb-8">
                    <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", meta.iconBg)}>
                      <Ic size={20} strokeWidth={1.75} className={meta.iconColor} />
                    </div>
                    <div>
                      <h2 className={cn("text-[16px] font-bold leading-tight font-heading", meta.accent)}>{activeSuite.label} Tools</h2>
                      <p className="text-[12px] text-muted-foreground mt-0.5">{activeSuite.desc}</p>
                    </div>
                    <span className="ml-auto text-[11px] text-muted-foreground/35 font-mono">{catTools.length} tools</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {catTools.map(t => (
                      <ToolCard key={t.slug} name={t.name} description={t.description} icon={t.icon}
                        href={`/tools/${t.slug}`} iconBg={meta.iconBg} iconColor={meta.iconColor} />
                    ))}
                  </div>
                </div>
              );
            })()}
          </section>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/30 mt-4 bg-card/30">
        <div className="mx-auto max-w-[1200px] px-5 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-md shadow-primary/25">
                <Shield size={14} strokeWidth={2.5} className="text-primary-foreground" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-foreground leading-tight font-heading">PrivaTools</p>
                <p className="text-[11px] text-muted-foreground/50">{totalTools} tools · no tracking · MIT</p>
              </div>
            </Link>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-muted-foreground">
              {suites.map(s => (
                <button key={s.id} onClick={() => setActiveTab(s.id)} className="hover:text-foreground transition-colors">
                  {s.label}
                </button>
              ))}
              <span className="h-3 w-px bg-border/40" />
              <Link to="/batch" className="hover:text-foreground transition-colors">Batch Process</Link>
              <Link to="/pipeline" className="hover:text-foreground transition-colors">Pipeline</Link>
              <span className="h-3 w-px bg-border/40" />
              <a href="https://github.com/taiyeba-dg/privatools" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-foreground transition-colors">
                <Github size={12} /> GitHub
              </a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-1">
            <p className="text-[11px] text-muted-foreground/35">© 2025 PrivaTools · MIT License · Free forever</p>
            <p className="text-[11px] text-muted-foreground/35">No cookies · No uploads · No accounts</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
