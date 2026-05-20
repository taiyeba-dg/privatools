/**
 * Smoke tests for src/lib/zip.ts — we verify the byte layout against the PKWare
 * spec rather than round-tripping with a real unzipper (no native deps in jsdom).
 */
import { describe, it, expect } from "vitest";
import { buildZip } from "@/lib/zip";

async function asBytes(blob: Blob): Promise<Uint8Array> {
    // jsdom's Blob doesn't ship arrayBuffer() in older versions and Response
    // serialisation goes via toString in the same env. FileReader is the
    // reliable path in this test runner.
    return await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload  = () => resolve(new Uint8Array(r.result as ArrayBuffer));
        r.onerror = () => reject(r.error);
        r.readAsArrayBuffer(blob);
    });
}

describe("buildZip", () => {
    it("emits the local-file-header signature 0x04034b50", async () => {
        const data = new TextEncoder().encode("hello");
        const blob = buildZip([{ name: "hello.txt", data }]);
        const bytes = await asBytes(blob);
        // Little-endian 0x04034b50 → 50 4b 03 04
        expect(Array.from(bytes.slice(0, 4))).toEqual([0x50, 0x4b, 0x03, 0x04]);
    });

    it("ends with EOCD record 0x06054b50", async () => {
        const blob = buildZip([{ name: "a.txt", data: new Uint8Array([97]) }]);
        const bytes = await asBytes(blob);
        const last22 = bytes.slice(bytes.length - 22, bytes.length - 18);
        expect(Array.from(last22)).toEqual([0x50, 0x4b, 0x05, 0x06]);
    });

    it("deduplicates colliding filenames", async () => {
        const data = new Uint8Array([1, 2, 3]);
        const blob = buildZip([
            { name: "report.pdf", data },
            { name: "report.pdf", data },
            { name: "report.pdf", data },
        ]);
        const bytes = await asBytes(blob);
        const text = new TextDecoder().decode(bytes);
        expect(text).toContain("report.pdf");
        expect(text).toContain("report_1.pdf");
        expect(text).toContain("report_2.pdf");
    });

    it("entry-count field in EOCD matches input", async () => {
        const data = new Uint8Array([42]);
        const entries = [
            { name: "a.txt", data },
            { name: "b.txt", data },
            { name: "c.txt", data },
            { name: "d.txt", data },
        ];
        const blob = buildZip(entries);
        const bytes = await asBytes(blob);
        // EOCD is the trailing 22 bytes — entries-on-disk @ offset +8, total @ +10
        const view = new DataView(bytes.buffer, bytes.byteOffset + bytes.length - 22);
        expect(view.getUint16(8, true)).toBe(4);
        expect(view.getUint16(10, true)).toBe(4);
    });
});
