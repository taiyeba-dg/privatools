import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { toolBySlug, tools, categoryMeta } from "@/data/tools";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Shield, ChevronRight, ArrowLeft, Github, ExternalLink } from "lucide-react";
import { useHistory } from "@/hooks/useHistory";
import { Breadcrumb } from "@/components/Breadcrumb";

import { MergeUI } from "@/components/tool-ui/MergeUI";
import { SplitUI } from "@/components/tool-ui/SplitUI";
import { CompressUI } from "@/components/tool-ui/CompressUI";
import { ProtectUI } from "@/components/tool-ui/ProtectUI";
import { WatermarkUI } from "@/components/tool-ui/WatermarkUI";
import { SignUI } from "@/components/tool-ui/SignUI";
import { CompareUI } from "@/components/tool-ui/CompareUI";
import { OcrUI } from "@/components/tool-ui/OcrUI";
import { PageNumbersUI } from "@/components/tool-ui/PageNumbersUI";
import { OrganizeUI } from "@/components/tool-ui/OrganizeUI";
import { GenericUI } from "@/components/tool-ui/GenericUI";
import { HeaderFooterUI } from "@/components/tool-ui/HeaderFooterUI";
import { BookmarksUI } from "@/components/tool-ui/BookmarksUI";
import { BatesUI } from "@/components/tool-ui/BatesUI";
import { ResizeUI } from "@/components/tool-ui/ResizeUI";
import { RedactUI } from "@/components/tool-ui/RedactUI";
import { MetadataUI } from "@/components/tool-ui/MetadataUI";
import { NupUI } from "@/components/tool-ui/NupUI";
import { QrCodeUI } from "@/components/tool-ui/QrCodeUI";
import { RemoveBlankPagesUI } from "@/components/tool-ui/RemoveBlankPagesUI";
import { AutoCropUI } from "@/components/tool-ui/AutoCropUI";
import { PdfToEpubUI } from "@/components/tool-ui/PdfToEpubUI";
import { MarkdownToPdfUI } from "@/components/tool-ui/MarkdownToPdfUI";
import { CsvToPdfUI } from "@/components/tool-ui/CsvToPdfUI";
import { AddHyperlinksUI } from "@/components/tool-ui/AddHyperlinksUI";
import { FormCreatorUI } from "@/components/tool-ui/FormCreatorUI";
import { TransparentBackgroundUI } from "@/components/tool-ui/TransparentBackgroundUI";
import { InvertColorsUI } from "@/components/tool-ui/InvertColorsUI";
import { PdfaValidatorUI } from "@/components/tool-ui/PdfaValidatorUI";
import { VerifySignatureUI } from "@/components/tool-ui/VerifySignatureUI";
import { SanitizeUI } from "@/components/tool-ui/SanitizeUI";
import { UnlockUI } from "@/components/tool-ui/UnlockUI";
import { PdfToImageUI } from "@/components/tool-ui/PdfToImageUI";
import { ImageToPdfUI } from "@/components/tool-ui/ImageToPdfUI";
import { HtmlToPdfUI } from "@/components/tool-ui/HtmlToPdfUI";
import { CropUI } from "@/components/tool-ui/CropUI";
import { PdfToTextUI } from "@/components/tool-ui/PdfToTextUI";
import { RotateUI } from "@/components/tool-ui/RotateUI";
import { FillFormUI } from "@/components/tool-ui/FillFormUI";
import { EditPdfUI } from "@/components/tool-ui/EditPdfUI";

function ToolUI({ slug, toolName, outputLabel, accepts }: { slug: string; toolName: string; outputLabel: string; accepts: string }) {
  switch (slug) {
    // Organize
    case "merge-pdf": return <MergeUI />;
    case "split-pdf":
    case "split-by-bookmarks":
    case "split-by-size": return <SplitUI />;
    case "organize-pages":
    case "delete-pages":
    case "extract-pages": return <OrganizeUI />;

    // Edit
    case "edit-pdf": return <EditPdfUI />;
    case "sign-pdf": return <SignUI />;
    case "watermark": return <WatermarkUI />;
    case "header-footer": return <HeaderFooterUI />;
    case "page-numbers": return <PageNumbersUI />;
    case "bates-numbering": return <BatesUI />;
    case "bookmarks": return <BookmarksUI />;

    // Optimize
    case "compress-pdf": return <CompressUI />;
    case "resize-pdf": return <ResizeUI />;
    case "rotate-pdf": return <RotateUI />;

    // Security
    case "protect-pdf": return <ProtectUI />;
    case "unlock-pdf": return <UnlockUI />;
    case "redact-pdf": return <RedactUI />;
    case "metadata": return <MetadataUI />;

    // Advanced
    case "compare-pdf": return <CompareUI />;
    case "ocr-pdf": return <OcrUI />;
    case "nup": return <NupUI />;
    case "qr-code": return <QrCodeUI />;
    case "fill-form": return <FillFormUI />;
    case "alternate-mix": return <MergeUI />;
    case "overlay": return <CompareUI />;
    case "form-creator": return <FormCreatorUI />;
    case "pdfa-validator": return <PdfaValidatorUI />;
    case "verify-signature": return <VerifySignatureUI />;

    // New cleanup
    case "remove-blank-pages": return <RemoveBlankPagesUI />;

    // New optimize
    case "auto-crop": return <AutoCropUI />;
    case "invert-colors": return <InvertColorsUI />;
    case "crop-pdf": return <CropUI />;

    // New conversions
    case "pdf-to-epub": return <PdfToEpubUI />;
    case "pdf-to-image": return <PdfToImageUI />;
    case "pdf-to-text": return <PdfToTextUI />;
    case "image-to-pdf": return <ImageToPdfUI />;
    case "html-to-pdf": return <HtmlToPdfUI />;
    case "markdown-to-pdf": return <MarkdownToPdfUI />;
    case "csv-to-pdf": return <CsvToPdfUI />;

    // New edit
    case "add-hyperlinks": return <AddHyperlinksUI />;
    case "transparent-background": return <TransparentBackgroundUI />;

    // New security
    case "sanitize-pdf": return <SanitizeUI />;

    default:
      return <GenericUI toolName={toolName} outputLabel={outputLabel} accepts={accepts} slug={slug} />;
  }
}

