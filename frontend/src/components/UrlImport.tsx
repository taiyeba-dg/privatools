import { useState } from "react";
import { Link2, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UrlImportProps {
    onFileReady: (file: File) => void;
    accept?: string;
}

export function UrlImport({ onFileReady, accept }: UrlImportProps) {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImport = async () => {
        if (!url.trim()) return;
        setLoading(true);
        setError(null);

        try {
            // Use backend proxy to fetch the URL
            const res = await fetch(`/api/fetch-url`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: url.trim() }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({ detail: "Failed to fetch URL" }));
                throw new Error(body.detail);
            }

            const blob = await res.blob();
            const filename = url.split("/").pop()?.split("?")[0] || "downloaded-file";
            const file = new File([blob], filename, { type: blob.type });
            onFileReady(file);
            setUrl("");
        } catch (e: any) {
            setError(e.message || "Failed to import from URL");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Link2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/30" />
                    <input
                        type="url"
                        placeholder="Paste URL to import file…"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleImport()}
                        className="w-full h-9 pl-8 pr-3 rounded-xl border border-border/40 bg-secondary/20 text-[13px] text-foreground placeholder:text-muted-foreground/30 focus:border-primary/40 focus:outline-none transition-colors"
                    />
                </div>
                <Button
                    size="sm"
                    onClick={handleImport}
                    disabled={loading || !url.trim()}
                    className="h-9 px-3 text-[12px]"
                >
                    {loading ? <Loader2 size={13} className="animate-spin" /> : <ArrowRight size={13} />}
                    Import
                </Button>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-[11px] text-destructive">
                    <AlertCircle size={11} />
                    {error}
                </div>
            )}
        </div>
    );
}
