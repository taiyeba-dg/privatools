import { useParams, Link } from "react-router-dom";
import { useEffect, useRef, Suspense, lazy, type ComponentType } from "react";
import { toolBySlug, tools, categoryMeta, type Category } from "@/data/tools";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Shield, ChevronRight, Github, ExternalLink, ArrowUpRight } from "lucide-react";
import { useHistory } from "@/hooks/useHistory";
import { Breadcrumb } from "@/components/Breadcrumb";
import { GenericUI } from "@/components/tool-ui/GenericUI";

type AnyModule = Record<string, unknown>;

function lazyNamed<T extends AnyModule>(loader: () => Promise<T>, exportName: keyof T) {
  return lazy(async () => ({
    default: (await loader())[exportName] as ComponentType,
  }));
}

const LazyMergeUI = lazyNamed(() => import("@/components/tool-ui/MergeUI"), "MergeUI");
const LazySplitUI = lazyNamed(() => import("@/components/tool-ui/SplitUI"), "SplitUI");
const LazySplitByBookmarksUI = lazyNamed(() => import("@/components/tool-ui/SplitByBookmarksUI"), "SplitByBookmarksUI");
const LazySplitBySizeUI = lazyNamed(() => import("@/components/tool-ui/SplitBySizeUI"), "SplitBySizeUI");
const LazyCompressUI = lazyNamed(() => import("@/components/tool-ui/CompressUI"), "CompressUI");
const LazyProtectUI = lazyNamed(() => import("@/components/tool-ui/ProtectUI"), "ProtectUI");
const LazyWatermarkUI = lazyNamed(() => import("@/components/tool-ui/WatermarkUI"), "WatermarkUI");
const LazySignUI = lazyNamed(() => import("@/components/tool-ui/SignUI"), "SignUI");
const LazyCompareUI = lazyNamed(() => import("@/components/tool-ui/CompareUI"), "CompareUI");
const LazyOcrUI = lazyNamed(() => import("@/components/tool-ui/OcrUI"), "OcrUI");
const LazyPageNumbersUI = lazyNamed(() => import("@/components/tool-ui/PageNumbersUI"), "PageNumbersUI");
const LazyOrganizeUI = lazyNamed(() => import("@/components/tool-ui/OrganizeUI"), "OrganizeUI");
const LazyDeletePagesUI = lazyNamed(() => import("@/components/tool-ui/DeletePagesUI"), "DeletePagesUI");
const LazyExtractPagesUI = lazyNamed(() => import("@/components/tool-ui/ExtractPagesUI"), "ExtractPagesUI");
const LazyHeaderFooterUI = lazyNamed(() => import("@/components/tool-ui/HeaderFooterUI"), "HeaderFooterUI");
const LazyBookmarksUI = lazyNamed(() => import("@/components/tool-ui/BookmarksUI"), "BookmarksUI");
const LazyBatesUI = lazyNamed(() => import("@/components/tool-ui/BatesUI"), "BatesUI");
const LazyResizeUI = lazyNamed(() => import("@/components/tool-ui/ResizeUI"), "ResizeUI");
const LazyRedactUI = lazyNamed(() => import("@/components/tool-ui/RedactUI"), "RedactUI");
const LazyMetadataUI = lazyNamed(() => import("@/components/tool-ui/MetadataUI"), "MetadataUI");
const LazyNupUI = lazyNamed(() => import("@/components/tool-ui/NupUI"), "NupUI");
const LazyQrCodeUI = lazyNamed(() => import("@/components/tool-ui/QrCodeUI"), "QrCodeUI");
const LazyRemoveBlankPagesUI = lazyNamed(() => import("@/components/tool-ui/RemoveBlankPagesUI"), "RemoveBlankPagesUI");
const LazyAutoCropUI = lazyNamed(() => import("@/components/tool-ui/AutoCropUI"), "AutoCropUI");
const LazyPdfToEpubUI = lazyNamed(() => import("@/components/tool-ui/PdfToEpubUI"), "PdfToEpubUI");
const LazyMarkdownToPdfUI = lazyNamed(() => import("@/components/tool-ui/MarkdownToPdfUI"), "MarkdownToPdfUI");
const LazyCsvToPdfUI = lazyNamed(() => import("@/components/tool-ui/CsvToPdfUI"), "CsvToPdfUI");
const LazyAddHyperlinksUI = lazyNamed(() => import("@/components/tool-ui/AddHyperlinksUI"), "AddHyperlinksUI");
const LazyFormCreatorUI = lazyNamed(() => import("@/components/tool-ui/FormCreatorUI"), "FormCreatorUI");
const LazyTransparentBackgroundUI = lazyNamed(() => import("@/components/tool-ui/TransparentBackgroundUI"), "TransparentBackgroundUI");
const LazyInvertColorsUI = lazyNamed(() => import("@/components/tool-ui/InvertColorsUI"), "InvertColorsUI");
const LazyPdfaValidatorUI = lazyNamed(() => import("@/components/tool-ui/PdfaValidatorUI"), "PdfaValidatorUI");
const LazyVerifySignatureUI = lazyNamed(() => import("@/components/tool-ui/VerifySignatureUI"), "VerifySignatureUI");
const LazySanitizeUI = lazyNamed(() => import("@/components/tool-ui/SanitizeUI"), "SanitizeUI");
const LazyUnlockUI = lazyNamed(() => import("@/components/tool-ui/UnlockUI"), "UnlockUI");
const LazyPdfToImageUI = lazyNamed(() => import("@/components/tool-ui/PdfToImageUI"), "PdfToImageUI");
const LazyImageToPdfUI = lazyNamed(() => import("@/components/tool-ui/ImageToPdfUI"), "ImageToPdfUI");
const LazyHtmlToPdfUI = lazyNamed(() => import("@/components/tool-ui/HtmlToPdfUI"), "HtmlToPdfUI");
const LazyCropUI = lazyNamed(() => import("@/components/tool-ui/CropUI"), "CropUI");
const LazyPdfToTextUI = lazyNamed(() => import("@/components/tool-ui/PdfToTextUI"), "PdfToTextUI");
const LazyRotateUI = lazyNamed(() => import("@/components/tool-ui/RotateUI"), "RotateUI");
const LazyFillFormUI = lazyNamed(() => import("@/components/tool-ui/FillFormUI"), "FillFormUI");
const LazyEditPdfUI = lazyNamed(() => import("@/components/tool-ui/EditPdfUI"), "EditPdfUI");
const LazyStampUI = lazyNamed(() => import("@/components/tool-ui/StampUI"), "StampUI");
const LazyESignUI = lazyNamed(() => import("@/components/tool-ui/ESignUI"), "ESignUI");
const LazyPermissionsUI = lazyNamed(() => import("@/components/tool-ui/PermissionsUI"), "PermissionsUI");
const LazyAttachmentUI = lazyNamed(() => import("@/components/tool-ui/AttachmentUI"), "AttachmentUI");
const LazyAnnotateUI = lazyNamed(() => import("@/components/tool-ui/AnnotateUI"), "AnnotateUI");
const LazyShapesUI = lazyNamed(() => import("@/components/tool-ui/ShapesUI"), "ShapesUI");
const LazyWhiteoutUI = lazyNamed(() => import("@/components/tool-ui/WhiteoutUI"), "WhiteoutUI");
const LazyOverlayUI = lazyNamed(() => import("@/components/tool-ui/OverlayUI"), "OverlayUI");
const LazyAlternateMixUI = lazyNamed(() => import("@/components/tool-ui/AlternateMixUI"), "AlternateMixUI");
const LazyPdfToWordUI = lazyNamed(() => import("@/components/tool-ui/PdfToWordUI"), "PdfToWordUI");
const LazyPdfToExcelUI = lazyNamed(() => import("@/components/tool-ui/PdfToExcelUI"), "PdfToExcelUI");
const LazyPdfToPptxUI = lazyNamed(() => import("@/components/tool-ui/PdfToPptxUI"), "PdfToPptxUI");

