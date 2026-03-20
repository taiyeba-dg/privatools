"""
Sitemap endpoint — generates sitemap.xml dynamically for all tool pages.
"""
from datetime import date
from fastapi import APIRouter
from fastapi.responses import Response

router = APIRouter()

# All tool slugs — must match frontend routes exactly
PDF_TOOLS = [
    "merge-pdf", "split-pdf", "split-by-bookmarks", "split-by-size",
    "organize-pages", "delete-pages", "extract-pages",
    "edit-pdf", "sign-pdf", "watermark", "header-footer",
    "page-numbers", "bates-numbering", "bookmarks",
    "compress-pdf", "flatten-pdf", "deskew-pdf", "repair-pdf",
    "resize-pdf", "rotate-pdf", "grayscale-pdf", "crop-pdf",
    "protect-pdf", "unlock-pdf", "redact-pdf", "strip-metadata",
    "delete-annotations", "metadata",
    "html-to-pdf", "image-to-pdf", "office-to-pdf",
    "pdf-to-excel", "pdf-to-image", "pdf-to-pptx", "pdf-to-text", "pdf-to-word",
    "alternate-mix", "compare-pdf", "extract-images", "fill-form",
    "nup", "ocr-pdf", "overlay", "qr-code", "pdf-to-pdfa",
    "remove-blank-pages", "auto-crop",
    "pdf-to-epub", "markdown-to-pdf", "csv-to-pdf",
    "invert-colors", "pdfa-validator", "verify-signature",
    "sanitize-pdf", "add-hyperlinks", "form-creator",
    "transparent-background", "stamp-pdf", "e-sign-pdf",
    "word-to-pdf", "excel-to-pdf", "pptx-to-pdf-convert",
    "txt-to-pdf", "json-to-pdf", "xml-to-pdf", "epub-to-pdf", "rtf-to-pdf",
    "extract-tables", "pdf-to-markdown",
    "whiteout-pdf", "annotate-pdf", "add-shapes",
    "set-permissions", "add-attachment",
    "reverse-pdf", "booklet-pdf",
]

NON_PDF_TOOLS = [
    "image-compressor", "image-converter", "remove-exif", "resize-crop-image",
    "video-to-gif", "image-ocr",
    "extract-audio", "trim-media", "compress-video",
    "json-xml-formatter", "text-diff", "base64", "hash-generator",
    "extract-archive", "create-zip",
    "csv-json", "markdown-html", "heic-to-jpg",
    "remove-background", "svg-to-png", "image-watermark",
    "generate-favicon", "make-collage", "generate-barcode",
    "url-to-pdf", "qr-reader", "merge-images",
]

BASE_URL = "https://privatools.me"


@router.get("/sitemap.xml")
async def sitemap():
    today = date.today().isoformat()

    entries = [
        (BASE_URL, "1.0", "daily"),
        (f"{BASE_URL}/about", "0.6", "monthly"),
        (f"{BASE_URL}/batch", "0.7", "weekly"),
        (f"{BASE_URL}/pipeline", "0.7", "weekly"),
        (f"{BASE_URL}/compare", "0.7", "monthly"),
        (f"{BASE_URL}/compare/ilovepdf", "0.8", "monthly"),
        (f"{BASE_URL}/compare/smallpdf", "0.8", "monthly"),
        (f"{BASE_URL}/compare/adobe-acrobat", "0.8", "monthly"),
    ]

    for slug in PDF_TOOLS:
        entries.append((f"{BASE_URL}/tool/{slug}", "0.8", "weekly"))
    for slug in NON_PDF_TOOLS:
        entries.append((f"{BASE_URL}/tools/{slug}", "0.8", "weekly"))

    xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    for url, priority, changefreq in entries:
        xml += f"  <url>\n"
        xml += f"    <loc>{url}</loc>\n"
        xml += f"    <lastmod>{today}</lastmod>\n"
        xml += f"    <changefreq>{changefreq}</changefreq>\n"
        xml += f"    <priority>{priority}</priority>\n"
        xml += f"  </url>\n"
    xml += "</urlset>"

    return Response(content=xml, media_type="application/xml")
