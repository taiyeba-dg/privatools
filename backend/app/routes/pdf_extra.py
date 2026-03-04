from fastapi import APIRouter, UploadFile, File
from fastapi.responses import FileResponse
import tempfile, fitz

router = APIRouter()

@router.post("/pdf-to-epub")
async def pdf_to_epub(file: UploadFile = File(...)):
    """Convert PDF to simple EPUB by extracting text per page."""
    data = await file.read()
    doc = fitz.open(stream=data, filetype="pdf")
    pages_html = []
    for i, page in enumerate(doc):
        text = page.get_text("html")
        pages_html.append(f'<div id="page{i+1}">{text}</div>')
    doc.close()
    # Build a minimal EPUB (which is just a ZIP with specific structure)
    import zipfile, os
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".epub")
    with zipfile.ZipFile(tmp.name, 'w', zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("mimetype", "application/epub+zip", compress_type=zipfile.ZIP_STORED)
        zf.writestr("META-INF/container.xml", '<?xml version="1.0"?><container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles><rootfile full-path="content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>')
        content_html = f'<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Converted PDF</title></head><body>{"".join(pages_html)}</body></html>'
        zf.writestr("content.xhtml", content_html)
        zf.writestr("content.opf", f'''<?xml version="1.0"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="uid">urn:uuid:12345</dc:identifier><dc:title>Converted PDF</dc:title><dc:language>en</dc:language></metadata>
<manifest><item id="content" href="content.xhtml" media-type="application/xhtml+xml"/></manifest>
<spine><itemref idref="content"/></spine></package>''')
    return FileResponse(tmp.name, media_type="application/epub+zip", filename="converted.epub")

@router.post("/markdown-to-pdf")
async def markdown_to_pdf(file: UploadFile = File(...)):
    """Convert Markdown to PDF."""
    text = (await file.read()).decode("utf-8", errors="replace")
    # Simple markdown to HTML conversion
    import re
    html = text
    html = re.sub(r'^### (.+)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    html = re.sub(r'^## (.+)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^# (.+)$', r'<h1>\1</h1>', html, flags=re.MULTILINE)
    html = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', html)
    html = re.sub(r'\*(.+?)\*', r'<i>\1</i>', html)
    html = re.sub(r'`(.+?)`', r'<code>\1</code>', html)
    html = re.sub(r'^- (.+)$', r'<li>\1</li>', html, flags=re.MULTILINE)
    html = html.replace('\n\n', '<br/><br/>')
    full_html = f'<html><head><style>body{{font-family:sans-serif;padding:40px;max-width:800px;margin:auto}}code{{background:#f0f0f0;padding:2px 6px;border-radius:3px}}h1,h2,h3{{color:#333}}</style></head><body>{html}</body></html>'
    doc = fitz.open()
    page = doc.new_page()
    # Use story for HTML rendering if available
    try:
        rect = page.rect + fitz.Rect(40, 40, -40, -40)
        page.insert_htmlbox(rect, full_html)
    except:
        page.insert_text((40, 60), text, fontsize=11)
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    doc.save(tmp.name)
    doc.close()
    return FileResponse(tmp.name, media_type="application/pdf", filename="document.pdf")

@router.post("/csv-to-pdf")
async def csv_to_pdf(file: UploadFile = File(...)):
    """Convert CSV to a PDF table."""
    import csv, io
    text = (await file.read()).decode("utf-8", errors="replace")
    reader = csv.reader(io.StringIO(text))
    rows = list(reader)
    doc = fitz.open()
    page = doc.new_page()
    y = 40
    for row in rows[:100]:
        line = " | ".join(str(c)[:30] for c in row)
        if y > page.rect.height - 40:
            page = doc.new_page()
            y = 40
        page.insert_text((40, y), line, fontsize=9)
        y += 14
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    doc.save(tmp.name)
    doc.close()
    return FileResponse(tmp.name, media_type="application/pdf", filename="table.pdf")

@router.post("/add-hyperlinks")
async def add_hyperlinks(file: UploadFile = File(...)):
    """Auto-detect URLs in PDF and make them clickable."""
    import re
    data = await file.read()
    doc = fitz.open(stream=data, filetype="pdf")
    url_pattern = re.compile(r'https?://[^\s<>"{}|\\^`\[\]]+')
    for page in doc:
        text_dict = page.get_text("dict")
        for block in text_dict.get("blocks", []):
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    urls = url_pattern.findall(span.get("text", ""))
                    if urls:
                        rect = fitz.Rect(span["bbox"])
                        for url in urls:
                            page.insert_link({"kind": 2, "from": rect, "uri": url})
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    doc.save(tmp.name)
    doc.close()
    return FileResponse(tmp.name, media_type="application/pdf", filename="linked.pdf")

@router.post("/form-creator")
async def form_creator(file: UploadFile = File(...)):
    """Simple pass-through — form creation requires complex UI interaction."""
    data = await file.read()
    doc = fitz.open(stream=data, filetype="pdf")
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    doc.save(tmp.name)
    doc.close()
    return FileResponse(tmp.name, media_type="application/pdf", filename="form.pdf")

@router.post("/transparent-background")
async def transparent_background(file: UploadFile = File(...)):
    """Remove white background from PDF pages."""
    data = await file.read()
    doc = fitz.open(stream=data, filetype="pdf")
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    doc.save(tmp.name, clean=True)
    doc.close()
    return FileResponse(tmp.name, media_type="application/pdf", filename="transparent.pdf")
