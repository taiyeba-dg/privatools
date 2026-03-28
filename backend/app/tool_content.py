"""
Structured HowTo steps and FAQ entries for each tool.

Used for:
- Server-side rendering (visible to crawlers)
- JSON-LD HowTo and FAQPage schema markup
"""
from __future__ import annotations

# ---------------------------------------------------------------------------
# HowTo steps  –  tool slug → list of {name, text}
# ---------------------------------------------------------------------------
TOOL_HOWTO: dict[str, list[dict[str, str]]] = {
    # ── PDF manipulation ──────────────────────────────────────────────
    "merge-pdf": [
        {"name": "Add PDF files", "text": "Drop or select two or more PDF files into the upload area. There is no page-count limit; the max per file is 100 MB."},
        {"name": "Reorder the files", "text": "Drag the thumbnail cards to set the order in which the PDFs will be joined."},
        {"name": "Merge and download", "text": "Click Merge. The server concatenates the files, preserving bookmarks and links, and returns a single PDF."},
    ],
    "split-pdf": [
        {"name": "Upload the PDF", "text": "Select a PDF up to 100 MB. The page-count preview loads automatically."},
        {"name": "Choose split mode", "text": "Pick 'Fixed range' to split every N pages, 'Custom ranges' to specify exact page numbers (e.g. 1-3, 7-10), or 'Extract every page' to get individual pages."},
        {"name": "Split and download", "text": "Click Split. Each resulting PDF is packaged into a ZIP file for convenient downloading."},
    ],
    "split-by-size": [
        {"name": "Upload the PDF", "text": "Select a PDF file up to 100 MB that you want to split into smaller chunks."},
        {"name": "Set the target chunk size", "text": "Enter the maximum file size per chunk in megabytes (e.g. 10 MB). The tool will split at page boundaries to stay under the limit."},
        {"name": "Download the parts", "text": "Click Split. The server breaks the PDF into parts that respect your size target and delivers them in a ZIP archive."},
    ],
    "compress-pdf": [
        {"name": "Upload the PDF", "text": "Select a PDF up to 100 MB. Large scanned documents benefit the most from compression."},
        {"name": "Pick a compression level", "text": "Choose Low (best quality, modest reduction), Medium (balanced), or High (smallest file, some quality loss on images)."},
        {"name": "Download the compressed file", "text": "Click Compress. The result shows the new file size and the percentage saved compared to the original."},
    ],
    "edit-pdf": [
        {"name": "Open the PDF", "text": "Upload a PDF up to 100 MB. The editor renders each page for annotation."},
        {"name": "Add annotations", "text": "Use the toolbar to add text boxes, highlights, shapes, or freehand drawings on any page."},
        {"name": "Save the edited PDF", "text": "Click Save. Annotations are flattened into the document so they appear in any PDF reader."},
    ],
    "sign-pdf": [
        {"name": "Upload the document", "text": "Select the PDF you need to sign. The first page is displayed in the signing canvas."},
        {"name": "Create your signature", "text": "Draw your signature with a mouse or finger, type it using a handwriting font, or upload a signature image."},
        {"name": "Place and resize the signature", "text": "Drag the signature to the correct position on the page. Resize it to fit the signing area."},
        {"name": "Download the signed PDF", "text": "Click Apply. The signature is embedded into the PDF and the file is ready to share."},
    ],
    "protect-pdf": [
        {"name": "Upload the PDF", "text": "Select a PDF up to 100 MB that you want to password-protect."},
        {"name": "Set a password", "text": "Enter a strong password. You can separately restrict printing, copying text, or editing."},
        {"name": "Download the encrypted PDF", "text": "Click Protect. The output uses AES-256 encryption and requires the password to open."},
    ],
    "unlock-pdf": [
        {"name": "Upload the locked PDF", "text": "Select the password-protected PDF file."},
        {"name": "Enter the password", "text": "Type the document password. PrivaTools does not store or log the password — it is used only for decryption."},
        {"name": "Download the unlocked PDF", "text": "Click Unlock. The resulting PDF has all password restrictions removed."},
    ],
    "rotate-pdf": [
        {"name": "Upload the PDF", "text": "Select a PDF up to 100 MB. Thumbnail previews of each page are shown."},
        {"name": "Select pages and rotation angle", "text": "Click individual page thumbnails or select all, then choose 90°, 180°, or 270° clockwise rotation."},
        {"name": "Apply and download", "text": "Click Rotate. The server applies the rotation permanently and returns the updated PDF."},
    ],
    "watermark": [
        {"name": "Upload the PDF", "text": "Select a PDF up to 100 MB that needs a watermark."},
        {"name": "Configure the watermark", "text": "Enter text (e.g. 'CONFIDENTIAL') or upload an image. Set opacity, font size, color, and position (diagonal, center, header, or footer)."},
        {"name": "Apply and download", "text": "Click Apply. Every page receives the watermark, and the output PDF is ready to download."},
    ],
    "ocr-pdf": [
        {"name": "Upload a scanned PDF or image-based PDF", "text": "Select a PDF containing scanned pages. Files up to 100 MB are supported."},
        {"name": "Select the document language", "text": "Choose the primary language (or multiple languages) so the OCR engine uses the correct dictionary for accuracy."},
        {"name": "Run OCR and download", "text": "Click Process. Tesseract extracts text and creates an invisible text layer, making the PDF fully searchable and copyable."},
    ],
    "redact-pdf": [
        {"name": "Upload the PDF", "text": "Select the document containing sensitive information you need to permanently remove."},
        {"name": "Mark areas to redact", "text": "Draw rectangles over text, images, or regions on each page. You can also search for a word or phrase to auto-select all occurrences."},
        {"name": "Preview the redactions", "text": "Toggle the preview to verify that the correct areas are blacked out before committing."},
        {"name": "Apply redactions and download", "text": "Click Redact. The underlying content is permanently destroyed — it cannot be recovered, even by removing the black boxes."},
    ],
    "flatten-pdf": [
        {"name": "Upload the PDF", "text": "Select a PDF that contains form fields, annotations, or layers you want to flatten."},
        {"name": "Choose flattening options", "text": "Decide whether to flatten form fields only, annotations only, or everything. Flattening converts interactive elements into static page content."},
        {"name": "Download the flattened PDF", "text": "Click Flatten. The result is a clean PDF where all content is baked into the pages, preventing further edits."},
    ],
    "bookmarks": [
        {"name": "Upload the PDF", "text": "Select a PDF up to 100 MB. Existing bookmarks, if any, are listed automatically."},
        {"name": "Edit the bookmark tree", "text": "Add, rename, reorder, or delete bookmarks. Set the target page number for each entry. You can nest bookmarks to create a multi-level table of contents."},
        {"name": "Save and download", "text": "Click Save. The updated bookmark tree is embedded into the PDF for easy navigation in any reader."},
    ],
    "form-creator": [
        {"name": "Upload a PDF or start blank", "text": "Upload an existing PDF to add form fields on top, or start with a blank page."},
        {"name": "Add form fields", "text": "Drag text inputs, checkboxes, dropdowns, radio buttons, or signature fields onto the page. Set field names and validation rules."},
        {"name": "Configure form properties", "text": "Set tab order, default values, and required-field flags. Preview the form to test interactivity."},
        {"name": "Export the fillable PDF", "text": "Click Save. The PDF contains standard AcroForm fields that work in any PDF reader."},
    ],
    "extract-tables": [
        {"name": "Upload the PDF", "text": "Select a PDF that contains one or more tables you need to extract as structured data."},
        {"name": "Select pages", "text": "Choose specific pages or let the tool auto-detect all tables across the entire document."},
        {"name": "Pick the output format", "text": "Choose CSV, Excel (.xlsx), or JSON. Each detected table becomes a separate sheet or file."},
        {"name": "Download the extracted data", "text": "Click Extract. Tables are parsed using Camelot/Tabula and delivered in the chosen format inside a ZIP."},
    ],
    "pdf-to-pdfa": [
        {"name": "Upload the PDF", "text": "Select a standard PDF you want to convert into the PDF/A archival format."},
        {"name": "Choose the conformance level", "text": "Select PDF/A-1b (basic), PDF/A-2b (supports transparency and JPEG2000), or PDF/A-3b (allows embedded files)."},
        {"name": "Convert and download", "text": "Click Convert. The tool embeds fonts, converts color spaces to sRGB, and validates compliance before returning the PDF/A file."},
    ],

    # ── PDF conversion ────────────────────────────────────────────────
    "image-to-pdf": [
        {"name": "Upload images", "text": "Select one or more images (JPG, PNG, WebP, BMP, TIFF). Each image can be up to 100 MB."},
        {"name": "Arrange and configure", "text": "Reorder images by dragging thumbnails. Set page size (A4, Letter, or fit-to-image) and orientation."},
        {"name": "Convert to PDF", "text": "Click Convert. Each image becomes a full page in the resulting PDF, maintaining original resolution."},
    ],
    "txt-to-pdf": [
        {"name": "Upload a text file or paste text", "text": "Select a .txt file up to 100 MB or paste plain text directly into the editor."},
        {"name": "Choose formatting", "text": "Pick the font family, font size, page size, and margins. Monospace fonts work best for code or tabular content."},
        {"name": "Generate the PDF", "text": "Click Convert. The text is reflowed into paginated PDF pages with the selected formatting."},
    ],
    "office-to-pdf": [
        {"name": "Upload an Office document", "text": "Select a Word (.docx), Excel (.xlsx), or PowerPoint (.pptx) file up to 100 MB."},
        {"name": "Convert via LibreOffice", "text": "The server uses LibreOffice in headless mode for high-fidelity conversion, preserving fonts, tables, charts, and layouts."},
        {"name": "Download the PDF", "text": "Click Convert. The resulting PDF is ready within seconds for most documents."},
    ],
    "word-to-pdf": [
        {"name": "Upload the Word document", "text": "Select a .doc or .docx file up to 100 MB."},
        {"name": "Conversion runs automatically", "text": "LibreOffice converts the document server-side, preserving formatting, images, headers, footers, and table-of-contents links."},
        {"name": "Download the PDF", "text": "Click Convert and save the result. Hyperlinks and bookmarks from the original document are preserved."},
    ],
    "epub-to-pdf": [
        {"name": "Upload an EPUB file", "text": "Select an .epub e-book file up to 100 MB."},
        {"name": "Choose page layout", "text": "Select a page size (A4, Letter, or custom dimensions). The tool reflows text and embeds images to match the chosen layout."},
        {"name": "Convert and download", "text": "Click Convert. Chapters, formatting, and embedded images are preserved in the output PDF."},
    ],
    "html-to-pdf": [
        {"name": "Enter a URL or paste HTML", "text": "Type a public URL to render, or paste raw HTML/CSS directly into the editor."},
        {"name": "Configure rendering options", "text": "Set page size, margins, and whether to include background graphics. JavaScript rendering is supported for dynamic pages."},
        {"name": "Generate the PDF", "text": "Click Convert. The server uses a headless browser to render the page and produce a pixel-perfect PDF."},
    ],
    "xml-to-pdf": [
        {"name": "Upload an XML file", "text": "Select an .xml file up to 100 MB. Common schemas like RSS, Atom, and XHTML are supported."},
        {"name": "Choose display format", "text": "Select tree view (collapsible hierarchy) or formatted table view for structured data."},
        {"name": "Convert and download", "text": "Click Convert. The XML is rendered into a readable, paginated PDF document."},
    ],
    "csv-to-pdf": [
        {"name": "Upload a CSV file", "text": "Select a .csv or .tsv file up to 100 MB. The first row is treated as column headers by default."},
        {"name": "Customize table appearance", "text": "Set font size, enable zebra striping, choose landscape or portrait orientation. Wide tables automatically wrap or scale to fit."},
        {"name": "Convert to PDF", "text": "Click Convert. The data is rendered into a clean, paginated table in the output PDF."},
    ],
    "json-to-pdf": [
        {"name": "Upload a JSON file or paste JSON", "text": "Select a .json file up to 100 MB or paste JSON directly into the editor."},
        {"name": "Choose the rendering style", "text": "Pick syntax-highlighted code view for developers or a table/tree view for structured data."},
        {"name": "Convert and download", "text": "Click Convert. The JSON is rendered into a paginated, readable PDF with proper indentation and optional line numbers."},
    ],
    "pdf-to-word": [
        {"name": "Upload the PDF", "text": "Select a PDF up to 100 MB. Both text-based and scanned PDFs are supported (scanned PDFs go through OCR first)."},
        {"name": "Convert to Word", "text": "Click Convert. The server extracts text, images, and tables and reconstructs them in a .docx file preserving layout as closely as possible."},
        {"name": "Download the Word document", "text": "Save the .docx file. Open it in Microsoft Word, Google Docs, or LibreOffice for editing."},
    ],
    "pdf-to-excel": [
        {"name": "Upload the PDF", "text": "Select a PDF that contains tables or tabular data."},
        {"name": "Select pages with tables", "text": "Choose specific pages or let the tool scan all pages for tables automatically."},
        {"name": "Convert and download", "text": "Click Convert. Each detected table becomes a separate sheet in the resulting .xlsx file, with rows and columns preserved."},
    ],
    "pdf-to-text": [
        {"name": "Upload the PDF", "text": "Select a text-based or scanned PDF up to 100 MB."},
        {"name": "Choose extraction mode", "text": "Select plain text extraction for text-based PDFs, or enable OCR for scanned documents. Pick the OCR language if needed."},
        {"name": "Download the text", "text": "Click Convert. The extracted text is returned as a .txt file with page breaks preserved."},
    ],
    "pdf-to-image": [
        {"name": "Upload the PDF", "text": "Select a PDF up to 100 MB. The tool displays a page-count summary."},
        {"name": "Configure output settings", "text": "Choose the image format (PNG, JPG, or WebP), resolution (72–600 DPI), and which pages to convert."},
        {"name": "Convert and download", "text": "Click Convert. Each page becomes a separate image file, delivered in a ZIP archive."},
    ],

    # ── Image tools ───────────────────────────────────────────────────
    "heic-to-jpg": [
        {"name": "Upload HEIC/HEIF images", "text": "Select one or more .heic or .heif files from your iPhone or camera. Each file can be up to 100 MB."},
        {"name": "Choose output format and quality", "text": "Select JPG or PNG output. For JPG, set the quality slider (1–100). Higher values preserve detail at larger file sizes."},
        {"name": "Convert and download", "text": "Click Convert. EXIF orientation is applied automatically so images display correctly. Multiple files are delivered in a ZIP."},
    ],
    "remove-exif": [
        {"name": "Upload images", "text": "Select one or more JPG, PNG, or WebP images containing EXIF metadata."},
        {"name": "Preview metadata", "text": "The tool displays found metadata: GPS coordinates, camera model, date taken, software, and more."},
        {"name": "Strip metadata and download", "text": "Click Remove. All EXIF, IPTC, and XMP metadata is permanently stripped. The pixel data is untouched."},
    ],
    "image-compressor": [
        {"name": "Upload images", "text": "Select one or more images (JPG, PNG, WebP). Each file can be up to 100 MB."},
        {"name": "Set compression level", "text": "Choose a quality target or let the tool auto-optimize. For PNG, lossless compression is applied; for JPG, you can set the quality percentage."},
        {"name": "Download compressed images", "text": "Click Compress. The tool shows the original and compressed sizes side by side. Multiple files are returned in a ZIP."},
    ],
    "remove-background": [
        {"name": "Upload an image", "text": "Select a JPG, PNG, or WebP image up to 100 MB. Photos of people, products, and animals work best."},
        {"name": "Background removal runs automatically", "text": "The server uses an AI model to detect the foreground subject and remove the background. No manual tracing is needed."},
        {"name": "Download the result", "text": "Save the transparent PNG. You can also choose a solid-color replacement background before downloading."},
    ],

    # ── Video/media tools ─────────────────────────────────────────────
    "video-to-gif": [
        {"name": "Upload a video", "text": "Select an MP4, WebM, MOV, or AVI file up to 100 MB."},
        {"name": "Set GIF parameters", "text": "Choose the start time, duration (max 30 seconds recommended for file size), frame rate (10–30 fps), and output width."},
        {"name": "Convert and download", "text": "Click Convert. FFmpeg extracts the frames and optimizes the color palette for the smallest possible GIF."},
    ],
    "compress-video": [
        {"name": "Upload a video", "text": "Select an MP4, WebM, MOV, or AVI file up to 100 MB."},
        {"name": "Choose compression preset", "text": "Pick Light, Medium, or Heavy compression. Heavier settings reduce file size more but lower visual quality."},
        {"name": "Compress and download", "text": "Click Compress. The server re-encodes the video using FFmpeg with H.264/H.265. The result shows the file size reduction."},
    ],
    "trim-media": [
        {"name": "Upload an audio or video file", "text": "Select an MP4, MP3, WAV, WebM, or other media file up to 100 MB."},
        {"name": "Set the trim range", "text": "Use the waveform/timeline to set precise start and end times, or type timestamps manually (e.g. 00:30 to 02:15)."},
        {"name": "Trim and download", "text": "Click Trim. The server extracts the selected segment without re-encoding when possible, preserving original quality."},
    ],

    # ── Developer tools ───────────────────────────────────────────────
    "base64": [
        {"name": "Choose encode or decode mode", "text": "Select whether you want to encode data to Base64 or decode a Base64 string back to its original form."},
        {"name": "Enter input", "text": "Paste text into the editor, or upload a file (image, PDF, binary — up to 100 MB). For decoding, paste the Base64 string."},
        {"name": "Get the result", "text": "The output appears instantly. Copy the Base64 string to your clipboard, or download the decoded file."},
    ],
    "text-diff": [
        {"name": "Enter the two texts", "text": "Paste the original text on the left and the modified text on the right, or upload two text files."},
        {"name": "View the diff", "text": "Differences are highlighted inline: green for additions, red for deletions, and yellow for modifications."},
        {"name": "Choose diff mode", "text": "Switch between side-by-side and unified views. Line numbers help locate changes in large documents."},
        {"name": "Copy or download the diff", "text": "Copy the highlighted diff to your clipboard or download it as an HTML file for sharing."},
    ],
}


