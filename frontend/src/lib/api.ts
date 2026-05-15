/**
 * Central API client for PrivaTools.
 * All tool UIs use these helpers to communicate with the FastAPI backend.
 */

const API_BASE = "/api";

/** Strip an accidental leading "/api" so callers can pass either "/foo" or
 *  "/api/foo" without producing "/api/api/foo". A few tool files have done
 *  the latter historically and that produced 405s in prod. */
function normalizeEndpoint(ep: string): string {
    if (ep.startsWith("/api/")) return ep.slice(4);
    if (ep === "/api") return "/";
    return ep.startsWith("/") ? ep : "/" + ep;
}

/** Turn a Response into a human-readable error message. Distinguishes
 *  HTTP status families so the UI can show meaningful guidance instead of
 *  a generic "Request failed (500)". */
async function describeError(res: Response): Promise<Error> {
    const status = res.status;
    let detail: string | undefined;
    try {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
            const body = await res.json();
            if (typeof body.detail === "string") detail = body.detail;
            else if (Array.isArray(body.detail)) detail = body.detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(", ");
        }
    } catch { /* fall through */ }

    if (detail) return new Error(detail);
    if (status === 0 || status >= 502) return new Error("The server isn't responding right now. Check your connection and try again in a moment.");
    if (status === 413) return new Error("That file is too large. The maximum is 500 MB per file.");
    if (status === 415) return new Error("That file type isn't supported by this tool.");
    if (status === 429) return new Error("Slow down — we're rate-limiting requests. Wait a moment and try again.");
    if (status === 504) return new Error("Processing timed out. Try a smaller file or a lighter compression setting.");
    if (status === 422) return new Error("Some required field is missing or has an invalid value.");
    if (status >= 400 && status < 500) return new Error(`Request rejected (HTTP ${status}). Try a different file or adjust the settings.`);
    return new Error(`Server error (HTTP ${status}). Try again.`);
}

/** Maximum file size: 500 MB per file (24 GB RAM server) */
export const MAX_FILE_SIZE = 500 * 1024 * 1024;
export const MAX_FILE_SIZE_LABEL = "500 MB";

function validateFileSize(file: File) {
    if (file.size > MAX_FILE_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        throw new Error(`File "${file.name}" is ${sizeMB} MB — max allowed is 500 MB`);
    }
}

/** Progress callback: phase ("upload" | "download"), percent 0-100 */
export type ProgressCallback = (phase: "upload" | "download", percent: number) => void;

/** Upload a single file with optional form-data parameters. Returns the response.
 *  Attaches both `file` (singular) and `files` (plural) so the request works
 *  against endpoints that expect either convention — without forcing every UI
 *  to know which name the backend chose. */
export async function uploadFile(
    endpoint: string,
    file: File,
    params?: Record<string, string | number | boolean>,
): Promise<Response> {
    validateFileSize(file);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("files", file);
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            fd.append(k, String(v));
        }
    }
    const res = await fetch(`${API_BASE}${normalizeEndpoint(endpoint)}`, { method: "POST", body: fd });
    if (!res.ok) throw await describeError(res);
    return res;
}

/**
 * Upload a single file with real upload progress via XMLHttpRequest.
 * Falls back to fetch() if XHR is unavailable.
 */
