/**
 * Central API client for PrivaTools.
 * All tool UIs use these helpers to communicate with the FastAPI backend.
 */

const API_BASE = "/api";

/** Maximum file size: 100 MB per file (protects 1GB RAM server from OOM) */
export const MAX_FILE_SIZE = 100 * 1024 * 1024;
export const MAX_FILE_SIZE_LABEL = "100 MB";

function validateFileSize(file: File) {
    if (file.size > MAX_FILE_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        throw new Error(`File "${file.name}" is ${sizeMB} MB — max allowed is 100 MB`);
    }
}

/** Upload a single file with optional form-data parameters. Returns the response. */
export async function uploadFile(
    endpoint: string,
    file: File,
    params?: Record<string, string | number | boolean>,
): Promise<Response> {
    validateFileSize(file);
    const fd = new FormData();
    fd.append("file", file);
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            fd.append(k, String(v));
        }
    }
    const res = await fetch(`${API_BASE}${endpoint}`, { method: "POST", body: fd });
    if (!res.ok) {
        const body = await res.json().catch(() => ({ detail: "An unexpected error occurred" }));
        throw new Error(body.detail || `Request failed (${res.status})`);
    }
    return res;
}

/** Upload multiple files with optional params. Returns the response. */
export async function uploadFiles(
    endpoint: string,
    files: File[],
    params?: Record<string, string | number | boolean>,
): Promise<Response> {
    for (const f of files) validateFileSize(f);
    const fd = new FormData();
    for (const f of files) fd.append("files", f);
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            fd.append(k, String(v));
        }
    }
    const res = await fetch(`${API_BASE}${endpoint}`, { method: "POST", body: fd });
    if (!res.ok) {
        const body = await res.json().catch(() => ({ detail: "An unexpected error occurred" }));
        throw new Error(body.detail || `Request failed (${res.status})`);
    }
    return res;
}

/** Upload a file and get a JSON response back. */
export async function uploadFileGetJson<T = unknown>(
    endpoint: string,
    file: File,
    params?: Record<string, string | number | boolean>,
): Promise<T> {
    const res = await uploadFile(endpoint, file, params);
    return res.json() as Promise<T>;
}

/** Post form data (no file) and get JSON back. */
export async function postForm<T = unknown>(
    endpoint: string,
    params: Record<string, string | number | boolean>,
): Promise<T> {
    const fd = new FormData();
    for (const [k, v] of Object.entries(params)) {
        fd.append(k, String(v));
    }
    const res = await fetch(`${API_BASE}${endpoint}`, { method: "POST", body: fd });
    if (!res.ok) {
        const body = await res.json().catch(() => ({ detail: "An unexpected error occurred" }));
        throw new Error(body.detail || `Request failed (${res.status})`);
    }
    return res.json() as Promise<T>;
}

/** Post JSON body and get JSON back. */
export async function postJson<T = unknown>(
    endpoint: string,
    body: unknown,
): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({ detail: "An unexpected error occurred" }));
        throw new Error(data.detail || `Request failed (${res.status})`);
    }
    return res.json() as Promise<T>;
}

/** Trigger a browser download from a blob. */
export function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);

    // Show toast notification
    import("sonner").then(({ toast }) => {
        toast.success("Downloaded!", { description: filename, duration: 3000 });
    }).catch(() => { });
}

/** Helper: upload file → get blob → download. Returns response headers for metadata. */
export async function processAndDownload(
    endpoint: string,
    file: File,
    filename: string,
    params?: Record<string, string | number | boolean>,
): Promise<Record<string, string>> {
    const res = await uploadFile(endpoint, file, params);
    const blob = await res.blob();
    downloadBlob(blob, filename);
    // Return headers as a plain object for convenience
    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => { headers[k] = v; });
    return headers;
}

/** Helper: upload multiple files → get blob → download. */
export async function processFilesAndDownload(
    endpoint: string,
    files: File[],
    filename: string,
    params?: Record<string, string | number | boolean>,
): Promise<void> {
    const res = await uploadFiles(endpoint, files, params);
    const blob = await res.blob();
    downloadBlob(blob, filename);
}

/** Format bytes to human-readable string. */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
}
