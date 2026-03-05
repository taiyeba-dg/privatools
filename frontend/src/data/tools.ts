import {
  FileText, Merge, Scissors, BookOpen, Layout, Trash2, Download,
  PenTool, Stamp, AlignLeft, Hash, Tag, Bookmark,
  Minimize2, Layers, ScanLine, Wrench, Maximize2, RotateCw, Palette, Crop,
  Shield, Unlock, EyeOff, DatabaseZap, MessageSquareOff, Info,
  Code, Image, FileBox,
  Table, FileImage, Presentation, Type, FileOutput,
  Shuffle, GitCompare, ImageDown, FormInput, Grid2x2, ScanText, Copy, QrCode, Archive,
  FileX2, ScissorsSquare, BookMarked, Link2, ClipboardList, Eraser, Moon,
  BadgeCheck, ShieldCheck, Sparkles, Code2, FileSpreadsheet,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export type Category = "organize" | "edit" | "optimize" | "security" | "to-pdf" | "from-pdf" | "advanced";

export interface Tool {
  slug: string;
  icon: LucideIcon;
  name: string;
  description: string;
  longDescription: string;
  category: Category;
  clientOnly?: boolean;
  accepts: string;
  outputLabel: string;
}

export const tools: Tool[] = [
  // ── Organize & Manage ──────────────────────────────────────────────────────
  {
    slug: "merge-pdf", icon: Merge, name: "Merge PDF",
    description: "Combine multiple PDFs into one",
    longDescription: "Drag and drop multiple PDF files to combine them into a single document. Reorder files before merging.",
    category: "organize", accepts: ".pdf", outputLabel: "merged.pdf",
  },
  {
    slug: "split-pdf", icon: Scissors, name: "Split PDF",
    description: "Split by selecting specific page ranges",
    longDescription: "Split a PDF into individual pages or custom page ranges. Each range becomes its own downloadable file.",
    category: "organize", accepts: ".pdf", outputLabel: "split pages",
  },
  {
    slug: "split-by-bookmarks", icon: BookOpen, name: "Split by Bookmarks",
    description: "Split at pages where bookmarks point to",
    longDescription: "Automatically detect chapters and bookmarks in your PDF and split the document at each bookmark.",
    category: "organize", accepts: ".pdf", outputLabel: "split chapters",
  },
  {
    slug: "split-by-size", icon: Maximize2, name: "Split by Size",
    description: "Split into parts based on a max file size",
    longDescription: "Specify a maximum file size and automatically split the PDF into chunks that fit within that limit.",
    category: "organize", accepts: ".pdf", outputLabel: "split files",
  },
  {
    slug: "organize-pages", icon: Layout, name: "Organize Pages",
    description: "Reorder, delete, or rotate pages visually",
    longDescription: "View thumbnails of all pages and drag them into any order. Delete, rotate, or duplicate pages.",
    category: "organize", accepts: ".pdf", outputLabel: "organized.pdf",
  },
  {
    slug: "delete-pages", icon: Trash2, name: "Delete Pages",
    description: "Remove specific pages from a PDF",
    longDescription: "Select individual pages or ranges to permanently remove from your PDF document.",
    category: "organize", accepts: ".pdf", outputLabel: "trimmed.pdf",
  },
  {
    slug: "extract-pages", icon: Download, name: "Extract Pages",
    description: "Extract specified pages to a new document",
    longDescription: "Pick specific pages to extract into a new standalone PDF file while keeping the original intact.",
    category: "organize", accepts: ".pdf", outputLabel: "extracted.pdf",
  },

  // ── Edit PDF Content ────────────────────────────────────────────────────────
  {
    slug: "edit-pdf", icon: PenTool, name: "Edit PDF",
    description: "Edit text and images directly inside the PDF",
    longDescription: "Click any text or image in your PDF to edit it in-place. Add new text blocks, shapes, or replace images.",
    category: "edit", accepts: ".pdf", outputLabel: "edited.pdf",
  },
  {
    slug: "sign-pdf", icon: Stamp, name: "Sign PDF",
    description: "Add a signature to a PDF document",
    longDescription: "Draw, type, or upload your signature and place it anywhere on the document. Supports multiple signers.",
    category: "edit", accepts: ".pdf", outputLabel: "signed.pdf",
  },
  {
    slug: "watermark", icon: Layers, name: "Watermark",
    description: "Add text or image watermark over PDF pages",
    longDescription: "Add text or image watermarks to every page. Control opacity, position, rotation, and font size.",
    category: "edit", accepts: ".pdf", outputLabel: "watermarked.pdf",
  },
  {
    slug: "header-footer", icon: AlignLeft, name: "Header & Footer",
    description: "Add headers and footers to specified pages",
    longDescription: "Insert custom text, dates, or page numbers in the header and footer of your PDF pages.",
    category: "edit", accepts: ".pdf", outputLabel: "headerfooter.pdf",
  },
  {
    slug: "page-numbers", icon: Hash, name: "Page Numbers",
    description: "Insert custom page numbers in your chosen format",
    longDescription: "Choose format (1,2,3 / i,ii,iii / A,B,C), set the start page, position, and optional prefix.",
    category: "edit", accepts: ".pdf", outputLabel: "numbered.pdf",
  },
  {
    slug: "bates-numbering", icon: Tag, name: "Bates Numbering",
    description: "Add Bates Numbers for legal document indexing",
    longDescription: "Apply Bates numbering with custom prefix, suffix, and start number to single or batches of PDFs.",
    category: "edit", accepts: ".pdf", outputLabel: "bates.pdf",
  },
  {
    slug: "bookmarks", icon: Bookmark, name: "Bookmarks",
    description: "Add or edit bookmarks to navigate large files",
    longDescription: "Create, rename, reorder, and nest bookmarks for easier navigation in large PDF documents.",
    category: "edit", accepts: ".pdf", outputLabel: "bookmarked.pdf",
  },

  // ── Optimize & Fix ──────────────────────────────────────────────────────────
  {
    slug: "compress-pdf", icon: Minimize2, name: "Compress PDF",
    description: "Reduce the file size of your PDF",
    longDescription: "Choose from light, recommended, or extreme compression. Preview estimated size savings before downloading.",
    category: "optimize", accepts: ".pdf", outputLabel: "compressed.pdf",
  },
  {
    slug: "flatten-pdf", icon: Layers, name: "Flatten PDF",
    description: "Flatten forms and annotations into PDF content",
    longDescription: "Permanently merge all interactive form fields and annotations into the static page content.",
    category: "optimize", accepts: ".pdf", outputLabel: "flattened.pdf",
  },
  {
    slug: "deskew-pdf", icon: ScanLine, name: "Deskew PDF",
    description: "Straighten scanned pages that are slightly tilted",
    longDescription: "Automatically detect and correct the angle of scanned pages so text appears straight and readable.",
    category: "optimize", accepts: ".pdf", outputLabel: "deskewed.pdf",
  },
  {
    slug: "repair-pdf", icon: Wrench, name: "Repair PDF",
    description: "Attempt to fix corrupted PDF files",
    longDescription: "Recover and rebuild damaged or corrupted PDF files that won't open in standard PDF readers.",
    category: "optimize", accepts: ".pdf", outputLabel: "repaired.pdf",
  },
  {
    slug: "resize-pdf", icon: Maximize2, name: "Resize PDF",
    description: "Change the physical dimensions of the pages",
    longDescription: "Scale or resize all pages to a standard size (A4, Letter, etc.) or set custom width and height.",
    category: "optimize", accepts: ".pdf", outputLabel: "resized.pdf",
  },
  {
    slug: "rotate-pdf", icon: RotateCw, name: "Rotate PDF",
    description: "Rotate all or specific pages in the PDF",
    longDescription: "Rotate individual pages or all pages by 90°, 180°, or 270°. Preview each page before saving.",
    category: "optimize", accepts: ".pdf", outputLabel: "rotated.pdf",
  },
  {
    slug: "grayscale-pdf", icon: Palette, name: "Grayscale PDF",
    description: "Convert a colorful PDF to black and white",
    longDescription: "Convert all color content in the PDF to grayscale or pure black and white. Useful for printing.",
    category: "optimize", accepts: ".pdf", outputLabel: "grayscale.pdf",
  },
  {
    slug: "crop-pdf", icon: Crop, name: "Crop PDF",
    description: "Trim the margins or change the visible area",
    longDescription: "Draw a crop box to remove unwanted white space or trim pages to a specific size and margin.",
    category: "optimize", accepts: ".pdf", outputLabel: "cropped.pdf",
  },

  // ── Security & Privacy ──────────────────────────────────────────────────────
  {
    slug: "protect-pdf", icon: Shield, name: "Protect PDF",
    description: "Encrypt a PDF with a password or set permissions",
    longDescription: "Set open and permission passwords on your PDF. Control printing, copying, and editing permissions.",
    category: "security", accepts: ".pdf", outputLabel: "protected.pdf",
  },
  {
    slug: "unlock-pdf", icon: Unlock, name: "Unlock PDF",
    description: "Remove password protection from a PDF",
    longDescription: "Remove passwords and permission restrictions from PDFs you own, making them freely accessible.",
    category: "security", accepts: ".pdf", outputLabel: "unlocked.pdf",
  },
  {
    slug: "redact-pdf", icon: EyeOff, name: "Redact PDF",
    description: "Permanently black out sensitive content",
    longDescription: "Select and permanently remove sensitive text, images, or areas. Content is fully erased, not just hidden.",
    category: "security", accepts: ".pdf", outputLabel: "redacted.pdf",
  },
  {
    slug: "strip-metadata", icon: DatabaseZap, name: "Strip Metadata",
    description: "Remove embedded metadata for privacy",
    longDescription: "Remove author, creation date, GPS data, and other hidden metadata from your PDF file.",
    category: "security", accepts: ".pdf", outputLabel: "stripped.pdf",
  },
  {
    slug: "delete-annotations", icon: MessageSquareOff, name: "Delete Annotations",
    description: "Remove all comments, highlights, and annotations",
    longDescription: "Permanently delete all annotation layers — highlights, comments, sticky notes, and drawings.",
    category: "security", accepts: ".pdf", outputLabel: "clean.pdf",
  },
  {
    slug: "metadata", icon: Info, name: "Metadata",
    description: "View and edit document metadata",
    longDescription: "Read and modify the embedded metadata fields: Title, Author, Subject, Keywords, and more.",
    category: "security", accepts: ".pdf", outputLabel: "metadata.pdf",
  },

  // ── Convert to PDF ──────────────────────────────────────────────────────────
  {
    slug: "html-to-pdf", icon: Code, name: "HTML to PDF",
    description: "Convert web pages or HTML code into a PDF",
    longDescription: "Paste a URL or upload an HTML file and render it as a pixel-perfect PDF document.",
    category: "to-pdf", accepts: ".html,.htm", outputLabel: "webpage.pdf",
  },
  {
    slug: "image-to-pdf", icon: Image, name: "Image to PDF",
    description: "Convert JPG, PNG, or other images into a PDF",
    longDescription: "Combine one or multiple images into a single PDF. Set page size, orientation, and margins.",
    category: "to-pdf", accepts: ".jpg,.jpeg,.png,.tiff,.bmp,.webp", outputLabel: "images.pdf",
  },
  {
    slug: "office-to-pdf", icon: FileBox, name: "Office to PDF",
    description: "Convert Word, Excel, or PowerPoint to PDF",
    longDescription: "Upload any Microsoft Office document and convert it to a perfectly formatted PDF with all styles preserved.",
    category: "to-pdf", accepts: ".doc,.docx,.xls,.xlsx,.ppt,.pptx", outputLabel: "document.pdf",
  },

  // ── Convert from PDF ────────────────────────────────────────────────────────
  {
    slug: "pdf-to-excel", icon: Table, name: "PDF to Excel",
    description: "Best-effort table/text extraction into a spreadsheet",
    longDescription: "Extract table-like data from your PDF into Excel. Complex layouts or scanned documents may need manual cleanup after conversion.",
    category: "from-pdf", accepts: ".pdf", outputLabel: "spreadsheet.xlsx",
  },
  {
    slug: "pdf-to-image", icon: FileImage, name: "PDF to Image",
    description: "Convert each PDF page into an image file",
    longDescription: "Render each PDF page as a high-resolution image. Choose format (JPG/PNG), DPI, and color mode.",
    category: "from-pdf", accepts: ".pdf", outputLabel: "pages.zip",
  },
  {
    slug: "pdf-to-pptx", icon: Presentation, name: "PDF to PowerPoint",
    description: "Convert each PDF page into a PowerPoint slide image",
    longDescription: "Create a PPTX where each PDF page is placed as a slide image. Great for presenting PDFs in PowerPoint, but not full text-level editability.",
    category: "from-pdf", accepts: ".pdf", outputLabel: "slides.pptx",
  },
  {
    slug: "pdf-to-text", icon: Type, name: "PDF to Text",
    description: "Extract all text from a PDF file",
    longDescription: "Extract all readable text content from your PDF into a clean plain-text or formatted document.",
    category: "from-pdf", accepts: ".pdf", outputLabel: "content.txt",
  },
  {
    slug: "pdf-to-word", icon: FileOutput, name: "PDF to Word",
    description: "Convert PDF content to an editable Word draft",
    longDescription: "Extract text and images into a DOCX document. Complex columns, forms, and tables may require post-conversion editing.",
    category: "from-pdf", accepts: ".pdf", outputLabel: "document.docx",
  },

  // ── Miscellaneous & Advanced ────────────────────────────────────────────────
  {
    slug: "alternate-mix", icon: Shuffle, name: "Alternate Mix",
    description: "Mix pages of two or more PDFs alternately",
    longDescription: "Interleave pages from two or more PDFs — useful for merging front and back scans of duplex documents.",
    category: "advanced", accepts: ".pdf", outputLabel: "mixed.pdf",
  },
  {
    slug: "compare-pdf", icon: GitCompare, name: "Compare PDF",
    description: "Visually compare two PDF documents",
    longDescription: "Upload two versions of a PDF and get a highlighted diff showing exactly what text or content changed.",
    category: "advanced", accepts: ".pdf", outputLabel: "comparison.pdf",
  },
  {
    slug: "extract-images", icon: ImageDown, name: "Extract Images",
    description: "Extract all embedded images from the PDF",
    longDescription: "Detect and download all embedded image resources from your PDF as individual PNG or JPEG files.",
    category: "advanced", accepts: ".pdf", outputLabel: "images.zip",
  },
  {
    slug: "fill-form", icon: FormInput, name: "Fill Form",
    description: "Fill out interactive PDF forms and save them",
    longDescription: "Open a fillable PDF form, fill in all fields interactively, and export the completed document.",
    category: "advanced", accepts: ".pdf", outputLabel: "filled.pdf",
  },
  {
    slug: "nup", icon: Grid2x2, name: "N-Up PDF",
    description: "Print multiple pages per sheet",
    longDescription: "Arrange multiple PDF pages onto a single sheet (2-up, 4-up, 6-up, etc.) to save paper when printing.",
    category: "advanced", accepts: ".pdf", outputLabel: "nup.pdf",
  },
  {
    slug: "ocr-pdf", icon: ScanText, name: "OCR PDF",
    description: "Extract text or create a searchable PDF using OCR",
    longDescription: "Run OCR on scanned PDFs and choose output as on-screen text, downloadable TXT, or a searchable PDF with an OCR text layer.",
    category: "advanced", accepts: ".pdf", outputLabel: "searchable.pdf",
  },
  {
    slug: "overlay", icon: Copy, name: "Overlay PDF",
    description: "Overlay one PDF onto another (e.g., letterhead)",
    longDescription: "Layer one PDF document on top of another — great for adding letterhead, backgrounds, or stamps.",
    category: "advanced", accepts: ".pdf", outputLabel: "overlaid.pdf",
  },
  {
    slug: "qr-code", icon: QrCode, name: "QR Code PDF",
    description: "Generate QR codes and add them to PDF pages",
    longDescription: "Create a QR code from any URL or text and stamp it onto the pages of your PDF at a chosen position.",
    category: "advanced", accepts: ".pdf", outputLabel: "qrcode.pdf",
  },
  {
    slug: "pdf-to-pdfa", icon: Archive, name: "PDF to PDF/A",
    description: "Convert to PDF/A format for long-term archiving",
    longDescription: "Convert your PDF to the ISO-standardised PDF/A format for reliable long-term digital preservation.",
    category: "advanced", accepts: ".pdf", outputLabel: "archive.pdfa",
  },

  // ── Document Cleanup & Structure ────────────────────────────────────────────
  {
    slug: "remove-blank-pages", icon: FileX2, name: "Remove Blank Pages",
    description: "Scan and delete entirely blank or near-blank pages",
    longDescription: "Automatically detect and remove empty white pages or pages with only scan noise from your PDF.",
    category: "organize", accepts: ".pdf", outputLabel: "cleaned.pdf",
  },
  {
    slug: "auto-crop", icon: ScissorsSquare, name: "Remove Margins",
    description: "Auto-trim white space/margins around text on all pages",
    longDescription: "Automatically detect and crop the white borders and margins from each page — ideal for e-reader or tablet reading.",
    category: "optimize", accepts: ".pdf", outputLabel: "cropped.pdf",
  },

  // ── New Conversions ─────────────────────────────────────────────────────────
  {
    slug: "pdf-to-epub", icon: BookMarked, name: "PDF to EPUB",
    description: "Convert a PDF into the EPUB format for e-readers",
    longDescription: "Transform your PDF into a reflowable EPUB file, compatible with Kindle, Kobo, Apple Books, and most e-reader devices.",
    category: "from-pdf", accepts: ".pdf", outputLabel: "book.epub",
  },
  {
    slug: "markdown-to-pdf", icon: Code2, name: "Markdown / Config to PDF",
    description: "Convert .md, .json, .yaml, or .toml files to PDF",
    longDescription: "Upload a Markdown, JSON, YAML, or TOML file and render it as a beautifully formatted, structured PDF — locally and instantly.",
    category: "to-pdf", accepts: ".md,.markdown,.json,.yaml,.yml,.toml", outputLabel: "document.pdf",
  },
  {
    slug: "csv-to-pdf", icon: FileSpreadsheet, name: "CSV to PDF",
    description: "Generate table-style or invoice PDFs from CSV data",
    longDescription: "Upload a CSV file and convert it into a cleanly formatted PDF with a table, invoice, or report layout.",
    category: "to-pdf", accepts: ".csv", outputLabel: "table.pdf",
  },
  {
    slug: "word-to-pdf", icon: FileText, name: "Word to PDF",
    description: "Convert .docx Word documents to PDF",
    longDescription: "Upload a Word document (.docx) and convert it to a high-quality PDF preserving headings, bold, italic text, and paragraph formatting.",
    category: "to-pdf", accepts: ".docx", outputLabel: "converted.pdf",
  },
  {
    slug: "excel-to-pdf", icon: Table, name: "Excel to PDF",
    description: "Convert .xlsx spreadsheets to PDF",
    longDescription: "Upload an Excel spreadsheet and convert all sheets into a formatted PDF with headers, grid lines, and automatic column sizing.",
    category: "to-pdf", accepts: ".xlsx", outputLabel: "converted.pdf",
  },
  {
    slug: "pptx-to-pdf-convert", icon: Presentation, name: "PowerPoint to PDF",
    description: "Convert .pptx presentations to PDF",
    longDescription: "Upload a PowerPoint presentation and convert it to a PDF preserving slide dimensions, text, headings, and formatting.",
    category: "to-pdf", accepts: ".pptx", outputLabel: "converted.pdf",
  },
  {
    slug: "txt-to-pdf", icon: Type, name: "Text to PDF",
    description: "Convert plain text .txt files to PDF",
    longDescription: "Upload a plain text file and convert it into a cleanly formatted PDF with monospace font, word wrap, and proper pagination.",
    category: "to-pdf", accepts: ".txt", outputLabel: "converted.pdf",
  },
  {
    slug: "stamp-pdf", icon: Stamp, name: "PDF Stamp",
    description: "Add CONFIDENTIAL, DRAFT, or custom stamps",
    longDescription: "Apply pre-built stamps (Confidential, Draft, Approved, Final, Copy, Void, Sample) or custom text stamps to your PDF pages with adjustable opacity and position.",
    category: "edit", accepts: ".pdf", outputLabel: "stamped.pdf",
  },
  {
    slug: "esign-pdf", icon: PenTool, name: "E-Sign PDF",
    description: "Add your signature to any PDF document",
    longDescription: "Draw or upload your signature and place it on any page of your PDF. Position and resize freely — all processed locally with zero data leaving your device.",
    category: "edit", accepts: ".pdf", outputLabel: "signed.pdf",
  },
  {
    slug: "extract-tables", icon: Table, name: "PDF Table Extractor",
    description: "Extract tables from PDF pages to CSV",
    longDescription: "Automatically detect and extract tables from PDF documents into clean CSV format. Perfect for pulling data from invoices, reports, and financial statements.",
    category: "from-pdf", accepts: ".pdf", outputLabel: "tables.csv",
  },
  {
    slug: "pdf-to-markdown", icon: Code2, name: "PDF to Markdown",
    description: "Extract PDF content as clean Markdown format",
    longDescription: "Convert PDF documents into Markdown format with automatic heading detection, bold text preservation, and clean formatting — great for docs, wikis, and web content.",
    category: "from-pdf", accepts: ".pdf", outputLabel: "document.md",
  },
  {
    slug: "whiteout-pdf", icon: Eraser, name: "White-Out / Eraser",
    description: "Cover content on PDF with white boxes",
    longDescription: "Place white rectangles over any content on your PDF to permanently hide or erase text, images, and other elements — like a digital correction tape.",
    category: "edit", accepts: ".pdf", outputLabel: "whiteout.pdf",
  },
  {
    slug: "annotate-pdf", icon: PenTool, name: "Annotate PDF",
    description: "Add highlights, underlines, and sticky notes",
    longDescription: "Add highlight, underline, strikethrough, and sticky note annotations to your PDF pages with customizable colors — perfect for reviewing documents.",
    category: "edit", accepts: ".pdf", outputLabel: "annotated.pdf",
  },
  {
    slug: "add-shapes", icon: Crop, name: "Add Shapes to PDF",
    description: "Draw rectangles, circles, lines, and arrows",
    longDescription: "Add geometric shapes to your PDF pages — rectangles, circles, lines, and arrows with customizable colors, fill, and stroke width.",
    category: "edit", accepts: ".pdf", outputLabel: "shapes.pdf",
  },
  {
    slug: "set-permissions", icon: Shield, name: "PDF Permissions",
    description: "Control print, copy, and edit permissions",
    longDescription: "Set granular permissions on your PDF — allow or deny printing, copying text, modifying content, and adding annotations. Protect with an owner password.",
    category: "security", accepts: ".pdf", outputLabel: "permissions.pdf",
  },
  {
    slug: "add-attachment", icon: FileBox, name: "Add Attachment",
    description: "Embed any file inside a PDF document",
    longDescription: "Attach any file (images, documents, spreadsheets, etc.) inside a PDF as an embedded attachment — recipients can extract it from the PDF.",
    category: "edit", accepts: ".pdf", outputLabel: "with_attachment.pdf",
  },
  {
    slug: "json-to-pdf", icon: Code, name: "JSON to PDF",
    description: "Format JSON data as a styled PDF document",
    longDescription: "Upload a JSON file and convert it to a beautifully formatted PDF with syntax highlighting, key-value coloring, and proper indentation.",
    category: "to-pdf", accepts: ".json", outputLabel: "document.pdf",
  },
  {
    slug: "xml-to-pdf", icon: Code, name: "XML to PDF",
    description: "Convert XML data to a formatted PDF document",
    longDescription: "Upload an XML file and render it as a clean, indented PDF with tag colorizing and proper formatting.",
    category: "to-pdf", accepts: ".xml", outputLabel: "document.pdf",
  },
  {
    slug: "epub-to-pdf", icon: BookOpen, name: "EPUB to PDF",
    description: "Convert e-books from EPUB to PDF format",
    longDescription: "Upload an EPUB e-book and convert it to a paginated PDF document preserving text content — compatible with all PDF readers.",
    category: "to-pdf", accepts: ".epub", outputLabel: "book.pdf",
  },
  {
    slug: "rtf-to-pdf", icon: FileText, name: "RTF to PDF",
    description: "Convert Rich Text Format files to PDF",
    longDescription: "Upload an RTF file and convert it to a clean PDF with proper formatting, word wrap, and pagination.",
    category: "to-pdf", accepts: ".rtf", outputLabel: "document.pdf",
  },

  // ── Advanced Editing ────────────────────────────────────────────────────────
  {
    slug: "add-hyperlinks", icon: Link2, name: "Add Hyperlinks",
    description: "Draw clickable hyperlink areas over text or images",
    longDescription: "Define invisible, clickable link areas on any page and attach a URL. Perfect for adding navigation to static PDFs.",
    category: "edit", accepts: ".pdf", outputLabel: "linked.pdf",
  },
  {
    slug: "form-creator", icon: ClipboardList, name: "Form Creator",
    description: "Add text fields, checkboxes, radios, and dropdowns to PDFs",
    longDescription: "Define field coordinates and create fillable PDF forms with text inputs, checkboxes, radio buttons, combo boxes, list boxes, and signature fields.",
    category: "advanced", accepts: ".pdf", outputLabel: "form.pdf",
  },
  {
    slug: "transparent-background", icon: Eraser, name: "Transparent Background",
    description: "Convert near-white PDF backgrounds to transparency",
    longDescription: "Rasterize each page and remove near-white pixels to create transparent backgrounds suitable for overlays and compositing.",
    category: "edit", accepts: ".pdf", outputLabel: "transparent.pdf",
  },
  {
    slug: "invert-colors", icon: Moon, name: "Invert Colors",
    description: "Invert PDF colors for a dark mode reading experience",
    longDescription: "Flip the color scheme of all pages (white → black, black → white). Multiple modes: full inversion, text-only, and night tint.",
    category: "optimize", accepts: ".pdf", outputLabel: "inverted.pdf",
  },

  // ── Security & Forensics ────────────────────────────────────────────────────
  {
    slug: "pdfa-validator", icon: BadgeCheck, name: "PDF/A Validator",
    description: "Run basic PDF/A indicator checks",
    longDescription: "Checks common PDF/A indicators and metadata warnings. This is a lightweight heuristic check, not a full ISO profile validator.",
    category: "security", accepts: ".pdf", outputLabel: "report",
  },
  {
    slug: "verify-signature", icon: ShieldCheck, name: "Verify Digital Signature",
    description: "Inspect signature fields in a PDF",
    longDescription: "Detects and reports signature widgets present in the file. Full cryptographic certificate-chain validation is planned.",
    category: "security", accepts: ".pdf", outputLabel: "verification report",
  },
  {
    slug: "sanitize-pdf", icon: Sparkles, name: "Sanitize Document",
    description: "Aggressively clean hidden data, JS, and layers",
    longDescription: "Permanently flatten layers, remove hidden OCR text, strip embedded JavaScript, and erase all metadata for maximum safety before sharing.",
    category: "security", accepts: ".pdf", outputLabel: "sanitized.pdf",
  },
];

export const toolBySlug = Object.fromEntries(tools.map(t => [t.slug, t]));

export const categoryMeta: Record<Category, { label: string; accent: string; iconBg: string; iconColor: string }> = {
  organize: { label: "Organize", accent: "text-blue-400", iconBg: "bg-blue-500/10", iconColor: "text-blue-400" },
  edit: { label: "Edit", accent: "text-violet-400", iconBg: "bg-violet-500/10", iconColor: "text-violet-400" },
  optimize: { label: "Optimize", accent: "text-teal-400", iconBg: "bg-teal-500/10", iconColor: "text-teal-400" },
  security: { label: "Security", accent: "text-rose-400", iconBg: "bg-rose-500/10", iconColor: "text-rose-400" },
  "to-pdf": { label: "To PDF", accent: "text-emerald-400", iconBg: "bg-emerald-500/10", iconColor: "text-emerald-400" },
  "from-pdf": { label: "From PDF", accent: "text-amber-400", iconBg: "bg-amber-500/10", iconColor: "text-amber-400" },
  advanced: { label: "Advanced", accent: "text-indigo-400", iconBg: "bg-indigo-500/10", iconColor: "text-indigo-400" },
};