export function uploadFileWithProgress(
    endpoint: string,
    file: File,
    params?: Record<string, string | number | boolean>,
    onProgress?: ProgressCallback,
): Promise<Response> {
    validateFileSize(file);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("files", file);
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            fd.append(k, String(v));
        }
    }

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${API_BASE}${normalizeEndpoint(endpoint)}`);
        xhr.responseType = "blob";

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable && onProgress) {
                onProgress("upload", Math.round((e.loaded / e.total) * 100));
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                const blob = xhr.response as Blob;
                const headers = new Headers();
                xhr.getAllResponseHeaders().trim().split(/[\r\n]+/).forEach(line => {
                    const parts = line.split(": ");
                    if (parts.length === 2) headers.append(parts[0], parts[1]);
                });
                resolve(new Response(blob, { status: xhr.status, headers }));
            } else {
                // Try to parse error from blob response
                const blob = xhr.response as Blob;
                blob.text().then(text => {
                    try {
                        const data = JSON.parse(text);
                        reject(new Error(data.detail || `Request failed (${xhr.status})`));
                    } catch {
                        reject(new Error(`Request failed (${xhr.status})`));
                    }
                }).catch(() => reject(new Error(`Request failed (${xhr.status})`)));
            }
        };

        xhr.onerror = () => reject(new Error("Network error"));
        xhr.ontimeout = () => reject(new Error("Request timed out"));
        xhr.timeout = 300_000; // 5 min
        xhr.send(fd);
    });
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
    const res = await fetch(`${API_BASE}${normalizeEndpoint(endpoint)}`, { method: "POST", body: fd });
    if (!res.ok) throw await describeError(res);
    return res;
}

/**
 * Upload multiple files with real upload progress via XMLHttpRequest.
 */
export function uploadFilesWithProgress(
    endpoint: string,
    files: File[],
    params?: Record<string, string | number | boolean>,
    onProgress?: ProgressCallback,
): Promise<Response> {
    for (const f of files) validateFileSize(f);
    const fd = new FormData();
    for (const f of files) fd.append("files", f);
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            fd.append(k, String(v));
        }
    }

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${API_BASE}${normalizeEndpoint(endpoint)}`);
        xhr.responseType = "blob";

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable && onProgress) {
                onProgress("upload", Math.round((e.loaded / e.total) * 100));
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                const blob = xhr.response as Blob;
                const headers = new Headers();
                xhr.getAllResponseHeaders().trim().split(/[\r\n]+/).forEach(line => {
                    const parts = line.split(": ");
                    if (parts.length === 2) headers.append(parts[0], parts[1]);
                });
                resolve(new Response(blob, { status: xhr.status, headers }));
            } else {
                const blob = xhr.response as Blob;
                blob.text().then(text => {
                    try {
                        const data = JSON.parse(text);
                        reject(new Error(data.detail || `Request failed (${xhr.status})`));
                    } catch {
                        reject(new Error(`Request failed (${xhr.status})`));
                    }
                }).catch(() => reject(new Error(`Request failed (${xhr.status})`)));
            }
        };

        xhr.onerror = () => reject(new Error("Network error"));
        xhr.ontimeout = () => reject(new Error("Request timed out"));
        xhr.timeout = 300_000;
        xhr.send(fd);
    });
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
    const res = await fetch(`${API_BASE}${normalizeEndpoint(endpoint)}`, { method: "POST", body: fd });
    if (!res.ok) throw await describeError(res);
    return res.json() as Promise<T>;
}

/** Post JSON body and get JSON back. */
export async function postJson<T = unknown>(
    endpoint: string,
    body: unknown,
): Promise<T> {
    const res = await fetch(`${API_BASE}${normalizeEndpoint(endpoint)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!res.ok) throw await describeError(res);
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

/** Helper: upload file → get blob → download. With progress tracking. */
export async function processAndDownload(
    endpoint: string,
    file: File,
    filename: string,
    params?: Record<string, string | number | boolean>,
    onProgress?: ProgressCallback,
): Promise<Record<string, string>> {
    const res = onProgress
        ? await uploadFileWithProgress(endpoint, file, params, onProgress)
        : await uploadFile(endpoint, file, params);
    if (onProgress) onProgress("download", 50);
    const blob = await res.blob();
    if (onProgress) onProgress("download", 100);
    downloadBlob(blob, filename);
    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => { headers[k] = v; });
    return headers;
}

/** Helper: upload multiple files → get blob → download. With progress tracking. */
export async function processFilesAndDownload(
    endpoint: string,
    files: File[],
    filename: string,
    params?: Record<string, string | number | boolean>,
    onProgress?: ProgressCallback,
): Promise<void> {
    const res = onProgress
        ? await uploadFilesWithProgress(endpoint, files, params, onProgress)
        : await uploadFiles(endpoint, files, params);
    if (onProgress) onProgress("download", 50);
    const blob = await res.blob();
    if (onProgress) onProgress("download", 100);
    downloadBlob(blob, filename);
}

/** Build an output filename that preserves the user's original filename stem.
 *
 *   buildOutputFilename("report.pdf",       "compressed", "pdf") → "report_compressed.pdf"
 *   buildOutputFilename("vacation.jpg",     null,         "png") → "vacation.png"
 *   buildOutputFilename("clip.mp4",         "audio",      "mp3") → "clip_audio.mp3"
 *   buildOutputFilename(undefined,          "merged",     "pdf") → "merged.pdf"
 *
 * Pass `suffix=null` for pure format conversions (e.g. jpg→png) so the
 * downloaded file just changes extension. Pass a verb suffix for any
 * operation that modifies content (compress, rotate, watermark, etc.).
 */
export function buildOutputFilename(
    sourceName: string | null | undefined,
    suffix: string | null,
    ext: string,
): string {
    const cleanExt = ext.startsWith(".") ? ext.slice(1) : ext;
    if (!sourceName) {
        return `${suffix || "output"}.${cleanExt}`;
    }
    const lastDot = sourceName.lastIndexOf(".");
    const stem = lastDot > 0 ? sourceName.substring(0, lastDot) : sourceName;
    if (suffix) return `${stem}_${suffix}.${cleanExt}`;
    return `${stem}.${cleanExt}`;
}

/** Format bytes to human-readable string. */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
}