const loadSimpleConvertUI = () => import("@/components/tool-ui/SimpleConvertUI");
const LazyPdfToMarkdownUI2 = lazyNamed(loadSimpleConvertUI, "PdfToMarkdownUI2");
const LazyExtractImagesUI = lazyNamed(loadSimpleConvertUI, "ExtractImagesUI");
const LazyExtractTablesUI = lazyNamed(loadSimpleConvertUI, "ExtractTablesUI");
const LazyPdfToPdfaUI = lazyNamed(loadSimpleConvertUI, "PdfToPdfaUI");
const LazyWordToPdfUI = lazyNamed(loadSimpleConvertUI, "WordToPdfUI");
const LazyExcelToPdfUI = lazyNamed(loadSimpleConvertUI, "ExcelToPdfUI");
const LazyPptxToPdfUI = lazyNamed(loadSimpleConvertUI, "PptxToPdfUI");
const LazyTxtToPdfUI = lazyNamed(loadSimpleConvertUI, "TxtToPdfUI");
const LazyJsonToPdfUI = lazyNamed(loadSimpleConvertUI, "JsonToPdfUI");
const LazyXmlToPdfUI = lazyNamed(loadSimpleConvertUI, "XmlToPdfUI");
const LazyEpubToPdfUI = lazyNamed(loadSimpleConvertUI, "EpubToPdfUI");
const LazyRtfToPdfUI = lazyNamed(loadSimpleConvertUI, "RtfToPdfUI");
const LazyFlattenUI = lazyNamed(loadSimpleConvertUI, "FlattenUI");
const LazyDeskewUI = lazyNamed(loadSimpleConvertUI, "DeskewUI");
const LazyRepairUI = lazyNamed(loadSimpleConvertUI, "RepairUI");
const LazyGrayscaleUI = lazyNamed(loadSimpleConvertUI, "GrayscaleUI");
const LazyStripMetadataUI = lazyNamed(() => import("@/components/tool-ui/StripMetadataUI"), "StripMetadataUI");
const LazyDeleteAnnotationsUI = lazyNamed(loadSimpleConvertUI, "DeleteAnnotationsUI");
const LazyOfficeToPdfUI = lazyNamed(loadSimpleConvertUI, "OfficeToPdfUI");
const LazyReversePdfUI = lazyNamed(loadSimpleConvertUI, "ReversePdfUI");
const LazyBookletUI = lazyNamed(loadSimpleConvertUI, "BookletUI");

