import { useState, useRef } from "react";
import { Upload, Loader2, CheckCircle2, X, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uploadFile, downloadBlob, formatFileSize } from "@/lib/api";

export function OcrUI() {
  const [file, setFile] = useState<{ name: string; size: string; raw: File } | null>(null);
  const [lang, setLang] = useState("eng");
  const [output, setOutput] = useState<"json" | "txt" | "searchable_pdf">("json");
  const [state, setState] = useState<"idle" | "processing" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const langs = [
    // European
    { id: "eng", label: "English" }, { id: "fra", label: "French" }, { id: "deu", label: "German" },
    { id: "spa", label: "Spanish" }, { id: "ita", label: "Italian" }, { id: "por", label: "Portuguese" },
    { id: "nld", label: "Dutch" }, { id: "pol", label: "Polish" }, { id: "rus", label: "Russian" },
    { id: "ukr", label: "Ukrainian" }, { id: "ces", label: "Czech" }, { id: "ron", label: "Romanian" },
    { id: "hun", label: "Hungarian" }, { id: "ell", label: "Greek" }, { id: "bul", label: "Bulgarian" },
    { id: "hrv", label: "Croatian" }, { id: "slk", label: "Slovak" }, { id: "slv", label: "Slovenian" },
    { id: "srp", label: "Serbian" }, { id: "cat", label: "Catalan" }, { id: "dan", label: "Danish" },
    { id: "fin", label: "Finnish" }, { id: "nor", label: "Norwegian" }, { id: "swe", label: "Swedish" },
    { id: "tur", label: "Turkish" },
    // Asian
    { id: "chi_sim", label: "Chinese (Simplified)" }, { id: "chi_tra", label: "Chinese (Traditional)" },
    { id: "jpn", label: "Japanese" }, { id: "kor", label: "Korean" }, { id: "tha", label: "Thai" },
    { id: "vie", label: "Vietnamese" }, { id: "ind", label: "Indonesian" }, { id: "msa", label: "Malay" },
    // South Asian
    { id: "hin", label: "Hindi" }, { id: "ben", label: "Bengali" }, { id: "tam", label: "Tamil" },
    { id: "tel", label: "Telugu" }, { id: "kan", label: "Kannada" }, { id: "mal", label: "Malayalam" },
    { id: "mar", label: "Marathi" }, { id: "guj", label: "Gujarati" }, { id: "pan", label: "Punjabi" },
    { id: "urd", label: "Urdu" },
    // Middle Eastern
    { id: "ara", label: "Arabic" }, { id: "heb", label: "Hebrew" },
  ];

  const pick = (fl: FileList) => { const f = fl[0]; setFile({ name: f.name, size: formatFileSize(f.size), raw: f }); setState("idle"); setError(null); };

  const process = async () => {
    if (!file) return;
    setState("processing"); setError(null);
    try {
      const res = await uploadFile("/ocr", file.raw, { lang, output });
      if (output === "json") {
        const data = await res.json();
        setExtractedText(data.text || "");
      } else {
        const blob = await res.blob();
        const filename = output === "txt" ? "extracted_text.txt" : "searchable.pdf";
        downloadBlob(blob, filename);
        setExtractedText("");
      }
      setState("done");
    } catch (e: any) { setError(e.message || "OCR failed"); setState("idle"); }
  };

  if (state === "done") return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
        <CheckCircle2 size={40} className="mx-auto mb-4 text-emerald-400" strokeWidth={1.5} />
        <h2 className="text-lg font-bold text-foreground mb-1">
          {output === "searchable_pdf" ? "Searchable PDF created!" : "Text extracted!"}
        </h2>
      </div>
      {extractedText && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-muted-foreground">Extracted text</p>
            <button onClick={() => navigator.clipboard.writeText(extractedText)} className="text-xs text-primary hover:underline">Copy</button>
          </div>
          <pre className="text-sm text-foreground whitespace-pre-wrap max-h-80 overflow-y-auto bg-secondary/30 rounded-lg p-3">{extractedText}</pre>
        </div>
      )}
      <Button variant="outline" className="border-border text-muted-foreground" onClick={() => { setFile(null); setState("idle"); setExtractedText(""); }}>OCR another file</Button>
    </div>
  );

  return (
    <div className="space-y-4">
      {!file ? (
        <div onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files.length) pick(e.dataTransfer.files); }}
          onClick={() => ref.current?.click()}
          onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ref.current?.click(); } }}
          role="button"
          tabIndex={0}
          aria-label="Upload file"
          className={cn("flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer transition-all py-14 px-6 text-center",
            drag ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-secondary/40 bg-secondary/20")}>
          <input ref={ref} type="file" accept=".pdf" className="hidden" onChange={e => e.target.files && pick(e.target.files)} />
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", drag ? "bg-primary/20" : "bg-secondary")}>
            <Upload size={22} className={drag ? "text-primary" : "text-muted-foreground"} strokeWidth={1.5} />
          </div>
          <p className="text-sm font-semibold text-foreground">Select a scanned PDF</p>
          <p className="text-xs text-muted-foreground">Drag & drop or click to browse</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary"><FileText size={14} className="text-muted-foreground" /></div>
            <div className="flex-1 min-w-0"><p className="text-sm font-medium text-foreground truncate">{file.name}</p><p className="text-xs text-muted-foreground">{file.size}</p></div>
            <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-foreground"><X size={15} /></button>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div>
              <label className="text-sm font-semibold text-foreground">Language</label>
              <select value={lang} onChange={e => setLang(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-secondary/20 px-3 py-2 text-sm text-foreground outline-none">
                {langs.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground">Output</label>
              <div className="flex gap-2 mt-1">
                {(["json", "txt", "searchable_pdf"] as const).map(o => (
                  <button key={o} onClick={() => setOutput(o)}
                    className={cn("flex-1 rounded-lg border py-2 text-xs font-medium transition-all",
                      output === o ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-secondary/40")}>
                    {o === "json" ? "Show text" : o === "txt" ? "Download .txt" : "Download searchable PDF"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {error && <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"><AlertCircle size={15} className="shrink-0" />{error}</div>}
          <Button onClick={process} disabled={state === "processing"} className="glow-primary">
            {state === "processing" ? <><Loader2 size={15} className="animate-spin" />Extracting text…</> : "Run OCR"}
          </Button>
        </>
      )}
    </div>
  );
}
