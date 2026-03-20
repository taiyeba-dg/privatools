import { Link } from "react-router-dom";
import { tools } from "@/data/tools";
import { nonPdfTools } from "@/data/non-pdf-tools";

interface RelatedToolsProps {
  currentSlug: string;
  category: string;
  isPdf?: boolean;
}

/**
 * Shows 4 related tools from the same category with real <a> links for Google crawling.
 */
export function RelatedTools({ currentSlug, category, isPdf = true }: RelatedToolsProps) {
  const allTools = isPdf ? tools : [...tools, ...nonPdfTools];

  const related = allTools
    .filter(t => t.category === category && t.slug !== currentSlug)
    .slice(0, 4);

  // If not enough from same category, fill with popular tools
  if (related.length < 4) {
    const popular = ["merge-pdf", "compress-pdf", "split-pdf", "pdf-to-word", "protect-pdf", "ocr-pdf"];
    const extras = allTools
      .filter(t => popular.includes(t.slug) && t.slug !== currentSlug && !related.find(r => r.slug === t.slug))
      .slice(0, 4 - related.length);
    related.push(...extras);
  }

  if (related.length === 0) return null;

  const getPath = (slug: string) => {
    const inPdf = tools.find(t => t.slug === slug);
    return inPdf ? `/tool/${slug}` : `/tools/${slug}`;
  };

  return (
    <section className="mt-10 pt-8 border-t border-[var(--border-color)]">
      <h2 className="font-serif text-lg font-bold mb-4 text-[var(--text-primary)]">
        Related Tools
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {related.map(tool => (
          <Link
            key={tool.slug}
            to={getPath(tool.slug)}
            className="group p-4 rounded-lg border border-[var(--border-color)] hover:border-[var(--accent-primary)]/40 transition-all hover:shadow-sm"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <tool.icon className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
              <span className="font-serif text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors truncate">
                {tool.name}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
              {tool.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
