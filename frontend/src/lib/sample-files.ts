/**
 * Sample-file loaders for the onboarding flow.
 *
 * Tools that want a "Try with sample file" affordance call `loadSamplePdf()`
 * (or its JPEG / JSON siblings) and pass the resulting `File` into their
 * existing pick handler. The fetch hits `/samples/sample.X` — those static
 * assets ship inside `frontend/public/samples/` and stay in the served
 * bundle, so the round-trip is local to the same origin and never touches
 * a third party.
 *
 * Each helper returns a `File` (not a `Blob`) so that downstream code that
 * expects `.name` / `.size` / `.type` works without special-casing the
 * sample path.
 */

const BASE = "/samples";

async function fetchAsFile(path: string, name: string, mime: string): Promise<File> {
    const res = await fetch(`${BASE}/${path}`, { credentials: "omit" });
    if (!res.ok) {
        throw new Error(`Sample file not found: ${path} (${res.status})`);
    }
    const blob = await res.blob();
    // We force the MIME type ourselves — some dev servers serve "application/octet-stream"
    // for static assets which would confuse the tool's accept filter.
    return new File([blob], name, { type: mime, lastModified: Date.now() });
}

export function loadSamplePdf(): Promise<File> {
    return fetchAsFile("sample.pdf", "privatools-sample.pdf", "application/pdf");
}

export function loadSampleJpg(): Promise<File> {
    return fetchAsFile("sample.jpg", "privatools-sample.jpg", "image/jpeg");
}

export async function loadSampleJsonText(): Promise<string> {
    const res = await fetch(`${BASE}/sample.json`, { credentials: "omit" });
    if (!res.ok) throw new Error(`Sample file not found: sample.json (${res.status})`);
    return await res.text();
}
