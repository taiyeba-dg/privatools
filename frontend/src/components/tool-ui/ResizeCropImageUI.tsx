import { useState } from "react";
import { Upload, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { processAndDownload } from "@/lib/api";

export function ResizeCropImageUI() {
  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [mode, setMode] = useState<"resize" | "crop">("resize");
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const process = async () => {
    if (!file) return;
    setStatus("processing"); setError(null);
    try { await processAndDownload("/resize-crop-image", file, `${mode}_${file.name}`, { width, height, mode }); setStatus("done"); }
    catch (e: any) { setError(e.message || "Failed"); setStatus("idle"); }
  };

  return (
    <div className="space-y-5">
      <label className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-secondary/30 px-6 py-12 cursor-pointer hover:border-primary/40 transition-all">
        <Upload size={22} className="text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">{file ? file.name : "Drop image here"}</p>
        <input type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} />
      </label>
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex gap-2">
          {(["resize", "crop"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} className={cn("flex-1 py-2 rounded-lg text-sm font-medium border transition-all capitalize",
              mode === m ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground")}>{m}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-medium text-muted-foreground">Width (px)</label>
            <input type="number" value={width} onChange={e => setWidth(parseInt(e.target.value) || 800)} min={1}
              className="mt-1 w-full rounded-lg border border-border bg-secondary/20 px-3 py-2 text-sm text-foreground outline-none" /></div>
          <div><label className="text-xs font-medium text-muted-foreground">Height (px)</label>
            <input type="number" value={height} onChange={e => setHeight(parseInt(e.target.value) || 600)} min={1}
              className="mt-1 w-full rounded-lg border border-border bg-secondary/20 px-3 py-2 text-sm text-foreground outline-none" /></div>
        </div>
      </div>
      {error && <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"><AlertCircle size={15} />{error}</div>}
      {status === "done" ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-center">
          <p className="text-sm font-semibold text-emerald-400 mb-3">Done!</p>
          <Button variant="outline" onClick={() => { setFile(null); setStatus("idle"); }}>Process another</Button>
        </div>
      ) : (
        <Button className="w-full" disabled={!file || status === "processing"} onClick={process}>
          {status === "processing" ? <><Loader2 size={14} className="animate-spin mr-2" />Processing…</> : `${mode === "resize" ? "Resize" : "Crop"} Image`}
        </Button>
      )}
    </div>
  );
}
