import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Shield, ArrowLeft, Upload, Play, Download, X, CheckCircle, AlertCircle, Loader2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { tools, categoryMeta } from "@/data/tools";
import { nonPdfTools, nonPdfCategoryMeta } from "@/data/non-pdf-tools";

const API = import.meta.env.VITE_API_URL || "";

// All tools that accept a single file upload
const batchableTools = [
    ...tools.filter(t => t.accepts && !["merge-pdf"].includes(t.slug))
        .map(t => ({ slug: t.slug, name: t.name, icon: t.icon, href: `/tool/${t.slug}`, accepts: t.accepts, type: "pdf" as const })),
    ...nonPdfTools.filter(t => t.accepts)
        .map(t => ({ slug: t.slug, name: t.name, icon: t.icon, href: `/tools/${t.slug}`, accepts: t.accepts || "", type: "nonpdf" as const })),
];

interface BatchFile {
    file: File;
    status: "pending" | "processing" | "done" | "error";
    resultUrl?: string;
    error?: string;
}

export default function BatchPage() {
    const [selectedTool, setSelectedTool] = useState(batchableTools[0]);
    const [files, setFiles] = useState<BatchFile[]>([]);
    const [processing, setProcessing] = useState(false);
    const [toolSearch, setToolSearch] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredTools = toolSearch.trim()
        ? batchableTools.filter(t => t.name.toLowerCase().includes(toolSearch.toLowerCase()))
        : batchableTools.slice(0, 20);

    const addFiles = useCallback((newFiles: FileList | null) => {
        if (!newFiles) return;
        const added: BatchFile[] = Array.from(newFiles).map(f => ({ file: f, status: "pending" as const }));
        setFiles(prev => [...prev, ...added]);
    }, []);

    const removeFile = (idx: number) => {
        setFiles(prev => prev.filter((_, i) => i !== idx));
    };

    const processAll = async () => {
        if (files.length === 0 || processing) return;
        setProcessing(true);
        const updated = [...files];

        for (let i = 0; i < updated.length; i++) {
            if (updated[i].status === "done") continue;
            updated[i] = { ...updated[i], status: "processing" };
            setFiles([...updated]);

            try {
                const formData = new FormData();
                formData.append("file", updated[i].file);

                const resp = await fetch(`${API}/api/${selectedTool.slug}`, {
                    method: "POST",
                    body: formData,
                });

                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

                const blob = await resp.blob();
                const url = URL.createObjectURL(blob);
                updated[i] = { ...updated[i], status: "done", resultUrl: url };
            } catch (e: any) {
                updated[i] = { ...updated[i], status: "error", error: e.message || "Failed" };
            }
            setFiles([...updated]);
        }
        setProcessing(false);
    };

    const downloadAll = () => {
        files.forEach((f, i) => {
            if (f.resultUrl) {
                const a = document.createElement("a");
                a.href = f.resultUrl;
                const ext = f.file.name.split(".").pop() || "pdf";
                const base = f.file.name.replace(/\.[^.]+$/, "");
                a.download = `${base}_${selectedTool.slug}.${ext}`;
                a.click();
            }
        });
    };

    const doneCount = files.filter(f => f.status === "done").length;

    return (
        <div className="min-h-screen bg-background">
            {/* Minimal navbar */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-border/40">
                <div className="mx-auto max-w-[900px] px-5">
                    <div className="flex h-[52px] items-center gap-3">
                        <Link to="/" className="flex items-center gap-2.5 shrink-0">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary shadow-md shadow-primary/40">
                                <Shield size={13} strokeWidth={2.5} className="text-primary-foreground" />
                            </div>
                            <span className="text-[15px] font-extrabold text-foreground tracking-tight">PrivaTools</span>
                        </Link>
                        <div className="hidden lg:block h-4 w-px bg-border/50" />
                        <span className="text-[13px] font-medium text-muted-foreground">Batch Process</span>
                        <Link to="/" className="ml-auto flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft size={13} /> Back
                        </Link>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-[900px] px-5 py-10">
                <h1 className="text-2xl font-bold text-foreground mb-2">Batch Process</h1>
                <p className="text-sm text-muted-foreground mb-8">Upload multiple files and apply the same tool to all of them at once.</p>

                {/* Tool selector */}
                <div className="mb-6">
                    <label className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2 block">Select Tool</label>
                    <input
                        className="w-full h-10 rounded-xl border border-border/50 bg-card/60 px-4 text-[14px] text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/40 mb-2"
                        placeholder="Search tools…"
                        value={toolSearch}
                        onChange={e => setToolSearch(e.target.value)}
                    />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-[200px] overflow-y-auto">
                        {filteredTools.map(t => {
                            const Ic = t.icon;
                            return (
                                <button
                                    key={t.slug}
                                    onClick={() => setSelectedTool(t)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-lg text-left text-[12px] transition-colors",
                                        selectedTool.slug === t.slug
                                            ? "bg-primary/10 border border-primary/30 text-primary font-semibold"
                                            : "border border-transparent text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                    )}
                                >
                                    <Ic size={12} className="shrink-0" />
                                    <span className="truncate">{t.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* File upload */}
                <div
                    className="relative border-2 border-dashed border-border/50 rounded-2xl p-10 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all mb-6"
                    onClick={() => inputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
                >
                    <Upload size={28} className="mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-[14px] font-semibold text-foreground mb-1">Drop files here or click to browse</p>
                    <p className="text-[12px] text-muted-foreground/60">Accepts: {selectedTool.accepts || "any"}</p>
                    <input
                        ref={inputRef}
                        type="file"
                        multiple
                        accept={selectedTool.accepts}
                        className="hidden"
                        onChange={e => addFiles(e.target.files)}
                    />
                </div>

                {/* File list */}
                {files.length > 0 && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[13px] font-semibold text-foreground">{files.length} file{files.length !== 1 ? "s" : ""}</span>
                            {doneCount > 0 && (
                                <button onClick={downloadAll}
                                    className="flex items-center gap-1.5 text-[12px] font-medium text-primary hover:text-primary/80 transition-colors">
                                    <Download size={12} /> Download All ({doneCount})
                                </button>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            {files.map((f, i) => (
                                <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border/50 bg-card/40">
                                    <FileText size={14} className="shrink-0 text-muted-foreground/40" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-medium text-foreground truncate">{f.file.name}</p>
                                        <p className="text-[11px] text-muted-foreground/50">{(f.file.size / 1024).toFixed(0)} KB</p>
                                    </div>
                                    {f.status === "pending" && (
                                        <span className="text-[11px] text-muted-foreground/40">Pending</span>
                                    )}
                                    {f.status === "processing" && (
                                        <Loader2 size={14} className="shrink-0 text-primary animate-spin" />
                                    )}
                                    {f.status === "done" && (
                                        <div className="flex items-center gap-2">
                                            <CheckCircle size={14} className="shrink-0 text-green-400" />
                                            {f.resultUrl && (
                                                <a href={f.resultUrl}
                                                    download={`${f.file.name.replace(/\.[^.]+$/, "")}_${selectedTool.slug}.${f.file.name.split(".").pop()}`}
                                                    className="text-[11px] text-primary hover:underline">
                                                    Download
                                                </a>
                                            )}
                                        </div>
                                    )}
                                    {f.status === "error" && (
                                        <div className="flex items-center gap-1.5">
                                            <AlertCircle size={14} className="shrink-0 text-red-400" />
                                            <span className="text-[11px] text-red-400">{f.error}</span>
                                        </div>
                                    )}
                                    {!processing && (
                                        <button onClick={() => removeFile(i)} className="shrink-0 text-muted-foreground/30 hover:text-muted-foreground">
                                            <X size={12} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action buttons */}
                {files.length > 0 && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={processAll}
                            disabled={processing || files.every(f => f.status === "done")}
                            className={cn(
                                "flex items-center gap-2 h-10 px-6 rounded-xl text-[14px] font-semibold transition-all",
                                processing || files.every(f => f.status === "done")
                                    ? "bg-secondary/50 text-muted-foreground cursor-not-allowed"
                                    : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/30"
                            )}
                        >
                            {processing ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                            {processing ? "Processing…" : `Process ${files.filter(f => f.status !== "done").length} Files`}
                        </button>
                        {!processing && (
                            <button onClick={() => setFiles([])}
                                className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
                                Clear all
                            </button>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
