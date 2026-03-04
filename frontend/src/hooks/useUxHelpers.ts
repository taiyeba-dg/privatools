import { useEffect, useCallback, useState } from "react";
import { toast } from "sonner";

/**
 * Hook to handle clipboard paste for image-based tools.
 * Listens for Ctrl+V / Cmd+V and extracts pasted image data.
 */
export function useClipboardPaste(onPaste: (file: File) => void) {
    useEffect(() => {
        const handler = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (const item of items) {
                if (item.type.startsWith("image/")) {
                    const file = item.getAsFile();
                    if (file) {
                        e.preventDefault();
                        onPaste(file);
                        toast.info("Image pasted from clipboard!");
                        return;
                    }
                }
            }
        };

        window.addEventListener("paste", handler);
        return () => window.removeEventListener("paste", handler);
    }, [onPaste]);
}

/**
 * File size warning — returns warning message if file exceeds threshold.
 */
export function getFileSizeWarning(sizeBytes: number): string | null {
    if (sizeBytes > 50 * 1024 * 1024) return "File exceeds 50MB limit. Processing may fail.";
    if (sizeBytes > 20 * 1024 * 1024) return "Large file (>20MB). Processing may take longer.";
    return null;
}

/**
 * Estimate processing time based on file size.
 */
export function estimateTime(sizeBytes: number): string {
    const mb = sizeBytes / (1024 * 1024);
    if (mb < 1) return "~1 second";
    if (mb < 5) return "~3 seconds";
    if (mb < 10) return "~5 seconds";
    if (mb < 20) return "~10 seconds";
    if (mb < 50) return "~20 seconds";
    return "~30+ seconds";
}
