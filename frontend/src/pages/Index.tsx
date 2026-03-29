import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, X, ArrowRight, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { tools, categoryMeta, Category } from "@/data/tools";
import { nonPdfTools, nonPdfCategoryMeta, NonPdfCategory } from "@/data/non-pdf-tools";
import { useHistory } from "@/hooks/useHistory";
import { EditorialMasthead } from "@/components/EditorialMasthead";
import { EditorialFooter } from "@/components/EditorialFooter";

const FEATURED_SLUGS = ["merge-pdf", "compress-pdf", "image-to-pdf", "edit-pdf"];
const FEATURED_TAGLINES: Record<string, string> = {
  "merge-pdf": "Combine multiple PDFs into a single document",
  "compress-pdf": "Shrink file size by up to 90% without quality loss",
  "image-to-pdf": "Turn JPG, PNG, and other images into PDF",
  "edit-pdf": "Modify text and images directly inside the PDF",
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
function ToolCard({ name, description, icon: Icon, href, categoryLabel }: {
  name: string; description: string; icon: React.ElementType;
  href: string; categoryLabel: string;
}) {
  return (
    <Link
      to={href}
      className="tool-card group flex items-start gap-3 border-b border-border/40 py-3.5 px-1 transition-all hover:bg-card/60"
    >
      <Icon size={16} strokeWidth={1.75} className="text-primary mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-heading text-[15px] font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
          {name}
        </p>
        <p className="font-serif-body text-xs text-muted-foreground line-clamp-1 mt-0.5">
          {description}
        </p>
      </div>
      <span className="category-tag shrink-0 hidden sm:block mt-1">{categoryLabel}</span>
      <ArrowRight size={12} className="shrink-0 text-muted-foreground/0 group-hover:text-primary transition-all mt-1" />
    </Link>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function Index() {
  const [activeTab, setActiveTab] = useState<Suite>("pdf");
  const [query, setQuery] = useState("");
  const { history } = useHistory();

  const allSearchable = [
    ...tools.map(t => ({ slug: t.slug, name: t.name, description: t.description, icon: t.icon, href: `/tool/${t.slug}`, cat: categoryMeta[t.category].label })),
    ...nonPdfTools.map(t => ({ slug: t.slug, name: t.name, description: t.description, icon: t.icon, href: `/tools/${t.slug}`, cat: nonPdfCategoryMeta[t.category].label })),
  ];

  const filtered = query.trim()
    ? allSearchable.filter(t => t.name.toLowerCase().includes(query.toLowerCase()) || t.description.toLowerCase().includes(query.toLowerCase()))
    : null;

  const activeNonPdfCat = nonPdfSuiteCategories[activeTab];

  return (
    <div className="min-h-screen bg-background">
      <EditorialMasthead />

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
          <div className="mt-6 flex items-center gap-3 justify-center">
            <Shield size={13} className="text-primary/60" />
            <p className="font-mono-meta text-[10px] uppercase tracking-widest text-muted-foreground/50">
              Your files never leave your device
            </p>
            <Shield size={13} className="text-primary/60" />
          </div>
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
                  <ToolCard key={t.slug} name={t.name} description={t.description} icon={t.icon} href={t.href} categoryLabel={t.cat} />
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
                        ? "text-primary border-b-2 border-primary"
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

            {/* ── Recently Used ────────────────────────────────────── */}
            {history.length > 0 && (() => {
              const recentItems = history.slice(0, 4).map(h => {
                const pdfTool = tools.find(t => t.slug === h.slug);
                const nonPdfTool = nonPdfTools.find(t => t.slug === h.slug);
                if (pdfTool) return { slug: pdfTool.slug, name: pdfTool.name, description: pdfTool.description, icon: pdfTool.icon, href: `/tool/${pdfTool.slug}`, cat: categoryMeta[pdfTool.category].label };
                if (nonPdfTool) return { slug: nonPdfTool.slug, name: nonPdfTool.name, description: nonPdfTool.description, icon: nonPdfTool.icon, href: `/tools/${nonPdfTool.slug}`, cat: nonPdfCategoryMeta[nonPdfTool.category].label };
                return null;
              }).filter(Boolean) as { slug: string; name: string; description: string; icon: React.ElementType; href: string; cat: string }[];
              if (!recentItems.length) return null;
              return (
                <section className="mb-10">
                  <div className="section-flag mb-4">RECENTLY USED</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                    {recentItems.map(t => (
                      <ToolCard key={t.slug} {...t} categoryLabel={t.cat} />
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
                            href={`/tool/${t.slug}`} categoryLabel={meta.label} />
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
                        href={`/tools/${t.slug}`} categoryLabel={meta.label} />
                    ))}
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </main>

      <EditorialFooter />
    </div>
  );
}
