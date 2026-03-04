/**
 * Export processing history as CSV.
 */

const STORAGE_KEY = "privatools_history";

interface HistoryEntry {
    slug: string;
    name: string;
    timestamp: number;
}

export function exportHistoryAsCsv(): void {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;

        const entries: HistoryEntry[] = JSON.parse(raw);
        if (!entries.length) return;

        const header = "Tool,Slug,Date,Time";
        const rows = entries.map(e => {
            const d = new Date(e.timestamp);
            return `"${e.name}","${e.slug}","${d.toLocaleDateString()}","${d.toLocaleTimeString()}"`;
        });

        const csv = [header, ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "privatools-history.csv";
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    } catch { }
}
