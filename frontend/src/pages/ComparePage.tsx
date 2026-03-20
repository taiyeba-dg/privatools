import { useParams, Link } from "react-router-dom";
import { Shield, Check, X, Zap, Globe, Lock, Heart, Github, ExternalLink, ArrowRight } from "lucide-react";
import { EditorialMasthead } from "@/components/EditorialMasthead";
import { EditorialFooter } from "@/components/EditorialFooter";

interface CompetitorData {
  name: string;
  slug: string;
  tagline: string;
  features: Record<string, boolean | string>;
}

const competitors: Record<string, CompetitorData> = {
  ilovepdf: {
    name: "iLovePDF",
    slug: "ilovepdf",
    tagline: "Popular PDF tool suite with ads and file limits",
    features: {
      "Free to use": "Limited",
      "No account required": "No",
      "No file size limits": "No (25MB free)",
      "No ads": "No",
      "Open source": "No",
      "Self-hostable": "No",
      "Files processed privately": "No (files uploaded to their servers)",
      "No watermarks on free tier": "Limited",
      "90+ tools (PDF, Image, Video, Dev)": "No (PDF only)",
      "Works offline / client-side tools": "No",
      "JSON-LD structured data": "Yes",
      "API available": "Yes (paid)",
    },
  },
  smallpdf: {
    name: "Smallpdf",
    slug: "smallpdf",
    tagline: "Swiss PDF tool with aggressive upsells",
    features: {
      "Free to use": "Limited (2 tasks/day)",
      "No account required": "No",
      "No file size limits": "No",
      "No ads": "No",
      "Open source": "No",
      "Self-hostable": "No",
      "Files processed privately": "No (files uploaded to their servers)",
      "No watermarks on free tier": "Limited",
      "90+ tools (PDF, Image, Video, Dev)": "No (21 tools, PDF only)",
      "Works offline / client-side tools": "No",
      "Desktop app included": "Yes (paid)",
      "API available": "Yes (paid)",
    },
  },
  "adobe-acrobat": {
    name: "Adobe Acrobat Online",
    slug: "adobe-acrobat",
    tagline: "Industry standard with expensive subscription",
    features: {
      "Free to use": "Very limited",
      "No account required": "No (Adobe ID required)",
      "No file size limits": "No",
      "No ads": "Yes",
      "Open source": "No",
      "Self-hostable": "No",
      "Files processed privately": "No (Adobe cloud)",
      "No watermarks on free tier": "Limited",
      "90+ tools (PDF, Image, Video, Dev)": "No (PDF only)",
      "Works offline / client-side tools": "Desktop app (paid)",
      "E-signatures": "Yes (paid)",
      "API available": "Yes (paid)",
    },
  },
};

const privatoolsFeatures: Record<string, boolean | string> = {
  "Free to use": "Yes — 100% free",
  "No account required": "Yes",
  "No file size limits": "100MB per file",
  "No ads": "Yes",
  "Open source": "Yes (MIT license)",
  "Self-hostable": "Yes (Docker)",
  "Files processed privately": "Yes — deleted immediately",
  "No watermarks on free tier": "Yes",
  "90+ tools (PDF, Image, Video, Dev)": "Yes",
  "Works offline / client-side tools": "Yes (dev tools)",
  "JSON-LD structured data": "Yes",
  "Desktop app included": "PWA installable",
  "E-signatures": "Yes (free)",
  "API available": "Coming soon",
};

function FeatureCell({ value }: { value: boolean | string }) {
  if (value === true || value === "Yes") {
    return <span className="inline-flex items-center gap-1 text-green-600 font-semibold text-sm"><Check className="w-4 h-4" /> Yes</span>;
  }
  if (value === false || value === "No") {
    return <span className="inline-flex items-center gap-1 text-red-500 text-sm"><X className="w-4 h-4" /> No</span>;
  }
  const isPositive = typeof value === "string" && (value.startsWith("Yes") || value === "100MB per file" || value.startsWith("PWA"));
  return <span className={`text-sm ${isPositive ? "text-green-600 font-semibold" : "text-[var(--text-secondary)]"}`}>{value as string}</span>;
}

