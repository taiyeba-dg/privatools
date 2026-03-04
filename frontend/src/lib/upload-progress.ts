/**
 * Upload a file with progress tracking using XMLHttpRequest.
 * Returns a promise that resolves with the response blob.
 */
export function uploadWithProgress(
    endpoint: string,
    file: File,
    params?: Record<string, string | number | boolean>,
    onProgress?: (percent: number) => void,
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const fd = new FormData();
        fd.append("file", file);
        if (params) {
            for (const [k, v] of Object.entries(params)) {
                fd.append(k, String(v));
            }
        }

        xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable && onProgress) {
                onProgress(Math.round((e.loaded / e.total) * 100));
            }
        });

        xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.response);
            } else {
                reject(new Error(`Request failed (${xhr.status})`));
            }
        });

        xhr.addEventListener("error", () => reject(new Error("Network error")));
        xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

        xhr.open("POST", `/api${endpoint}`);
        xhr.responseType = "blob";
        xhr.send(fd);
    });
}
