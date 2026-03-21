"""
Server-side SEO meta tag injection.

Provides per-route <title> and <meta name="description"> values
so that search-engine crawlers see the correct metadata without
executing JavaScript.
"""
from __future__ import annotations
import re

BASE_URL = "https://privatools.me"

# ---------------------------------------------------------------------------
# Static page meta
# ---------------------------------------------------------------------------
_STATIC_META: dict[str, tuple[str, str]] = {
    "/": (
        "PrivaTools — Free, Open-Source Privacy-First File Tools",
        "90+ free, open-source file tools — PDF, image, video, and developer utilities. "
        "All processing happens on your device. Zero uploads, zero tracking.",
    ),
    "/about": (
        "About PrivaTools — How We Handle Your Files | Privacy-First",
        "Learn how PrivaTools processes your files with zero-knowledge architecture. "
        "Files are processed and immediately deleted — never stored, never read, never shared. 100% open source.",
    ),
    "/batch": (
        "Batch Process Files — Apply Tools to Multiple Files | PrivaTools",
        "Upload multiple files and apply the same tool to all of them at once. "
        "Batch compress, convert, or transform PDF, image, and video files privately. Free, no limits.",
    ),
    "/pipeline": (
        "PDF Pipeline — Chain Multiple PDF Tools Together | PrivaTools",
        "Chain multiple PDF tools together into a processing pipeline. "
        "Compress, rotate, watermark, and more — all in one pass. Privacy-first and free.",
    ),
    "/compare": (
        "PrivaTools vs iLovePDF vs Smallpdf vs Adobe — Free Comparison",
        "Compare PrivaTools with iLovePDF, Smallpdf, Adobe Acrobat, Sejda, PDF24, Foxit, and LightPDF. "
        "See which tool is truly free, private, and open source.",
    ),
    "/compare/ilovepdf": (
        "PrivaTools vs iLovePDF — Honest Feature Comparison (2026)",
        "PrivaTools vs iLovePDF compared: pricing, file limits, privacy, features. "
        "PrivaTools is 100% free with no ads, no accounts, and open source. See the full comparison.",
    ),
    "/compare/smallpdf": (
        "PrivaTools vs Smallpdf — Honest Feature Comparison (2026)",
        "PrivaTools vs Smallpdf: no 2-tasks/day limit, no premium upsells, no watermarks. "
        "90+ tools vs 21 tools. See the full comparison.",
    ),
    "/compare/adobe-acrobat": (
        "PrivaTools vs Adobe Acrobat Online — Free Alternative (2026)",
        "PrivaTools is a free, open-source alternative to Adobe Acrobat Online. "
        "No Adobe ID required, no subscription, 90+ tools. Compare features side by side.",
    ),
    "/compare/sejda": (
        "PrivaTools vs Sejda — Free PDF Tool Comparison (2026)",
        "PrivaTools vs Sejda: unlimited tools vs Sejda's 3 tasks/hour limit. "
        "100% free, open source, self-hostable. See how PrivaTools compares to Sejda PDF.",
    ),
    "/compare/pdf24": (
        "PrivaTools vs PDF24 — Free PDF Tools Comparison (2026)",
        "PrivaTools vs PDF24: both free, but PrivaTools is open source, self-hostable, and privacy-first. "
        "Compare features, privacy practices, and tool breadth.",
    ),
    "/compare/foxit": (
        "PrivaTools vs Foxit PDF — Free vs Paid Comparison (2026)",
        "PrivaTools vs Foxit PDF: free, open-source tools vs Foxit's paid subscription. "
        "90+ privacy-first PDF tools with no account required vs Foxit's enterprise pricing.",
    ),
    "/compare/lightpdf": (
        "PrivaTools vs LightPDF — Privacy & Feature Comparison (2026)",
        "PrivaTools vs LightPDF: 100% free and open source vs LightPDF's freemium model. "
        "No file limits, no accounts, no ads. Compare privacy and features.",
    ),
}

