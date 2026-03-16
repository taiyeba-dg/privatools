"""
Sitemap endpoint — generates sitemap.xml dynamically for all tool pages.
"""
from fastapi import APIRouter
from fastapi.responses import Response

router = APIRouter()

# All tool slugs
PDF_TOOLS = [
    "merge-pdf", "split-pdf", "compress", "protect-pdf", "unlock-pdf", "rotate-pdf",
    "watermark", "page-numbers", "header-footer", "bates-numbering",
    "pdf-to-image", "image-to-pdf", "pdf-to-word", "pdf-to-text", "pdf-to-excel",
    "pdf-to-pptx", "pdf-to-pdfa", "html-to-pdf", "office-to-pdf",
    "extract-pages", "delete-pages", "organize-pages", "crop-pdf", "resize-pdf",
    "flatten-pdf", "grayscale-pdf", "deskew-pdf", "edit-pdf", "fill-form",
    "metadata", "strip-metadata", "delete-annotations", "repair-pdf",
    "redact-pdf", "sign-pdf", "ocr", "compare-pdf", "alternate-mix",
    "overlay-pdf", "nup-pdf", "qr-code", "bookmarks",
    "extract-images", "split-by-bookmarks", "split-by-size",
    "remove-blank-pages", "auto-crop", "invert-colors", "pdfa-validator",
    "verify-signature", "sanitize-pdf", "pdf-to-epub", "markdown-to-pdf",
    "csv-to-pdf", "add-hyperlinks", "form-creator", "transparent-background",
    "stamp-pdf", "e-sign-pdf", "word-to-pdf", "excel-to-pdf",
    "pptx-to-pdf", "txt-to-pdf", "heic-to-jpg", "extract-tables",
    "remove-background", "pdf-to-markdown", "svg-to-png",
    "barcode-generator", "image-watermark", "favicon-generator",
    "collage-maker", "url-to-pdf",
    "whiteout-pdf", "annotate-pdf", "add-shapes",
    "set-permissions", "add-attachment",
    "json-to-pdf", "xml-to-pdf", "epub-to-pdf", "rtf-to-pdf",
    "reverse-pdf", "booklet-pdf",
]

NON_PDF_TOOLS = [
    "image-compressor", "image-converter", "remove-exif", "resize-crop-image",
    "video-to-gif", "extract-audio", "trim-media", "compress-video",
    "extract-archive", "create-zip", "json-xml-formatter", "text-diff",
    "base64", "hash-generator", "csv-json", "markdown-html", "image-ocr",
    "qr-reader", "merge-images",
]

BASE_URL = "https://privatools.me"


@router.get("/sitemap.xml")
async def sitemap():
    urls = [BASE_URL, f"{BASE_URL}/about", f"{BASE_URL}/batch", f"{BASE_URL}/pipeline"]
    for slug in PDF_TOOLS:
        urls.append(f"{BASE_URL}/tool/{slug}")
    for slug in NON_PDF_TOOLS:
        urls.append(f"{BASE_URL}/tools/{slug}")

    xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    for url in urls:
        xml += f"  <url><loc>{url}</loc><changefreq>weekly</changefreq></url>\n"
    xml += "</urlset>"

    return Response(content=xml, media_type="application/xml")
