import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, X, ArrowRight, Shield, GitBranch, Star, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { tools, categoryMeta, Category } from "@/data/tools";
import { nonPdfTools, nonPdfCategoryMeta, NonPdfCategory } from "@/data/non-pdf-tools";
import { useHistory } from "@/hooks/useHistory";
import { useFavorites } from "@/hooks/useFavorites";
import { EditorialMasthead } from "@/components/EditorialMasthead";
import { EditorialFooter } from "@/components/EditorialFooter";

const FEATURED_SLUGS = ["merge-pdf", "compress-pdf", "image-to-pdf", "edit-pdf"];
const FEATURED_TAGLINES: Record<string, string> = {
  "merge-pdf": "Combine multiple PDFs into a single document",
  "compress-pdf": "Shrink file size by up to 90% without quality loss",
  "image-to-pdf": "Turn JPG, PNG, and other images into PDF",
  "edit-pdf": "Modify text and images directly inside the PDF",
};
const suiteColors: Record<Suite, string> = {
  pdf: "text-red-400 border-red-400",
  image: "text-pink-400 border-pink-400",
  "video-audio": "text-orange-400 border-orange-400",
  developer: "text-cyan-400 border-cyan-400",
  archive: "text-yellow-400 border-yellow-400",
  "document-office": "text-lime-400 border-lime-400",
};

const featuredTools = FEATURED_SLUGS
  .map(s => tools.find(t => t.slug === s)!)
  .filter(Boolean);

type Suite = "pdf" | "image" | "video-audio" | "developer" | "archive" | "document-office";

