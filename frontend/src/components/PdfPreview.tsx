import { useEffect, useRef, useState } from "react";

interface PdfPreviewProps {
    file: File | null;
    className?: string;
    width?: number;
    height?: number;
}

/**
 * Renders a thumbnail of the first page of a PDF using pdf.js from CDN.
 * Falls back to a file icon if pdf.js isn't available.
 */
export function PdfPreview({ file, className = "", width = 160, height = 220 }: PdfPreviewProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!file || !canvasRef.current) return;
        setLoaded(false);
        setError(false);

        const render = async () => {
            try {
                // Dynamically load pdf.js if not already available
                if (!(window as any).pdfjsLib) {
                    const script = document.createElement("script");
                    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
                    script.onload = () => {
                        (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
                            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
                        renderPdf();
                    };
                    script.onerror = () => setError(true);
                    document.head.appendChild(script);
                } else {
                    renderPdf();
                }

                async function renderPdf() {
                    const pdfjsLib = (window as any).pdfjsLib;
                    const arrayBuffer = await file!.arrayBuffer();
                    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                    const page = await pdf.getPage(1);

                    const canvas = canvasRef.current!;
                    const ctx = canvas.getContext("2d")!;

                    const viewport = page.getViewport({ scale: 1 });
                    const scale = Math.min(width / viewport.width, height / viewport.height);
                    const scaledViewport = page.getViewport({ scale });

                    canvas.width = scaledViewport.width;
                    canvas.height = scaledViewport.height;

                    await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;
                    setLoaded(true);
                }
            } catch {
                setError(true);
            }
        };

        render();
    }, [file, width, height]);

    if (!file) return null;

    return (
        <div
            className={`relative rounded-xl overflow-hidden border border-border/40 bg-secondary/20 flex items-center justify-center ${className}`}
            style={{ width, height }}
        >
            <canvas
                ref={canvasRef}
                className={`transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
            />
            {!loaded && !error && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
            )}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-[10px] text-muted-foreground/40">Preview unavailable</p>
                </div>
            )}
        </div>
    );
}