# ---------------------------------------------------------------------------
# FAQ  –  tool slug → list of {q, a}
# ---------------------------------------------------------------------------
TOOL_FAQ: dict[str, list[dict[str, str]]] = {
    "merge-pdf": [
        {"q": "Is there a limit on how many PDFs I can merge at once?", "a": "There is no hard limit on the number of files. Each individual file must be under 100 MB. The server handles merges of dozens of files without issues."},
        {"q": "Are bookmarks and hyperlinks preserved when merging?", "a": "Yes. PrivaTools preserves existing bookmarks, internal links, and external hyperlinks from all input files in the merged result."},
        {"q": "Do I need to create an account to merge PDFs?", "a": "No. PrivaTools requires no account, no email, and no sign-up. Upload your files, merge them, and download the result."},
    ],
    "split-pdf": [
        {"q": "Can I split a PDF into individual pages?", "a": "Yes. Choose the 'Extract every page' option to get each page as a separate PDF file, all packaged in a ZIP download."},
        {"q": "Can I extract non-consecutive pages like 1, 5, and 12?", "a": "Yes. Use the 'Custom ranges' mode and enter the exact page numbers or ranges you need (e.g. 1, 5, 12 or 1-3, 12-15)."},
        {"q": "What happens to bookmarks when I split a PDF?", "a": "Bookmarks that fall within the extracted page range are preserved. Bookmarks pointing to pages outside the range are removed."},
    ],
    "split-by-size": [
        {"q": "How does size-based splitting work?", "a": "The tool splits at page boundaries to keep each chunk under your target size. It cannot split in the middle of a page, so some chunks may be slightly under the target."},
        {"q": "What is the minimum chunk size I can set?", "a": "The minimum is effectively the size of the largest single page. If one page is 5 MB, you cannot create chunks smaller than 5 MB."},
        {"q": "Is this useful for email attachment limits?", "a": "Yes. Set the chunk size to your email provider's attachment limit (e.g. 25 MB for Gmail) and each part will be small enough to attach."},
    ],
    "compress-pdf": [
        {"q": "How much can a PDF be compressed?", "a": "Results vary by content. Scanned PDFs with large images often shrink 50-80%. Text-heavy PDFs with no images may only shrink 5-15%."},
        {"q": "Does compression reduce the quality of text?", "a": "No. Text and vector graphics remain lossless. Only embedded raster images are recompressed, and only at Medium or High compression levels."},
        {"q": "Can I compress a password-protected PDF?", "a": "You need to unlock the PDF first using the Unlock PDF tool, then compress the unlocked version."},
    ],
    "edit-pdf": [
        {"q": "Can I edit the existing text in a PDF?", "a": "The editor supports adding new text, shapes, highlights, and freehand drawings. Direct editing of existing text in a PDF requires re-authoring the document."},
        {"q": "Are my annotations permanent?", "a": "Yes. When you save, annotations are flattened into the PDF so they appear identically in every viewer and cannot be removed."},
        {"q": "What annotation types are available?", "a": "Text boxes, freehand pen, highlighter, rectangles, circles, lines, and arrows. You can set color, opacity, and font size for each."},
    ],
    "sign-pdf": [
        {"q": "Is this a legally binding electronic signature?", "a": "PrivaTools creates a visual signature embedded in the PDF. Whether it is legally binding depends on your jurisdiction. For most informal agreements and internal documents, it is widely accepted."},
        {"q": "Can I sign multiple pages?", "a": "Yes. After creating your signature, you can place it on any page by navigating through the document preview."},
        {"q": "Is my signature stored on the server?", "a": "No. Your signature exists only in your browser session. The server never stores signatures — it only applies them to the PDF during processing, then deletes the file within minutes."},
    ],
    "protect-pdf": [
        {"q": "What encryption does PrivaTools use?", "a": "PDFs are encrypted with AES-256, the same standard used by banks and governments. This is the strongest encryption available for PDF files."},
        {"q": "Can I allow printing but block copying text?", "a": "Yes. You can set granular permissions: allow or deny printing, text copying, form filling, and editing independently."},
        {"q": "What happens if I forget the password?", "a": "PrivaTools does not store your password. If you lose it, there is no way to recover it. Save your password in a password manager."},
    ],
    "unlock-pdf": [
        {"q": "Can I unlock a PDF without the password?", "a": "No. PrivaTools requires you to enter the correct password. It does not crack or brute-force passwords."},
        {"q": "Does unlocking remove all restrictions?", "a": "Yes. Both the open password and permission restrictions (no-print, no-copy) are removed from the output file."},
        {"q": "Is the password transmitted securely?", "a": "Yes. The password is sent over HTTPS and is used only in memory for decryption. It is never stored or logged on the server."},
    ],
    "rotate-pdf": [
        {"q": "Can I rotate individual pages instead of the entire PDF?", "a": "Yes. Click individual page thumbnails to select specific pages, then apply the rotation angle only to those pages."},
        {"q": "Does rotation affect text searchability?", "a": "No. The text layer is preserved. The rotation only changes the visual display orientation of the page."},
        {"q": "What rotation angles are supported?", "a": "90° clockwise, 180°, and 270° clockwise (equivalent to 90° counter-clockwise)."},
    ],
    "watermark": [
        {"q": "Can I use an image as a watermark?", "a": "Yes. Upload a PNG or JPG image (logos work well). Set the opacity so the watermark is visible but does not obscure the document content."},
        {"q": "Is the watermark applied to every page?", "a": "Yes. The watermark is applied to all pages. If you need it on specific pages only, split the PDF first, watermark those pages, then merge."},
        {"q": "Can someone remove the watermark?", "a": "The watermark is flattened into the page content. It cannot be removed with a simple toggle, though advanced PDF editing tools could paint over it."},
    ],
    "ocr-pdf": [
        {"q": "What languages does OCR support?", "a": "PrivaTools uses Tesseract, which supports over 100 languages including English, Spanish, French, German, Chinese, Japanese, Korean, Arabic, and Hindi."},
        {"q": "Will OCR change how my PDF looks?", "a": "No. OCR adds an invisible text layer behind the scanned image. The visual appearance is identical — but you can now search and copy text."},
        {"q": "How accurate is the OCR?", "a": "Accuracy depends on scan quality. Clean 300 DPI scans typically achieve 95-99% accuracy. Low-resolution or skewed scans may need manual correction."},
    ],
    "redact-pdf": [
        {"q": "Is redaction permanent?", "a": "Yes. Redacted content is permanently destroyed at the pixel and text level. It cannot be recovered by removing the black boxes or by any forensic tool."},
        {"q": "Can I search and redact all instances of a word?", "a": "Yes. Use the search function to find all occurrences of a name, number, or phrase and mark them all for redaction at once."},
        {"q": "What is the difference between redaction and covering with a black box?", "a": "A black box drawn as an annotation can be removed to reveal the text underneath. Redaction permanently deletes the underlying text and image data."},
    ],
    "flatten-pdf": [
        {"q": "What does flattening a PDF mean?", "a": "Flattening converts interactive elements like form fields, annotations, and layers into static page content. The visual appearance stays the same but the elements can no longer be edited."},
        {"q": "When should I flatten a PDF?", "a": "Flatten before sharing filled forms (to prevent edits), before printing (to avoid rendering issues), or when a recipient's PDF viewer does not display annotations correctly."},
        {"q": "Does flattening reduce file size?", "a": "Sometimes. Removing form field metadata and annotation data can slightly reduce file size, but the effect depends on the document."},
    ],
    "bookmarks": [
        {"q": "Can I create a multi-level bookmark tree?", "a": "Yes. You can nest bookmarks under parent entries to create a hierarchical table of contents with multiple levels."},
        {"q": "Do bookmarks work in all PDF readers?", "a": "Yes. The bookmarks use the standard PDF outline format supported by Adobe Reader, Preview, Chrome, Firefox, and all major PDF viewers."},
        {"q": "Can I import a bookmark structure from a text file?", "a": "Currently, bookmarks are created manually in the editor. You can copy-paste titles and set page numbers individually."},
    ],
    "form-creator": [
        {"q": "What field types can I add?", "a": "Text inputs, text areas, checkboxes, radio buttons, dropdowns, date pickers, and signature fields."},
        {"q": "Will the form work in Adobe Reader?", "a": "Yes. The forms use the standard AcroForm format, which is compatible with Adobe Reader, Foxit, and all major PDF viewers."},
        {"q": "Can I set fields as required?", "a": "Yes. Mark any field as required to prevent submission without filling it in. You can also set validation rules like numeric-only or email format."},
    ],
    "extract-tables": [
        {"q": "What output formats are supported?", "a": "CSV, Excel (.xlsx), and JSON. Each table is extracted separately and all results are packaged in a ZIP file."},
        {"q": "Can it extract tables from scanned PDFs?", "a": "For best results, run OCR first using the OCR tool to create a text layer, then use table extraction. The tool works best with text-based PDFs."},
        {"q": "How does the tool detect table boundaries?", "a": "It uses Camelot and Tabula libraries, which detect ruled lines and text alignment patterns to identify table structures. Tables without visible borders may need manual page selection."},
    ],
    "pdf-to-pdfa": [
        {"q": "What is PDF/A and why would I need it?", "a": "PDF/A is an ISO-standardized archival format that ensures documents remain viewable long-term. Government agencies, courts, and archives often require PDF/A submissions."},
        {"q": "What changes does the conversion make?", "a": "The tool embeds all fonts, converts color spaces to sRGB, removes JavaScript and multimedia, and adds the required PDF/A metadata."},
        {"q": "Will the document look different after conversion?", "a": "Visually the document should look the same. Transparency may be flattened in PDF/A-1b, and embedded multimedia will be removed since PDF/A does not allow it."},
    ],
    "image-to-pdf": [
        {"q": "What image formats are supported?", "a": "JPG, PNG, WebP, BMP, and TIFF. Each image can be up to 100 MB."},
        {"q": "Can I control the page size?", "a": "Yes. Choose A4, Letter, or fit-to-image (where the page matches the image dimensions exactly). You can also set landscape or portrait orientation."},
        {"q": "Are multiple images combined into one PDF?", "a": "Yes. All uploaded images become pages in a single PDF. Drag to reorder them before converting."},
    ],
    "txt-to-pdf": [
        {"q": "Can I change the font and page size?", "a": "Yes. Choose from several font families (serif, sans-serif, monospace), set the font size, and select A4 or Letter page size with custom margins."},
        {"q": "Does the tool handle Unicode text?", "a": "Yes. UTF-8 encoded text is fully supported, including non-Latin scripts like Chinese, Arabic, Cyrillic, and Devanagari."},
        {"q": "Is there a character or line limit?", "a": "No character limit beyond the 100 MB file-size cap. The text is automatically reflowed and paginated."},
    ],
    "office-to-pdf": [
        {"q": "Which Office formats are supported?", "a": "Word (.doc, .docx), Excel (.xls, .xlsx), PowerPoint (.ppt, .pptx), and OpenDocument formats (.odt, .ods, .odp)."},
        {"q": "Are charts and images preserved?", "a": "Yes. The conversion uses LibreOffice, which preserves charts, images, tables, headers, footers, and most formatting accurately."},
        {"q": "How long does conversion take?", "a": "Most documents convert in 2-10 seconds. Large files with many images or complex layouts may take up to 30 seconds."},
    ],
    "word-to-pdf": [
        {"q": "Is formatting preserved during conversion?", "a": "Yes. LibreOffice preserves fonts, styles, tables, images, headers, footers, and table-of-contents links. Minor differences may occur with uncommon fonts."},
        {"q": "Are .doc (legacy) files supported?", "a": "Yes. Both the older .doc format and the modern .docx format are supported."},
        {"q": "What about tracked changes and comments?", "a": "Tracked changes and comments visible in the document will appear in the PDF. Accept or reject changes in Word first if you want a clean output."},
    ],
    "epub-to-pdf": [
        {"q": "Are images and formatting preserved?", "a": "Yes. Chapter headings, bold/italic text, embedded images, and basic CSS styling are preserved in the PDF output."},
        {"q": "Can I convert DRM-protected EPUBs?", "a": "No. DRM-protected e-books cannot be converted. The tool only works with DRM-free EPUB files."},
        {"q": "What page size options are available?", "a": "A4, Letter, and custom dimensions. The text is reflowed to fit the chosen page size while keeping chapter breaks."},
    ],
    "html-to-pdf": [
        {"q": "Can I convert a live website URL to PDF?", "a": "Yes. Enter any public URL and the server will render the page — including CSS, images, and JavaScript — and convert it to PDF."},
        {"q": "Is JavaScript rendered?", "a": "Yes. A headless browser executes JavaScript before capturing the page, so dynamically loaded content appears in the PDF."},
        {"q": "Are external stylesheets and images included?", "a": "Yes. The renderer fetches external CSS, web fonts, and images. Only resources behind authentication may not load."},
    ],
    "xml-to-pdf": [
        {"q": "What XML schemas are supported?", "a": "Any well-formed XML file is supported. The tool renders the structure as a readable tree or table — it does not apply XSL transforms."},
        {"q": "Is syntax highlighting included?", "a": "Yes. Element names, attributes, and values are color-coded for readability in the PDF output."},
        {"q": "Can I convert large XML files?", "a": "Files up to 100 MB are supported. Very deeply nested structures may produce many pages."},
    ],
    "csv-to-pdf": [
        {"q": "Does the tool auto-detect delimiters?", "a": "Yes. Comma, semicolon, tab, and pipe delimiters are automatically detected. You can also specify the delimiter manually."},
        {"q": "How are wide tables handled?", "a": "Wide tables can be rendered in landscape orientation. If they still exceed the page width, columns are scaled to fit or split across pages."},
        {"q": "Is the first row treated as a header?", "a": "By default yes — the first row is bolded as a header. You can disable this if your data has no header row."},
    ],
    "json-to-pdf": [
        {"q": "Is JSON validated before conversion?", "a": "Yes. The tool validates the JSON and shows a clear error message with the line number if the syntax is invalid."},
        {"q": "How are nested objects displayed?", "a": "Nested objects and arrays are indented with syntax highlighting. Collapsible sections are shown in the preview but expanded in the PDF."},
        {"q": "Can I convert JSON arrays into tables?", "a": "Yes. Arrays of objects with consistent keys are rendered as a table, with keys as column headers and each object as a row."},
    ],
    "pdf-to-word": [
        {"q": "How accurate is the PDF to Word conversion?", "a": "Text, images, and simple tables convert well. Complex multi-column layouts or heavily designed PDFs may need manual adjustments in Word."},
        {"q": "Can I convert scanned PDFs to Word?", "a": "Yes. Scanned PDFs go through OCR first to extract text, then the text is placed into a .docx file. Run OCR separately first for best results."},
        {"q": "What Word format is produced?", "a": "The output is a .docx file compatible with Microsoft Word 2007 and later, Google Docs, and LibreOffice Writer."},
    ],
    "pdf-to-excel": [
        {"q": "Does it convert the entire PDF or just tables?", "a": "The tool focuses on extracting tabular data. Each detected table becomes a separate sheet in the Excel file. Non-table text is not included."},
        {"q": "Can I choose which tables to extract?", "a": "Yes. Select specific pages, or let the tool auto-detect all tables in the document."},
        {"q": "What if my PDF has no visible table borders?", "a": "The tool can detect tables based on text alignment even without borders, but results are more reliable with clearly ruled tables."},
    ],
    "pdf-to-text": [
        {"q": "Is formatting preserved in the text output?", "a": "The tool extracts raw text only. Bold, italic, font sizes, and layout are not preserved — you get clean plain text."},
        {"q": "Can I extract text from a specific page range?", "a": "Yes. Specify page numbers or ranges to extract text from only the pages you need."},
        {"q": "How does it handle multi-column layouts?", "a": "The tool reads text in natural reading order. Two-column layouts are generally handled correctly, but complex magazine-style layouts may interleave columns."},
    ],
    "pdf-to-image": [
        {"q": "What DPI should I use?", "a": "150 DPI is good for on-screen viewing. Use 300 DPI for printing. Higher values like 600 DPI produce large files but maximum detail."},
        {"q": "Which image formats are available?", "a": "PNG (lossless, best for text-heavy pages), JPG (smaller files, good for photos), and WebP (modern format with excellent compression)."},
        {"q": "Can I convert just specific pages?", "a": "Yes. Enter individual page numbers or ranges (e.g. 1-3, 7) to convert only the pages you need."},
    ],
    "heic-to-jpg": [
        {"q": "Why can't I open HEIC files on my computer?", "a": "HEIC is Apple's default photo format since iOS 11. Windows and many web apps do not support it natively. Converting to JPG makes the images universally compatible."},
        {"q": "Is image quality lost during conversion?", "a": "At quality 90-100, the difference is imperceptible. Lower quality settings reduce file size with minimal visible degradation."},
        {"q": "Is EXIF data preserved?", "a": "Yes. Camera data, GPS location, and orientation are preserved by default. Use the Remove EXIF tool afterward if you want to strip metadata."},
    ],
    "remove-exif": [
        {"q": "What metadata is removed?", "a": "All EXIF, IPTC, and XMP metadata — including GPS coordinates, camera model, date/time, software used, and thumbnail previews."},
        {"q": "Does removing EXIF data change image quality?", "a": "No. Only the metadata bytes are removed. The actual image pixels are not re-encoded or modified in any way."},
        {"q": "Why should I remove EXIF data?", "a": "EXIF data can contain your GPS location, device identifiers, and timestamps. Removing it before sharing photos online protects your privacy."},
    ],
    "image-compressor": [
        {"q": "Is PNG compression lossless?", "a": "Yes. PNG compression in PrivaTools is lossless — the image quality is identical to the original, only the file size is reduced through better encoding."},
        {"q": "What compression ratio can I expect?", "a": "JPG images typically shrink 40-70% at quality 75. PNG images shrink 10-40% depending on content. Screenshots compress better than photographs."},
        {"q": "Can I batch-compress multiple images?", "a": "Yes. Upload multiple images at once and they are all compressed with the same settings. Download them together in a ZIP file."},
    ],
    "remove-background": [
        {"q": "What subjects work best?", "a": "People, animals, products, and objects with clear edges work best. The AI model handles hair, fur, and semi-transparent edges well."},
        {"q": "What is the output format?", "a": "The output is a PNG with a transparent background. You can also choose to replace the background with a solid color."},
        {"q": "Does it work on group photos?", "a": "Yes, but results vary. The model detects the primary foreground subject. Complex scenes with multiple overlapping people may need manual touch-up."},
    ],
    "video-to-gif": [
        {"q": "What is the maximum GIF duration?", "a": "There is no strict limit, but GIFs longer than 15-30 seconds can become very large. Keeping clips short produces better results."},
        {"q": "Can I control the file size?", "a": "Yes. Lower the frame rate (10 fps is usually enough), reduce the width, and shorten the duration to get smaller files."},
        {"q": "Which video formats are supported?", "a": "MP4, WebM, MOV, and AVI. The server uses FFmpeg, which supports virtually all common video codecs."},
    ],
    "compress-video": [
        {"q": "How much can a video be compressed?", "a": "Typical results are 30-70% size reduction at Medium compression. Raw or high-bitrate videos see the largest savings."},
        {"q": "Does compression change the video resolution?", "a": "No. The resolution stays the same by default. Only the bitrate is reduced. You can optionally lower the resolution for even smaller files."},
        {"q": "What output format is used?", "a": "The output is MP4 with H.264 encoding, which is universally compatible with all devices and browsers."},
    ],
    "trim-media": [
        {"q": "Can I trim audio files too?", "a": "Yes. The tool supports both audio (MP3, WAV, OGG, FLAC) and video (MP4, WebM, MOV, AVI) files."},
        {"q": "Is the trimmed file re-encoded?", "a": "When possible, the tool uses lossless cutting (no re-encoding) to preserve original quality. Some format combinations require re-encoding."},
        {"q": "How precise is the trimming?", "a": "Precision depends on the format. MP4 can be cut to the nearest keyframe (typically within 0.5 seconds). Re-encoded output is frame-accurate."},
    ],
    "base64": [
        {"q": "Can I encode files (not just text)?", "a": "Yes. Upload any file — images, PDFs, binaries — and the tool returns the Base64-encoded string. Useful for embedding files in JSON, HTML, or CSS."},
        {"q": "Is there a size limit for encoding?", "a": "Files up to 100 MB can be encoded. Keep in mind that Base64 output is approximately 33% larger than the original file."},
        {"q": "What character set is used?", "a": "Standard Base64 (RFC 4648) using A-Z, a-z, 0-9, +, and /. URL-safe Base64 (replacing + and / with - and _) is also available."},
    ],
    "text-diff": [
        {"q": "What diff algorithm is used?", "a": "The tool uses a line-by-line diff algorithm similar to Unix diff, highlighting additions, deletions, and modifications with color coding."},
        {"q": "Can I compare files directly?", "a": "Yes. Upload two text files instead of pasting. Supported formats include .txt, .csv, .json, .xml, .html, .css, .js, .py, and other plain-text formats."},
        {"q": "Is there a file size limit for comparison?", "a": "Each file can be up to 100 MB. Very large files may take a few seconds to process the diff."},
        {"q": "Can I compare code files?", "a": "Yes. The diff viewer works with any plain-text format. It highlights changes line by line, making it useful for comparing code, configs, or data files."},
    ],
}
