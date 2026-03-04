import { useState, useRef } from "react";
import { Upload, Download, Loader2, CheckCircle2, X, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uploadFile, downloadBlob, formatFileSize } from "@/lib/api";

interface GenericUIProps {
  toolName: string;
  outputLabel: string;
  accepts: string;
  actionLabel?: string;
  slug: string;
  apiEndpoint?: string;
  params?: Record<string, string | number | boolean>;
}

export function GenericUI({ toolName, outputLabel, accepts, actionLabel, slug, apiEndpoint, params }: GenericUIProps) {
  const [files, setFiles] = useState<{ id: string; name: string; size: string; file: File }[]>([]);
  const [state, setState] = useState<"idle" | "processing" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const add = (fl: FileList) => {
    setFiles(p => [...p, ...Array.from(fl).map(f => ({ id: Math.random().toString(36).slice(2), name: f.name, size: formatFileSize(f.size), file: f }))]);
    setState("idle");
    setError(null);
  };

  const process = async () => {
    setState("processing");
    setError(null);
    try {
      const endpoint = apiEndpoint || `/${slug}`;
      const res = await uploadFile(endpoint, files[0].file, params);
      const blob = await res.blob();
      setResultBlob(blob);
      setState("done");
    } catch (e: any) {
      setError(e.message || "Processing failed");
      setState("idle");
    }
  };

  const getOutputFilename = () => {
    if (!files.length) return outputLabel;
    const original = files[0].name;
    const lastDot = original.lastIndexOf(".");
    const baseName = lastDot > 0 ? original.substring(0, lastDot) : original;
    // Get extension from outputLabel (e.g. "compressed.pdf" → ".pdf")
    const outDot = outputLabel.lastIndexOf(".");
    const ext = outDot > 0 ? outputLabel.substring(outDot) : ".pdf";
    // Get suffix from outputLabel (e.g. "compressed.pdf" → "_compressed")
    const suffix = outDot > 0 ? "_" + outputLabel.substring(0, outDot) : "";
    return `${baseName}${suffix}${ext}`;
  };

  const handleDownload = () => {
    if (resultBlob) downloadBlob(resultBlob, getOutputFilename());
  };

  if (state === "done") return (
    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-10 text-center">
      <CheckCircle2 size={40} className="mx-auto mb-4 text-emerald-400" strokeWidth={1.5} />
      <h2 className="text-lg font-bold text-foreground mb-1">Done!</h2>
      <p className="text-sm text-muted-foreground mb-6">Your file is ready — <span className="text-foreground font-medium">{getOutputFilename()}</span></p>
      <div className="flex justify-center gap-3 flex-wrap">
        <Button className="glow-primary" onClick={handleDownload}><Download size={15} />Download</Button>
        <Button variant="outline" className="border-border text-muted-foreground" onClick={() => { setFiles([]); setState("idle"); setResultBlob(null); }}>Process another</Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <div
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files.length) add(e.dataTransfer.files); }}
        onClick={() => ref.current?.click()}
        className={cn("flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer transition-all py-14 px-6 text-center",
          drag ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-secondary/40 bg-secondary/20")}
      >
        <input ref={ref} type="file" accept={accepts} className="hidden" onChange={e => e.target.files && add(e.target.files)} />
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", drag ? "bg-primary/20" : "bg-secondary")}>
          <Upload size={22} className={drag ? "text-primary" : "text-muted-foreground"} strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{drag ? "Drop files here" : "Click to select or drag & drop"}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Accepts: {accepts.split(",").join(", ")}</p>
        </div>
        <p className="text-[11px] text-muted-foreground/60">Free · No sign-up · Processed locally on your server</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle size={15} className="shrink-0" />
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map(f => (
            <div key={f.id} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary"><FileText size={13} className="text-muted-foreground" /></div>
              <div className="flex-1 min-w-0"><p className="text-sm font-medium text-foreground truncate">{f.name}</p><p className="text-xs text-muted-foreground">{f.size}</p></div>
              <button onClick={() => setFiles(p => p.filter(x => x.id !== f.id))} className="text-muted-foreground hover:text-foreground"><X size={14} /></button>
            </div>
          ))}
          <div className="flex gap-3 pt-1">
            <Button onClick={process} disabled={state === "processing"} className="glow-primary">
              {state === "processing" ? <><Loader2 size={15} className="animate-spin" />Processing…</> : (actionLabel || toolName)}
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setFiles([])}>Clear</Button>
          </div>
        </div>
      )}
    </div>
  );
}
