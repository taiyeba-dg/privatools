import { useState } from "react";
import { Upload, FileText, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { processAndDownload } from "@/lib/api";

export function RemoveExifUI() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const process = async () => {
    if (!file) return;
    setStatus("processing"); setError(null);
    try { await processAndDownload("/remove-exif", file, `clean_${file.name}`); setStatus("done"); }
    catch (e: any) { setError(e.message || "Failed"); setStatus("idle"); }
  };

  return (
    <div className="space-y-5">
      <label className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-secondary/30 px-6 py-12 cursor-pointer hover:border-primary/40 transition-all">
        <Upload size={22} className="text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">{file ? file.name : "Drop image here"}</p>
        <p className="text-xs text-muted-foreground">{file ? `${(file.size / 1024).toFixed(0)} KB` : "JPEG, PNG, WebP, TIFF"}</p>
        <input type="file" accept=".jpg,.jpeg,.png,.webp,.tiff" className="hidden" onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} />
      </label>
      {error && <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"><AlertCircle size={15} />{error}</div>}
      {status === "done" ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-center">
          <p className="text-sm font-semibold text-emerald-400 mb-3">EXIF data removed!</p>
          <Button variant="outline" onClick={() => { setFile(null); setStatus("idle"); }}>Clean another</Button>
        </div>
      ) : (
        <Button className="w-full" disabled={!file || status === "processing"} onClick={process}>
          {status === "processing" ? <><Loader2 size={14} className="animate-spin mr-2" />Removing…</> : "Remove EXIF Data"}
        </Button>
      )}
    </div>
  );
}
