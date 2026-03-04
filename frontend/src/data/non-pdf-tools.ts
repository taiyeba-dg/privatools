import {
  ImageIcon, RefreshCw, UserX, Crop, Film,
  Music, Scissors, Video,
  Braces, GitCompare, KeyRound, Hash,
  Archive, Lock,
  ArrowLeftRight, Code2,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export type NonPdfCategory =
  | "image"
  | "video-audio"
  | "developer"
  | "archive"
  | "document-office";

export interface NonPdfTool {
  slug: string;
  icon: LucideIcon;
  name: string;
  description: string;
  longDescription: string;
  category: NonPdfCategory;
  accepts: string;
  outputLabel: string;
}

export const nonPdfTools: NonPdfTool[] = [
  // ── Image & Media ───────────────────────────────────────────────────────────
  {
    slug: "image-compressor", icon: ImageIcon, name: "Image Compressor",
    description: "Reduce JPEG/PNG/WebP size without losing quality",
    longDescription: "Compress images locally using high-quality algorithms. Drag multiple files and see live size savings before downloading.",
    category: "image", accepts: ".jpg,.jpeg,.png,.webp", outputLabel: "compressed images",
  },
  {
    slug: "image-converter", icon: RefreshCw, name: "Image Format Converter",
    description: "Convert between WebP, PNG, JPG, TIFF, and HEIC",
    longDescription: "Convert any image format to another — including iPhone HEIC files — all locally with no upload required.",
    category: "image", accepts: ".jpg,.jpeg,.png,.webp,.tiff,.heic,.bmp", outputLabel: "converted image",
  },
  {
    slug: "remove-exif", icon: UserX, name: "Remove EXIF Data",
    description: "Strip GPS, camera, and timestamp metadata from photos",
    longDescription: "Permanently erase all EXIF metadata from images — location, device model, timestamps — before sharing online.",
    category: "image", accepts: ".jpg,.jpeg,.png,.tiff,.webp", outputLabel: "clean image",
  },
  {
    slug: "resize-crop-image", icon: Crop, name: "Resize & Crop Image",
    description: "Bulk resize or crop images to any dimension",
    longDescription: "Set a target width/height, aspect ratio, or pixel dimensions. Resize or crop multiple images at once for social media, thumbnails, and more.",
    category: "image", accepts: ".jpg,.jpeg,.png,.webp,.bmp", outputLabel: "resized images",
  },
  {
    slug: "video-to-gif", icon: Film, name: "Video / Audio to GIF",
    description: "Convert short video clips into animated GIFs",
    longDescription: "Upload an MP4 or MOV file, select the clip range, and export a looping GIF. Adjust FPS and resolution for the perfect size.",
    category: "image", accepts: ".mp4,.mov,.webm,.avi", outputLabel: "animation.gif",
  },

  // ── Audio & Video ───────────────────────────────────────────────────────────
  {
    slug: "extract-audio", icon: Music, name: "Extract Audio from Video",
    description: "Strip the MP3/WAV audio track from a video file",
    longDescription: "Pull the audio stream out of any video file and save it as MP3, WAV, or OGG — entirely in your browser.",
    category: "video-audio", accepts: ".mp4,.mov,.webm,.avi,.mkv", outputLabel: "audio.mp3",
  },
  {
    slug: "trim-media", icon: Scissors, name: "Cut / Trim Video & Audio",
    description: "Trim the start and end of video or audio files",
    longDescription: "Use a visual timeline to set in/out points and export the trimmed clip without re-encoding at full quality.",
    category: "video-audio", accepts: ".mp4,.mov,.webm,.mp3,.wav,.ogg,.m4a", outputLabel: "trimmed file",
  },
  {
    slug: "compress-video", icon: Video, name: "Compress Video",
    description: "Reduce video file size for email or messaging",
    longDescription: "Lower bitrate or resolution to drastically shrink video files. Choose quality presets from 'High' to 'WhatsApp-ready'.",
    category: "video-audio", accepts: ".mp4,.mov,.webm,.avi", outputLabel: "compressed.mp4",
  },

  // ── Developer & Text ────────────────────────────────────────────────────────
  {
    slug: "json-xml-formatter", icon: Braces, name: "JSON / XML Formatter",
    description: "Prettify and validate JSON or XML offline",
    longDescription: "Paste any JSON or XML string to instantly format, validate, and highlight errors. 100% offline — sensitive API payloads never leave your browser.",
    category: "developer", accepts: ".json,.xml", outputLabel: "formatted",
  },
  {
    slug: "text-diff", icon: GitCompare, name: "Text Diff / Comparator",
    description: "Highlight exact differences between two text blocks",
    longDescription: "Paste two versions of text or code side-by-side and get a line-by-line diff with additions highlighted in green and deletions in red.",
    category: "developer", accepts: "", outputLabel: "diff report",
  },
  {
    slug: "base64", icon: KeyRound, name: "Base64 Encoder / Decoder",
    description: "Encode or decode text and files as Base64",
    longDescription: "Encode text strings or binary files to Base64, or decode Base64 back to the original. Supports text, images, and any file type.",
    category: "developer", accepts: "*", outputLabel: "encoded/decoded",
  },
  {
    slug: "hash-generator", icon: Hash, name: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256 hashes of text or files",
    longDescription: "Verify file integrity by generating cryptographic hashes. Paste text or upload a file and get instant MD5, SHA-1, SHA-256, and SHA-512 digests.",
    category: "developer", accepts: "*", outputLabel: "hash digest",
  },

  // ── Archive & File Management ───────────────────────────────────────────────
  {
    slug: "extract-archive", icon: Archive, name: "Extract ZIP / RAR",
    description: "Extract archive files locally — no WinRAR needed",
    longDescription: "Upload a ZIP, TAR, or RAR file and extract its contents directly in the browser. Download individual files or the whole archive.",
    category: "archive", accepts: ".zip,.tar,.gz,.rar,.7z", outputLabel: "extracted files",
  },
  {
    slug: "create-zip", icon: Lock, name: "Create Password-Protected ZIP",
    description: "Bundle files into an AES-256 encrypted ZIP",
    longDescription: "Select multiple files, set a strong password, and create an AES-256 encrypted ZIP archive — safe to send via email or messaging.",
    category: "archive", accepts: "*", outputLabel: "archive.zip",
  },

  // ── Document & Office ───────────────────────────────────────────────────────
  {
    slug: "csv-json", icon: ArrowLeftRight, name: "CSV ↔ JSON Converter",
    description: "Swap between CSV and JSON data formats instantly",
    longDescription: "Paste or upload a CSV file to get clean JSON, or paste JSON to convert it into a downloadable CSV spreadsheet.",
    category: "document-office", accepts: ".csv,.json", outputLabel: "converted file",
  },
  {
    slug: "markdown-html", icon: Code2, name: "Markdown to HTML",
    description: "Convert Markdown writing into web-ready HTML",
    longDescription: "Paste or upload a Markdown file and get clean, semantic HTML output. Includes live preview and syntax highlighting.",
    category: "document-office", accepts: ".md,.markdown", outputLabel: "output.html",
  },
];

export const nonPdfToolBySlug = Object.fromEntries(nonPdfTools.map(t => [t.slug, t]));

export const nonPdfCategoryMeta: Record<NonPdfCategory, { label: string; accent: string; iconBg: string; iconColor: string }> = {
  "image":           { label: "Image & Media",        accent: "text-pink-400",    iconBg: "bg-pink-500/10",    iconColor: "text-pink-400"    },
  "video-audio":     { label: "Video & Audio",         accent: "text-orange-400",  iconBg: "bg-orange-500/10",  iconColor: "text-orange-400"  },
  "developer":       { label: "Developer & Text",      accent: "text-cyan-400",    iconBg: "bg-cyan-500/10",    iconColor: "text-cyan-400"    },
  "archive":         { label: "Archive & Files",       accent: "text-yellow-400",  iconBg: "bg-yellow-500/10",  iconColor: "text-yellow-400"  },
  "document-office": { label: "Documents & Office",    accent: "text-lime-400",    iconBg: "bg-lime-500/10",    iconColor: "text-lime-400"    },
};
