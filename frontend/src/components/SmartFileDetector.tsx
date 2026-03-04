import { useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Upload, FileText, ImageIcon, FileArchive, FileVideo, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { tools } from "@/data/tools";
import { nonPdfTools } from "@/data/non-pdf-tools";

// Map file extensions to compatible tools
const extensionMap: Record<string, { slug: string; name: string; path: string }[]> = {};

function addMapping(exts: string[], slug: string, name: string, prefix: string) {
    for (const ext of exts) {
        if (!extensionMap[ext]) extensionMap[ext] = [];
        extensionMap[ext].push({ slug, name, path: `${prefix}/${slug}` });
    }
}

// PDF tools
tools.forEach(t => {
    if (t.accepts) {
        t.accepts.split(",").forEach(ext => {
            addMapping([ext.trim().replace(".", "")], t.slug, t.name, "/tool");
        });
    }
});

// Non-PDF tools
nonPdfTools.forEach(t => {
    if (t.accepts) {
        t.accepts.split(",").forEach(ext => {
            addMapping([ext.trim().replace(".", "")], t.slug, t.name, "/tools");
        });
    }
});

export function SmartFileDetector() {
    const [detectedTools, setDetectedTools] = useState<{ slug: string; name: string; path: string }[]>([]);
    const [fileName, setFileName] = useState("");
    const [show, setShow] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const handleFile = useCallback((file: File) => {
        const ext = file.name.split(".").pop()?.toLowerCase() || "";
        setFileName(file.name);
        const matching = extensionMap[ext] || [];

        // Also match by mime type
        const mimeTools: typeof matching = [];
        if (file.type.startsWith("image/")) {
            nonPdfTools.forEach(t => {
                if (t.accepts?.includes("image") && !matching.find(m => m.slug === t.slug)) {
                    mimeTools.push({ slug: t.slug, name: t.name, path: `/tools/${t.slug}` });
                }
            });
        }

        setDetectedTools([...matching, ...mimeTools].slice(0, 12));
        setShow(true);
    }, []);

    const getIcon = () => {
        const ext = fileName.split(".").pop()?.toLowerCase() || "";
        if (ext === "pdf") return FileText;
        if (["jpg", "jpeg", "png", "gif", "webp", "svg", "heic"].includes(ext)) return ImageIcon;
        if (["mp4", "mov", "avi", "webm", "mp3", "wav"].includes(ext)) return FileVideo;
        if (["zip", "tar", "gz", "rar", "7z"].includes(ext)) return FileArchive;
        return FileText;
    };

    if (!show) {
        return (
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
                className="relative group cursor-pointer rounded-2xl border-2 border-dashed border-border/40 hover:border-primary/40 bg-card/30 hover:bg-primary/5 transition-all p-6 text-center"
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                />
                <Upload size={20} className="mx-auto text-muted-foreground/30 group-hover:text-primary/50 mb-2 transition-colors" />
                <p className="text-[13px] font-semibold text-foreground/80">Drop any file to find compatible tools</p>
                <p className="text-[11px] text-muted-foreground/40 mt-0.5">PDF, images, video, archives, documents…</p>
            </div>
        );
    }

    const Icon = getIcon();

    return (
        <div className="rounded-2xl border border-border/50 bg-card/40 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3 border-b border-border/30">
                <Icon size={16} className="text-primary/60 shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-foreground truncate">{fileName}</p>
                    <p className="text-[11px] text-muted-foreground/50">{detectedTools.length} compatible tool{detectedTools.length !== 1 ? "s" : ""} found</p>
                </div>
                <button onClick={() => { setShow(false); setDetectedTools([]); }} className="text-muted-foreground/30 hover:text-muted-foreground">
                    <X size={14} />
                </button>
            </div>

            {detectedTools.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 p-2">
                    {detectedTools.map(t => (
                        <Link
                            key={t.slug}
                            to={t.path}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-medium text-muted-foreground hover:bg-primary/10 hover:text-foreground transition-colors"
                        >
                            <span className="flex-1 truncate">{t.name}</span>
                            <ArrowRight size={10} className="shrink-0 opacity-0 group-hover:opacity-100" />
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="p-6 text-center">
                    <p className="text-[13px] text-muted-foreground/50">No compatible tools found for this file type</p>
                </div>
            )}
        </div>
    );
}
