import { useState, useRef, useCallback, useEffect } from "react";
import {
    Download, CheckCircle2, AlertCircle, Type, Eraser, Square, Circle,
    Minus, Highlighter, Undo2, Trash2, Copy, ChevronRight, ZoomIn,
    ZoomOut, X, ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { downloadBlob } from "@/lib/api";
import { FileUploadZone, ProcessingBar } from "./FileUploadZone";
import { createPortal } from "react-dom";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const API_BASE = "/api";

const FONTS = [
    { value: "Helvetica", label: "Helvetica" },
    { value: "Helvetica-Bold", label: "Helvetica Bold" },
    { value: "Times-Roman", label: "Times Roman" },
    { value: "Times-Bold", label: "Times Bold" },
    { value: "Courier", label: "Courier" },
    { value: "Courier-Bold", label: "Courier Bold" },
];

const PALETTE = [
    "#000000", "#ffffff", "#dc2626", "#2563eb", "#16a34a",
    "#9333ea", "#ea580c", "#0891b2", "#facc15", "#78716c",
];

/* ────────────── Edit Types ────────────── */
interface BaseEdit { id: string; page: number }
interface TextEdit extends BaseEdit { type: "text"; x: number; y: number; text: string; font_size: number; color: string; font_family: string }
interface RectEdit extends BaseEdit { type: "rectangle"; x: number; y: number; width: number; height: number; stroke_color: string; fill_color: string; stroke_width: number }
interface HighlightEdit extends BaseEdit { type: "highlight"; x: number; y: number; width: number; height: number; color: string; opacity: number }
interface WhiteoutEdit extends BaseEdit { type: "rectangle"; x: number; y: number; width: number; height: number; stroke_color: string; fill_color: string; stroke_width: number }

type Edit = TextEdit | RectEdit | HighlightEdit | WhiteoutEdit;

type ToolId = "text" | "highlight" | "whiteout" | "shapes";

const TOOLS: { id: ToolId; icon: any; label: string }[] = [
    { id: "text", icon: Type, label: "Text" },
    { id: "highlight", icon: Highlighter, label: "Highlight" },
    { id: "whiteout", icon: Eraser, label: "Whiteout" },
    { id: "shapes", icon: Square, label: "Rectangle" },
];

export function EditPdfUI() {
    const [file, setFile] = useState<File | null>(null);
    const [edits, setEdits] = useState<Edit[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [state, setState] = useState<"idle" | "editing" | "processing" | "done">("idle");
    const [error, setError] = useState<string | null>(null);
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [activeTool, setActiveTool] = useState<ToolId>("text");
    const [zoom, setZoom] = useState(100);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [pdfDoc, setPdfDoc] = useState<any>(null);
    const [pageSize, setPageSize] = useState({ w: 595, h: 842 });
    const [renderKey, setRenderKey] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    // Load PDF
    useEffect(() => {
        if (!file) return;
        (async () => {
            try {
                const buf = await file.arrayBuffer();
                const doc = await pdfjsLib.getDocument({ data: buf }).promise;
                setPdfDoc(doc);
                setTotalPages(doc.numPages);
                setCurrentPage(1);
            } catch (e) { console.error("PDF load error:", e); }
        })();
    }, [file]);

    // Render page
    useEffect(() => {
        if (!pdfDoc || !canvasRef.current) return;
        (async () => {
            try {
                const page = await pdfDoc.getPage(currentPage);
                const scale = 1.5 * (zoom / 100);
                const vp = page.getViewport({ scale });
                const cv = canvasRef.current!;
                cv.width = vp.width;
                cv.height = vp.height;
                setPageSize({ w: page.getViewport({ scale: 1 }).width, h: page.getViewport({ scale: 1 }).height });
                await page.render({ canvasContext: cv.getContext("2d")!, viewport: vp }).promise;
            } catch (e) { console.error("Render error:", e); }
        })();
    }, [pdfDoc, currentPage, zoom, renderKey]);

    const pick = (f: File) => { setFile(f); setState("editing"); setError(null); setEdits([]); };

    const uid = () => Math.random().toString(36).slice(2);
    const pdfCoords = (clientX: number, clientY: number) => {
        if (!overlayRef.current) return { x: 0, y: 0 };
        const r = overlayRef.current.getBoundingClientRect();
        return { x: Math.round(((clientX - r.left) / r.width) * pageSize.w), y: Math.round((1 - (clientY - r.top) / r.height) * pageSize.h) };
    };

    const addEdit = useCallback((clientX: number, clientY: number) => {
        const { x, y } = pdfCoords(clientX, clientY);
        let edit: Edit;
        switch (activeTool) {
            case "text":
                edit = { id: uid(), type: "text", page: currentPage, x, y, text: "", font_size: 16, color: "#000000", font_family: "Helvetica" };
                break;
            case "highlight":
                edit = { id: uid(), type: "highlight", page: currentPage, x, y: y - 10, width: 150, height: 20, color: "#facc15", opacity: 0.4 };
                break;
            case "whiteout":
                edit = { id: uid(), type: "rectangle", page: currentPage, x, y: y - 12, width: 120, height: 24, stroke_color: "#ffffff", fill_color: "#ffffff", stroke_width: 0 };
                break;
            case "shapes":
                edit = { id: uid(), type: "rectangle", page: currentPage, x, y: y - 25, width: 100, height: 50, stroke_color: "#2563eb", fill_color: "", stroke_width: 2 };
                break;
        }
        setEdits(prev => [...prev, edit]);
        setSelectedId(edit.id);
    }, [activeTool, currentPage, pageSize]);

    const updateEdit = (id: string, updates: Partial<Edit>) => {
        setEdits(prev => prev.map(e => e.id === id ? { ...e, ...updates } as Edit : e));
    };
    const removeEdit = (id: string) => { setEdits(prev => prev.filter(e => e.id !== id)); if (selectedId === id) setSelectedId(null); };
    const duplicateEdit = (id: string) => {
        const src = edits.find(e => e.id === id);
        if (!src) return;
        const dup = { ...src, id: uid(), x: (src as any).x + 20, y: (src as any).y - 20 } as Edit;
        setEdits(prev => [...prev, dup]);
        setSelectedId(dup.id);
    };

    const process = async () => {
        if (!file || edits.length === 0) return;
        setState("processing"); setError(null);
        try {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("edits", JSON.stringify(edits.map(({ id, ...rest }) => rest)));
            const res = await fetch(`${API_BASE}/edit-pdf`, { method: "POST", body: fd });
            if (!res.ok) { const b = await res.json().catch(() => ({ detail: "Unexpected error" })); throw new Error(b.detail); }
            setResultBlob(await res.blob());
            setState("done");
        } catch (e: any) { setError(e.message); setState("editing"); }
    };

    const handleDownload = () => {
        if (resultBlob) downloadBlob(resultBlob, file ? `${file.name.replace(/\.pdf$/i, "")}_edited.pdf` : "edited.pdf");
    };

    const pageEdits = edits.filter(e => e.page === currentPage);
    const selected = selectedId ? edits.find(e => e.id === selectedId) : null;

    /* ═══ Done state ═══ */
    if (state === "done") return (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-10 text-center">
            <CheckCircle2 size={40} className="mx-auto mb-4 text-emerald-400" strokeWidth={1.5} />
            <h2 className="text-lg font-bold text-foreground mb-1">PDF Edited Successfully!</h2>
            <p className="text-sm text-muted-foreground mb-6">{edits.length} edit{edits.length !== 1 ? "s" : ""} applied.</p>
            <div className="flex justify-center gap-3 flex-wrap">
                <Button className="glow-primary" onClick={handleDownload}><Download size={15} />Download</Button>
                <Button variant="outline" className="border-border text-muted-foreground"
                    onClick={() => { setFile(null); setState("idle"); setEdits([]); setResultBlob(null); setSelectedId(null); setPdfDoc(null); }}>Edit another</Button>
            </div>
        </div>
    );

    /* ═══ Upload state ═══ */
    if (state === "idle") return (
        <FileUploadZone file={null} onFileSelect={pick} onClear={() => { }} accept=".pdf"
            label="Upload a PDF to edit" hint="Add text, highlights, whiteout, and shapes — all processing stays on your server" />
    );

    /* ═══ Full-viewport editor ═══ */
    const editor = (
        <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: "hsl(224 20% 7%)" }}>

            {/* ─── Header ─── */}
            <div className="flex items-center gap-3 px-4 h-12 shrink-0" style={{ background: "hsl(224 18% 10%)", borderBottom: "1px solid hsl(224 15% 16%)" }}>
                <button onClick={() => { setFile(null); setState("idle"); setEdits([]); setSelectedId(null); setPdfDoc(null); }}
                    className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.06] transition-all" title="Close editor">
                    <X size={16} />
                </button>
                <div className="w-px h-5" style={{ background: "hsl(224 15% 16%)" }} />
                <span className="text-sm font-medium text-white/80 truncate max-w-[180px]">{file?.name}</span>
                <div className="flex-1" />

                {/* Page nav */}
                {totalPages > 1 && (
                    <div className="flex items-center gap-0.5 rounded-lg px-1 py-0.5" style={{ background: "hsl(224 15% 14%)" }}>
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}
                            className="p-1 text-white/40 hover:text-white disabled:opacity-20 transition-colors rounded"><ChevronLeft size={14} /></button>
                        <span className="text-[11px] text-white/50 font-medium min-w-[70px] text-center">Page {currentPage} / {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}
                            className="p-1 text-white/40 hover:text-white disabled:opacity-20 transition-colors rounded"><ChevronRight size={14} /></button>
                    </div>
                )}

                {/* Zoom */}
                <div className="flex items-center gap-0.5 rounded-lg px-1 py-0.5" style={{ background: "hsl(224 15% 14%)" }}>
                    <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="p-1 text-white/40 hover:text-white transition-colors rounded"><ZoomOut size={14} /></button>
                    <span className="text-[11px] text-white/50 font-medium min-w-[36px] text-center">{zoom}%</span>
                    <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="p-1 text-white/40 hover:text-white transition-colors rounded"><ZoomIn size={14} /></button>
                </div>

                <div className="w-px h-5" style={{ background: "hsl(224 15% 16%)" }} />

                {/* Apply */}
                <button onClick={process}
                    disabled={edits.length === 0 || edits.some(e => e.type === "text" && !(e as TextEdit).text.trim())}
                    className={cn("flex items-center gap-1.5 rounded-lg px-5 py-1.5 text-sm font-semibold transition-all",
                        edits.length > 0 ? "text-white shadow-lg" : "text-white/20 cursor-not-allowed")}
                    style={edits.length > 0 ? { background: "hsl(216 90% 60%)", boxShadow: "0 0 20px -4px hsl(216 90% 60% / 0.4)" } : { background: "hsl(224 15% 14%)" }}>
                    Apply changes <ChevronRight size={14} />
                </button>
            </div>

            {/* ─── Toolbar ─── */}
            <div className="flex items-center justify-center gap-1 px-4 h-10 shrink-0" style={{ background: "hsl(224 15% 14%)", borderBottom: "1px solid hsl(224 15% 16%)" }}>
                {TOOLS.map(t => (
                    <button key={t.id} onClick={() => setActiveTool(t.id)}
                        className={cn("flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-medium transition-all",
                            activeTool === t.id ? "text-white" : "text-white/35 hover:text-white/60")}
                        style={activeTool === t.id ? { background: "hsl(216 90% 60% / 0.15)", color: "hsl(216 90% 70%)" } : {}}>
                        <t.icon size={14} />{t.label}
                    </button>
                ))}
                <div className="w-px h-5 mx-2" style={{ background: "hsl(224 15% 16%)" }} />
                <button onClick={() => { if (edits.length) { removeEdit(edits[edits.length - 1].id); } }}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white/35 hover:text-white/60 transition-all" disabled={!edits.length}>
                    <Undo2 size={14} /> Undo
                </button>
                <div className="flex-1" />
                <span className="text-[10px] text-white/25">{edits.length ? `${edits.length} edit${edits.length !== 1 ? "s" : ""}` : "Click on the page to start editing"}</span>
            </div>

            {/* ─── Canvas ─── */}
            <div className="flex-1 overflow-auto" style={{ background: "hsl(224 20% 12%)" }}>
                <div className="flex items-start justify-center min-h-full py-8 px-4">
                    <div className="relative" style={{ boxShadow: "0 8px 60px rgba(0,0,0,0.4)", lineHeight: 0 }}>
                        <canvas ref={canvasRef} className="block rounded-sm" />
                        {/* Overlay for edits */}
                        <div ref={overlayRef} className="absolute inset-0 rounded-sm"
                            style={{ cursor: activeTool === "text" ? "text" : "crosshair" }}
                            onClick={e => { addEdit(e.clientX, e.clientY); }}>

                            {pageEdits.map(edit => {
                                const scale = 1.5 * (zoom / 100);
                                const isSelected = edit.id === selectedId;

                                if (edit.type === "text") {
                                    const te = edit as TextEdit;
                                    const leftPct = (te.x / pageSize.w) * 100;
                                    const topPct = (1 - te.y / pageSize.h) * 100;
                                    const sz = Math.max(8, te.font_size * scale);
                                    return (
                                        <div key={te.id} className="absolute" style={{ left: `${leftPct}%`, top: `${topPct}%`, zIndex: isSelected ? 20 : 10 }}>
                                            {isSelected && <TextToolbar edit={te} onUpdate={(f, v) => updateEdit(te.id, { [f]: v })} onDuplicate={() => duplicateEdit(te.id)} onDelete={() => removeEdit(te.id)} />}
                                            {isSelected ? (
                                                <input type="text" autoFocus value={te.text} onChange={e => updateEdit(te.id, { text: e.target.value })}
                                                    placeholder="Type your text" onClick={e => e.stopPropagation()}
                                                    className="outline-none px-1.5 py-0.5 rounded min-w-[120px]"
                                                    style={{
                                                        fontSize: sz, color: te.color, border: "2px solid hsl(216 90% 60%)", background: "hsl(216 90% 60% / 0.08)",
                                                        fontFamily: te.font_family.includes("Courier") ? "monospace" : te.font_family.includes("Times") ? "serif" : "sans-serif",
                                                        fontWeight: te.font_family.includes("Bold") ? 700 : 400
                                                    }} />
                                            ) : (
                                                <span onClick={e => { e.stopPropagation(); setSelectedId(te.id); }}
                                                    className="cursor-pointer rounded px-1.5 py-0.5 transition-all hover:ring-2 hover:ring-blue-400/50"
                                                    style={{
                                                        fontSize: sz, color: te.color,
                                                        fontFamily: te.font_family.includes("Courier") ? "monospace" : te.font_family.includes("Times") ? "serif" : "sans-serif",
                                                        fontWeight: te.font_family.includes("Bold") ? 700 : 400
                                                    }}>
                                                    {te.text || <span className="opacity-40">Type text</span>}
                                                </span>
                                            )}
                                        </div>
                                    );
                                }

                                // Rectangle / Whiteout / Highlight
                                const re = edit as any;
                                const left = (re.x / pageSize.w) * 100;
                                const bottom = (re.y / pageSize.h) * 100;
                                const top = 100 - bottom - (re.height / pageSize.h) * 100;
                                const w = (re.width / pageSize.w) * 100;
                                const h = (re.height / pageSize.h) * 100;
                                const isHighlight = edit.type === "highlight";
                                const isWhiteout = edit.type === "rectangle" && re.fill_color === "#ffffff";

                                return (
                                    <div key={edit.id} className={cn("absolute cursor-pointer transition-all", isSelected && "ring-2 ring-blue-400")}
                                        style={{
                                            left: `${left}%`, top: `${top}%`, width: `${w}%`, height: `${h}%`,
                                            backgroundColor: isHighlight ? re.color : (re.fill_color || "transparent"),
                                            opacity: isHighlight ? re.opacity : 1,
                                            border: !isHighlight && !isWhiteout ? `${re.stroke_width * scale}px solid ${re.stroke_color}` : "none",
                                            zIndex: isSelected ? 20 : 5
                                        }}
                                        onClick={e => { e.stopPropagation(); setSelectedId(edit.id); }}>
                                        {isSelected && (
                                            <div className="absolute -top-9 left-0 flex items-center gap-0.5 rounded-lg bg-white shadow-xl px-1.5 py-1 z-30 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                                                {isHighlight && PALETTE.slice(0, 5).map(c => (
                                                    <button key={c} onClick={() => updateEdit(edit.id, { color: c })}
                                                        className={cn("w-5 h-5 rounded-full border-2 transition-all", re.color === c ? "border-blue-500 scale-110" : "border-gray-200 hover:scale-110")}
                                                        style={{ backgroundColor: c }} />
                                                ))}
                                                {!isHighlight && !isWhiteout && PALETTE.slice(0, 5).map(c => (
                                                    <button key={c} onClick={() => updateEdit(edit.id, { stroke_color: c })}
                                                        className={cn("w-5 h-5 rounded-full border-2 transition-all", re.stroke_color === c ? "border-blue-500 scale-110" : "border-gray-200 hover:scale-110")}
                                                        style={{ backgroundColor: c }} />
                                                ))}
                                                <div className="w-px h-4 bg-gray-200 mx-0.5" />
                                                <button onClick={() => duplicateEdit(edit.id)} className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600"><Copy size={12} /></button>
                                                <button onClick={() => removeEdit(edit.id)} className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 size={12} /></button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Error toast */}
            {error && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-xl px-5 py-3 text-sm shadow-2xl z-50"
                    style={{ background: "hsl(0 72% 20%)", border: "1px solid hsl(0 60% 30%)", color: "hsl(0 60% 80%)" }}>
                    <AlertCircle size={15} className="shrink-0" />{error}
                    <button onClick={() => setError(null)} className="ml-2 hover:text-white"><X size={14} /></button>
                </div>
            )}

            {/* Processing overlay */}
            {state === "processing" && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="rounded-2xl p-8 w-[360px] shadow-2xl" style={{ background: "hsl(224 18% 10%)", border: "1px solid hsl(224 15% 16%)" }}>
                        <ProcessingBar label="Applying edits to your PDF…" />
                    </div>
                </div>
            )}
        </div>
    );

    return createPortal(editor, document.body);
}