# ---------------------------------------------------------------------------
# PDF tool meta  (slug → (name, long_description))
# ---------------------------------------------------------------------------
_PDF_TOOLS: dict[str, tuple[str, str]] = {
    "merge-pdf": ("Merge PDF", "Merge PDF files online for free — combine multiple PDF documents into a single file in seconds. Drag, drop, and reorder pages before merging. No file size limits, no sign-up, no watermarks. Your files are processed securely and never stored."),
    "split-pdf": ("Split PDF", "Split PDF online for free — divide a PDF into separate files by page range. Extract specific pages or split every page into individual PDFs. No installation, no registration required. Privacy-first: files are never stored on our servers."),
    "split-by-bookmarks": ("Split by Bookmarks", "Split PDF by bookmarks or chapters automatically. Detect table of contents entries and create separate PDFs for each section. Ideal for splitting textbooks, manuals, and reports. Free, private, no sign-up."),
    "split-by-size": ("Split by Size", "Split large PDFs into smaller files by maximum file size. Perfect for email attachments with size limits. Set your target size (e.g., 10 MB) and automatically split into compliant chunks. Free online tool, no registration."),
    "organize-pages": ("Organize Pages", "Rearrange PDF pages online — drag and drop page thumbnails to reorder, delete, rotate, or duplicate pages visually. Free PDF page organizer with no watermarks. Preview every page before saving."),
    "delete-pages": ("Delete Pages", "Remove pages from PDF online for free. Select specific pages or ranges to permanently delete. Preview thumbnails and choose exactly which pages to remove. No sign-up, no watermarks, files never stored."),
    "extract-pages": ("Extract Pages", "Extract pages from PDF online — save specific pages as a new PDF file. Select individual pages or ranges to pull out while keeping the original document intact. Free, fast, and private."),
    "remove-blank-pages": ("Remove Blank Pages", "Remove blank pages from PDF online for free. Automatically scan and delete entirely blank or near-blank pages from scanned documents. Clean up your PDFs by removing empty fillers and scan artifacts."),
    "reverse-pdf": ("Reverse PDF", "Reverse the page order of a PDF online for free. Flip the entire document so the last page becomes first. Useful for fixing duplex scan order or creating back-to-front presentations."),
    "booklet-pdf": ("PDF Booklet", "Rearrange PDF pages for booklet printing online for free. Automatically reorder pages so that when printed and folded, they create a correctly ordered booklet. No software needed."),
    "edit-pdf": ("Edit PDF", "Edit PDF online for free — modify text, images, and content directly inside your PDF. Add new text blocks, replace images, and make changes without converting to Word first. Full-featured PDF editor with no watermarks."),
    "sign-pdf": ("Sign PDF", "Add signature to PDF online for free. Draw, type, or upload your signature image and place it anywhere on the document. Create legally-binding electronic signatures without printing. No account required."),
    "watermark": ("Watermark PDF", "Add watermark to PDF online for free. Apply text or image watermarks to every page with full control over opacity, position, rotation, and font size. Protect your documents from unauthorized use. No sign-up needed."),
    "header-footer": ("PDF Header & Footer", "Add headers and footers to PDF online. Insert custom text, dates, page numbers, or company information in the header and footer of your PDF pages. Free tool with flexible formatting options."),
    "page-numbers": ("Add Page Numbers to PDF", "Add page numbers to PDF online for free. Choose from multiple formats, set starting page and number, position, font, and optional prefix. No watermarks, no sign-up."),
    "bates-numbering": ("Bates Numbering PDF", "Add Bates numbering to PDF for legal document indexing. Apply sequential Bates stamps with custom prefix, suffix, and start number. Essential for legal discovery and court filings. Free online tool."),
    "bookmarks": ("PDF Bookmarks", "Add bookmarks to PDF online — create, rename, reorder, and nest bookmarks for easier navigation in large documents. Build a clickable table of contents for your PDF. Free, no software installation."),
    "stamp-pdf": ("PDF Stamp", "Add stamps to PDF online for free — apply CONFIDENTIAL, DRAFT, APPROVED, COPY, VOID, or custom text stamps to any page. Adjustable opacity, position, and size. No sign-up, no watermarks."),
    "esign-pdf": ("E-Sign PDF", "E-sign PDF online for free — draw your signature with mouse or finger, then place it on any page. The simplest way to electronically sign documents without printing. No account needed."),
    "annotate-pdf": ("Annotate PDF", "Annotate PDF online for free — add highlights, underlines, strikethrough, and sticky notes with customizable colors. Perfect for reviewing documents, studying, and collaborative feedback. No software needed."),
    "add-shapes": ("Add Shapes to PDF", "Add shapes to PDF online — draw rectangles, circles, lines, and arrows with custom colors, fill, and stroke width. Perfect for technical drawings, callouts, and visual annotations. Free tool."),
    "add-attachment": ("Add Attachment to PDF", "Embed files inside a PDF online — attach images, documents, spreadsheets, or any file as an embedded attachment that recipients can extract. Perfect for sending supplementary materials."),
    "add-hyperlinks": ("Add Hyperlinks to PDF", "Add clickable hyperlinks to PDF online for free. Draw link areas over text or images and attach URLs. Create interactive PDFs with internal and external navigation links."),
    "transparent-background": ("PDF Transparent Background", "Convert near-white PDF backgrounds to transparency online for free. Perfect for layering PDF content over colored backgrounds or presentations."),
    "compress-pdf": ("Compress PDF", "Compress PDF online for free — reduce PDF file size by up to 90% without losing quality. Choose from light, balanced, or extreme compression levels. Preview estimated savings before downloading. No file limits, no sign-up."),
    "flatten-pdf": ("Flatten PDF", "Flatten PDF online — permanently merge interactive form fields, annotations, and layers into static page content. Essential for submitting filled forms, preventing further edits. Free tool."),
    "deskew-pdf": ("Deskew PDF", "Deskew scanned PDF pages online for free. Automatically detect and correct the tilt angle of scanned documents so text appears perfectly straight and readable. Ideal for fixing wonky scans."),
    "repair-pdf": ("Repair PDF", "Repair corrupted PDF files online for free. Fix damaged, broken, or unreadable PDFs that won't open in standard PDF readers. Recover content from corrupted documents."),
    "resize-pdf": ("Resize PDF", "Resize PDF pages online — change page dimensions to A4, Letter, Legal, or custom sizes. Scale content to fit new page sizes while maintaining aspect ratio. Free PDF page resizer with no watermarks."),
    "rotate-pdf": ("Rotate PDF", "Rotate PDF pages online for free — rotate individual pages or all pages by 90°, 180°, or 270°. Fix sideways or upside-down scanned documents instantly. Preview each page before saving."),
    "grayscale-pdf": ("Grayscale PDF", "Convert PDF to grayscale online for free — turn color PDFs into black and white. Save ink when printing, reduce file size, or prepare documents for monochrome printing."),
    "crop-pdf": ("Crop PDF", "Crop PDF online for free — trim margins, remove white space, or change the visible area of PDF pages. Draw a crop box to remove unwanted borders. Perfect for removing headers, footers, or excess whitespace."),
    "auto-crop": ("Remove PDF Margins", "Remove PDF margins online — auto-detect and trim white space around text on all pages. Ideal for reading PDFs on e-readers, tablets, or phones where screen space is limited. Free auto-crop tool."),
    "invert-colors": ("Invert PDF Colors", "Invert PDF colors online for a dark mode reading experience. Convert white-background PDFs to dark-background versions to reduce eye strain when reading in the dark."),
    "protect-pdf": ("Protect PDF with Password", "Password protect PDF online for free — encrypt your PDF with AES-256 encryption. Set open passwords, permission passwords, and control printing, copying, and editing access."),
    "unlock-pdf": ("Unlock PDF", "Remove password from PDF online for free. Unlock password-protected PDFs you own by entering the correct password. Remove restrictions on printing, copying, and editing."),
    "redact-pdf": ("Redact PDF", "Redact PDF online for free — permanently black out sensitive information including names, addresses, SSNs, and confidential text. WARNING: Redaction is irreversible."),
    "strip-metadata": ("Strip PDF Metadata", "Remove metadata from PDF online — strip author name, creation date, GPS coordinates, software info, and all hidden metadata for maximum privacy before sharing documents."),
    "delete-annotations": ("Delete PDF Annotations", "Remove all annotations from PDF online — delete highlights, comments, sticky notes, drawings, and markup from your documents. Clean up reviewed PDFs before final distribution."),
    "metadata": ("PDF Metadata Editor", "View and edit PDF metadata online for free — read and modify Title, Author, Subject, Keywords, Creator, and Producer fields. See exactly what information is embedded in your PDF."),
    "set-permissions": ("PDF Permissions", "Set PDF permissions online — control who can print, copy, edit, or annotate your PDF documents. Apply granular access controls with owner password protection."),
    "pdfa-validator": ("PDF/A Validator", "Validate PDF/A compliance online for free. Run basic PDF/A indicator checks to verify your document meets long-term archiving standards. Free tool, no software needed."),
    "verify-signature": ("Verify PDF Digital Signature", "Inspect digital signature fields in a PDF online for free. Verify signature validity, view signer information, and check certificate details."),
    "sanitize-pdf": ("Sanitize PDF", "Aggressively sanitize PDF documents online — remove hidden data, JavaScript, embedded files, and metadata layers for maximum security before sharing or publishing."),
    "html-to-pdf": ("HTML to PDF", "Convert HTML to PDF online for free. Paste a URL or upload an HTML file and render it as a pixel-perfect, print-ready PDF document. Preserves CSS styles, images, and layout."),
    "image-to-pdf": ("Image to PDF", "Convert images to PDF online for free — combine JPG, PNG, TIFF, WebP, or BMP images into a single PDF document. Set page size, orientation, margins, and image quality."),
    "office-to-pdf": ("Office to PDF", "Convert Word, Excel, and PowerPoint to PDF online for free. Upload any Microsoft Office document (.docx, .xlsx, .pptx) and get a perfectly formatted PDF."),
    "markdown-to-pdf": ("Markdown to PDF", "Convert Markdown to PDF online for free. Upload .md, .json, .yaml, or .toml files and render them as beautifully formatted, structured PDF documents."),
    "csv-to-pdf": ("CSV to PDF", "Convert CSV to PDF online for free — upload a CSV spreadsheet and generate a cleanly formatted PDF with tables, invoices, or report layouts."),
    "word-to-pdf": ("Word to PDF", "Convert Word to PDF online for free — upload .docx documents and convert them to high-quality PDFs preserving headings, bold, italic text, images, and paragraph formatting."),
    "excel-to-pdf": ("Excel to PDF", "Convert Excel to PDF online for free — upload .xlsx spreadsheets and convert all sheets into a formatted PDF with headers, grid lines, and automatic column sizing."),
    "pptx-to-pdf-convert": ("PowerPoint to PDF", "Convert PowerPoint to PDF online for free — upload .pptx presentations and get a high-quality PDF preserving slide dimensions, text, headings, and formatting."),
    "txt-to-pdf": ("Text to PDF", "Convert text to PDF online for free — upload .txt files and get a cleanly formatted PDF with monospace font, word wrap, and proper pagination."),
    "json-to-pdf": ("JSON to PDF", "Convert JSON to PDF online for free — upload JSON data and render it as a styled, formatted PDF document. Great for API responses and configuration files."),
    "xml-to-pdf": ("XML to PDF", "Convert XML to PDF online for free — upload XML data and generate a formatted PDF document with proper structure and syntax highlighting."),
    "epub-to-pdf": ("EPUB to PDF", "Convert EPUB to PDF online for free — transform e-books from EPUB format into printable, shareable PDF documents. Preserves chapters, headings, and images."),
    "rtf-to-pdf": ("RTF to PDF", "Convert RTF to PDF online for free — upload Rich Text Format files and convert them to high-quality PDF preserving bold, italic, fonts, and paragraph formatting."),
    "pdf-to-excel": ("PDF to Excel", "Convert PDF to Excel online for free — extract tables and data from PDF documents into editable XLSX spreadsheets. Great for invoices, financial reports, and tabular data."),
    "pdf-to-image": ("PDF to Image", "Convert PDF to images online for free — render each page as a high-resolution JPG or PNG image. Choose DPI (up to 300), color mode, and output format."),
    "pdf-to-pptx": ("PDF to PowerPoint", "Convert PDF to PowerPoint online for free — create a PPTX presentation where each page becomes a slide. Great for presenting PDF content in meetings."),
    "pdf-to-text": ("PDF to Text", "Extract text from PDF online for free — pull all readable text content from your PDF into a clean plain-text document. Works with both text-based and searchable PDFs."),
    "pdf-to-word": ("PDF to Word", "Convert PDF to Word online for free — extract text, paragraphs, and images into an editable DOCX document. No watermarks, no file limits."),
    "pdf-to-epub": ("PDF to EPUB", "Convert PDF to EPUB online for free — transform PDF documents into reflowable e-book format compatible with Kindle, Kobo, Apple Books, and all modern e-reader devices."),
    "pdf-to-markdown": ("PDF to Markdown", "Convert PDF to Markdown online for free — extract content with automatic heading detection, bold text preservation, and clean formatting. Perfect for documentation and wikis."),
    "extract-tables": ("PDF Table Extractor", "Extract tables from PDF to CSV online for free. Automatically detect and extract tabular data from invoices, reports, and financial statements into clean, editable CSV format."),
    "alternate-mix": ("Alternate Mix PDF", "Alternate mix PDF pages online — interleave pages from two or more PDFs for duplex scanning workflows. Combine front-side and back-side scans into the correct page order."),
    "compare-pdf": ("Compare PDF", "Compare two PDFs online for free — upload two versions of a document and get a visual diff highlighting every text change, addition, and deletion. Essential for contract review."),
    "extract-images": ("Extract Images from PDF", "Extract images from PDF online for free — detect and download all embedded images from your PDF as individual PNG or JPEG files."),
    "fill-form": ("Fill PDF Form", "Fill PDF forms online for free — open interactive PDF forms, fill in all text fields, checkboxes, and dropdowns, then save the completed document. No Adobe Acrobat needed."),
    "nup": ("N-Up PDF", "Print multiple PDF pages per sheet online — arrange 2, 4, 6, or 9 pages onto a single sheet for booklet-style printing. Save paper and create handouts."),
    "ocr-pdf": ("OCR PDF", "OCR PDF online for free — convert scanned documents into searchable, selectable text using Tesseract OCR. Supports 100+ languages. Output as searchable PDF or plain text."),
    "overlay": ("Overlay PDF", "Overlay PDF pages online — layer one PDF document on top of another. Perfect for adding letterhead, branded backgrounds, or watermark stamps to existing PDFs."),
    "qr-code": ("QR Code PDF", "Add QR code to PDF online for free — generate a QR code from any URL or text and stamp it onto your PDF pages at a chosen position and size."),
    "pdf-to-pdfa": ("PDF to PDF/A", "Convert PDF to PDF/A online for free — create ISO-standardized archival documents for long-term digital preservation. Essential for legal compliance and government records."),
    "form-creator": ("PDF Form Creator", "Create PDF forms online — add text fields, checkboxes, radio buttons, and dropdown menus to any PDF. Build fillable forms without Adobe Acrobat."),
    "whiteout-pdf": ("PDF White-Out / Eraser", "White-out content in PDF online — place white rectangles over text, images, or any content to permanently hide it. Free digital erasure tool."),
}

