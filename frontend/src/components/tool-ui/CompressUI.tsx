import { useState, useRef, useEffect, useCallback } from "react";
import { Upload, Download, Loader2, CheckCircle2, X, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uploadFile, downloadBlob, formatFileSize, processFilesAndDownload, MAX_FILE_SIZE_LABEL } from "@/lib/api";

type Level = "light" | "recommended" | "extreme";
type CompressFile = { id: string; name: string; size: string; bytes: number; raw: File };
let fileId = 0;

const levels: { id: Level; label: string; desc: string; saving: string }[] = [
  { id: "light", label: "Light", desc: "Minimal quality loss", saving: "~20% smaller" },
  { id: "recommended", label: "Recommended", desc: "Balanced quality & size", saving: "~50% smaller" },
  { id: "extreme", label: "Extreme", desc: "Maximum compression", saving: "~75% smaller" },
];

export function CompressUI() {
  const [files, setFiles] = useState<CompressFile[]>([]);
  const [level, setLevel] = useState<Level>("recommended");
  const [state, setState] = useState<"idle" | "processing" | "done">("idle");
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const ref = useRef<HTMLInputElement>(null);

  const addFiles = (fl: FileList) => {
    const newFiles: CompressFile[] = Array.from(fl)
      .filter(f => f.name.toLowerCase().endsWith(".pdf"))
      .map(f => ({ id: String(++fileId), name: f.name, size: formatFileSize(f.size), bytes: f.size, raw: f }));
    if (newFiles.length) {
      setFiles(prev => [...prev, ...newFiles]);
      setState("idle");
      setError(null);
    }
  };

  const removeFile = (id: string) => setFiles(prev => prev.filter(f => f.id !== id));
  const totalBytes = files.reduce((s, f) => s + f.bytes, 0);
  const canProcess = files.length > 0 && state !== "processing";

  const process = useCallback(async () => {
    if (!files.length) return;
    setState("processing");
    setError(null);
    try {
      if (files.length === 1) {
        const res = await uploadFile("/compress", files[0].raw, { level });
        const blob = await res.blob();
        const cSize = parseInt(res.headers.get("X-Compressed-Size") || "0") || blob.size;
        setCompressedSize(cSize);
        setResultBlob(blob);
        setState("done");
        const base = files[0].name.replace(/\.pdf$/i, "");
        downloadBlob(blob, `${base}_compressed.pdf`);
      } else {
        await processFilesAndDownload("/compress", files.map(f => f.raw), "compressed_pdfs.zip", { level });
        setCompressedSize(0);
        setResultBlob(null);
        setState("done");
      }
    } catch (e: any) {
      setError(e.message || "Compression failed");
      setState("idle");
    }
  }, [files, level]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canProcess) { e.preventDefault(); process(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [canProcess, process]);

  if (state === "done") {
    const savings = files.length === 1 && compressedSize > 0 ? Math.round((1 - compressedSize / totalBytes) * 100) : 0;
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-10 text-center">
        <CheckCircle2 size={40} className="mx-auto mb-4 text-emerald-400" strokeWidth={1.5} />
        <h2 className="text-lg font-bold text-foreground mb-1">Compressed & Downloaded!</h2>
        {files.length === 1 && compressedSize > 0 ? (
          <div className="flex items-center justify-center gap-4 text-sm mb-6">
            <span className="text-muted-foreground">{files[0].size}</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-emerald-400 font-bold">{formatFileSize(compressedSize)}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">-{savings}%</span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mb-6">{files.length} PDFs compressed and downloaded as ZIP.</p>
        )}
        <div className="flex justify-center gap-3 flex-wrap">
          {resultBlob && <Button className="glow-primary" onClick={() => { const base = files[0].name.replace(/\.pdf$/i, ""); downloadBlob(resultBlob, `${base}_compressed.pdf`); }}><Download size={15} />Download again</Button>}
          <Button variant="outline" className="border-border text-muted-foreground" onClick={() => { setFiles([]); setState("idle"); setResultBlob(null); }}>Compress more</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files); }}
        onClick={() => ref.current?.click()}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ref.current?.click(); } }}
        role="button" tabIndex={0} aria-label="Upload files"
        className={cn("flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer transition-all py-14 px-6 text-center",
          drag ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-secondary/40 bg-secondary/20")}>
        <input ref={ref} type="file" accept=".pdf" multiple className="hidden" onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }} />
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", drag ? "bg-primary/20" : "bg-secondary")}>
          <Upload size={22} className={drag ? "text-primary" : "text-muted-foreground"} strokeWidth={1.5} />
        </div>
        <p className="text-sm font-semibold text-foreground">{files.length ? "Add more PDFs" : "Select PDFs to compress"}</p>
        <p className="text-xs text-muted-foreground">Drag & drop or click · Multiple files supported · Max {MAX_FILE_SIZE_LABEL} each</p>
      </div>

      {files.length > 0 && (
        <>
          <div className="space-y-2">
            {files.map(f => (
              <div key={f.id} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary"><FileText size={14} className="text-muted-foreground" /></div>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-foreground truncate">{f.name}</p><p className="text-xs text-muted-foreground">{f.size}</p></div>
                <button onClick={() => removeFile(f.id)} className="text-muted-foreground hover:text-foreground"><X size={15} /></button>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <p className="text-sm font-semibold text-foreground">Compression level</p>
            <div className="space-y-2">
              {levels.map(l => (
                <button key={l.id} onClick={() => setLevel(l.id)}
                  className={cn("w-full flex items-center justify-between rounded-xl border p-3.5 text-left transition-all",
                    level === l.id ? "border-primary bg-primary/5" : "border-border hover:border-border/70 hover:bg-secondary/40")}>
                  <div className="flex items-center gap-3">
                    <div className={cn("h-4 w-4 rounded-full border-2 flex items-center justify-center", level === l.id ? "border-primary" : "border-border")}>
                      {level === l.id && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <div><p className="text-sm font-medium text-foreground">{l.label}</p><p className="text-xs text-muted-foreground">{l.desc}</p></div>
                  </div>
                  <span className={cn("text-xs font-semibold", level === l.id ? "text-primary" : "text-muted-foreground")}>{l.saving}</span>
                </button>
              ))}
            </div>
          </div>

          {error && <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"><AlertCircle size={15} className="shrink-0" />{error}</div>}

          <div className="flex items-center gap-3">
            <Button onClick={process} disabled={!canProcess} className="glow-primary">
              {state === "processing" ? <><Loader2 size={15} className="animate-spin" />Compressing…</> : `Compress ${files.length > 1 ? `${files.length} PDFs` : "PDF"}`}
            </Button>
            {canProcess && <kbd className="hidden sm:inline-flex items-center gap-0.5 font-mono text-[10px] text-muted-foreground/40 bg-secondary/30 rounded px-1.5 py-0.5">⌘↵</kbd>}
          </div>
        </>
      )}
    </div>
  );
}
