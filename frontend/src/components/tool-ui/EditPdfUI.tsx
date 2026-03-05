import { useState, useRef, useCallback } from "react";
import { Download, CheckCircle2, AlertCircle, Type, Link2, Image, Stamp, Eraser, PenTool, Undo2, Trash2, Copy, Move, ChevronRight } from "lucide-react";
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

const COLORS = [
    "#000000", "#ffffff", "#dc2626", "#2563eb", "#16a34a",
    "#9333ea", "#ea580c", "#0891b2", "#be185d", "#64748b",
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

const TOOLBAR_ITEMS = [
    { id: "text", icon: Type, label: "Text", active: true },
    { id: "whiteout", icon: Eraser, label: "Whiteout" },
    { id: "annotate", icon: PenTool, label: "Annotate" },
    { id: "shapes", icon: Stamp, label: "Shapes" },
];

export function EditPdfUI() {
    const [file, setFile] = useState<File | null>(null);
    const [edits, setEdits] = useState<TextEdit[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [state, setState] = useState<"idle" | "editing" | "processing" | "done">("idle");
    const [error, setError] = useState<string | null>(null);
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [activeTool, setActiveTool] = useState("text");
    const canvasRef = useRef<HTMLDivElement>(null);

    const pick = (f: File) => {
        setFile(f);
        setState("editing");
        setError(null);
        setEdits([]);
    };

    const addTextAtPosition = useCallback((clientX: number, clientY: number) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const xPct = (clientX - rect.left) / rect.width;
        const yPct = (clientY - rect.top) / rect.height;
        const pdfX = Math.round(xPct * 595);
        const pdfY = Math.round((1 - yPct) * 842);

        const newEdit: TextEdit = {
            id: Math.random().toString(36).slice(2),
            type: "add_text",
            page: 1,
            x: pdfX,
            y: pdfY,
            text: "",
            font_size: 16,
            color: "#000000",
            font_family: "Helvetica",
        };
        setEdits(prev => [...prev, newEdit]);
        setSelectedId(newEdit.id);
    }, []);

    const updateEdit = (id: string, field: keyof TextEdit, value: string | number) => {
        setEdits(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    const removeEdit = (id: string) => {
        setEdits(prev => prev.filter(e => e.id !== id));
        if (selectedId === id) setSelectedId(null);
    };

    const duplicateEdit = (id: string) => {
        const src = edits.find(e => e.id === id);
        if (!src) return;
        const dup: TextEdit = { ...src, id: Math.random().toString(36).slice(2), x: src.x + 20, y: src.y - 20 };
        setEdits(prev => [...prev, dup]);
        setSelectedId(dup.id);
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

    // ── Done ─────
    if (state === "done") return (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-10 text-center">
            <CheckCircle2 size={40} className="mx-auto mb-4 text-emerald-400" strokeWidth={1.5} />
            <h2 className="text-lg font-bold text-foreground mb-1">Edited!</h2>
            <p className="text-sm text-muted-foreground mb-6">{edits.length} edit{edits.length !== 1 ? "s" : ""} applied.</p>
            <div className="flex justify-center gap-3 flex-wrap">
                <Button className="glow-primary" onClick={handleDownload}><Download size={15} />Download Edited PDF</Button>
                <Button variant="outline" className="border-border text-muted-foreground"
                    onClick={() => { setFile(null); setState("idle"); setEdits([]); setResultBlob(null); setSelectedId(null); }}>Edit another</Button>
            </div>
        </div>
    );

    // ── Upload ─────
    if (state === "idle") return (
        <FileUploadZone file={null} onFileSelect={pick} onClear={() => { }} accept=".pdf"
            label="Upload a PDF to edit" hint="Add text, whiteout areas, annotate, and more — like Sejda, but private" />
    );

    // ── Editor (Sejda-style) ─────
    return (
        <div className="space-y-0 -mx-1">
            {/* ═══ Main Toolbar (Sejda-style horizontal pill buttons) ═══ */}
            <div className="flex items-center justify-center gap-1 rounded-t-xl border border-border bg-card px-3 py-2.5">
                {TOOLBAR_ITEMS.map(item => (
                    <button key={item.id} onClick={() => setActiveTool(item.id)}
                        className={cn(
                            "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-all border",
                            activeTool === item.id
                                ? "bg-primary/10 border-primary/30 text-primary shadow-sm"
                                : "border-transparent text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                        )}>
                        <item.icon size={14} />
                        {item.label}
                    </button>
                ))}
                <div className="h-5 w-px bg-border mx-2" />
                <button onClick={() => { if (edits.length) { setEdits(prev => prev.slice(0, -1)); setSelectedId(null); } }}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-all border border-transparent"
                    disabled={edits.length === 0}>
                    <Undo2 size={14} /> Undo
                </button>
            </div>

            {/* ═══ Page Controls Bar ═══ */}
            <div className="flex items-center justify-center gap-3 border-x border-border bg-secondary/30 px-3 py-1.5">
                <span className="text-xs font-semibold text-muted-foreground">1</span>
                <div className="h-4 w-px bg-border" />
                <span className="text-[10px] text-muted-foreground">Click anywhere on the page to add text</span>
                <div className="flex-1" />
                <span className="text-[10px] text-muted-foreground">{edits.length} edit{edits.length !== 1 ? "s" : ""}</span>
            </div>

            {/* ═══ Canvas Area (full-width, light gray bg like Sejda) ═══ */}
            <div className="border-x border-border bg-[#e8eaed] dark:bg-[#1a1d23] overflow-hidden" style={{ minHeight: 520 }}>
                <div className="flex items-start justify-center py-6 px-4">
                    {/* The page */}
                    <div ref={canvasRef}
                        className="relative bg-white shadow-[0_2px_20px_rgba(0,0,0,0.12)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.4)]"
                        style={{ width: 520, height: 674, cursor: activeTool === "text" ? "text" : "default" }}
                        onClick={e => {
                            if (activeTool === "text") {
                                addTextAtPosition(e.clientX, e.clientY);
                            } else {
                                setSelectedId(null);
                            }
                        }}>

                        {/* Render text elements */}
                        {edits.map(edit => {
                            const leftPct = (edit.x / 595) * 100;
                            const topPct = (1 - edit.y / 842) * 100;
                            const isSelected = edit.id === selectedId;
                            const scaledSize = Math.max(8, edit.font_size * (520 / 595));

                            return (
                                <div key={edit.id} className="absolute" style={{ left: `${leftPct}%`, top: `${topPct}%` }}>
                                    {/* ── Floating toolbar (Sejda-style, above text) ── */}
                                    {isSelected && (
                                        <div className="absolute bottom-full left-0 mb-1.5 flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white shadow-lg px-1 py-0.5 z-20 whitespace-nowrap"
                                            onClick={e => e.stopPropagation()}>
                                            {/* Bold */}
                                            <button onClick={() => updateEdit(edit.id, "font_family", edit.font_family.includes("Bold") ? edit.font_family.replace("-Bold", "") : edit.font_family.replace(/(Helvetica|Times-Roman|Courier)/, "$1-Bold"))}
                                                className={cn("w-7 h-7 flex items-center justify-center rounded text-xs font-bold transition-colors",
                                                    edit.font_family.includes("Bold") ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100")}>
                                                B
                                            </button>
                                            <div className="w-px h-4 bg-gray-200" />
                                            {/* Font size */}
                                            <select value={edit.font_size} onChange={e => updateEdit(edit.id, "font_size", +e.target.value)}
                                                className="h-7 rounded border-0 bg-transparent text-xs text-gray-700 focus:ring-0 pr-1 cursor-pointer">
                                                {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72].map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            <div className="w-px h-4 bg-gray-200" />
                                            {/* Font family */}
                                            <select value={edit.font_family} onChange={e => updateEdit(edit.id, "font_family", e.target.value)}
                                                className="h-7 rounded border-0 bg-transparent text-xs text-gray-700 focus:ring-0 cursor-pointer max-w-[90px]">
                                                {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                            </select>
                                            <div className="w-px h-4 bg-gray-200" />
                                            {/* Color swatches */}
                                            <div className="flex items-center gap-0.5 px-0.5">
                                                {COLORS.slice(0, 6).map(c => (
                                                    <button key={c} onClick={() => updateEdit(edit.id, "color", c)}
                                                        className={cn("w-5 h-5 rounded-full border transition-all",
                                                            edit.color === c ? "border-blue-500 scale-110 ring-1 ring-blue-300" : "border-gray-300 hover:scale-110")}
                                                        style={{ backgroundColor: c }} />
                                                ))}
                                                <input type="color" value={edit.color} onChange={e => updateEdit(edit.id, "color", e.target.value)}
                                                    className="w-5 h-5 rounded-full border border-gray-300 cursor-pointer" />
                                            </div>
                                            <div className="w-px h-4 bg-gray-200" />
                                            {/* Duplicate */}
                                            <button onClick={() => duplicateEdit(edit.id)}
                                                className="w-7 h-7 flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 transition-colors"
                                                title="Duplicate"><Copy size={12} /></button>
                                            {/* Delete */}
                                            <button onClick={() => removeEdit(edit.id)}
                                                className="w-7 h-7 flex items-center justify-center rounded text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                                                title="Delete"><Trash2 size={12} /></button>
                                        </div>
                                    )}

                                    {/* ── Text element ── */}
                                    {isSelected ? (
                                        <input
                                            type="text"
                                            autoFocus
                                            value={edit.text}
                                            onChange={e => updateEdit(edit.id, "text", e.target.value)}
                                            placeholder="Type your text"
                                            onClick={e => e.stopPropagation()}
                                            className="border border-blue-400 bg-blue-50/30 outline-none px-1 rounded-sm min-w-[100px]"
                                            style={{
                                                fontSize: scaledSize,
                                                color: edit.color,
                                                fontFamily: edit.font_family.includes("Courier") ? "monospace" : edit.font_family.includes("Times") ? "serif" : "sans-serif",
                                                fontWeight: edit.font_family.includes("Bold") ? 700 : 400,
                                            }}
                                        />
                                    ) : (
                                        <span
                                            onClick={e => { e.stopPropagation(); setSelectedId(edit.id); }}
                                            className="cursor-pointer hover:outline hover:outline-1 hover:outline-blue-300 rounded-sm px-1 transition-all"
                                            style={{
                                                fontSize: scaledSize,
                                                color: edit.color,
                                                fontFamily: edit.font_family.includes("Courier") ? "monospace" : edit.font_family.includes("Times") ? "serif" : "sans-serif",
                                                fontWeight: edit.font_family.includes("Bold") ? 700 : 400,
                                            }}>
                                            {edit.text || "Type your text"}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ═══ Bottom bar ═══ */}
            <div className="rounded-b-xl border border-t-0 border-border bg-card px-4 py-3">
                {error && (
                    <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive mb-3">
                        <AlertCircle size={14} className="shrink-0" />{error}
                    </div>
                )}
                {state === "processing" && <ProcessingBar label="Applying edits to your PDF…" />}
                {state !== "processing" && (
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{file?.name}</span>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="text-muted-foreground text-xs"
                                onClick={() => { setFile(null); setState("idle"); setEdits([]); setSelectedId(null); }}>Cancel</Button>
                            <Button onClick={process}
                                disabled={edits.length === 0 || edits.some(e => !e.text.trim())}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 px-5">
                                Apply changes <ChevronRight size={14} />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