function CategoryToolNav({ currentSlug, category }: { currentSlug: string; category: Category }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const categoryTools = tools.filter(t => t.category === category);
  const meta = categoryMeta[category];

  useEffect(() => {
    const el = scrollRef.current?.querySelector('[data-active="true"]');
    if (el) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [currentSlug]);

  return (
    <div className="mb-8 -mx-4 sm:-mx-6">
      <div className="px-4 sm:px-6 mb-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/50 font-heading">
          {meta.label} — {categoryTools.length} tools
        </p>
      </div>
      <div ref={scrollRef} className="flex items-center gap-1 overflow-x-auto no-scrollbar px-4 sm:px-6 pb-1">
        {categoryTools.map(t => {
          const TIcon = t.icon;
          const isActive = t.slug === currentSlug;
          return (
            <Link
              key={t.slug}
              to={`/tool/${t.slug}`}
              data-active={isActive}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-all shrink-0",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground/60 hover:text-foreground hover:bg-secondary/40 border border-transparent"
              )}
            >
              <TIcon size={12} strokeWidth={1.75} />
              {t.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function ToolLoadingCard() {
  return (
    <div className="space-y-4">
      <div className="h-40 animate-pulse rounded-2xl border border-border/60 bg-card/50" />
      <div className="h-14 animate-pulse rounded-xl border border-border/60 bg-card/40" />
    </div>
  );
}

function ToolUI({ slug, toolName, outputLabel, accepts }: { slug: string; toolName: string; outputLabel: string; accepts: string }) {
  switch (slug) {
    case "merge-pdf": return <LazyMergeUI />;
    case "split-pdf": return <LazySplitUI />;
    case "split-by-bookmarks": return <LazySplitByBookmarksUI />;
    case "split-by-size": return <LazySplitBySizeUI />;
    case "organize-pages": return <LazyOrganizeUI />;
    case "delete-pages": return <LazyDeletePagesUI />;
    case "extract-pages": return <LazyExtractPagesUI />;
    case "edit-pdf": return <LazyEditPdfUI />;
    case "sign-pdf": return <LazySignUI />;
    case "watermark": return <LazyWatermarkUI />;
    case "header-footer": return <LazyHeaderFooterUI />;
    case "page-numbers": return <LazyPageNumbersUI />;
    case "bates-numbering": return <LazyBatesUI />;
    case "bookmarks": return <LazyBookmarksUI />;
    case "compress-pdf": return <LazyCompressUI />;
    case "resize-pdf": return <LazyResizeUI />;
    case "rotate-pdf": return <LazyRotateUI />;
    case "protect-pdf": return <LazyProtectUI />;
    case "unlock-pdf": return <LazyUnlockUI />;
    case "redact-pdf": return <LazyRedactUI />;
    case "metadata": return <LazyMetadataUI />;
    case "compare-pdf": return <LazyCompareUI />;
    case "ocr-pdf": return <LazyOcrUI />;
    case "nup": return <LazyNupUI />;
    case "qr-code": return <LazyQrCodeUI />;
    case "fill-form": return <LazyFillFormUI />;
    case "alternate-mix": return <LazyAlternateMixUI />;
    case "overlay": return <LazyOverlayUI />;
    case "form-creator": return <LazyFormCreatorUI />;
    case "pdfa-validator": return <LazyPdfaValidatorUI />;
    case "verify-signature": return <LazyVerifySignatureUI />;
    case "remove-blank-pages": return <LazyRemoveBlankPagesUI />;
    case "auto-crop": return <LazyAutoCropUI />;
    case "invert-colors": return <LazyInvertColorsUI />;
    case "crop-pdf": return <LazyCropUI />;
    case "pdf-to-epub": return <LazyPdfToEpubUI />;
    case "pdf-to-image": return <LazyPdfToImageUI />;
    case "pdf-to-text": return <LazyPdfToTextUI />;
    case "image-to-pdf": return <LazyImageToPdfUI />;
    case "html-to-pdf": return <LazyHtmlToPdfUI />;
    case "markdown-to-pdf": return <LazyMarkdownToPdfUI />;
    case "csv-to-pdf": return <LazyCsvToPdfUI />;
    case "add-hyperlinks": return <LazyAddHyperlinksUI />;
    case "transparent-background": return <LazyTransparentBackgroundUI />;
    case "stamp-pdf": return <LazyStampUI />;
    case "esign-pdf": return <LazyESignUI />;
    case "set-permissions": return <LazyPermissionsUI />;
    case "add-attachment": return <LazyAttachmentUI />;
    case "annotate-pdf": return <LazyAnnotateUI />;
    case "add-shapes": return <LazyShapesUI />;
    case "whiteout-pdf": return <LazyWhiteoutUI />;
    case "sanitize-pdf": return <LazySanitizeUI />;
    case "pdf-to-word": return <LazyPdfToWordUI />;
    case "pdf-to-excel": return <LazyPdfToExcelUI />;
    case "pdf-to-pptx": return <LazyPdfToPptxUI />;
    case "pdf-to-markdown": return <LazyPdfToMarkdownUI2 />;
    case "extract-images": return <LazyExtractImagesUI />;
    case "extract-tables": return <LazyExtractTablesUI />;
    case "pdf-to-pdfa": return <LazyPdfToPdfaUI />;
    case "word-to-pdf": return <LazyWordToPdfUI />;
    case "excel-to-pdf": return <LazyExcelToPdfUI />;
    case "pptx-to-pdf-convert": return <LazyPptxToPdfUI />;
    case "txt-to-pdf": return <LazyTxtToPdfUI />;
    case "json-to-pdf": return <LazyJsonToPdfUI />;
    case "xml-to-pdf": return <LazyXmlToPdfUI />;
    case "epub-to-pdf": return <LazyEpubToPdfUI />;
    case "rtf-to-pdf": return <LazyRtfToPdfUI />;
    case "office-to-pdf": return <LazyOfficeToPdfUI />;
    case "flatten-pdf": return <LazyFlattenUI />;
    case "deskew-pdf": return <LazyDeskewUI />;
    case "repair-pdf": return <LazyRepairUI />;
    case "grayscale-pdf": return <LazyGrayscaleUI />;
    case "strip-metadata": return <LazyStripMetadataUI />;
    case "delete-annotations": return <LazyDeleteAnnotationsUI />;
    case "reverse-pdf": return <LazyReversePdfUI />;
    case "booklet-pdf": return <LazyBookletUI />;
    default:
      return <GenericUI toolName={toolName} outputLabel={outputLabel} accepts={accepts} slug={slug} />;
  }
}

export default function ToolPage() {
  const { slug } = useParams<{ slug: string }>();
  const tool = slug ? toolBySlug[slug] : null;
  const { addEntry } = useHistory();

  useEffect(() => {
    if (tool && slug) {
      addEntry({ slug, name: tool.name, href: `/tool/${slug}` });
    }
  }, [slug, tool, addEntry]);

  useEffect(() => {
    if (tool) {
      document.title = `${tool.name} — PrivaTools`;
      let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "description";
        document.head.appendChild(meta);
      }
      meta.content = tool.longDescription || tool.description;
    }
    return () => {
      document.title = "PrivaTools";
    };
  }, [tool]);

  const relatedTools = tools
    .filter((t) => t.category === tool?.category && t.slug !== slug)
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
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/30 bg-background/75 backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-14 items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 shrink-0 logo-animated">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/25">
                <Shield size={14} className="text-primary-foreground logo-shield" strokeWidth={2.5} />
              </div>
              <span className="text-[15px] font-bold text-foreground font-heading">PrivaTools</span>
            </Link>
            <span className="text-muted-foreground/30 text-sm">/</span>
            <span className="text-sm text-muted-foreground truncate max-w-[180px] sm:max-w-none">{tool.name}</span>
            <div className="flex-1" />
            <a
              href="https://github.com/taiyeba-dg/privatools"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-border/40 bg-secondary/25 px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
            >
              <Github size={13} />
              <span className="hidden sm:inline">Open Source</span>
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        <Breadcrumb items={[
          { label: meta.label, href: `/?tab=${tool.category}` },
          { label: tool.name },
        ]} />

        <CategoryToolNav currentSlug={slug!} category={tool.category} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_290px] gap-10">
          <div>
            {/* Tool header */}
            <div className="flex items-start gap-4 mb-8">
              <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl", meta.iconBg)}>
                <Icon size={26} strokeWidth={1.5} className={meta.iconColor} />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading tracking-tight">{tool.name}</h1>
                  <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-secondary", meta.accent)}>
                    {meta.label}
                  </span>
                  {tool.clientOnly && (
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                      Client-Side
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground max-w-lg leading-relaxed">{tool.longDescription}</p>
              </div>
            </div>

            {/* Tool UI */}
            <Suspense fallback={<ToolLoadingCard />}>
              <ToolUI slug={slug!} toolName={tool.name} outputLabel={tool.outputLabel} accepts={tool.accepts} />
            </Suspense>

            {/* How it works */}
            <div className="mt-12">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-5 font-heading">How it works</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    step: "01",
                    title: "Upload your file",
                    desc: tool.clientOnly
                      ? "Drag & drop or click to select. Processing happens locally in your browser."
                      : "Drag & drop or click to select. Files are processed on your self-hosted server.",
                  },
                  {
                    step: "02",
                    title: "Configure & process",
                    desc: tool.clientOnly
                      ? "Adjust settings and process instantly without uploading file contents."
                      : "Adjust any settings, then process instantly on your server.",
                  },
                  { step: "03", title: "Download result", desc: "Your processed file is ready. Download it — no waiting, no email." },
                ].map((s) => (
                  <div key={s.step} className="rounded-xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm">
                    <div className="text-lg font-black text-primary/30 font-heading mb-2">{s.step}</div>
                    <p className="text-sm font-bold text-foreground mb-1.5 font-heading">{s.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="rounded-xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 font-heading">Related tools</h3>
              <div className="space-y-0.5">
                {relatedTools.map((t) => {
                  const TIcon = t.icon;
                  const m = categoryMeta[t.category];
                  return (
                    <Link
                      key={t.slug}
                      to={`/tool/${t.slug}`}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-primary/6 transition-colors group"
                    >
                      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", m.iconBg)}>
                        <TIcon size={14} strokeWidth={1.75} className={m.iconColor} />
                      </div>
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex-1 truncate">{t.name}</span>
                      <ChevronRight size={12} className="text-muted-foreground/25 group-hover:text-primary/50 shrink-0 transition-colors" />
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Github size={14} className="text-foreground" />
                <span className="text-sm font-bold text-foreground font-heading">Open Source</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">100% free, no accounts, no tracking. Forever.</p>
              <a
                href="https://github.com/taiyeba-dg/privatools"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
              >
                View on GitHub <ArrowUpRight size={11} />
              </a>
            </div>

            <div className="rounded-xl border border-primary/15 bg-primary/5 p-5">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <Shield size={12} className="inline-block mr-1 text-primary" />
                <span className="text-foreground font-semibold">Your files stay private.</span> All processing happens locally on your self-hosted server — files are never sent to third parties.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-12 border-t border-border/30 bg-card/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
              <Shield size={11} className="text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground font-heading">PrivaTools</span>
            <span className="text-muted-foreground/40">· Free forever · MIT License</span>
          </div>
          <p className="text-muted-foreground/40">No cookies · No tracking · No sign-up</p>
        </div>
      </footer>
    </div>
  );
}
