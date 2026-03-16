import { useState, useRef, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Shield, ArrowLeft, Plus, X, Play, Download, Loader2, CheckCircle, AlertCircle, FileText, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { tools } from "@/data/tools";
import { getToolEndpoint } from "@/lib/tool-endpoints";

const API = import.meta.env.VITE_API_URL || "";

const PIPELINE_TOOL_SLUGS = new Set([
  "compress-pdf",
  "flatten-pdf",
  "deskew-pdf",
  "repair-pdf",
  "grayscale-pdf",
  "crop-pdf",
  "rotate-pdf",
  "resize-pdf",
  "strip-metadata",
  "delete-annotations",
  "remove-blank-pages",
  "auto-crop",
  "invert-colors",
  "sanitize-pdf",
  "pdf-to-pdfa",
  "stamp-pdf",
  "add-hyperlinks",
  "transparent-background",
  "page-numbers",
  "bates-numbering",
]);

const pipelineTools = tools
  .filter((t) => PIPELINE_TOOL_SLUGS.has(t.slug))
  .map((t) => ({ slug: t.slug, endpoint: getToolEndpoint(t.slug), name: t.name, icon: t.icon }));

interface PipelineStep {
  tool: (typeof pipelineTools)[0];
}

export default function PipelinePage() {
  const [steps, setSteps] = useState<PipelineStep[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addingStep, setAddingStep] = useState(false);
  const [stepSearch, setStepSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredTools = useMemo(
    () =>
      stepSearch.trim()
        ? pipelineTools.filter((t) => t.name.toLowerCase().includes(stepSearch.toLowerCase()))
        : pipelineTools,
    [stepSearch],
  );

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  const addStep = (tool: (typeof pipelineTools)[0]) => {
    setSteps((prev) => [...prev, { tool }]);
    setAddingStep(false);
    setStepSearch("");
  };

  const removeStep = (idx: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveStep = (idx: number, dir: -1 | 1) => {
    setSteps((prev) => {
      const arr = [...prev];
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= arr.length) return arr;
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
  };

  const runPipeline = async () => {
    if (!file || steps.length === 0 || processing) return;
    setProcessing(true);
    setError(null);
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      setResultUrl(null);
    }

    let currentBlob: Blob = file;

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      try {
        const formData = new FormData();
        formData.append("file", currentBlob, file.name);

        const resp = await fetch(`${API}/api${steps[i].tool.endpoint}`, {
          method: "POST",
          body: formData,
        });

        if (!resp.ok) {
          const payload = await resp.json().catch(() => ({ detail: `HTTP ${resp.status}` }));
          const detail = payload.detail || `HTTP ${resp.status}`;
          throw new Error(`Step ${i + 1} (${steps[i].tool.name}) failed: ${detail}`);
        }

        currentBlob = await resp.blob();
      } catch (e: any) {
        setError(e.message || "Pipeline failed");
        setProcessing(false);
        setCurrentStep(-1);
        return;
      }
    }

    const url = URL.createObjectURL(currentBlob);
    setResultUrl(url);
    setProcessing(false);
    setCurrentStep(-1);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/75 backdrop-blur-2xl border-b border-border/30">
        <div className="mx-auto max-w-[900px] px-5">
          <div className="flex h-[52px] items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/25">
                <Shield size={13} strokeWidth={2.5} className="text-primary-foreground" />
              </div>
              <span className="text-[15px] font-extrabold text-foreground tracking-tight font-heading">PrivaTools</span>
            </Link>
            <div className="hidden lg:block h-4 w-px bg-border/40" />
            <span className="text-[13px] font-medium text-muted-foreground">PDF Pipeline</span>
            <Link
              to="/"
              className="ml-auto flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground rounded-xl px-3 py-1.5 hover:bg-card/60 transition-all"
            >
              <ArrowLeft size={13} /> Back
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[900px] px-5 py-10">
        <h1 className="text-2xl font-bold text-foreground mb-2 font-heading">PDF Pipeline</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Chain multiple PDF tools together. Supported pipeline steps are tools that work with file-only defaults.
        </p>

        {/* Input PDF */}
        <div className="mb-8">
          <label className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2 block font-heading">Input PDF</label>
          {!file ? (
            <div
              className="border-2 border-dashed border-border/50 rounded-2xl p-8 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all group"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
              }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-4 group-hover:bg-primary/15 transition-colors">
                <FileText size={22} className="text-primary/60 group-hover:text-primary/80 transition-colors" />
              </div>
              <p className="text-[14px] font-semibold text-foreground mb-1">Drop a PDF or click to browse</p>
              <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                <FileText size={14} className="text-primary/70" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">{file.name}</p>
                <p className="text-[11px] text-muted-foreground/50">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  if (resultUrl) {
                    URL.revokeObjectURL(resultUrl);
                    setResultUrl(null);
                  }
                }}
                className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Pipeline Steps */}
        <div className="mb-8">
          <label className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-3 block font-heading">Pipeline Steps</label>

          {steps.length === 0 && !addingStep && (
            <div className="text-center py-8 border border-dashed border-border/40 rounded-2xl mb-3">
              <Layers size={24} className="mx-auto text-muted-foreground/20 mb-2" />
              <p className="text-[13px] text-muted-foreground/50">No steps yet -- add tools to build your pipeline</p>
            </div>
          )}

          <div className="space-y-0">
            {steps.map((step, i) => {
              const Ic = step.tool.icon;
              const isRunning = processing && currentStep === i;
              const isDone = processing ? currentStep > i : resultUrl !== null;
              return (
                <div key={i} className="relative">
                  {/* Connector line */}
                  {i > 0 && (
                    <div className="absolute left-[23px] -top-[1px] w-px h-[1px]">
                      <div
                        className={cn(
                          "w-px h-5 -translate-y-full",
                          isDone ? "bg-green-500/40" : isRunning ? "bg-primary/40" : "bg-border/40",
                        )}
                        style={{ position: "absolute", bottom: 0 }}
                      />
                    </div>
                  )}

                  <div
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all mb-2 backdrop-blur-sm",
                      isRunning
                        ? "border-primary/30 bg-primary/5"
                        : isDone
                          ? "border-green-500/25 bg-green-500/5"
                          : "border-border/60 bg-card/60",
                    )}
                  >
                    {/* Number badge */}
                    <div
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold shrink-0 transition-all",
                        isRunning
                          ? "bg-primary/20 text-primary shadow-md shadow-primary/25"
                          : isDone
                            ? "bg-green-500/15 text-green-400"
                            : "bg-card/80 border border-border/40 text-muted-foreground/50",
                      )}
                    >
                      {i + 1}
                    </div>

                    <Ic size={14} className={cn("shrink-0", isRunning ? "text-primary" : isDone ? "text-green-400/70" : "text-muted-foreground")} />
                    <span className="flex-1 text-[13px] font-semibold text-foreground">{step.tool.name}</span>

                    {isRunning && <Loader2 size={14} className="shrink-0 text-primary animate-spin" />}
                    {isDone && !isRunning && <CheckCircle size={14} className="shrink-0 text-green-400" />}

                    {!processing && (
                      <div className="flex items-center gap-1">
                        {i > 0 && (
                          <button onClick={() => moveStep(i, -1)} className="text-muted-foreground/30 hover:text-muted-foreground p-1 rounded-lg hover:bg-card/80 transition-colors" title="Move up">
                            ↑
                          </button>
                        )}
                        {i < steps.length - 1 && (
                          <button onClick={() => moveStep(i, 1)} className="text-muted-foreground/30 hover:text-muted-foreground p-1 rounded-lg hover:bg-card/80 transition-colors" title="Move down">
                            ↓
                          </button>
                        )}
                        <button onClick={() => removeStep(i)} className="text-muted-foreground/30 hover:text-red-400 p-1 rounded-lg hover:bg-red-500/10 transition-colors ml-0.5">
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!processing && (
            <>
              {addingStep ? (
                <div className="mt-3 border border-border/60 bg-card/80 rounded-xl p-4 backdrop-blur-sm">
                  <input
                    autoFocus
                    className="w-full h-9 rounded-xl bg-card/60 border border-border/60 px-3 text-[13px] text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/20 transition-all mb-3"
                    placeholder="Search tools..."
                    value={stepSearch}
                    onChange={(e) => setStepSearch(e.target.value)}
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[200px] overflow-y-auto pr-1">
                    {filteredTools.slice(0, 18).map((t) => {
                      const Ic = t.icon;
                      return (
                        <button
                          key={t.slug}
                          onClick={() => addStep(t)}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px] text-muted-foreground hover:bg-primary/10 hover:text-foreground border border-transparent hover:border-primary/20 transition-all text-left"
                        >
                          <Ic size={12} className="shrink-0" />
                          <span className="truncate">{t.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => { setAddingStep(false); setStepSearch(""); }}
                    className="mt-3 text-[12px] text-muted-foreground hover:text-foreground transition-colors rounded-lg px-2 py-1 hover:bg-card/60"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingStep(true)}
                  className="mt-3 flex items-center gap-2 h-10 px-4 rounded-xl border border-dashed border-border/50 text-[13px] font-medium text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all w-full justify-center"
                >
                  <Plus size={14} /> Add Step
                </button>
              )}
            </>
          )}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/15 mb-6">
            <AlertCircle size={14} className="text-red-400 shrink-0" />
            <span className="text-[13px] text-red-400">{error}</span>
          </div>
        )}

        {/* Result Banner */}
        {resultUrl && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 mb-6">
            <CheckCircle size={16} className="text-primary shrink-0" />
            <span className="text-[13px] font-semibold text-foreground flex-1">Pipeline complete!</span>
            <a
              href={resultUrl}
              download={file ? `${file.name.replace(/\.pdf$/i, "")}_pipeline.pdf` : "pipeline_result.pdf"}
              className="flex items-center gap-1.5 h-8 px-4 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
            >
              <Download size={13} /> Download
            </a>
          </div>
        )}

        {/* Run Button */}
        {file && steps.length > 0 && !resultUrl && (
          <button
            onClick={runPipeline}
            disabled={processing}
            className={cn(
              "flex items-center gap-2 h-11 px-8 rounded-xl text-[14px] font-semibold transition-all",
              processing
                ? "bg-secondary/50 text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25",
            )}
          >
            {processing ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            {processing ? `Running step ${currentStep + 1} of ${steps.length}...` : `Run ${steps.length}-Step Pipeline`}
          </button>
        )}
      </main>
    </div>
  );
}
