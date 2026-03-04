import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search, X, Shield, Github, Menu, FileText, ImageIcon,
  Video, Code2, Archive, BookOpen, ChevronDown, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { tools, categoryMeta, Category } from "@/data/tools";
import { nonPdfTools, nonPdfCategoryMeta, NonPdfCategory } from "@/data/non-pdf-tools";

// ── Types & config ─────────────────────────────────────────────────────────────
type Suite = "pdf" | "image" | "video-audio" | "developer" | "archive" | "document-office";

const suites: { id: Suite; label: string; icon: typeof FileText; desc: string; count: () => number }[] = [
  { id: "pdf",             label: "PDF",       icon: FileText,  desc: "60+ tools for every PDF task",    count: () => tools.length },
  { id: "image",           label: "Image",     icon: ImageIcon, desc: "Compress, convert & crop",        count: () => nonPdfTools.filter(t => t.category === "image").length },
  { id: "video-audio",     label: "Video",     icon: Video,     desc: "Trim, compress, extract audio",   count: () => nonPdfTools.filter(t => t.category === "video-audio").length },
  { id: "developer",       label: "Dev",       icon: Code2,     desc: "JSON, diff, Base64, hashes",      count: () => nonPdfTools.filter(t => t.category === "developer").length },
  { id: "archive",         label: "Archive",   icon: Archive,   desc: "ZIP, extract, encrypt",           count: () => nonPdfTools.filter(t => t.category === "archive").length },
  { id: "document-office", label: "Docs",      icon: BookOpen,  desc: "CSV, Markdown, JSON convert",     count: () => nonPdfTools.filter(t => t.category === "document-office").length },
];

