import { useState, useRef, useCallback } from "react";
import { Upload, Loader2, CheckCircle2, X, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { downloadBlob, formatFileSize } from "@/lib/api";

export function CompareUI() {
  const [file1, setFile1] = useState<{ name: string; size: string; raw: File } | null>(null);
  const [file2, setFile2] = useState<{ name: string; size: string; raw: File } | null>(null);
  const [state, setState] = useState<"idle" | "processing" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const ref1 = useRef<HTMLInputElement>(null);
  const ref2 = useRef<HTMLInputElement>(null);

  const process = async () => {
    if (!file1 || !file2) return;
    setState("processing"); setError(null);
    try {
      const fd = new FormData();
      fd.append("files", file1.raw);
      fd.append("files", file2.raw);
      const res = await fetch("/api/compare", { method: "POST", body: fd });
      if (!res.ok) { const b = await res.json().catch(() => ({ detail: "Failed" })); throw new Error(b.detail); }
      const blob = await res.blob();
      downloadBlob(blob, "comparison.pdf");
      setState("done");
    } catch (e: any) { setError(e.message || "Failed"); setState("idle"); }
  };

  if (state === "done") return (
    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-10 text-center">
      <CheckCircle2 size={40} className="mx-auto mb-4 text-emerald-400" strokeWidth={1.5} />
      <h2 className="text-lg font-bold text-foreground mb-1">Comparison complete!</h2>
      <p className="text-sm text-muted-foreground mb-6">Your comparison PDF has been downloaded.</p>
      <Button variant="outline" className="border-border text-muted-foreground" onClick={() => { setFile1(null); setFile2(null); setState("idle"); }}>Compare more</Button>
    </div>
  );

  const FileBox = ({ label, file, setFile, inputRef }: { label: string; file: typeof file1; setFile: (f: typeof file1) => void; inputRef: React.RefObject<HTMLInputElement> }) => (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-2">{label}</p>
      {!file ? (
        <div onClick={() => inputRef.current?.click()}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border hover:border-primary/40 cursor-pointer py-8 transition-all bg-secondary/20 hover:bg-secondary/40">
          <input ref={inputRef as any} type="file" accept=".pdf" className="hidden" onChange={e => { if (e.target.files?.[0]) { const f = e.target.files[0]; setFile({ name: f.name, size: formatFileSize(f.size), raw: f }); } }} />
          <Upload size={18} className="text-muted-foreground" /><span className="text-sm text-muted-foreground">Select PDF</span>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary"><FileText size={13} className="text-muted-foreground" /></div>
          <div className="flex-1 min-w-0"><p className="text-sm font-medium text-foreground truncate">{file.name}</p><p className="text-xs text-muted-foreground">{file.size}</p></div>
          <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-foreground"><X size={14} /></button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FileBox label="First PDF" file={file1} setFile={setFile1} inputRef={ref1} />
        <FileBox label="Second PDF" file={file2} setFile={setFile2} inputRef={ref2} />
      </div>
      {error && <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"><AlertCircle size={15} className="shrink-0" />{error}</div>}
      <Button onClick={process} disabled={state === "processing" || !file1 || !file2} className="glow-primary">
        {state === "processing" ? <><Loader2 size={15} className="animate-spin" />Comparing…</> : "Compare PDFs"}
      </Button>
    </div>
  );
}