const suites: { id: Suite; label: string; count: () => number }[] = [
  { id: "pdf", label: "PDF", count: () => tools.length },
  { id: "image", label: "IMAGE", count: () => nonPdfTools.filter(t => t.category === "image").length },
  { id: "video-audio", label: "VIDEO", count: () => nonPdfTools.filter(t => t.category === "video-audio").length },
  { id: "developer", label: "DEVELOPER", count: () => nonPdfTools.filter(t => t.category === "developer").length },
  { id: "archive", label: "ARCHIVE", count: () => nonPdfTools.filter(t => t.category === "archive").length },
  { id: "document-office", label: "DOCS", count: () => nonPdfTools.filter(t => t.category === "document-office").length },
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

// ── Tool Card ──────────────────────────────────────────────────────────────
function ToolCard({ name, description, icon: Icon, href, categoryLabel, accent, slug, isFav, onToggleFav }: {
  name: string; description: string; icon: React.ElementType;
  href: string; categoryLabel: string; accent?: string;
  slug?: string; isFav?: boolean; onToggleFav?: (slug: string) => void;
}) {
  return (
    <div className="tool-card group flex items-start gap-3 border-b border-border/40 py-3.5 px-1 transition-all hover:bg-card/60 relative">
      <Link to={href} className="flex items-start gap-3 min-w-0 flex-1">
        <Icon size={16} strokeWidth={1.75} className={cn("mt-0.5 shrink-0", accent || "text-primary")} />
        <div className="min-w-0 flex-1">
          <p className="font-heading text-[15px] font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
            {name}
          </p>
          <p className="font-serif-body text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {description}
          </p>
        </div>
      </Link>
      <span className={cn("shrink-0 hidden sm:block mt-1 font-sans-ui text-[0.6rem] font-bold tracking-[0.1em] uppercase", accent || "text-primary")}>{categoryLabel}</span>
      {slug && onToggleFav && (
        <button
          onClick={(e) => { e.preventDefault(); onToggleFav(slug); }}
          className="shrink-0 mt-0.5 transition-all hover:scale-110 active:scale-95"
          title={isFav ? "Remove from favorites" : "Add to favorites"}
        >
          <Star
            size={14}
            className={cn(
              "transition-colors",
              isFav ? "text-primary fill-primary" : "text-muted-foreground/30 hover:text-primary/60"
            )}
          />
        </button>
      )}
      <Link to={href}>
        <ArrowRight size={12} className="shrink-0 text-muted-foreground/0 group-hover:text-primary transition-all mt-1" />
      </Link>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
/** Match a file extension to relevant tools. */
function getToolsForExtension(ext: string) {
  const e = ext.toLowerCase().replace(/^\./, "");
  const matchingPdf = tools.filter(t =>
    t.accepts.split(",").some(a => a.trim().replace(/^\./, "") === e)
  );
  const matchingNonPdf = nonPdfTools.filter(t =>
    t.accepts === "*" ? false : t.accepts.split(",").some(a => a.trim().replace(/^\./, "") === e)
  );
  return {
    pdf: matchingPdf.map(t => ({ ...t, href: `/tool/${t.slug}`, cat: categoryMeta[t.category].label, accent: categoryMeta[t.category].accent })),
    nonPdf: matchingNonPdf.map(t => ({ ...t, href: `/tools/${t.slug}`, cat: nonPdfCategoryMeta[t.category].label, accent: nonPdfCategoryMeta[t.category].accent })),
  };
}

export default function Index() {
  const [activeTab, setActiveTab] = useState<Suite>("pdf");
  const [query, setQuery] = useState("");
  const { history } = useHistory();
  const { favorites, toggle: toggleFav, isFavorite } = useFavorites();
  const navigate = useNavigate();

  // Drag-and-drop state
  const [dragging, setDragging] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const [matchedTools, setMatchedTools] = useState<{ pdf: ReturnType<typeof getToolsForExtension>["pdf"]; nonPdf: ReturnType<typeof getToolsForExtension>["nonPdf"] } | null>(null);

  // Track drag enter/leave depth to handle child elements
  const [dragDepth, setDragDepth] = useState(0);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragDepth(d => d + 1);
    if (e.dataTransfer?.types.includes("Files")) setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragDepth(d => {
      if (d - 1 <= 0) { setDragging(false); return 0; }
      return d - 1;
    });
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    setDragDepth(0);
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop() || "";
    const matched = getToolsForExtension(ext);
    const all = [...matched.pdf, ...matched.nonPdf];
    if (all.length === 1) {
      // Single match — go directly to that tool
      // Store file in sessionStorage for the tool page to pick up
      const reader = new FileReader();
      reader.onload = () => {
        sessionStorage.setItem("privatools_dropped_file", JSON.stringify({ name: file.name, type: file.type, data: reader.result }));
        navigate(all[0].href);
      };
      reader.readAsDataURL(file);
    } else if (all.length > 0) {
      setDroppedFile(file);
      setMatchedTools(matched);
    }
  }, [navigate]);

  useEffect(() => {
    document.addEventListener("dragenter", handleDragEnter);
    document.addEventListener("dragleave", handleDragLeave);
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("drop", handleDrop);
    return () => {
      document.removeEventListener("dragenter", handleDragEnter);
      document.removeEventListener("dragleave", handleDragLeave);
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("drop", handleDrop);
    };
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop]);

  const allSearchable = [
    ...tools.map(t => ({ slug: t.slug, name: t.name, description: t.description, icon: t.icon, href: `/tool/${t.slug}`, cat: categoryMeta[t.category].label, accent: categoryMeta[t.category].accent })),
    ...nonPdfTools.map(t => ({ slug: t.slug, name: t.name, description: t.description, icon: t.icon, href: `/tools/${t.slug}`, cat: nonPdfCategoryMeta[t.category].label, accent: nonPdfCategoryMeta[t.category].accent })),
  ];

  const filtered = query.trim()
    ? allSearchable.filter(t => t.name.toLowerCase().includes(query.toLowerCase()) || t.description.toLowerCase().includes(query.toLowerCase()))
    : null;

  const activeNonPdfCat = nonPdfSuiteCategories[activeTab];

  const allMatched = matchedTools ? [...matchedTools.pdf, ...matchedTools.nonPdf] : [];

  return (
    <div className="min-h-screen bg-background">
      <EditorialMasthead />

      {/* ── Drag overlay ───────────────────────────────────────── */}
      {dragging && (
        <div className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-sm flex items-center justify-center animate-fade-in">
          <div className="text-center space-y-4 animate-pulse-border border-2 border-dashed border-primary/40 rounded-2xl px-16 py-12">
            <Upload size={48} className="text-primary mx-auto" />
            <p className="font-heading text-xl font-bold text-foreground">Drop your file to get started</p>
            <p className="font-mono-meta text-xs text-muted-foreground uppercase tracking-widest">
              We'll show you the right tools
            </p>
          </div>
        </div>
      )}

      {/* ── Matched tools view (after drop) ────────────────────── */}
      {droppedFile && matchedTools && allMatched.length > 0 && (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="font-mono-meta text-[11px] uppercase tracking-widest text-muted-foreground/60 mb-1">
                Tools for your file
              </p>
              <p className="font-heading text-lg font-bold text-foreground">
                {droppedFile.name}
                <span className="font-mono-meta text-xs text-muted-foreground ml-2">
                  {allMatched.length} matching tool{allMatched.length !== 1 ? "s" : ""}
                </span>
              </p>
            </div>
            <button
              onClick={() => { setDroppedFile(null); setMatchedTools(null); }}
              className="font-mono-meta text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest flex items-center gap-1"
            >
              <X size={12} /> Back to all tools
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
            {allMatched.map(t => (
              <ToolCard key={t.slug} name={t.name} description={t.description} icon={t.icon}
                href={t.href} categoryLabel={t.cat} accent={t.accent} slug={t.slug} isFav={isFavorite(t.slug)} onToggleFav={toggleFav} />
            ))}
          </div>
        </div>
      )}

      {/* ── Main content (hidden when showing matched tools) ──── */}
      {!droppedFile && <>
      {/* ── Privacy Trust Banner (homepage only) ────────────────── */}
      <div className="border-y border-border/40 bg-card/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-center gap-3 sm:gap-4">
          <Shield size={15} className="text-primary shrink-0" />
          <p className="font-mono-meta text-[10px] sm:text-[11px] uppercase tracking-widest text-muted-foreground">
            Your files never leave your device. 100% local processing — no uploads, no servers, no tracking.
          </p>
          <Link to="/about" className="font-mono-meta text-[10px] uppercase tracking-widest text-primary hover:text-primary/80 transition-colors whitespace-nowrap shrink-0 hidden sm:block">
            Learn more
          </Link>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 sm:px-6">

        {/* ── Featured Tools ───────────────────────────────────────── */}
        <section className="pt-8 pb-6">
          <p className="font-mono-meta text-[11px] uppercase tracking-widest text-muted-foreground/60 mb-4 text-center">
            Start with our most popular tools
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {featuredTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.slug}
                  to={`/tool/${tool.slug}`}
                  className="group relative flex flex-col items-center text-center gap-3 sm:gap-4 px-4 py-6 sm:py-8 rounded-lg border border-border/60 bg-card/40 hover:border-primary/50 hover:bg-primary/[0.04] transition-all"
                >
                  <div className="flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon size={22} strokeWidth={1.75} className="text-primary sm:w-7 sm:h-7" />
                  </div>
                  <div>
                    <p className="font-heading text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                      {tool.name}
                    </p>
                    <p className="font-serif-body text-[11px] sm:text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                      {FEATURED_TAGLINES[tool.slug]}
                    </p>
                  </div>
                  <ArrowRight size={14} className="absolute top-3 right-3 text-muted-foreground/0 group-hover:text-primary transition-all" />
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── Pipeline Callout ──────────────────────────────────────── */}
        <section className="py-6">
          <Link
            to="/pipeline"
            className="group block rounded-lg border border-primary/20 bg-primary/[0.03] hover:bg-primary/[0.06] hover:border-primary/40 transition-all p-5 sm:p-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15">
                  <GitBranch size={20} className="text-primary" />
                </div>
                <div className="flex items-center gap-1.5 sm:hidden">
                  <span className="font-heading text-base font-bold text-foreground group-hover:text-primary transition-colors">
                    Pipeline
                  </span>
                  <span className="px-1.5 py-0.5 text-[8px] font-bold tracking-wider bg-primary text-primary-foreground rounded-sm leading-none">
                    NEW
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 hidden sm:flex">
                  <span className="font-heading text-base font-bold text-foreground group-hover:text-primary transition-colors">
                    Chain Tools Together with Pipeline
                  </span>
                  <span className="px-1.5 py-0.5 text-[8px] font-bold tracking-wider bg-primary text-primary-foreground rounded-sm leading-none">
                    NEW
                  </span>
                </div>
                <p className="font-serif-body text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Run multiple operations in sequence — merge, compress, watermark, and more — all in one go. No other tool offers this.
                </p>
              </div>
              <span className="font-sans-ui text-xs font-semibold text-primary whitespace-nowrap inline-flex items-center gap-1 shrink-0">
                Try Pipeline <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </Link>
        </section>

        <div className="rule-thin" />

        <div className="flex items-center justify-center py-3">
          <span className="font-mono-meta text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40">All Tools</span>
        </div>

        <div className="rule-thin mb-0" />

        {/* ── Search Bar ─────────────────────────────────────────── */}
        <section className="py-8">
          <div className="max-w-xl mx-auto">
            <div className="flex items-center gap-3 border-b-2 border-foreground/20 focus-within:border-primary transition-colors pb-2">
              <Search size={16} className="text-muted-foreground shrink-0" />
              <input
                className="flex-1 bg-transparent outline-none font-serif-body text-base placeholder:text-muted-foreground/40 text-foreground"
                placeholder="Search 107 tools..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X size={14} />
                </button>
              )}
              <kbd className="hidden sm:block font-mono-meta text-[10px] text-muted-foreground/30 border border-border px-1.5 py-0.5">
                ⌘K
              </kbd>
            </div>
          </div>
        </section>

        {/* ── Search Results ──────────────────────────────────────── */}
        {filtered && (
          <section className="pb-10">
            <div className="flex items-center gap-3 mb-4">
              <p className="font-serif-body text-sm text-muted-foreground">
                <span className="font-bold text-foreground">{filtered.length}</span> result{filtered.length !== 1 ? "s" : ""} for{" "}
                <span className="font-bold text-foreground">"{query}"</span>
              </p>
              <button onClick={() => setQuery("")} className="ml-auto font-mono-meta text-xs text-muted-foreground hover:text-foreground transition-colors">
                CLEAR
              </button>
            </div>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
                {filtered.map(t => (
                  <ToolCard key={t.slug} name={t.name} description={t.description} icon={t.icon} href={t.href} categoryLabel={t.cat} accent={t.accent} slug={t.slug} isFav={isFavorite(t.slug)} onToggleFav={toggleFav} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="font-heading text-xl font-bold text-foreground mb-1">No tools found</p>
                <p className="font-serif-body text-sm text-muted-foreground">Try a different keyword</p>
              </div>
            )}
          </section>
        )}

        {/* ── Suite Tabs ─────────────────────────────────────────── */}
        {!filtered && (
          <>
            <div className="rule-thin mb-4" />
            <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar mb-2">
              {suites.map((s, i) => (
                <span key={s.id} className="flex items-center">
                  {i > 0 && <span className="text-muted-foreground/20 mx-1.5 font-serif-body">·</span>}
                  <button
                    onClick={() => setActiveTab(s.id)}
                    className={cn(
                      "masthead-nav whitespace-nowrap px-2 py-1.5 transition-all",
                      activeTab === s.id
                        ? cn("border-b-2", suiteColors[s.id])
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {s.label}
                    <span className="ml-1 font-mono-meta text-[10px] opacity-50">{s.count()}</span>
                  </button>
                </span>
              ))}
            </div>
            <div className="rule-thin mt-0 mb-8" />

            {/* ── Favorites ────────────────────────────────────────── */}
            {favorites.length > 0 && (() => {
              const favItems = favorites.slice(0, 6).map(slug => {
                const pdfTool = tools.find(t => t.slug === slug);
                const nonPdfTool = nonPdfTools.find(t => t.slug === slug);
                if (pdfTool) return { slug: pdfTool.slug, name: pdfTool.name, description: pdfTool.description, icon: pdfTool.icon, href: `/tool/${pdfTool.slug}`, cat: categoryMeta[pdfTool.category].label, accent: categoryMeta[pdfTool.category].accent };
                if (nonPdfTool) return { slug: nonPdfTool.slug, name: nonPdfTool.name, description: nonPdfTool.description, icon: nonPdfTool.icon, href: `/tools/${nonPdfTool.slug}`, cat: nonPdfCategoryMeta[nonPdfTool.category].label, accent: nonPdfCategoryMeta[nonPdfTool.category].accent };
                return null;
              }).filter(Boolean) as { slug: string; name: string; description: string; icon: React.ElementType; href: string; cat: string; accent: string }[];
              if (!favItems.length) return null;
              return (
                <section className="mb-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Star size={12} className="text-primary fill-primary" />
                    <div className="section-flag">FAVORITES</div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                    {favItems.map(t => (
                      <ToolCard key={t.slug} {...t} categoryLabel={t.cat} isFav={true} onToggleFav={toggleFav} />
                    ))}
                  </div>
                  <div className="rule-thin mt-6" />
                </section>
              );
            })()}

            {/* ── Recently Used ────────────────────────────────────── */}
            {history.length > 0 && (() => {
              const recentItems = history.slice(0, 4).map(h => {
                const pdfTool = tools.find(t => t.slug === h.slug);
                const nonPdfTool = nonPdfTools.find(t => t.slug === h.slug);
                if (pdfTool) return { slug: pdfTool.slug, name: pdfTool.name, description: pdfTool.description, icon: pdfTool.icon, href: `/tool/${pdfTool.slug}`, cat: categoryMeta[pdfTool.category].label, accent: categoryMeta[pdfTool.category].accent };
                if (nonPdfTool) return { slug: nonPdfTool.slug, name: nonPdfTool.name, description: nonPdfTool.description, icon: nonPdfTool.icon, href: `/tools/${nonPdfTool.slug}`, cat: nonPdfCategoryMeta[nonPdfTool.category].label, accent: nonPdfCategoryMeta[nonPdfTool.category].accent };
                return null;
              }).filter(Boolean) as { slug: string; name: string; description: string; icon: React.ElementType; href: string; cat: string; accent: string }[];
              if (!recentItems.length) return null;
              return (
                <section className="mb-10">
                  <div className="section-flag mb-4">RECENTLY USED</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                    {recentItems.map(t => (
                      <ToolCard key={t.slug} {...t} categoryLabel={t.cat} isFav={isFavorite(t.slug)} onToggleFav={toggleFav} />
                    ))}
                  </div>
                  <div className="rule-thin mt-6" />
                </section>
              );
            })()}

            {/* ── PDF Categories ───────────────────────────────────── */}
            {activeTab === "pdf" && (
              <div className="space-y-12 pb-16">
                {pdfCategories.map(cat => {
                  const catTools = tools.filter(t => t.category === cat.id);
                  const meta = categoryMeta[cat.id];
                  return (
                    <section key={cat.id}>
                      <div className="flex items-center gap-3 mb-1">
                        <div className="section-flag">{cat.title.toUpperCase()}</div>
                        <div className="flex-1 rule-thin" />
                        <span className="font-mono-meta text-xs text-muted-foreground/40">{catTools.length} tools</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
                        {catTools.map(t => (
                          <ToolCard key={t.slug} name={t.name} description={t.description} icon={t.icon}
                            href={`/tool/${t.slug}`} categoryLabel={meta.label} accent={meta.accent} slug={t.slug} isFav={isFavorite(t.slug)} onToggleFav={toggleFav} />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}

            {/* ── Non-PDF Suites ──────────────────────────────────── */}
            {activeTab !== "pdf" && activeNonPdfCat && (() => {
              const meta = nonPdfCategoryMeta[activeNonPdfCat];
              const catTools = nonPdfTools.filter(t => t.category === activeNonPdfCat);
              const activeSuite = suites.find(s => s.id === activeTab)!;
              return (
                <div className="pb-16">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="section-flag">{activeSuite.label} TOOLS</div>
                    <div className="flex-1 rule-thin" />
                    <span className="font-mono-meta text-xs text-muted-foreground/40">{catTools.length} tools</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
                    {catTools.map(t => (
                      <ToolCard key={t.slug} name={t.name} description={t.description} icon={t.icon}
                        href={`/tools/${t.slug}`} categoryLabel={meta.label} accent={meta.accent} slug={t.slug} isFav={isFavorite(t.slug)} onToggleFav={toggleFav} />
                    ))}
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </main>
      </>}

      <EditorialFooter />
    </div>
  );
}