/* ═══ Floating text toolbar ═══ */
function TextToolbar({ edit, onUpdate, onDuplicate, onDelete }: {
    edit: TextEdit; onUpdate: (field: string, value: any) => void; onDuplicate: () => void; onDelete: () => void;
}) {
    return (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex items-center gap-0.5 rounded-xl border border-gray-200 bg-white shadow-xl px-1.5 py-1 z-30 whitespace-nowrap"
            onClick={e => e.stopPropagation()}>
            <button onClick={() => {
                const base = edit.font_family.replace("-Bold", "");
                onUpdate("font_family", edit.font_family.includes("Bold") ? base : `${base}-Bold`);
            }} className={cn("w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all",
                edit.font_family.includes("Bold") ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100")}>B</button>
            <div className="w-px h-5 bg-gray-200" />
            <select value={edit.font_size} onChange={e => onUpdate("font_size", +e.target.value)}
                className="h-8 rounded-lg border-0 bg-transparent text-sm text-gray-700 focus:ring-0 px-1.5 cursor-pointer font-medium hover:bg-gray-50">
                {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="w-px h-5 bg-gray-200" />
            <select value={edit.font_family} onChange={e => onUpdate("font_family", e.target.value)}
                className="h-8 rounded-lg border-0 bg-transparent text-sm text-gray-700 focus:ring-0 cursor-pointer max-w-[100px] hover:bg-gray-50">
                {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
            <div className="w-px h-5 bg-gray-200" />
            <div className="flex items-center gap-1 px-1">
                {PALETTE.slice(0, 6).map(c => (
                    <button key={c} onClick={() => onUpdate("color", c)}
                        className={cn("w-6 h-6 rounded-full border-2 transition-all",
                            edit.color === c ? "border-blue-500 scale-110 ring-2 ring-blue-200" : "border-gray-200 hover:scale-110")}
                        style={{ backgroundColor: c }} />
                ))}
                <input type="color" value={edit.color} onChange={e => onUpdate("color", e.target.value)}
                    className="w-6 h-6 rounded-full border-2 border-gray-200 cursor-pointer" />
            </div>
            <div className="w-px h-5 bg-gray-200" />
            <button onClick={onDuplicate} title="Duplicate" className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"><Copy size={14} /></button>
            <button onClick={onDelete} title="Delete" className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
        </div>
    );
}
