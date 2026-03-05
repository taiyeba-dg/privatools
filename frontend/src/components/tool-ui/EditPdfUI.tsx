import { useState } from "react";
import { Download, CheckCircle2, AlertCircle, Plus, Trash2, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { downloadBlob } from "@/lib/api";
import { FileUploadZone, ProcessingBar } from "./FileUploadZone";

const API_BASE = "/api";

const FONTS = [
    { value: "Helvetica", label: "Helvetica", desc: "Sans-serif" },
    { value: "Times-Roman", label: "Times", desc: "Serif" },
    { value: "Courier", label: "Courier", desc: "Monospace" },
];

interface TextEdit {
    id: string;
    type: "add_text";
    page: number;
    x: number;
    y: number;
    text: string;
    font_size: number;
    color: string;
    font_family: string;
    bold: boolean;
}

export function EditPdfUI() {
    const [file, setFile] = useState<File | null>(null);
    const [edits, setEdits] = useState<TextEdit[]>([]);
    const [state, setState] = useState<"idle" | "editing" | "processing" | "done">("idle");
    const [error, setError] = useState<string | null>(null);
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);

    const pick = (f: File) => {
        setFile(f);
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
            font_family: "Helvetica",
            bold: false,
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
            fd.append("file", file);
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
            <FileUploadZone file={file} onFileSelect={pick} onClear={() => { setFile(null); setState("idle"); setEdits([]); }} accept=".pdf" />

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

                        {/* Font family & Bold */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Font</label>
                                <select value={edit.font_family} onChange={e => updateEdit(edit.id, "font_family", e.target.value)}
                                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                                    {FONTS.map(f => <option key={f.value} value={f.value}>{f.label} — {f.desc}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Style</label>
                                <button onClick={() => updateEdit(edit.id, "bold", edit.bold ? 0 : 1)}
                                    className={cn("w-full rounded-lg border py-2 text-sm font-bold transition-all",
                                        edit.bold ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30")}>
                                    B Bold
                                </button>
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

            {state === "processing" && <ProcessingBar label="Applying edits to your PDF…" />}

            {state !== "processing" && (
                <div className="flex gap-3">
                    <Button onClick={process} disabled={edits.length === 0 || edits.some(e => !e.text.trim())} className="glow-primary">
                        {`Apply ${edits.length} Edit${edits.length !== 1 ? "s" : ""}`}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground"
                        onClick={() => { setFile(null); setState("idle"); setEdits([]); }}>Start Over</Button>
                </div>
            )}
        </div>
    );

    // Upload state
    return (
        <div className="space-y-4">
            <FileUploadZone
                file={null}
                onFileSelect={pick}
                onClear={() => { }}
                accept=".pdf"
                label="Select a PDF to edit"
                hint="Add text, modify content, and customize your PDF"
            />
        </div>
    );
}
