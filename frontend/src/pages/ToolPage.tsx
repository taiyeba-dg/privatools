import { useParams, Link } from "react-router-dom";
import { useEffect, useRef, Suspense, lazy, type ComponentType } from "react";
import { toolBySlug, tools, categoryMeta, type Category } from "@/data/tools";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Shield, ChevronRight, Github, ExternalLink, ArrowUpRight, ArrowRight, Lock, BookOpen } from "lucide-react";
import { useHistory } from "@/hooks/useHistory";
import { Breadcrumb } from "@/components/Breadcrumb";
import { GenericUI } from "@/components/tool-ui/GenericUI";
import { EditorialMasthead } from "@/components/EditorialMasthead";
import { EditorialFooter } from "@/components/EditorialFooter";

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

// Map tool slugs to related blog posts for internal linking
const TOOL_BLOG_LINKS: Record<string, { slug: string; title: string }[]> = {
  "merge-pdf": [
    { slug: "merge-pdf-files-online-free", title: "How to Merge PDF Files Online for Free" },
    { slug: "best-free-pdf-tools-2026", title: "Best Free PDF Tools in 2026" },
  ],
  "split-pdf": [
    { slug: "split-pdf-online-free", title: "How to Split a PDF File Online — 3 Methods" },
  ],
  "split-by-bookmarks": [
    { slug: "split-pdf-online-free", title: "How to Split a PDF File Online — 3 Methods" },
  ],
  "split-by-size": [
    { slug: "split-pdf-online-free", title: "How to Split a PDF File Online — 3 Methods" },
  ],
  "compress-pdf": [
    { slug: "compress-pdf-without-losing-quality", title: "How to Compress a PDF Without Losing Quality" },
    { slug: "best-free-pdf-tools-2026", title: "Best Free PDF Tools in 2026" },
  ],
  "edit-pdf": [
    { slug: "edit-pdf-online-free-no-sign-up", title: "How to Edit a PDF Online — No Sign-Up" },
    { slug: "best-free-online-pdf-editors-2026", title: "Best Free Online PDF Editors in 2026" },
  ],
  "sign-pdf": [
    { slug: "edit-pdf-online-free-no-sign-up", title: "How to Edit a PDF Online — No Sign-Up" },
  ],
  "esign-pdf": [
    { slug: "edit-pdf-online-free-no-sign-up", title: "How to Edit a PDF Online — No Sign-Up" },
  ],
  "annotate-pdf": [
    { slug: "edit-pdf-online-free-no-sign-up", title: "How to Edit a PDF Online — No Sign-Up" },
  ],
  "protect-pdf": [
    { slug: "remove-password-from-pdf", title: "How to Remove a Password from a PDF" },
  ],
  "unlock-pdf": [
    { slug: "remove-password-from-pdf", title: "How to Remove a Password from a PDF" },
  ],
  "redact-pdf": [
    { slug: "redact-pdf-free-guide", title: "How to Redact Sensitive Information from PDFs" },
  ],
  "word-to-pdf": [
    { slug: "convert-word-to-pdf-free", title: "How to Convert Word to PDF for Free" },
  ],
  "office-to-pdf": [
    { slug: "convert-word-to-pdf-free", title: "How to Convert Word to PDF for Free" },
  ],
  "pdf-to-word": [
    { slug: "best-free-pdf-tools-2026", title: "Best Free PDF Tools in 2026" },
  ],
  "ocr-pdf": [
    { slug: "best-free-pdf-tools-2026", title: "Best Free PDF Tools in 2026" },
  ],
  "fill-form": [
    { slug: "edit-pdf-online-free-no-sign-up", title: "How to Edit a PDF Online — No Sign-Up" },
  ],
  "form-creator": [
    { slug: "edit-pdf-online-free-no-sign-up", title: "How to Edit a PDF Online — No Sign-Up" },
  ],
  "flatten-pdf": [
    { slug: "best-free-pdf-tools-2026", title: "Best Free PDF Tools in 2026" },
  ],
  "watermark": [
    { slug: "edit-pdf-online-free-no-sign-up", title: "How to Edit a PDF Online — No Sign-Up" },
  ],
  "strip-metadata": [
    { slug: "redact-pdf-free-guide", title: "How to Redact Sensitive Information from PDFs" },
  ],
  "sanitize-pdf": [
    { slug: "redact-pdf-free-guide", title: "How to Redact Sensitive Information from PDFs" },
  ],
};

function CategoryToolNav({ currentSlug, category }: { currentSlug: string; category: Category }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const categoryTools = tools.filter(t => t.category === category);
  const meta = categoryMeta[category];
  useEffect(() => {
    const el = scrollRef.current?.querySelector('[data-active="true"]');
    if (el) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [currentSlug]);
  return (
    <div className="mb-6">
      <p className="font-mono-meta text-[10px] text-muted-foreground/50 mb-2">{meta.label} — {categoryTools.length} tools</p>
      <div ref={scrollRef} className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
        {categoryTools.map(t => {
          const TIcon = t.icon;
          const isActive = t.slug === currentSlug;
          return (
            <Link key={t.slug} to={`/tool/${t.slug}`} data-active={isActive}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1.5 text-[12px] font-sans-ui font-medium transition-all shrink-0 border-b-2",
                isActive ? "border-primary text-primary" : "border-transparent text-muted-foreground/60 hover:text-foreground hover:border-foreground/20"
              )}>
              <TIcon size={12} strokeWidth={1.75} />
              {t.name}
            </Link>
          );
        })}
      </div>
      <div className="rule-thin" />
    </div>
  );
}