const pdfCategories: { id: Category; title: string }[] = [
  { id: "organize",  title: "Organize & Manage" },
  { id: "edit",      title: "Edit Content" },
  { id: "optimize",  title: "Optimize & Fix" },
  { id: "security",  title: "Security & Privacy" },
  { id: "to-pdf",    title: "Convert to PDF" },
  { id: "from-pdf",  title: "Convert from PDF" },
  { id: "advanced",  title: "Advanced" },
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
      className="group relative flex items-center gap-3 rounded-xl border border-border/50 bg-card/40 px-4 py-3.5 transition-all duration-200 hover:border-border/80 hover:bg-card hover:shadow-lg hover:shadow-black/20 hover:-translate-y-px"
    >
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", iconBg)}>
        <Icon size={14} strokeWidth={1.75} className={iconColor} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-foreground leading-tight truncate">{name}</p>
        <p className="text-[11px] text-muted-foreground leading-snug line-clamp-1 mt-0.5">{description}</p>
      </div>
      <ArrowRight size={13} className="shrink-0 text-muted-foreground/20 group-hover:text-muted-foreground/50 group-hover:translate-x-0.5 transition-all duration-200" />
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
      <div className="w-[580px] rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/60 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
          <div>
            <p className="text-[13px] font-semibold text-foreground">PDF Tools</p>
            <p className="text-[11px] text-muted-foreground">{tools.length} tools · all local, no uploads</p>
          </div>
          <button onClick={() => go("pdf")} className="flex items-center gap-1 text-[12px] text-primary hover:text-primary/80 font-medium">
            Browse all <ArrowRight size={11} />
          </button>
        </div>
        <div className="p-3 grid grid-cols-2 gap-x-2">
          {pdfDropdownGroups.map(group => {
            const m = categoryMeta[group.catId as Category];
            return (
              <div key={group.catId} className="py-1.5">
                <p className={cn("text-[10px] font-bold uppercase tracking-widest mb-1 px-2", m.accent)}>{group.title}</p>
                {group.items.map(tool => {
                  const Ic = tool.icon;
                  return (
                    <Link key={tool.slug} to={`/tool/${tool.slug}`} onClick={onClose}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary/70 transition-colors group/i">
                      <div className={cn("flex h-5 w-5 items-center justify-center rounded-md shrink-0", m.iconBg)}>
                        <Ic size={11} strokeWidth={2} className={m.iconColor} />
                      </div>
                      <span className="text-[12px] text-muted-foreground group-hover/i:text-foreground leading-tight">{tool.name}</span>
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
    <div className="w-56 rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/60 overflow-hidden">
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className={cn("flex h-6 w-6 items-center justify-center rounded-lg", meta?.iconBg)}>
            <suite.icon size={12} className={meta?.iconColor} />
          </div>
          <p className="text-[13px] font-semibold text-foreground">{suite.label}</p>
        </div>
        <button onClick={() => go(suite.id)} className="text-[11px] text-primary hover:text-primary/80 font-medium">All →</button>
      </div>
      <div className="p-1.5">
        {catTools.map(tool => {
          const Ic = tool.icon;
          return (
            <Link key={tool.slug} to={`/tools/${tool.slug}`} onClick={onClose}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-secondary/60 transition-colors group/i">
              <Ic size={13} strokeWidth={1.75} className={cn("shrink-0", meta?.iconColor)} />
              <span className="text-[12px] text-muted-foreground group-hover/i:text-foreground">{tool.name}</span>
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
  const totalTools = tools.length + nonPdfTools.length;

  const open = (id: Suite) => { if (timer.current) clearTimeout(timer.current); setOpenDropdown(id); };
  const close = () => { timer.current = setTimeout(() => setOpenDropdown(null), 130); };
  const hold = () => { if (timer.current) clearTimeout(timer.current); };

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-border/40">
      <div className="mx-auto max-w-[1200px] px-5">
        <div className="flex h-13 items-center gap-4" style={{ height: "52px" }}>

          {/* Logo */}
          <Link to="/" onClick={() => { setActiveTab("pdf"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="flex items-center gap-2.5 shrink-0 mr-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary shadow-md shadow-primary/40">
              <Shield size={13} strokeWidth={2.5} className="text-primary-foreground" />
            </div>
            <span className="text-[15px] font-extrabold text-foreground tracking-tight">PrivaTools</span>
          </Link>

          <div className="hidden lg:block h-4 w-px bg-border/50" />

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
                      "relative flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-[13px] font-medium transition-all duration-100",
                      isActive || isOpen
                        ? "text-foreground bg-secondary/60"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                    )}
                  >
                    <Ic size={12} strokeWidth={2} className="shrink-0" />
                    {s.label}
                    <ChevronDown size={10} strokeWidth={2.5} className={cn(
                      "shrink-0 transition-transform duration-150",
                      isOpen ? "rotate-180 opacity-80" : "opacity-35"
                    )} />
                    {isActive && !isOpen && (
                      <span className="absolute -bottom-px left-2 right-2 h-[2px] rounded-full bg-primary/70" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="absolute top-full left-0 mt-2 z-50 animate-in fade-in-0 slide-in-from-top-2 duration-150"
                      onMouseEnter={hold} onMouseLeave={close}>
                      <NavDropdown suite={s} setActiveTab={setActiveTab} onClose={() => setOpenDropdown(null)} />
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2 ml-auto">
            <div className={cn(
              "hidden sm:flex items-center gap-2 h-8 rounded-lg border border-border/50 bg-secondary/20 px-2.5 transition-all duration-200",
              "focus-within:border-primary/40 focus-within:bg-secondary/50",
              "w-36 focus-within:w-52"
            )}>
              <Search size={12} strokeWidth={2.5} className="shrink-0 text-muted-foreground/50" />
              <input
                className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-muted-foreground/40 text-foreground min-w-0"
                placeholder={`Search ${totalTools}+ tools…`}
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              {query && <button onClick={() => setQuery("")} className="shrink-0 text-muted-foreground/50 hover:text-muted-foreground"><X size={11} /></button>}
            </div>

            <a href="https://github.com/taiyeba-dg/privatools" target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border/50 bg-secondary/20 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 hover:border-border/70 transition-all">
              <Github size={13} />
              <span className="hidden md:inline">GitHub</span>
            </a>

            {/* Mobile */}
            <div className="flex lg:hidden items-center gap-2">
              <div className="flex items-center gap-1.5 h-8 rounded-lg border border-border/50 bg-secondary/20 px-2.5 w-32 focus-within:w-44 transition-all focus-within:border-primary/40">
                <Search size={12} className="shrink-0 text-muted-foreground/50" />
                <input className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-muted-foreground/40 text-foreground min-w-0"
                  placeholder="Search…" value={query} onChange={e => setQuery(e.target.value)} />
                {query && <button onClick={() => setQuery("")}><X size={11} className="text-muted-foreground/50" /></button>}
              </div>
              <button onClick={() => setMobileOpen(!mobileOpen)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors">
                {mobileOpen ? <X size={15} /> : <Menu size={15} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl px-5 py-3">
          <div className="grid grid-cols-2 gap-1 mb-2">
            {suites.map(s => {
              const Ic = s.icon;
              return (
                <button key={s.id}
                  onClick={() => { setActiveTab(s.id); setMobileOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors",
                    activeTab === s.id
                      ? "bg-primary/10 border border-primary/20 text-primary"
                      : "border border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}>
                  <Ic size={13} className="shrink-0" />
                  <span className="text-[13px] font-medium">{s.label}</span>
                  <span className="ml-auto text-[11px] opacity-40">{s.count()}</span>
                </button>
              );
            })}
          </div>
          <div className="pt-2 border-t border-border/40">
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
          <section className="relative pt-20 pb-14 text-center overflow-hidden">
            {/* layered glow */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full"
                style={{ background: "radial-gradient(ellipse at center, hsl(216 90% 60% / 0.12) 0%, transparent 70%)" }} />
              <div className="absolute top-10 left-1/4 w-[300px] h-[200px] rounded-full blur-3xl"
                style={{ background: "hsl(263 70% 65% / 0.06)" }} />
              <div className="absolute top-10 right-1/4 w-[300px] h-[200px] rounded-full blur-3xl"
                style={{ background: "hsl(174 60% 50% / 0.05)" }} />
            </div>

            <div className="relative">
              {/* badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-[11px] font-semibold text-primary mb-8 shadow-sm shadow-primary/10">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                {totalTools} tools · 100% local processing · no sign-up
              </div>

              <h1 className="text-[3.25rem] sm:text-[4rem] font-black tracking-[-0.03em] leading-[1.05] max-w-2xl mx-auto">
                <span className="text-foreground">Every file task,</span>
                <br />
                <span style={{
                  background: "linear-gradient(135deg, hsl(217 90% 70%) 0%, hsl(210 100% 80%) 40%, hsl(240 70% 75%) 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
                }}>
                  done privately.
                </span>
              </h1>

              <p className="mt-5 text-[15px] text-muted-foreground max-w-[420px] mx-auto leading-relaxed">
                PDF, image, video, and developer tools — all running in your browser. Zero uploads, zero tracking.
              </p>

              {/* stat row */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                {suites.map(s => {
                  const Ic = s.icon;
                  return (
                    <button
                      key={s.id}
                      onClick={() => { setActiveTab(s.id); document.getElementById("tools-section")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                      className={cn(
                        "group flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[13px] font-medium transition-all duration-150",
                        activeTab === s.id
                          ? "border-primary/30 bg-primary/10 text-primary shadow-sm shadow-primary/10"
                          : "border-border/50 bg-card/50 text-muted-foreground hover:border-border hover:bg-card hover:text-foreground hover:shadow-sm hover:shadow-black/10"
                      )}
                    >
                      <Ic size={13} strokeWidth={2} className="shrink-0" />
                      {s.label}
                      <span className={cn(
                        "text-[11px] font-mono rounded-md px-1.5 py-0.5 transition-colors",
                        activeTab === s.id ? "bg-primary/15 text-primary" : "bg-secondary/60 text-muted-foreground/60"
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
                <span className="font-semibold text-foreground">{filtered.length}</span> result{filtered.length !== 1 ? "s" : ""} for{" "}
                <span className="font-semibold text-foreground">"{query}"</span>
              </p>
              <button onClick={() => setQuery("")} className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <X size={11} /> Clear
              </button>
            </div>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {filtered.map(t => <ToolCard key={t.slug} {...t} />)}
              </div>
            ) : (
              <div className="py-24 text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/60 mb-4">
                  <Search size={22} className="text-muted-foreground/30" />
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">No tools found</p>
                <p className="text-xs text-muted-foreground">Try a different keyword</p>
              </div>
            )}
          </section>
        )}

        {/* ── Tools section ──────────────────────────────────────────────────── */}
        {!filtered && (
          <section id="tools-section">

            {/* Tab bar */}
            <div className="sticky top-[52px] z-40 -mx-5 px-5 pt-3 pb-3 bg-background/85 backdrop-blur-2xl border-b border-border/40 mb-8">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {suites.map(s => {
                  const Ic = s.icon;
                  const isActive = activeTab === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActiveTab(s.id)}
                      className={cn(
                        "flex items-center gap-1.5 whitespace-nowrap h-8 px-3.5 rounded-lg text-[13px] font-medium transition-all duration-150 shrink-0",
                        isActive
                          ? "bg-foreground text-background shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      )}
                    >
                      <Ic size={12} strokeWidth={2} />
                      {s.label}
                      <span className={cn(
                        "text-[11px] font-mono ml-0.5",
                        isActive ? "opacity-50" : "text-muted-foreground/40"
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
              <div className="space-y-10 pb-20">
                {pdfCategories.map(cat => {
                  const catTools = tools.filter(t => t.category === cat.id);
                  const meta = categoryMeta[cat.id];
                  return (
                    <div key={cat.id}>
                      {/* category header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className={cn("flex h-6 w-6 items-center justify-center rounded-md", meta.iconBg)}>
                          <span className={cn("block h-2 w-2 rounded-sm", meta.iconBg.replace("/10",""), meta.iconColor)} />
                        </div>
                        <h2 className={cn("text-[11px] font-bold uppercase tracking-[0.12em]", meta.accent)}>
                          {cat.title}
                        </h2>
                        <div className="flex-1 h-px bg-border/30" />
                        <span className="text-[11px] text-muted-foreground/40 font-mono tabular-nums">{catTools.length}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
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
                <div className="pb-20">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", meta.iconBg)}>
                      <Ic size={16} strokeWidth={1.75} className={meta.iconColor} />
                    </div>
                    <div>
                      <h2 className={cn("text-[14px] font-bold leading-tight", meta.accent)}>{activeSuite.label} Tools</h2>
                      <p className="text-[11px] text-muted-foreground">{activeSuite.desc}</p>
                    </div>
                    <span className="ml-auto text-[11px] text-muted-foreground/40 font-mono">{catTools.length}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
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
      <footer className="border-t border-border/40 mt-4 bg-card/20">
        <div className="mx-auto max-w-[1200px] px-5 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary shadow shadow-primary/40">
                <Shield size={13} strokeWidth={2.5} className="text-primary-foreground" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-foreground leading-tight">PrivaTools</p>
                <p className="text-[11px] text-muted-foreground/60">{totalTools} tools · no tracking · MIT</p>
              </div>
            </Link>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-muted-foreground">
              {suites.map(s => (
                <button key={s.id} onClick={() => setActiveTab(s.id)} className="hover:text-foreground transition-colors">
                  {s.label}
                </button>
              ))}
              <span className="h-3 w-px bg-border/50" />
              <a href="https://github.com/taiyeba-dg/privatools" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-foreground transition-colors">
                <Github size={12} /> GitHub
              </a>
            </div>
          </div>
          <div className="mt-6 pt-5 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-1">
            <p className="text-[11px] text-muted-foreground/40">© 2025 PrivaTools · MIT License · Free forever</p>
            <p className="text-[11px] text-muted-foreground/40">No cookies · No uploads · No accounts</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
