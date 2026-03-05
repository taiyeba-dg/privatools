import { useParams, Link } from "react-router-dom";
import { useEffect, Suspense, lazy, type ComponentType } from "react";
import { nonPdfToolBySlug, nonPdfTools, nonPdfCategoryMeta } from "@/data/non-pdf-tools";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Shield, ChevronRight, ArrowLeft, Github, ExternalLink } from "lucide-react";
import { useHistory } from "@/hooks/useHistory";
import { GenericUI } from "@/components/tool-ui/GenericUI";

type AnyModule = Record<string, unknown>;

function lazyNamed<T extends AnyModule>(loader: () => Promise<T>, exportName: keyof T) {
  return lazy(async () => ({
    default: (await loader())[exportName] as ComponentType,
  }));
}

const LazyImageCompressorUI = lazyNamed(() => import("@/components/tool-ui/ImageCompressorUI"), "ImageCompressorUI");
const LazyImageConverterUI = lazyNamed(() => import("@/components/tool-ui/ImageConverterUI"), "ImageConverterUI");
const LazyRemoveExifUI = lazyNamed(() => import("@/components/tool-ui/RemoveExifUI"), "RemoveExifUI");
const LazyResizeCropImageUI = lazyNamed(() => import("@/components/tool-ui/ResizeCropImageUI"), "ResizeCropImageUI");
const LazyVideoToGifUI = lazyNamed(() => import("@/components/tool-ui/VideoToGifUI"), "VideoToGifUI");
const LazyExtractAudioUI = lazyNamed(() => import("@/components/tool-ui/ExtractAudioUI"), "ExtractAudioUI");
const LazyTrimMediaUI = lazyNamed(() => import("@/components/tool-ui/TrimMediaUI"), "TrimMediaUI");
const LazyCompressVideoUI = lazyNamed(() => import("@/components/tool-ui/CompressVideoUI"), "CompressVideoUI");
const LazyJsonXmlFormatterUI = lazyNamed(() => import("@/components/tool-ui/JsonXmlFormatterUI"), "JsonXmlFormatterUI");
const LazyTextDiffUI = lazyNamed(() => import("@/components/tool-ui/TextDiffUI"), "TextDiffUI");
const LazyBase64UI = lazyNamed(() => import("@/components/tool-ui/Base64UI"), "Base64UI");
const LazyHashGeneratorUI = lazyNamed(() => import("@/components/tool-ui/HashGeneratorUI"), "HashGeneratorUI");
const LazyExtractArchiveUI = lazyNamed(() => import("@/components/tool-ui/ExtractArchiveUI"), "ExtractArchiveUI");
const LazyCreateZipUI = lazyNamed(() => import("@/components/tool-ui/CreateZipUI"), "CreateZipUI");
const LazyCsvJsonUI = lazyNamed(() => import("@/components/tool-ui/CsvJsonUI"), "CsvJsonUI");
const LazyMarkdownHtmlUI = lazyNamed(() => import("@/components/tool-ui/MarkdownHtmlUI"), "MarkdownHtmlUI");
const LazyImageOcrUI = lazyNamed(() => import("@/components/tool-ui/ImageOcrUI"), "ImageOcrUI");
const LazyBarcodeGeneratorUI = lazyNamed(() => import("@/components/tool-ui/BarcodeGeneratorUI"), "BarcodeGeneratorUI");
const LazyUrlToPdfUI = lazyNamed(() => import("@/components/tool-ui/UrlToPdfUI"), "UrlToPdfUI");
const LazyImageWatermarkUI = lazyNamed(() => import("@/components/tool-ui/ImageWatermarkUI"), "ImageWatermarkUI");
const LazyCollageUI = lazyNamed(() => import("@/components/tool-ui/CollageUI"), "CollageUI");
const LazyBackgroundRemoverUI = lazyNamed(() => import("@/components/tool-ui/BackgroundRemoverUI"), "BackgroundRemoverUI");
const LazySvgToPngUI = lazyNamed(() => import("@/components/tool-ui/SvgToPngUI"), "SvgToPngUI");
const LazyHeicToJpgUI = lazyNamed(() => import("@/components/tool-ui/HeicToJpgUI"), "HeicToJpgUI");
const LazyFaviconUI = lazyNamed(() => import("@/components/tool-ui/FaviconUI"), "FaviconUI");

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
    case "image-compressor": return <LazyImageCompressorUI />;
    case "image-converter": return <LazyImageConverterUI />;
    case "remove-exif": return <LazyRemoveExifUI />;
    case "resize-crop-image": return <LazyResizeCropImageUI />;
    case "video-to-gif": return <LazyVideoToGifUI />;
    case "extract-audio": return <LazyExtractAudioUI />;
    case "trim-media": return <LazyTrimMediaUI />;
    case "compress-video": return <LazyCompressVideoUI />;
    case "json-xml-formatter": return <LazyJsonXmlFormatterUI />;
    case "text-diff": return <LazyTextDiffUI />;
    case "base64": return <LazyBase64UI />;
    case "hash-generator": return <LazyHashGeneratorUI />;
    case "extract-archive": return <LazyExtractArchiveUI />;
    case "create-zip": return <LazyCreateZipUI />;
    case "csv-json": return <LazyCsvJsonUI />;
    case "markdown-html": return <LazyMarkdownHtmlUI />;
    case "image-ocr": return <LazyImageOcrUI />;
    case "generate-barcode": return <LazyBarcodeGeneratorUI />;
    case "url-to-pdf": return <LazyUrlToPdfUI />;
    case "image-watermark": return <LazyImageWatermarkUI />;
    case "make-collage": return <LazyCollageUI />;
    case "remove-background": return <LazyBackgroundRemoverUI />;
    case "svg-to-png": return <LazySvgToPngUI />;
    case "heic-to-jpg": return <LazyHeicToJpgUI />;
    case "generate-favicon": return <LazyFaviconUI />;
    default:
      return <GenericUI toolName={toolName} outputLabel={outputLabel} accepts={accepts} slug={slug} />;
  }
}

export default function NonPdfToolPage() {
  const { slug } = useParams<{ slug: string }>();
  const tool = slug ? nonPdfToolBySlug[slug] : null;
  const { addEntry } = useHistory();

  useEffect(() => {
    if (tool && slug) {
      addEntry({ slug, name: tool.name, href: `/tools/${slug}` });
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

  const relatedTools = nonPdfTools
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

  const meta = nonPdfCategoryMeta[tool.category];
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
              <Github size={13} /><span className="hidden sm:inline">Open Source</span>
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft size={12} /> All tools
        </Link>

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
                  { step: "3", title: "Download result", desc: "Your processed file is ready immediately. No email, no waiting." },
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
            {relatedTools.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Related tools</h3>
                <div className="space-y-0.5">
                  {relatedTools.map((t) => {
                    const TIcon = t.icon;
                    const m = nonPdfCategoryMeta[t.category];
                    return (
                      <Link
                        key={t.slug}
                        to={`/tools/${t.slug}`}
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
            )}

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