function ToolLoadingCard() {
  return (
    <div className="space-y-4">
      <div className="h-40 animate-pulse border border-border/40 bg-card/50" />
      <div className="h-14 animate-pulse border border-border/40 bg-card/40" />
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

  const relatedTools = tools.filter(t => t.category === tool?.category && t.slug !== slug).slice(0, 6);

  if (!tool) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="font-serif-body text-muted-foreground mb-4">Tool not found.</p>
          <Link to="/" className="btn-editorial inline-block">← Back to all tools</Link>
        </div>
      </div>
    );
  }

  const meta = categoryMeta[tool.category];

  return (
    <div className="min-h-screen bg-background">
      <EditorialMasthead />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
        <nav className="font-mono-meta text-[11px] text-muted-foreground mb-6 flex items-center gap-1.5">
          <Link to="/" className="hover:text-foreground transition-colors">ALL TOOLS</Link>
          <span className="text-muted-foreground/30">›</span>
          <Link to={`/?tab=${tool.category}`} className="hover:text-foreground transition-colors">{meta.label.toUpperCase()}</Link>
          <span className="text-muted-foreground/30">›</span>
          <span className="text-foreground">{tool.name.toUpperCase()}</span>
        </nav>

        <CategoryToolNav currentSlug={slug!} category={tool.category} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
          <div>
            <div className="mb-8">
              <span className="section-flag">{meta.label}</span>
              {tool.clientOnly && <span className="section-flag ml-2 !bg-green-700 dark:!bg-green-800">CLIENT-SIDE</span>}
              <h1 className="font-heading text-3xl sm:text-5xl font-bold text-foreground mt-4 tracking-tight">{tool.name}</h1>
              <div className="rule-accent mt-4 mb-4 w-16" />
              <p className="font-serif-body text-base sm:text-lg text-foreground/75 leading-relaxed max-w-xl">{tool.longDescription || tool.description}</p>
            </div>

            <div className="editorial-insert p-4 sm:p-6 mb-8">
              <Suspense fallback={<ToolLoadingCard />}>
                <ToolUI slug={slug!} toolName={tool.name} outputLabel={tool.outputLabel} accepts={tool.accepts} />
              </Suspense>
            </div>

            <div className="mt-10 mb-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="section-flag">HOW IT WORKS</div>
                <div className="flex-1 rule-thin" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  { step: "I.", title: "Upload your file", desc: tool.clientOnly ? "Drag & drop or click to select. Processing happens locally in your browser." : "Drag & drop or click to select. Files are processed on your self-hosted server." },
                  { step: "II.", title: "Configure & process", desc: tool.clientOnly ? "Adjust settings and process instantly without uploading file contents." : "Adjust any settings, then process instantly on your server." },
                  { step: "III.", title: "Download result", desc: "Your processed file is ready. Download it — no waiting, no email." },
                ].map(s => (
                  <div key={s.step} className="editorial-insert p-5">
                    <div className="font-heading text-2xl font-bold text-primary/40 mb-2">{s.step}</div>
                    <p className="font-heading text-sm font-bold text-foreground mb-1.5">{s.title}</p>
                    <p className="font-serif-body text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="editorial-insert p-5">
              <h3 className="font-sans-ui text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Related tools</h3>
              <div className="space-y-0.5">
                {relatedTools.map(t => {
                  const TIcon = t.icon;
                  return (
                    <Link key={t.slug} to={`/tool/${t.slug}`} className="flex items-center gap-3 px-2 py-2 hover:bg-card/60 transition-colors group">
                      <TIcon size={14} strokeWidth={1.75} className="text-primary shrink-0" />
                      <span className="font-serif-body text-sm text-muted-foreground group-hover:text-foreground transition-colors flex-1 truncate">{t.name}</span>
                      <ArrowRight size={10} className="text-muted-foreground/0 group-hover:text-primary transition-all shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="editorial-insert p-5">
              <div className="flex items-center gap-2 mb-2">
                <Github size={14} className="text-foreground" />
                <span className="font-sans-ui text-sm font-bold text-foreground">Open Source</span>
              </div>
              <p className="font-serif-body text-xs text-muted-foreground leading-relaxed mb-3">100% free, no accounts, no tracking. Forever.</p>
              <a href="https://github.com/taiyeba-dg/privatools" target="_blank" rel="noopener noreferrer" className="font-sans-ui inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline">
                View on GitHub <ArrowUpRight size={11} />
              </a>
            </div>

            <div className="editorial-insert p-5 border-l-4 !border-l-primary">
              <p className="font-serif-body text-xs text-muted-foreground leading-relaxed">
                <Lock size={12} className="inline-block mr-1 text-primary" />
                <span className="text-foreground font-semibold">Your files stay private.</span>{" "}
                All processing happens locally on your self-hosted server — files are never sent to third parties.
              </p>
            </div>

            {slug && TOOL_BLOG_LINKS[slug] && TOOL_BLOG_LINKS[slug].length > 0 && (
              <div className="editorial-insert p-5">
                <h3 className="font-sans-ui text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Related articles</h3>
                <div className="space-y-0.5">
                  {TOOL_BLOG_LINKS[slug].map(post => (
                    <Link key={post.slug} to={`/blog/${post.slug}`} className="flex items-center gap-3 px-2 py-2 hover:bg-card/60 transition-colors group">
                      <BookOpen size={14} strokeWidth={1.75} className="text-primary shrink-0" />
                      <span className="font-serif-body text-sm text-muted-foreground group-hover:text-foreground transition-colors flex-1">{post.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <EditorialFooter />
    </div>
  );
}
