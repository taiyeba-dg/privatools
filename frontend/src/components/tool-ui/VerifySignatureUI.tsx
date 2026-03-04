import { useState } from "react";
import { Upload, Loader2, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadFile } from "@/lib/api";

export function VerifySignatureUI() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ valid: boolean; signatures: { signer: string; date: string; valid: boolean }[] } | null>(null);

  const process = async () => {
    if (!file) return;
    setStatus("processing"); setError(null);
    try {
      const res = await uploadFile("/verify-signature", file);
      const data = await res.json();
      setResult(data);
      setStatus("done");
    } catch (e: any) { setError(e.message || "Failed"); setStatus("idle"); }
  };

  return (
    <div className="space-y-5">
      <label className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-secondary/30 px-6 py-12 cursor-pointer hover:border-primary/40 transition-all">
        <Upload size={22} className="text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">{file ? file.name : "Drop signed PDF here"}</p>
        <p className="text-xs text-muted-foreground">Verify digital signatures and certificates</p>
        <input type="file" accept=".pdf" className="hidden" onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} />
      </label>
      {error && <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"><AlertCircle size={15} />{error}</div>}
      {status === "done" && result && (
        <div className={`rounded-xl border p-5 ${result.valid ? "border-emerald-500/20 bg-emerald-500/5" : "border-amber-500/20 bg-amber-500/5"}`}>
          <div className="flex items-center gap-3 mb-3">
            {result.valid ? <CheckCircle2 size={20} className="text-emerald-400" /> : <XCircle size={20} className="text-amber-400" />}
            <p className="text-sm font-semibold text-foreground">{result.valid ? "All signatures valid" : "Signature issues found"}</p>
          </div>
          {result.signatures?.length > 0 && (
            <div className="space-y-2 mt-3">
              {result.signatures.map((s, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-secondary/30 p-3">
                  {s.valid ? <CheckCircle2 size={14} className="text-emerald-400 shrink-0" /> : <XCircle size={14} className="text-amber-400 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{s.signer || "Unknown signer"}</p>
                    <p className="text-xs text-muted-foreground">{s.date || "Date unknown"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Button variant="outline" className="mt-4" onClick={() => { setFile(null); setStatus("idle"); setResult(null); }}>Verify another</Button>
        </div>
      )}
      {status !== "done" && (
        <Button className="w-full" disabled={!file || status === "processing"} onClick={process}>
          {status === "processing" ? <><Loader2 size={14} className="animate-spin mr-2" />Verifying…</> : "Verify Signatures"}
        </Button>
      )}
    </div>
  );
}
