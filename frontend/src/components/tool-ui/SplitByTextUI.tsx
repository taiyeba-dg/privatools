import { useRef, useState } from "react";
import { Upload, Download, Loader2, AlertCircle, FileText, X, Scissors, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uploadFile, downloadBlob, formatFileSize } from "@/lib/api";

export function SplitByTextUI() {
    const [file, setFile] = useState<File | null>(null);
    const [search, setSearch] = useState("");
    const [caseSensitive, setCaseSensitive] = useState(false);
    const [state, setState] = useState<"idle" | "processing" | "done">("idle");
    const [error, setError] = useState<string | null>(null);
    const [drag, setDrag] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const canProcess = !!file && search.trim().length > 0 && state !== "processing";

    const onPick = (f: FileList | null) => {
        if (!f || !f[0]) return;
        setFile(f[0]);
        setState("idle");
        setError(null);
    };

    const process = async () => {
        if (!file || !search.trim()) return;
        setState("processing");
        setError(null);
        try {
            const res = await uploadFile("/split-by-text", file, {
                search: search.trim(),
                case_sensitive: caseSensitive,
            });
            const blob = await res.blob();
            const baseName = file.name.replace(/\.pdf$/i, "");
            downloadBlob(blob, `${baseName}_split.zip`);
            setState("done");
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Split failed";
            setError(msg);
            setState("idle");
        }
    };

    return (
        <div className="space-y-5">
            {!file ? (
                <label
                    onDragOver={e => { e.preventDefault(); setDrag(true); }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={e => { e.preventDefault(); setDrag(false); onPick(e.dataTransfer.files); }}
                    className={cn(
                        "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-secondary/30 px-6 py-12 cursor-pointer transition-all",
                        drag ? "border-accent bg-accent/5" : "border-border hover:border-accent/40 hover:bg-secondary/50"
                    )}
                >
                    <Upload size={22} className="text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">Drop a PDF or click to choose</p>
                    <p className="text-xs text-muted-foreground">Splits at every page containing the search term</p>
                    <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={e => { onPick(e.target.files); e.target.value = ""; }} />
                </label>
            ) : (
                <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                    <FileText size={18} className="text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                        <p className="text-[11px] text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                    <Button type="button" size="sm" variant="ghost" onClick={() => { setFile(null); setState("idle"); }}>
                        <X size={14} />
                    </Button>
                </div>
            )}

            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Search text (split before every page containing this)</label>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder='e.g. "Invoice #", "Chapter", "Statement of"'
                        className="mt-1.5 w-full px-4 py-2 rounded-xl border border-border bg-secondary/40 text-[14px] text-foreground focus:outline-none focus:border-accent"
                    />
                </div>
                <label className="flex items-center gap-2 text-[13px] text-foreground cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={caseSensitive}
                        onChange={e => setCaseSensitive(e.target.checked)}
                        className="rounded"
                    />
                    Case-sensitive
                </label>
            </div>

            {error && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/[0.06] px-4 py-3 flex items-start gap-3">
                    <AlertCircle size={14} className="text-rose-500 mt-0.5 shrink-0" />
                    <p className="text-[13px] text-foreground">{error}</p>
                </div>
            )}

            <Button
                type="button"
                onClick={process}
                disabled={!canProcess}
                className="w-full h-11 rounded-xl"
            >
                {state === "processing" ? (
                    <><Loader2 size={15} className="mr-2 animate-spin" /> Splitting…</>
                ) : state === "done" ? (
                    <><CheckCircle2 size={15} className="mr-2" /> Downloaded — split again?</>
                ) : (
                    <><Scissors size={15} className="mr-2" /> Split PDF</>
                )}
            </Button>
        </div>
    );
}
