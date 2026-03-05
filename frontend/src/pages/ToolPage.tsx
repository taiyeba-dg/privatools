import { useParams, Link } from "react-router-dom";
import { useEffect, Suspense, lazy, type ComponentType } from "react";
import { toolBySlug, tools, categoryMeta } from "@/data/tools";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Shield, ChevronRight, Github, ExternalLink } from "lucide-react";
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
const LazyStripMetadataUI = lazyNamed(loadSimpleConvertUI, "StripMetadataUI");
const LazyDeleteAnnotationsUI = lazyNamed(loadSimpleConvertUI, "DeleteAnnotationsUI");
const LazyOfficeToPdfUI = lazyNamed(loadSimpleConvertUI, "OfficeToPdfUI");

function ToolLoadingCard() {
  return (
    <div className="space-y-3">
      <div className="h-36 animate-pulse rounded-2xl border border-border bg-card/70" />
      <div className="h-14 animate-pulse rounded-xl border border-border bg-card/60" />
      <div className="h-14 animate-pulse rounded-xl border border-border bg-card/60" />
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
            <a
              href="https://github.com/taiyeba-dg/privatools"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
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

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
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
                  {tool.clientOnly && (
                    <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                      Client-Side
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground max-w-lg">{tool.longDescription}</p>
              </div>
            </div>

            <Suspense fallback={<ToolLoadingCard />}>
              <ToolUI slug={slug!} toolName={tool.name} outputLabel={tool.outputLabel} accepts={tool.accepts} />
            </Suspense>

            <div className="mt-10">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">How it works</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    step: "1",
                    title: "Upload your file",
                    desc: tool.clientOnly
                      ? "Drag & drop or click to select. Processing happens locally in your browser."
                      : "Drag & drop or click to select. Files are processed on your self-hosted server.",
                  },
                  {
                    step: "2",
                    title: "Configure & process",
                    desc: tool.clientOnly
                      ? "Adjust settings and process instantly without uploading file contents."
                      : "Adjust any settings, then process instantly on your server.",
                  },
                  { step: "3", title: "Download result", desc: "Your processed file is ready. Download it — no waiting, no email." },
                ].map((s) => (
                  <div key={s.step} className="rounded-xl border border-border bg-card p-4">
                    <div className="text-xs font-bold text-primary mb-2">Step {s.step}</div>
                    <p className="text-sm font-semibold text-foreground mb-1">{s.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Related tools</h3>
              <div className="space-y-0.5">
                {relatedTools.map((t) => {
                  const TIcon = t.icon;
                  const m = categoryMeta[t.category];
                  return (
                    <Link
                      key={t.slug}
                      to={`/tool/${t.slug}`}
                      className="flex items-center gap-3 rounded-lg px-2.5 py-2 hover:bg-secondary/60 transition-colors group"
                    >
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
              <a
                href="https://github.com/taiyeba-dg/privatools"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
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
