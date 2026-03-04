import { useState, useRef } from "react";
import { Upload, Download, Loader2, CheckCircle2, X, FileText, AlertCircle, Plus, Trash2, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { downloadBlob, formatFileSize } from "@/lib/api";

const API_BASE = "/api";

interface TextEdit {
    id: string;
    type: "add_text";
    page: number;
    x: number;
    y: number;
    text: string;
    font_size: number;
    color: string;
}

export function EditPdfUI() {
    const [file, setFile] = useState<{ name: string; size: string; raw: File } | null>(null);
    const [edits, setEdits] = useState<TextEdit[]>([]);
    const [state, setState] = useState<"idle" | "editing" | "processing" | "done">("idle");
    const [error, setError] = useState<string | null>(null);
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [drag, setDrag] = useState(false);
    const ref = useRef<HTMLInputElement>(null);

    const pick = (fl: FileList) => {
        const f = fl[0];
        setFile({ name: f.name, size: formatFileSize(f.size), raw: f });
        setState("editing");
        setError(null);
        setEdits([]);
    };

    const addEdit = () => {
        setEdits(prev => [...prev, {
            id: Math.random().toString(36).slice(2),
            type: "add_text",
            page: 1,
            x: 50,
            y: 50,
            text: "",
            font_size: 12,
            color: "#000000",
        }]);
    };

    const updateEdit = (id: string, field: keyof TextEdit, value: string | number) => {
        setEdits(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    const removeEdit = (id: string) => {
        setEdits(prev => prev.filter(e => e.id !== id));
    };

    const process = async () => {
        if (!file || edits.length === 0) return;
        setState("processing");
        setError(null);
        try {
            const fd = new FormData();
            fd.append("file", file.raw);
            // Strip the internal 'id' from edits before sending
            const cleanEdits = edits.map(({ id, ...rest }) => rest);
            fd.append("edits", JSON.stringify(cleanEdits));

            const res = await fetch(`${API_BASE}/edit-pdf`, { method: "POST", body: fd });
            if (!res.ok) {
                const body = await res.json().catch(() => ({ detail: "An unexpected error occurred" }));
                throw new Error(body.detail || `Request failed (${res.status})`);
            }
            const blob = await res.blob();
            setResultBlob(blob);
            setState("done");
        } catch (e: any) {
            setError(e.message || "Editing failed");
            setState("editing");
        }
    };

    const handleDownload = () => {
        if (resultBlob) downloadBlob(resultBlob, file ? `${file.name.replace(/\.pdf$/i, "")}_edited.pdf` : "edited.pdf");
    };

    // Done state
    if (state === "done") return (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-10 text-center">
            <CheckCircle2 size={40} className="mx-auto mb-4 text-emerald-400" strokeWidth={1.5} />
            <h2 className="text-lg font-bold text-foreground mb-1">Edited!</h2>
            <p className="text-sm text-muted-foreground mb-6">{edits.length} edit{edits.length !== 1 ? "s" : ""} applied to your PDF.</p>
            <div className="flex justify-center gap-3 flex-wrap">
                <Button className="glow-primary" onClick={handleDownload}><Download size={15} />Download Edited PDF</Button>
                <Button variant="outline" className="border-border text-muted-foreground"
                    onClick={() => { setFile(null); setState("idle"); setEdits([]); setResultBlob(null); }}>Edit another</Button>
            </div>
        </div>
    );

    // Editing state
    if ((state === "editing" || state === "processing") && file) return (
        <div className="space-y-4">
            {/* File info */}
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary"><FileText size={14} className="text-muted-foreground" /></div>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-foreground truncate">{file.name}</p><p className="text-xs text-muted-foreground">{file.size}</p></div>
                <button onClick={() => { setFile(null); setState("idle"); setEdits([]); }} className="text-muted-foreground hover:text-foreground"><X size={15} /></button>
            </div>

            {/* Edits list */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <PenTool size={16} className="text-primary" />
                        <p className="text-sm font-semibold text-foreground">Text Edits ({edits.length})</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={addEdit} className="gap-1.5">
                        <Plus size={13} />Add Text
                    </Button>
                </div>

                {edits.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                        <PenTool size={24} className="mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No edits yet. Click "Add Text" to add text to your PDF.</p>
                    </div>
                )}

                {edits.map((edit, idx) => (
                    <div key={edit.id} className="rounded-lg border border-border bg-background p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">Edit #{idx + 1} — Add Text</span>
                            <button onClick={() => removeEdit(edit.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                                <Trash2 size={14} />
                            </button>
                        </div>

                        {/* Text input */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Text Content</label>
                            <input
                                type="text"
                                value={edit.text}
                                onChange={e => updateEdit(edit.id, "text", e.target.value)}
                                placeholder="Enter text to add"
                                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>

                        {/* Position & Page */}
                        <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Page</label>
                                <input type="number" min={1} value={edit.page}
                                    onChange={e => updateEdit(edit.id, "page", parseInt(e.target.value) || 1)}
                                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">X (from left)</label>
                                <input type="number" min={0} value={edit.x}
                                    onChange={e => updateEdit(edit.id, "x", parseInt(e.target.value) || 0)}
                                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Y (from top)</label>
                                <input type="number" min={0} value={edit.y}
                                    onChange={e => updateEdit(edit.id, "y", parseInt(e.target.value) || 0)}
                                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                            </div>
                        </div>

                        {/* Font size & Color */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Font Size</label>
                                <input type="number" min={6} max={72} value={edit.font_size}
                                    onChange={e => updateEdit(edit.id, "font_size", parseInt(e.target.value) || 12)}
                                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Color</label>
                                <div className="flex gap-2 items-center">
                                    <input type="color" value={edit.color} onChange={e => updateEdit(edit.id, "color", e.target.value)}
                                        className="h-9 w-9 rounded-lg border border-border cursor-pointer" />
                                    <input type="text" value={edit.color} onChange={e => updateEdit(edit.id, "color", e.target.value)}
                                        className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {error && (
                <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    <AlertCircle size={15} className="shrink-0" />{error}
                </div>
            )}

            <div className="flex gap-3">
                <Button onClick={process} disabled={state === "processing" || edits.length === 0 || edits.some(e => !e.text.trim())} className="glow-primary">
                    {state === "processing" ? <><Loader2 size={15} className="animate-spin" />Applying Edits…</> : `Apply ${edits.length} Edit${edits.length !== 1 ? "s" : ""}`}
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground"
                    onClick={() => { setFile(null); setState("idle"); setEdits([]); }}>Start Over</Button>
            </div>
        </div>
    );

    // Upload state
    return (
        <div className="space-y-4">
            <div onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
                onDrop={e => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files.length) pick(e.dataTransfer.files); }}
                onClick={() => ref.current?.click()}
                className={cn("flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer transition-all py-14 px-6 text-center",
                    drag ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-secondary/40 bg-secondary/20")}>
                <input ref={ref} type="file" accept=".pdf" className="hidden" onChange={e => e.target.files && pick(e.target.files)} />
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", drag ? "bg-primary/20" : "bg-secondary")}>
                    <Upload size={22} className={drag ? "text-primary" : "text-muted-foreground"} strokeWidth={1.5} />
                </div>
                <p className="text-sm font-semibold text-foreground">Select a PDF to edit</p>
                <p className="text-xs text-muted-foreground">Add text, modify content, and customize your PDF</p>
            </div>
        </div>
    );
}
