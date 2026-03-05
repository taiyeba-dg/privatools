import { useState, useRef } from "react";
import { Upload, Loader2, CheckCircle2, X, FileText, AlertCircle, Eye, EyeOff, LockOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { processAndDownload, formatFileSize } from "@/lib/api";

export function UnlockUI() {
    const [file, setFile] = useState<{ name: string; size: string; raw: File } | null>(null);
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [state, setState] = useState<"idle" | "processing" | "done">("idle");
    const [error, setError] = useState<string | null>(null);
    const [drag, setDrag] = useState(false);
    const ref = useRef<HTMLInputElement>(null);

    const pick = (fl: FileList) => { const f = fl[0]; setFile({ name: f.name, size: formatFileSize(f.size), raw: f }); setState("idle"); setError(null); };

    const process = async () => {
        if (!file || !password) return;
        setState("processing"); setError(null);
        try {
            await processAndDownload("/unlock", file.raw, "unlocked.pdf", { password });
            setState("done");
        } catch (e: any) { setError(e.message || "Unlock failed"); setState("idle"); }
    };

    if (state === "done") return (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-10 text-center">
            <CheckCircle2 size={40} className="mx-auto mb-4 text-emerald-400" strokeWidth={1.5} />
            <h2 className="text-lg font-bold text-foreground mb-1">Unlocked!</h2>
            <p className="text-sm text-muted-foreground mb-6">Your PDF has been unlocked and is ready to use.</p>
            <Button variant="outline" className="border-border text-muted-foreground" onClick={() => { setFile(null); setState("idle"); setPassword(""); }}>Unlock another</Button>
        </div>
    );

    return (
        <div className="space-y-4">
            {!file ? (
                <div onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
                    onDrop={e => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files.length) pick(e.dataTransfer.files); }}
                    onClick={() => ref.current?.click()}
          onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ref.current?.click(); } }}
          role="button"
          tabIndex={0}
          aria-label="Upload file"
                    className={cn("flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer transition-all py-14 px-6 text-center",
                        drag ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-secondary/40 bg-secondary/20")}>
                    <input ref={ref} type="file" accept=".pdf" className="hidden" onChange={e => e.target.files && pick(e.target.files)} />
                    <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", drag ? "bg-primary/20" : "bg-secondary")}>
                        <LockOpen size={22} className={drag ? "text-primary" : "text-muted-foreground"} strokeWidth={1.5} />
                    </div>
                    <p className="text-sm font-semibold text-foreground">Select a password-protected PDF</p>
                    <p className="text-xs text-muted-foreground">Drag & drop or click to browse</p>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary"><FileText size={14} className="text-muted-foreground" /></div>
                        <div className="flex-1 min-w-0"><p className="text-sm font-medium text-foreground truncate">{file.name}</p><p className="text-xs text-muted-foreground">{file.size}</p></div>
                        <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-foreground"><X size={15} /></button>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                        <label className="text-sm font-semibold text-foreground">PDF Password</label>
                        <div className="relative">
                            <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter the document password"
                                className="w-full rounded-lg border border-border bg-secondary/20 px-3 py-2.5 pr-10 text-sm text-foreground outline-none focus:border-primary/50" />
                            <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground">Enter the password used to protect this PDF.</p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                            <AlertCircle size={15} className="shrink-0" />{error}
                        </div>
                    )}

                    <Button onClick={process} disabled={state === "processing" || !password} className="glow-primary">
                        {state === "processing" ? <><Loader2 size={15} className="animate-spin" />Unlocking…</> : "Unlock PDF"}
                    </Button>
                </>
            )}
        </div>
    );
}
