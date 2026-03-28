import {
  ImageIcon, RefreshCw, UserX, Crop, Film,
  Music, Scissors, Video,
  Braces, GitCompare, KeyRound, Hash,
  Archive, Lock,
  ArrowLeftRight, Code2, ScanText,
  Stamp, Globe, LayoutGrid, ScanLine, Link,
  QrCode, Merge, Maximize2,
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
  clientOnly?: boolean;
  accepts: string;
  outputLabel: string;
}

export const nonPdfTools: NonPdfTool[] = [
  // ── Image & Media ───────────────────────────────────────────────────────────
  {
    slug: "image-compressor", icon: ImageIcon, name: "Image Compressor",
    description: "Reduce JPEG/PNG/WebP size without losing quality",
    longDescription: "Compress images online for free — reduce JPEG, PNG, and WebP file sizes by up to 80% without visible quality loss. Drag multiple files, see live savings, and download instantly. No upload to external servers.",
    category: "image", accepts: ".jpg,.jpeg,.png,.webp", outputLabel: "compressed images",
  },
  {
    slug: "image-converter", icon: RefreshCw, name: "Image Format Converter",
    description: "Convert between WebP, PNG, JPG, TIFF, and HEIC",
    longDescription: "Convert images online for free — change between WebP, PNG, JPG, TIFF, BMP and HEIC formats instantly. Perfect for converting iPhone HEIC photos to JPG. No upload required, processed locally.",
    category: "image", accepts: ".jpg,.jpeg,.png,.webp,.tiff,.heic,.bmp", outputLabel: "converted image",
  },
  {
    slug: "remove-exif", icon: UserX, name: "Remove EXIF Data",
    description: "Strip GPS, camera, and timestamp metadata from photos",
    longDescription: "Remove EXIF data from photos online for free — strip GPS location, camera model, timestamps, and all metadata before sharing images online. Protect your privacy with one click. No sign-up needed.",
    category: "image", accepts: ".jpg,.jpeg,.png,.tiff,.webp", outputLabel: "clean image",
  },
  {
    slug: "resize-crop-image", icon: Crop, name: "Resize & Crop Image",
    description: "Bulk resize or crop images to any dimension",
    longDescription: "Resize and crop images online for free — set exact dimensions, aspect ratios, or pixel sizes. Bulk resize multiple images for social media, thumbnails, profile pictures, and website optimization.",
    category: "image", accepts: ".jpg,.jpeg,.png,.webp,.bmp", outputLabel: "resized images",
  },
  {
    slug: "video-to-gif", icon: Film, name: "Video / Audio to GIF",
    description: "Convert short video clips into animated GIFs",
    longDescription: "Convert video to GIF online for free — upload MP4, MOV, or WebM files, select the clip range, and export a looping animated GIF. Adjust FPS and resolution for the perfect file size. No watermarks.",
    category: "image", accepts: ".mp4,.mov,.webm,.avi", outputLabel: "animation.gif",
  },
  {
    slug: "image-ocr", icon: ScanText, name: "Image OCR",
    description: "Extract text from images using optical character recognition",
    longDescription: "Extract text from images online for free using OCR. Upload photos of documents, screenshots, receipts, or handwritten notes and get all readable text. Supports 40+ languages via Tesseract. Private and instant.",
    category: "image", accepts: ".jpg,.jpeg,.png,.webp,.bmp,.tiff,.tif", outputLabel: "extracted text",
  },

  // ── Audio & Video ───────────────────────────────────────────────────────────
  {
    slug: "extract-audio", icon: Music, name: "Extract Audio from Video",
    description: "Strip the MP3/WAV audio track from a video file",
    longDescription: "Extract audio from video online for free — pull the audio track from any MP4, MOV, WebM, or AVI file and save as MP3, WAV, or OGG. No quality loss, processed directly in your browser.",
    category: "video-audio", accepts: ".mp4,.mov,.webm,.avi,.mkv", outputLabel: "audio.mp3",
  },
  {
    slug: "trim-media", icon: Scissors, name: "Cut / Trim Video & Audio",
    description: "Trim the start and end of video or audio files",
    longDescription: "Cut and trim video or audio online for free — use a visual timeline to set in/out points and export the trimmed clip at full quality without re-encoding. Supports MP4, MP3, WAV, and more.",
    category: "video-audio", accepts: ".mp4,.mov,.webm,.mp3,.wav,.ogg,.m4a", outputLabel: "trimmed file",
  },
  {
    slug: "compress-video", icon: Video, name: "Compress Video",
    description: "Reduce video file size for email or messaging",
    longDescription: "Compress video online for free — reduce video file size for email, messaging, and uploads. Choose quality presets from 'High Quality' to 'WhatsApp-ready'. Supports MP4, MOV, WebM, and AVI.",
    category: "video-audio", accepts: ".mp4,.mov,.webm,.avi", outputLabel: "compressed.mp4",
  },

  // ── Developer & Text ────────────────────────────────────────────────────────
  {
    slug: "json-xml-formatter", icon: Braces, name: "JSON / XML Formatter",
    description: "Prettify and validate JSON or XML offline",
    longDescription: "Format JSON and XML online for free — paste, prettify, validate, and highlight syntax errors instantly. 100% offline processing — sensitive API payloads and config files never leave your browser. No data sent to servers.",
    category: "developer", clientOnly: true, accepts: ".json,.xml", outputLabel: "formatted",
  },
  {
    slug: "text-diff", icon: GitCompare, name: "Text Diff / Comparator",
    description: "Highlight exact differences between two text blocks",
    longDescription: "Compare text online for free — paste two versions of text or code side-by-side and get a line-by-line diff with additions in green and deletions in red. Perfect for code review, proofreading, and version comparison.",
    category: "developer", clientOnly: true, accepts: "", outputLabel: "diff report",
  },
  {
    slug: "base64", icon: KeyRound, name: "Base64 Encoder / Decoder",
    description: "Encode or decode text and files as Base64",
    longDescription: "Base64 encode and decode online for free — convert text strings or binary files to Base64, or decode Base64 back to the original content. Supports text, images, PDFs, and any file type. Runs entirely in your browser.",
    category: "developer", clientOnly: true, accepts: "*", outputLabel: "encoded/decoded",
  },
  {
    slug: "hash-generator", icon: Hash, name: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256 hashes of text or files",
    longDescription: "Generate MD5, SHA-1, SHA-256 hashes online for free — verify file integrity and create cryptographic checksums. Paste text or upload files to get instant hash digests. All processing happens in your browser.",
    category: "developer", clientOnly: true, accepts: "*", outputLabel: "hash digest",
  },

  // ── Archive & File Management ───────────────────────────────────────────────
  {
    slug: "extract-archive", icon: Archive, name: "Extract ZIP / TAR",
    description: "Extract ZIP and TAR archives locally",
    longDescription: "Extract ZIP and TAR files online for free — upload .zip, .tar, .tar.gz, .tgz archives and extract contents locally. Download extracted files individually or as a new ZIP. No file size limits, no sign-up.",
    category: "archive", accepts: ".zip,.tar,.tar.gz,.tgz,.tar.bz2,.tbz2,.tar.xz,.txz", outputLabel: "extracted files",
  },
  {
    slug: "create-zip", icon: Lock, name: "Create ZIP Archive",
    description: "Bundle multiple files into a ZIP archive",
    longDescription: "Create ZIP archives online for free — select multiple files and package them into a standard ZIP file. Fast local compression with no file upload to external servers. No sign-up, instant download.",
    category: "archive", accepts: "*", outputLabel: "archive.zip",
  },

  // ── Document & Office ───────────────────────────────────────────────────────
  {
    slug: "csv-json", icon: ArrowLeftRight, name: "CSV ↔ JSON Converter",
    description: "Swap between CSV and JSON data formats instantly",
    longDescription: "Convert CSV to JSON and JSON to CSV online for free — paste or upload data and instantly swap between formats. Perfect for data transformation, API testing, and spreadsheet-to-JSON conversion. Browser-only, no upload.",
    category: "document-office", clientOnly: true, accepts: ".csv,.json", outputLabel: "converted file",
  },
  {
    slug: "markdown-html", icon: Code2, name: "Markdown to HTML",
    description: "Convert Markdown writing into web-ready HTML",
    longDescription: "Convert Markdown to HTML online for free — paste or upload .md files and get clean, semantic HTML output with live preview and syntax highlighting. Perfect for blog posts, documentation, and README files.",
    category: "document-office", clientOnly: true, accepts: ".md,.markdown", outputLabel: "output.html",
  },
  {
    slug: "heic-to-jpg", icon: RefreshCw, name: "HEIC to JPG",
    description: "Convert iPhone HEIC/HEIF photos to JPEG",
    longDescription: "Convert HEIC to JPG online for free — upload iPhone HEIC/HEIF photos and convert them to universally compatible JPEG format instantly. Perfect for sharing Apple photos on Windows, Android, and social media.",
    category: "image", accepts: ".heic,.heif", outputLabel: "converted.jpg",
  },
  {
    slug: "remove-background", icon: UserX, name: "Background Remover",
    description: "Remove backgrounds from images using local AI",
    longDescription: "Remove image background online for free using AI — upload any photo and instantly remove the background. Perfect for product photos, profile pictures, passport photos, and design work. Processed on your server, not third-party.",
    category: "image", accepts: ".jpg,.jpeg,.png,.webp,.bmp", outputLabel: "no_background.png",
  },
  {
    slug: "svg-to-png", icon: ImageIcon, name: "SVG to PNG",
    description: "Convert vector SVG files to crisp PNG images",
    longDescription: "Convert SVG to PNG online for free — upload vector SVG files and render them as crisp, high-resolution PNG images with 2x Retina scaling. Perfect for design assets, app icons, and social media graphics.",
    category: "image", accepts: ".svg", outputLabel: "converted.png",
  },
  {
    slug: "image-watermark", icon: Stamp, name: "Image Watermark",
    description: "Add text watermarks to photos and images",
    longDescription: "Add watermark to images online for free — protect your photos with customizable text watermarks. Choose position (center, corners, or tiled), opacity, font size, and color. Processed locally, no upload.",
    category: "image", accepts: ".jpg,.jpeg,.png,.webp,.bmp", outputLabel: "watermarked.png",
  },
  {
    slug: "generate-favicon", icon: Globe, name: "Favicon Generator",
    description: "Create .ico favicons from any image",
    longDescription: "Generate favicon from image online for free — upload any image and create a multi-size ICO file (16x16, 32x32, 48x48) ready for your website. Instant favicon creator, no design skills needed.",
    category: "image", accepts: ".jpg,.jpeg,.png,.webp,.bmp", outputLabel: "favicon.ico",
  },
  {
    slug: "make-collage", icon: LayoutGrid, name: "Photo Collage",
    description: "Combine multiple images into a beautiful grid",
    longDescription: "Create photo collages online for free — upload multiple images and arrange them into a clean grid layout. Customize columns, spacing, and background color. Free collage maker with instant download.",
    category: "image", accepts: ".jpg,.jpeg,.png,.webp,.bmp", outputLabel: "collage.jpg",
  },
  {
    slug: "generate-barcode", icon: ScanLine, name: "Barcode Generator",
    description: "Generate Code128, EAN-13, QR codes from any text",
    longDescription: "Generate barcodes online for free — create Code128, Code39, EAN-13, EAN-8, UPC-A, ISBN-13, and QR codes from any text or number. Download as high-resolution PNG images. No sign-up required.",
    category: "developer", accepts: "", outputLabel: "barcode.png",
  },
  {
    slug: "url-to-pdf", icon: Link, name: "URL to PDF",
    description: "Save any webpage as a PDF document",
    longDescription: "Save webpage as PDF online for free — enter any URL and convert the web page to a high-quality PDF document. Rendered on your server using WeasyPrint. Note: results may vary for JavaScript-heavy sites.",
    category: "developer", accepts: "", outputLabel: "webpage.pdf",
  },
  {
    slug: "qr-reader", icon: QrCode, name: "QR Code Reader",
    description: "Decode QR codes and barcodes from images",
    longDescription: "Read QR codes online for free — upload any image containing a QR code or barcode and instantly decode its contents. Supports QR, Code128, EAN, UPC, and other popular barcode formats. No app needed.",
    category: "image", accepts: ".jpg,.jpeg,.png,.webp,.bmp", outputLabel: "decoded text",
  },
  {
    slug: "merge-images", icon: Merge, name: "Merge Images",
    description: "Combine images side-by-side or top-to-bottom",
    longDescription: "Merge images online for free — combine multiple photos side-by-side (horizontal) or top-to-bottom (vertical) into a single image. Images are automatically scaled to match. Free, instant, no sign-up.",
    category: "image", accepts: ".jpg,.jpeg,.png,.webp,.bmp", outputLabel: "merged.png",
  },
  {
    slug: "image-upscaler", icon: Maximize2, name: "Image Upscaler",
    description: "Upscale images 2x or 4x with Lanczos resampling",
    longDescription: "Upscale images online for free — enlarge photos by 2x or 4x using high-quality Lanczos resampling. Supports JPG, PNG, and WebP. Perfect for improving resolution of small images, thumbnails, or screenshots. No sign-up, no watermarks.",
    category: "image", accepts: ".jpg,.jpeg,.png,.webp", outputLabel: "upscaled image",
  },
  {
    slug: "audio-converter", icon: Music, name: "Audio Converter",
    description: "Convert between MP3, WAV, OGG, FLAC, AAC",
    longDescription: "Convert audio files online for free — change between MP3, WAV, OGG, FLAC, and AAC formats. Choose your preferred bitrate (64k to 320k). Powered by FFmpeg for professional-quality conversion. Files up to 200 MB supported.",
    category: "video-audio", accepts: ".mp3,.wav,.ogg,.flac,.aac,.m4a,.wma", outputLabel: "converted audio",
  },
];

export const nonPdfToolBySlug = Object.fromEntries(nonPdfTools.map(t => [t.slug, t]));

export const nonPdfCategoryMeta: Record<NonPdfCategory, { label: string; accent: string; iconBg: string; iconColor: string }> = {
  "image": { label: "Image & Media", accent: "text-pink-400", iconBg: "bg-pink-500/10", iconColor: "text-pink-400" },
  "video-audio": { label: "Video & Audio", accent: "text-orange-400", iconBg: "bg-orange-500/10", iconColor: "text-orange-400" },
  "developer": { label: "Developer & Text", accent: "text-cyan-400", iconBg: "bg-cyan-500/10", iconColor: "text-cyan-400" },
  "archive": { label: "Archive & Files", accent: "text-yellow-400", iconBg: "bg-yellow-500/10", iconColor: "text-yellow-400" },
  "document-office": { label: "Documents & Office", accent: "text-lime-400", iconBg: "bg-lime-500/10", iconColor: "text-lime-400" },
};