# ---------------------------------------------------------------------------
# Non-PDF tool meta  (slug → (name, long_description))
# ---------------------------------------------------------------------------
_NONPDF_TOOLS: dict[str, tuple[str, str]] = {
    "image-compressor": ("Image Compressor", "Compress images online for free — reduce JPEG, PNG, and WebP file sizes by up to 80% without visible quality loss. Drag multiple files, see live savings, and download instantly. No upload to external servers."),
    "image-converter": ("Image Format Converter", "Convert images online for free — change between WebP, PNG, JPG, TIFF, BMP and HEIC formats instantly. Perfect for converting iPhone HEIC photos to JPG. No upload required."),
    "remove-exif": ("Remove EXIF Data", "Remove EXIF data from photos online for free — strip GPS location, camera model, timestamps, and all metadata before sharing images online. Protect your privacy with one click."),
    "resize-crop-image": ("Resize & Crop Image", "Resize and crop images online for free — set exact dimensions, aspect ratios, or pixel sizes. Bulk resize multiple images for social media, thumbnails, profile pictures, and websites."),
    "video-to-gif": ("Video to GIF Converter", "Convert video to GIF online for free — upload MP4, MOV, or WebM files, select the clip range, and export a looping animated GIF. Adjust FPS and resolution. No watermarks."),
    "image-ocr": ("Image OCR", "Extract text from images online for free using OCR. Upload photos of documents, screenshots, receipts, or handwritten notes. Supports 40+ languages via Tesseract. Private and instant."),
    "extract-audio": ("Extract Audio from Video", "Extract audio from video online for free — pull the audio track from any MP4, MOV, WebM, or AVI file and save as MP3, WAV, or OGG. No quality loss."),
    "trim-media": ("Cut / Trim Video & Audio", "Cut and trim video or audio online for free — use a visual timeline to set in/out points and export the trimmed clip at full quality without re-encoding."),
    "compress-video": ("Compress Video", "Compress video online for free — reduce video file size for email, messaging, and uploads. Choose quality presets from High Quality to WhatsApp-ready. Supports MP4, MOV, WebM."),
    "json-xml-formatter": ("JSON / XML Formatter", "Format JSON and XML online for free — paste, prettify, validate, and highlight syntax errors instantly. 100% offline processing. Sensitive data never leaves your browser."),
    "text-diff": ("Text Diff / Comparator", "Compare text online for free — paste two versions of text or code and get a line-by-line diff with additions in green and deletions in red. Perfect for code review."),
    "base64": ("Base64 Encoder / Decoder", "Encode and decode Base64 online for free — convert text, files, or binary data to and from Base64 format instantly. Works entirely in your browser, no data sent anywhere."),
    "hash-generator": ("Hash Generator", "Generate cryptographic hashes online for free — compute MD5, SHA-1, SHA-256, SHA-512, and more from text or files. Verify file integrity instantly. 100% private."),
    "extract-archive": ("Extract Archive", "Extract ZIP, RAR, 7Z, and TAR archives online for free — upload compressed files and extract all contents privately in your browser. No server uploads needed."),
    "create-zip": ("Create ZIP Archive", "Create ZIP archives online for free — select multiple files and compress them into a downloadable ZIP file. Fast, private, and no file size limits."),
    "csv-json": ("CSV to JSON Converter", "Convert CSV to JSON online for free — upload a CSV spreadsheet and get a properly formatted JSON array. Also supports JSON to CSV. Perfect for data transformation."),
    "markdown-html": ("Markdown to HTML Converter", "Convert Markdown to HTML online for free — paste Markdown text and get clean, rendered HTML. Preview the output instantly. Also supports HTML to Markdown."),
    "heic-to-jpg": ("HEIC to JPG Converter", "Convert HEIC to JPG online for free — transform iPhone HEIC/HEIF photos into universally compatible JPG format. Bulk convert multiple photos at once. No upload required."),
    "remove-background": ("Remove Image Background", "Remove background from images online for free — automatically detect and delete the background from photos to create transparent PNGs. Perfect for product photos, portraits, and logos."),
    "svg-to-png": ("SVG to PNG Converter", "Convert SVG to PNG online for free — render vector graphics as high-resolution PNG images. Set custom width, height, and DPI. Perfect for using SVG icons in presentations."),
    "image-watermark": ("Add Watermark to Image", "Add text or image watermarks to photos online for free — protect your images with customizable watermarks. Control opacity, position, and size. Batch watermark multiple images at once."),
    "generate-favicon": ("Favicon Generator", "Generate favicons online for free — upload any image and get ICO, PNG, and SVG favicon files for your website in all standard sizes (16x16, 32x32, 48x48, 192x192)."),
    "make-collage": ("Photo Collage Maker", "Create photo collages online for free — arrange multiple images into grid layouts, contact sheets, or custom collages. Download as a high-resolution image file."),
    "generate-barcode": ("Barcode Generator", "Generate barcodes online for free — create Code 128, QR Code, EAN-13, UPC, and other barcode formats. Download as PNG or SVG. Perfect for product labels and inventory."),
    "url-to-pdf": ("URL to PDF Converter", "Convert any web page URL to PDF online for free — enter a URL and get a rendered, print-ready PDF of the full page with styles and images preserved."),
    "qr-reader": ("QR Code Reader", "Read and decode QR codes online for free — upload an image containing a QR code and extract the encoded text, URL, or data instantly. No app or camera required."),
    "merge-images": ("Merge Images", "Merge multiple images online for free — combine JPG, PNG, and WebP files side by side or stacked vertically into a single image. Set spacing, alignment, and background color."),
}