export default function ToolPage() {
  const { slug } = useParams<{ slug: string }>();
  const tool = slug ? toolBySlug[slug] : null;
  const { addEntry } = useHistory();

  // Track tool usage in history
  useEffect(() => {
    if (tool && slug) {
      addEntry({ slug, name: tool.name, href: `/tool/${slug}` });
    }
  }, [slug, tool, addEntry]);

  const relatedTools = tools
    .filter(t => t.category === tool?.category && t.slug !== slug)
    .slice(0, 6);

  if (!tool) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Tool not found.</p>
          <Button asChild variant="outline"><Link to="/">Go home</Link></Button>
        </div>
      </div>
    );
  }

  const meta = categoryMeta[tool.category];
  const Icon = tool.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-14 items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary glow-primary">
                <Shield size={14} className="text-primary-foreground" strokeWidth={2.25} />
              </div>
              <span className="text-sm font-bold text-foreground">PrivaTools</span>
            </Link>
            <span className="text-muted-foreground text-sm">/</span>
            <span className="text-sm text-muted-foreground truncate max-w-[160px] sm:max-w-none">{tool.name}</span>
            <div className="flex-1" />
            <a href="https://github.com/taiyeba-dg/privatools" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Github size={13} /><span className="hidden sm:inline">Open Source</span>
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        <Breadcrumb items={[
          { label: meta.label, href: `/?tab=${tool.category}` },
          { label: tool.name },
        ]} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
          {/* Main */}
          <div>
            <div className="flex items-start gap-4 mb-8">
              <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", meta.iconBg)}>
                <Icon size={22} strokeWidth={1.75} className={meta.iconColor} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-foreground">{tool.name}</h1>
                  <span className={cn("text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary", meta.accent)}>
                    {meta.label}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground max-w-lg">{tool.longDescription}</p>
              </div>
            </div>

            <ToolUI slug={slug!} toolName={tool.name} outputLabel={tool.outputLabel} accepts={tool.accepts} />

            {/* How it works */}
            <div className="mt-10">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">How it works</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { step: "1", title: "Upload your file", desc: "Drag & drop or click to select. Your files never leave your browser." },
                  { step: "2", title: "Configure & process", desc: "Adjust any settings, then click to process your file instantly." },
                  { step: "3", title: "Download result", desc: "Your processed file is ready. Download it — no waiting, no email." },
                ].map(s => (
                  <div key={s.step} className="rounded-xl border border-border bg-card p-4">
                    <div className="text-xs font-bold text-primary mb-2">Step {s.step}</div>
                    <p className="text-sm font-semibold text-foreground mb-1">{s.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Related tools</h3>
              <div className="space-y-0.5">
                {relatedTools.map(t => {
                  const TIcon = t.icon;
                  const m = categoryMeta[t.category];
                  return (
                    <Link key={t.slug} to={`/tool/${t.slug}`}
                      className="flex items-center gap-3 rounded-lg px-2.5 py-2 hover:bg-secondary/60 transition-colors group">
                      <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", m.iconBg)}>
                        <TIcon size={14} strokeWidth={1.75} className={m.iconColor} />
                      </div>
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex-1 truncate">{t.name}</span>
                      <ChevronRight size={12} className="text-muted-foreground/40 shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Github size={14} className="text-foreground" />
                <span className="text-sm font-semibold text-foreground">Open Source</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">100% free, no accounts, no tracking. Forever.</p>
              <a href="https://github.com/taiyeba-dg/privatools" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
                View on GitHub <ExternalLink size={11} />
              </a>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                🔒 <span className="text-foreground font-medium">Your files stay private.</span> All processing happens locally on your self-hosted server — files are never sent to third parties.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-10 border-t border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-primary">
              <Shield size={11} className="text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">PrivaTools</span>
            <span>· Free forever · MIT License</span>
          </div>
          <p>No cookies · No tracking · No sign-up</p>
        </div>
      </footer>
    </div>
  );
}
