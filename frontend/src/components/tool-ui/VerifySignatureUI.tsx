import { useState } from "react";
import { Loader2, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadFile } from "@/lib/api";
import { FileUploadZone } from "./FileUploadZone";

export function VerifySignatureUI() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ valid: boolean; signatures: { signer: string; date: string; valid: boolean }[] } | null>(null);

  const process = async () => {
    if (!file) return;
    setStatus("processing");
    setError(null);
    try {
      const res = await uploadFile("/verify-signature", file);
      const data = await res.json();
      setResult(data);
      setStatus("done");
    } catch (e: any) {
      setError(e.message || "Failed");
      setStatus("idle");
    }
  };

  return (
    <div className="space-y-5">
      {!file ? (
        <FileUploadZone
          file={null}
          onFileSelect={setFile}
          onClear={() => setFile(null)}
          accept=".pdf"
          label="Drop signed PDF here"
          hint="Inspect signature fields"
        />
      ) : (
        <FileUploadZone
          file={file}
          onFileSelect={setFile}
          onClear={() => {
            setFile(null);
            setResult(null);
            setStatus("idle");
          }}
          accept=".pdf"
        />
      )}

      <p className="text-[11px] text-muted-foreground/90">
        Current verification inspects signature fields and widgets. Full cryptographic trust-chain validation is not included yet.
      </p>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      {status === "done" && result && (
        <div className={`rounded-xl border p-5 ${result.valid ? "border-emerald-500/20 bg-emerald-500/5" : "border-amber-500/20 bg-amber-500/5"}`}>
          <div className="flex items-center gap-3 mb-3">
            {result.valid ? <CheckCircle2 size={20} className="text-emerald-400" /> : <XCircle size={20} className="text-amber-400" />}
            <p className="text-sm font-semibold text-foreground">{result.valid ? "Signature fields found" : "No valid signature fields detected"}</p>
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
          <Button variant="outline" className="mt-4" onClick={() => { setFile(null); setStatus("idle"); setResult(null); }}>
            Verify another
          </Button>
        </div>
      )}

      {status !== "done" && (
        <Button className="w-full" disabled={!file || status === "processing"} onClick={process}>
          {status === "processing" ? (
            <>
              <Loader2 size={14} className="animate-spin mr-2" />
              Verifying…
            </>
          ) : (
            "Verify Signatures"
          )}
        </Button>
      )}
    </div>
  );
}