def _tool_title(name: str) -> str:
    return f"{name} Online Free — No Sign Up | PrivaTools"


def _tool_desc(desc: str) -> str:
    return desc[:160] if len(desc) > 160 else desc


def get_meta_for_path(path: str) -> tuple[str, str]:
    """Return (title, description) for the given URL path."""
    path = path.rstrip("/") or "/"

    # Static page lookup
    if path in _STATIC_META:
        return _STATIC_META[path]

    # /tool/<slug>
    if path.startswith("/tool/"):
        slug = path[len("/tool/"):]
        if slug in _PDF_TOOLS:
            name, desc = _PDF_TOOLS[slug]
            return _tool_title(name), _tool_desc(desc)
        # Unknown slug — still return a reasonable fallback
        readable = slug.replace("-", " ").title()
        return (
            f"{readable} Online Free | PrivaTools",
            f"Use {readable} online for free on PrivaTools. Privacy-first file processing — no sign-up, no uploads stored.",
        )

    # /tools/<slug>
    if path.startswith("/tools/"):
        slug = path[len("/tools/"):]
        if slug in _NONPDF_TOOLS:
            name, desc = _NONPDF_TOOLS[slug]
            return _tool_title(name), _tool_desc(desc)
        readable = slug.replace("-", " ").title()
        return (
            f"{readable} Online Free | PrivaTools",
            f"Use {readable} online for free on PrivaTools. Privacy-first file processing — no sign-up, no uploads stored.",
        )

    # Fallback
    return _STATIC_META["/"]