export default function ComparePage() {
  const { competitor } = useParams<{ competitor: string }>();
  const comp = competitor ? competitors[competitor] : null;

  if (!comp) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <EditorialMasthead />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center space-y-8">
          <h1 className="font-serif text-3xl font-bold">PrivaTools vs The Rest</h1>
          <p className="text-[var(--text-secondary)]">Choose a comparison:</p>
          <div className="grid sm:grid-cols-3 gap-4 max-w-xl mx-auto">
            {Object.entries(competitors).map(([key, c]) => (
              <Link
                key={key}
                to={`/compare/${key}`}
                className="p-4 border border-[var(--border-color)] rounded-lg hover:border-[var(--accent-primary)]/40 transition-colors text-center"
              >
                <div className="font-serif font-bold">{c.name}</div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">{c.tagline}</div>
              </Link>
            ))}
          </div>
        </main>
        <EditorialFooter />
      </div>
    );
  }

  // Combine all features from both
  const allFeatures = [...new Set([...Object.keys(comp.features), ...Object.keys(privatoolsFeatures)])];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <EditorialMasthead />

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* Hero */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--accent-primary)]/30 text-xs font-mono uppercase tracking-widest text-[var(--accent-primary)]">
            <Shield className="w-3.5 h-3.5" /> Honest Comparison
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold leading-tight">
            PrivaTools vs {comp.name}
          </h1>
          <p className="font-serif text-base text-[var(--text-secondary)] max-w-xl mx-auto">
            A side-by-side comparison of features, pricing, and privacy practices.
          </p>
        </header>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-[var(--accent-primary)]">
                <th className="py-3 pr-4 font-mono text-xs uppercase tracking-wider text-[var(--text-secondary)]">Feature</th>
                <th className="py-3 px-4 font-mono text-xs uppercase tracking-wider text-[var(--accent-primary)]">PrivaTools</th>
                <th className="py-3 pl-4 font-mono text-xs uppercase tracking-wider text-[var(--text-secondary)]">{comp.name}</th>
              </tr>
            </thead>
            <tbody>
              {allFeatures.map((feature, i) => (
                <tr key={feature} className={`border-b border-[var(--border-color)] ${i % 2 === 0 ? "" : "bg-[var(--bg-secondary)]/30"}`}>
                  <td className="py-3 pr-4 text-sm font-medium">{feature}</td>
                  <td className="py-3 px-4">
                    <FeatureCell value={privatoolsFeatures[feature] ?? false} />
                  </td>
                  <td className="py-3 pl-4">
                    <FeatureCell value={comp.features[feature] ?? false} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Why PrivaTools */}
        <section className="space-y-6">
          <h2 className="font-serif text-2xl font-bold border-b-2 border-[var(--accent-primary)] pb-2 inline-block">
            Why Choose PrivaTools?
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Lock, title: "True Privacy", desc: "Files are processed and immediately deleted. No cloud storage, no data mining." },
              { icon: Heart, title: "Actually Free", desc: "No '2 tasks/day' limits, no premium upsells, no watermarks. Every tool, every time." },
              { icon: Globe, title: "Open Source", desc: "MIT licensed. Audit every line of code. Self-host with Docker if you don't trust anybody." },
              { icon: Zap, title: "90+ Tools", desc: "Not just PDF — image, video, audio, and developer tools too. All in one place." },
            ].map((item, i) => (
              <div key={i} className="p-4 border border-[var(--border-color)] rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 text-[var(--accent-primary)]" />
                  <h3 className="font-serif font-bold text-sm">{item.title}</h3>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center space-y-4 py-8 border-t border-[var(--border-color)]">
          <h2 className="font-serif text-2xl font-bold">Try PrivaTools — it's free</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent-primary)] text-white rounded-md font-mono text-sm hover:opacity-90 transition-opacity"
            >
              Browse All Tools <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://github.com/taiyeba-dg/privatools"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border border-[var(--border-color)] rounded-md font-mono text-sm hover:border-[var(--accent-primary)]/40 transition-colors"
            >
              <Github className="w-4 h-4" /> View Source
            </a>
          </div>
        </section>

        {/* Other comparisons */}
        <section className="text-center pb-4">
          <p className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] mb-3">Other comparisons</p>
          <div className="flex flex-wrap justify-center gap-2">
            {Object.entries(competitors)
              .filter(([key]) => key !== competitor)
              .map(([key, c]) => (
                <Link
                  key={key}
                  to={`/compare/${key}`}
                  className="px-3 py-1.5 text-xs border border-[var(--border-color)] rounded-md hover:border-[var(--accent-primary)]/40 transition-colors"
                >
                  vs {c.name}
                </Link>
              ))}
          </div>
        </section>
      </main>

      <EditorialFooter />
    </div>
  );
}
