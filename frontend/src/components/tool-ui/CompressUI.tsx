import { useState, useRef } from "react";
import { Upload, Download, Loader2, CheckCircle2, X, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uploadFile, downloadBlob, formatFileSize } from "@/lib/api";

type Level = "light" | "recommended" | "extreme";

const levels: { id: Level; label: string; desc: string; saving: string }[] = [
  { id: "light", label: "Light", desc: "Minimal quality loss", saving: "~20% smaller" },
  { id: "recommended", label: "Recommended", desc: "Balanced quality & size", saving: "~50% smaller" },
  { id: "extreme", label: "Extreme", desc: "Maximum compression", saving: "~75% smaller" },
];

export function CompressUI() {
  const [file, setFile] = useState<{ name: string; size: string; bytes: number; raw: File } | null>(null);
  const [level, setLevel] = useState<Level>("recommended");
  const [state, setState] = useState<"idle" | "processing" | "done">("idle");
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const ref = useRef<HTMLInputElement>(null);

  const pick = (fl: FileList) => {
    const f = fl[0];
    setFile({ name: f.name, size: formatFileSize(f.size), bytes: f.size, raw: f });
    setState("idle");
    setError(null);
  };

  const process = async () => {
    if (!file) return;
    setState("processing");
    setError(null);
    try {
      const res = await uploadFile("/compress", file.raw, { level });
      const blob = await res.blob();
      const cSize = parseInt(res.headers.get("X-Compressed-Size") || "0") || blob.size;
      setCompressedSize(cSize);
      setResultBlob(blob);
      setState("done");
    } catch (e: any) {
      setError(e.message || "Compression failed");
      setState("idle");
    }
  };

  const getFilename = () => {
    if (!file) return "compressed.pdf";
    const base = file.name.replace(/\.pdf$/i, "");
    return `${base}_compressed.pdf`;
  };

  const handleDownload = () => {
    if (resultBlob) downloadBlob(resultBlob, getFilename());
  };

  if (state === "done") {
    const savings = file ? Math.round((1 - compressedSize / file.bytes) * 100) : 0;
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-10 text-center">
        <CheckCircle2 size={40} className="mx-auto mb-4 text-emerald-400" strokeWidth={1.5} />
        <h2 className="text-lg font-bold text-foreground mb-1">Compressed!</h2>
        <div className="flex items-center justify-center gap-4 text-sm mb-6">
          <span className="text-muted-foreground">{file?.size}</span>
          <span className="text-muted-foreground">→</span>
          <span className="text-emerald-400 font-bold">{formatFileSize(compressedSize)}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
            -{savings}%
          </span>
        </div>
        <div className="flex justify-center gap-3 flex-wrap">
          <Button className="glow-primary" onClick={handleDownload}><Download size={15} />Download {getFilename()}</Button>
          <Button variant="outline" className="border-border text-muted-foreground" onClick={() => { setFile(null); setState("idle"); setResultBlob(null); }}>Compress another</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!file ? (
        <div
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files.length) pick(e.dataTransfer.files); }}
          onClick={() => ref.current?.click()}
          onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ref.current?.click(); } }}
          role="button"
          tabIndex={0}
          aria-label="Upload file"
          className={cn("flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer transition-all py-14 px-6 text-center",
            drag ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-secondary/40 bg-secondary/20")}
        >
          <input ref={ref} type="file" accept=".pdf" className="hidden" onChange={e => e.target.files && pick(e.target.files)} />
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", drag ? "bg-primary/20" : "bg-secondary")}>
            <Upload size={22} className={drag ? "text-primary" : "text-muted-foreground"} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Select a PDF to compress</p>
            <p className="text-xs text-muted-foreground mt-0.5">Drag & drop or click to browse</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <FileText size={14} className="text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{file.size}</p>
            </div>
            <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-foreground"><X size={15} /></button>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <p className="text-sm font-semibold text-foreground">Compression level</p>
            <div className="space-y-2">
              {levels.map(l => (
                <button
                  key={l.id}
                  onClick={() => setLevel(l.id)}
                  className={cn(
                    "w-full flex items-center justify-between rounded-xl border p-3.5 text-left transition-all",
                    level === l.id ? "border-primary bg-primary/5" : "border-border hover:border-border/70 hover:bg-secondary/40"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("h-4 w-4 rounded-full border-2 flex items-center justify-center", level === l.id ? "border-primary" : "border-border")}>
                      {level === l.id && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{l.label}</p>
                      <p className="text-xs text-muted-foreground">{l.desc}</p>
                    </div>
                  </div>
                  <span className={cn("text-xs font-semibold", level === l.id ? "text-primary" : "text-muted-foreground")}>{l.saving}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}

          <Button onClick={process} disabled={state === "processing"} className="glow-primary">
            {state === "processing" ? <><Loader2 size={15} className="animate-spin" />Compressing…</> : "Compress PDF"}
          </Button>
        </>
      )}
    </div>
  );
}