def inject_seo(html: str, path: str) -> str:
    """
    Inject server-side <title>, <meta name="description">, and
    <meta property="og:*"> into the HTML string returned by StaticFiles.
    """
    title, description = get_meta_for_path(path)
    canonical_url = BASE_URL + (path if path != "/" else "")

    # Escape for HTML attribute context
    def esc(s: str) -> str:
        return s.replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;").replace(">", "&gt;")

    t = esc(title)
    d = esc(description)
    u = esc(canonical_url)

    # Replace <title>
    html = re.sub(r"<title>[^<]*</title>", f"<title>{t}</title>", html, count=1)

    # Update meta description
    html = _set_meta(html, 'name="description"', d)

    # Update OG tags
    html = _set_meta(html, 'property="og:title"', t)
    html = _set_meta(html, 'property="og:description"', d)
    html = _set_meta(html, 'property="og:url"', u)

    # Update Twitter tags
    html = _set_meta(html, 'name="twitter:title"', t)
    html = _set_meta(html, 'name="twitter:description"', d)

    # Update / add canonical
    if 'rel="canonical"' in html:
        html = re.sub(r'<link rel="canonical"[^>]*/?\s*>', f'<link rel="canonical" href="{u}" />', html, count=1)
    else:
        html = html.replace("</head>", f'  <link rel="canonical" href="{u}" />\n</head>', 1)

    return html


def _set_meta(html: str, attr: str, value: str) -> str:
    """Update the content attribute of a meta tag identified by `attr`."""
    pattern = rf'(<meta\s+{re.escape(attr)}\s+content=")[^"]*(")'
    replacement = rf'\g<1>{value}\g<2>'
    new_html, n = re.subn(pattern, replacement, html, count=1)
    if n == 0:
        # Also try reversed attribute order: content="..." name="..."
        pattern2 = rf'(<meta\s+content=")[^"]*("\s+{re.escape(attr)}[^>]*>)'
        new_html, n2 = re.subn(pattern2, rf'\g<1>{value}\g<2>', html, count=1)
        return new_html if n2 else html
    return new_html
