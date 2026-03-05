import { useState } from "react";
import { Download, CheckCircle2, AlertCircle, Plus, Trash2, Type, MousePointer2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { downloadBlob } from "@/lib/api";
import { FileUploadZone, ProcessingBar } from "./FileUploadZone";

const API_BASE = "/api";

const FONTS = [
    { value: "Helvetica", label: "Helvetica" },
    { value: "Helvetica-Bold", label: "Helvetica Bold" },
    { value: "Times-Roman", label: "Times Roman" },
    { value: "Times-Bold", label: "Times Bold" },
    { value: "Courier", label: "Courier" },
    { value: "Courier-Bold", label: "Courier Bold" },
];

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64];

const COLORS = [
    { value: "#000000", label: "Black" },
    { value: "#ffffff", label: "White" },
    { value: "#dc2626", label: "Red" },
    { value: "#2563eb", label: "Blue" },
    { value: "#16a34a", label: "Green" },
    { value: "#9333ea", label: "Purple" },
    { value: "#ea580c", label: "Orange" },
    { value: "#64748b", label: "Gray" },
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
}

export function EditPdfUI() {
    const [file, setFile] = useState<File | null>(null);
    const [edits, setEdits] = useState<TextEdit[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [state, setState] = useState<"idle" | "editing" | "processing" | "done">("idle");
    const [error, setError] = useState<string | null>(null);
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [activePage, setActivePage] = useState(1);
    const [totalPages] = useState(1);

    const pick = (f: File) => {
        setFile(f);
        setState("editing");
        setError(null);
        setEdits([]);
    };

    const addEdit = () => {
        const newEdit: TextEdit = {
            id: Math.random().toString(36).slice(2),
            type: "add_text",
            page: activePage,
            x: 72,
            y: 700,
            text: "New text",
            font_size: 14,
            color: "#000000",
            font_family: "Helvetica",
        };
        setEdits(prev => [...prev, newEdit]);
        setSelectedId(newEdit.id);
    };

    const updateEdit = (id: string, field: keyof TextEdit, value: string | number) => {
        setEdits(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    const removeEdit = (id: string) => {
        setEdits(prev => prev.filter(e => e.id !== id));
        if (selectedId === id) setSelectedId(null);
    };

    const process = async () => {
        if (!file || edits.length === 0) return;
        setState("processing");
        setError(null);
        try {
            const fd = new FormData();
            fd.append("file", file);
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

    const selected = edits.find(e => e.id === selectedId);
    const pageEdits = edits.filter(e => e.page === activePage);

    // ── Done ────────────────────────────────────────────────────────────────
    if (state === "done") return (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-10 text-center">
            <CheckCircle2 size={40} className="mx-auto mb-4 text-emerald-400" strokeWidth={1.5} />
            <h2 className="text-lg font-bold text-foreground mb-1">Edited!</h2>
            <p className="text-sm text-muted-foreground mb-6">{edits.length} edit{edits.length !== 1 ? "s" : ""} applied to your PDF.</p>
            <div className="flex justify-center gap-3 flex-wrap">
                <Button className="glow-primary" onClick={handleDownload}><Download size={15} />Download Edited PDF</Button>
                <Button variant="outline" className="border-border text-muted-foreground"
                    onClick={() => { setFile(null); setState("idle"); setEdits([]); setResultBlob(null); setSelectedId(null); }}>Edit another</Button>
            </div>
        </div>
    );

    // ── Upload ──────────────────────────────────────────────────────────────
    if (state === "idle") return (
        <FileUploadZone file={null} onFileSelect={pick} onClear={() => { }} accept=".pdf"
            label="Select a PDF to edit" hint="Add text anywhere on your PDF pages" />
    );

    // ── Editor ──────────────────────────────────────────────────────────────
    return (
        <div className="space-y-0 -mx-1">
            {/* ── Toolbar ─────────────────────────────────────── */}
            <div className="flex items-center gap-2 rounded-t-xl border border-border bg-card px-3 py-2">
                <button onClick={addEdit}
                    className="flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-all">
                    <Type size={13} /> Add Text
                </button>
                <div className="h-5 w-px bg-border mx-1" />
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span>Page</span>
                    <select value={activePage} onChange={e => setActivePage(+e.target.value)}
                        className="rounded border border-border bg-background px-1.5 py-0.5 text-xs text-foreground">
                        {Array.from({ length: Math.max(totalPages, ...edits.map(e => e.page)) }, (_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1" />
                <span className="text-[11px] text-muted-foreground">{edits.length} edit{edits.length !== 1 ? "s" : ""}</span>
                <button onClick={() => { setFile(null); setState("idle"); setEdits([]); setSelectedId(null); }}
                    className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">✕ Close</button>
            </div>

            {/* ── Canvas + Properties split ───────────────────── */}
            <div className="flex border-x border-b border-border rounded-b-xl overflow-hidden" style={{ minHeight: 420 }}>
                {/* Canvas area */}
                <div className="flex-1 bg-[#1a1a2e] relative overflow-hidden flex items-center justify-center p-4">
                    {/* Page representation */}
                    <div className="relative bg-white rounded shadow-2xl"
                        style={{ width: 340, height: 440, cursor: "crosshair" }}
                        onClick={e => {
                            if (!selectedId) return;
                            const rect = e.currentTarget.getBoundingClientRect();
                            const xPct = (e.clientX - rect.left) / rect.width;
                            const yPct = (e.clientY - rect.top) / rect.height;
                            // Convert to PDF coordinates (595 × 842 points, origin at bottom-left)
                            const pdfX = Math.round(xPct * 595);
                            const pdfY = Math.round((1 - yPct) * 842);
                            updateEdit(selectedId, "x", pdfX);
                            updateEdit(selectedId, "y", pdfY);
                        }}>
                        {/* Page label */}
                        <div className="absolute top-2 left-2 text-[9px] text-gray-400 font-mono">Page {activePage}</div>

                        {/* Render edit markers on canvas */}
                        {pageEdits.map(edit => {
                            const leftPct = (edit.x / 595) * 100;
                            const topPct = (1 - edit.y / 842) * 100;
                            const isSelected = edit.id === selectedId;
                            return (
                                <div key={edit.id}
                                    onClick={e => { e.stopPropagation(); setSelectedId(edit.id); }}
                                    className={cn("absolute cursor-pointer transition-all whitespace-nowrap",
                                        isSelected ? "ring-2 ring-blue-500 ring-offset-1" : "hover:ring-2 hover:ring-blue-300 hover:ring-offset-1")}
                                    style={{
                                        left: `${Math.min(95, Math.max(0, leftPct))}%`,
                                        top: `${Math.min(95, Math.max(0, topPct))}%`,
                                        fontSize: Math.max(8, Math.min(edit.font_size * (340 / 595), 28)),
                                        color: edit.color,
                                        fontFamily: edit.font_family.includes("Courier") ? "monospace" : edit.font_family.includes("Times") ? "serif" : "sans-serif",
                                        fontWeight: edit.font_family.includes("Bold") ? 700 : 400,
                                    }}>
                                    {edit.text || "…"}
                                </div>
                            );
                        })}

                        {/* Click hint */}
                        {selectedId && (
                            <div className="absolute bottom-2 left-0 right-0 text-center">
                                <span className="text-[9px] text-gray-400 bg-white/80 px-2 py-0.5 rounded">
                                    <MousePointer2 size={9} className="inline mr-1" />Click to reposition
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Properties panel */}
                <div className="w-64 bg-card border-l border-border overflow-y-auto">
                    {selected ? (
                        <div className="p-3 space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-foreground">Text Properties</p>
                                <button onClick={() => removeEdit(selected.id)}
                                    className="text-muted-foreground hover:text-destructive transition-colors">
                                    <Trash2 size={13} />
                                </button>
                            </div>

                            {/* Text */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Text</label>
                                <textarea value={selected.text} onChange={e => updateEdit(selected.id, "text", e.target.value)}
                                    placeholder="Enter text…" rows={2}
                                    className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
                            </div>

                            {/* Font */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Font</label>
                                <select value={selected.font_family} onChange={e => updateEdit(selected.id, "font_family", e.target.value)}
                                    className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                                    {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                </select>
                            </div>

                            {/* Size */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Size</label>
                                <div className="flex flex-wrap gap-1">
                                    {FONT_SIZES.map(s => (
                                        <button key={s} onClick={() => updateEdit(selected.id, "font_size", s)}
                                            className={cn("min-w-[28px] rounded border px-1.5 py-0.5 text-[10px] font-medium transition-all",
                                                selected.font_size === s
                                                    ? "border-primary bg-primary/15 text-primary"
                                                    : "border-border text-muted-foreground hover:border-primary/30")}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Color */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Color</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {COLORS.map(c => (
                                        <button key={c.value} onClick={() => updateEdit(selected.id, "color", c.value)}
                                            title={c.label}
                                            className={cn("h-6 w-6 rounded-full border-2 transition-all",
                                                selected.color === c.value ? "border-primary scale-110 ring-2 ring-primary/30" : "border-border hover:scale-110")}
                                            style={{ backgroundColor: c.value }} />
                                    ))}
                                    <input type="color" value={selected.color}
                                        onChange={e => updateEdit(selected.id, "color", e.target.value)}
                                        className="h-6 w-6 rounded-full border-2 border-border cursor-pointer" title="Custom color" />
                                </div>
                            </div>

                            {/* Position */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Position</label>
                                <div className="grid grid-cols-2 gap-1.5">
                                    <div className="flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1">
                                        <span className="text-[9px] text-muted-foreground">X</span>
                                        <input type="number" min={0} max={595} value={selected.x}
                                            onChange={e => updateEdit(selected.id, "x", parseInt(e.target.value) || 0)}
                                            className="w-full bg-transparent text-xs text-foreground outline-none" />
                                    </div>
                                    <div className="flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1">
                                        <span className="text-[9px] text-muted-foreground">Y</span>
                                        <input type="number" min={0} max={842} value={selected.y}
                                            onChange={e => updateEdit(selected.id, "y", parseInt(e.target.value) || 0)}
                                            className="w-full bg-transparent text-xs text-foreground outline-none" />
                                    </div>
                                </div>
                                <p className="text-[9px] text-muted-foreground/50">Or click on the page to place</p>
                            </div>

                            {/* Page */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Page</label>
                                <input type="number" min={1} value={selected.page}
                                    onChange={e => { const v = parseInt(e.target.value) || 1; updateEdit(selected.id, "page", v); setActivePage(v); }}
                                    className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
                            <Type size={24} className="text-muted-foreground/30 mb-3" />
                            <p className="text-xs font-medium text-muted-foreground mb-1">No element selected</p>
                            <p className="text-[10px] text-muted-foreground/60 mb-4">Click "Add Text" to add text to your PDF, then click on the page to position it.</p>
                            <button onClick={addEdit}
                                className="flex items-center gap-1.5 rounded-lg border border-dashed border-primary/30 px-3 py-1.5 text-xs text-primary hover:bg-primary/5 transition-all">
                                <Plus size={12} /> Add Text
                            </button>
                        </div>
                    )}

                    {/* Edit list at bottom */}
                    {edits.length > 0 && (
                        <div className="border-t border-border px-3 py-2">
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">All Edits</p>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                                {edits.map((edit, i) => (
                                    <button key={edit.id}
                                        onClick={() => { setSelectedId(edit.id); setActivePage(edit.page); }}
                                        className={cn("w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-all",
                                            edit.id === selectedId ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary/50")}>
                                        <Type size={10} />
                                        <span className="text-[10px] font-medium truncate flex-1">{edit.text || `Text ${i + 1}`}</span>
                                        <span className="text-[9px] opacity-50">p{edit.page}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Bottom bar ─────────────────────────────────── */}
            {error && (
                <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive mt-3">
                    <AlertCircle size={15} className="shrink-0" />{error}
                </div>
            )}

            {state === "processing" && <div className="mt-3"><ProcessingBar label="Applying edits to your PDF…" /></div>}

            {state !== "processing" && (
                <div className="flex items-center gap-3 mt-3">
                    <Button onClick={process} disabled={edits.length === 0 || edits.some(e => !e.text.trim())} className="glow-primary">
                        Apply {edits.length} Edit{edits.length !== 1 ? "s" : ""}
                    </Button>
                    <span className="text-[10px] text-muted-foreground">{file?.name}</span>
                </div>
            )}
        </div>
    );
}
