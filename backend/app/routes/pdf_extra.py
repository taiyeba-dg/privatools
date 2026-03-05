import csv
import io
import json
import logging
import re
import tempfile
import zipfile

import fitz
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from PIL import Image
from starlette.background import BackgroundTask

from ..utils.cleanup import remove_files, validate_pdf_content

router = APIRouter()
logger = logging.getLogger(__name__)

MAX_PDF_BYTES = 50 * 1024 * 1024
MAX_TEXT_BYTES = 5 * 1024 * 1024
MAX_FORM_FIELDS = 300
MAX_FORM_OPTIONS = 50


async def _read_upload(file: UploadFile, max_bytes: int, label: str) -> bytes:
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail=f"{label} is empty")
    if len(data) > max_bytes:
        raise HTTPException(status_code=413, detail=f"{label} exceeds size limit")
    return data


def _open_pdf(data: bytes) -> fitz.Document:
    try:
        return fitz.open(stream=data, filetype="pdf")
    except fitz.FileDataError as exc:
        raise HTTPException(status_code=400, detail="Invalid or corrupted PDF") from exc


def _new_temp_file(suffix: str) -> tempfile.NamedTemporaryFile:
    return tempfile.NamedTemporaryFile(delete=False, suffix=suffix)


def _to_float(value: object, label: str) -> float:
    try:
        return float(value)
    except (TypeError, ValueError) as exc:
        raise HTTPException(status_code=400, detail=f"{label} must be a number") from exc


def _to_int(value: object, label: str) -> int:
    try:
        return int(value)
    except (TypeError, ValueError) as exc:
        raise HTTPException(status_code=400, detail=f"{label} must be an integer") from exc


def _parse_form_fields(raw: str) -> list[dict]:
    if not (raw or "").strip():
        raise HTTPException(status_code=400, detail="form_fields is required")
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="form_fields must be valid JSON") from exc

    if not isinstance(parsed, list):
        raise HTTPException(status_code=400, detail="form_fields must be a JSON array")
    if not parsed:
        raise HTTPException(status_code=400, detail="form_fields must contain at least one field")
    if len(parsed) > MAX_FORM_FIELDS:
        raise HTTPException(status_code=400, detail=f"form_fields cannot exceed {MAX_FORM_FIELDS} items")

    normalized: list[dict] = []
    for idx, item in enumerate(parsed, start=1):
        if not isinstance(item, dict):
            raise HTTPException(status_code=400, detail=f"Field #{idx} must be an object")

        name = str(item.get("name", "")).strip()
        if not name:
            raise HTTPException(status_code=400, detail=f"Field #{idx} name is required")
        if len(name) > 80:
            raise HTTPException(status_code=400, detail=f"Field #{idx} name must be <= 80 characters")

        field_type = str(item.get("type", "text")).strip().lower()
        if field_type not in {"text", "checkbox", "radio", "combobox", "listbox", "signature"}:
            raise HTTPException(status_code=400, detail=f"Field #{idx} has unsupported type '{field_type}'")

        page = _to_int(item.get("page", 1), f"Field #{idx} page")
        x = _to_float(item.get("x"), f"Field #{idx} x")
        y = _to_float(item.get("y"), f"Field #{idx} y")
        width = _to_float(item.get("width"), f"Field #{idx} width")
        height = _to_float(item.get("height"), f"Field #{idx} height")
        if page < 1:
            raise HTTPException(status_code=400, detail=f"Field #{idx} page must be >= 1")
        if width <= 0 or height <= 0:
            raise HTTPException(status_code=400, detail=f"Field #{idx} width/height must be > 0")

        field_data: dict[str, object] = {
            "name": name,
            "type": field_type,
            "page": page,
            "x": x,
            "y": y,
            "width": width,
            "height": height,
            "required": bool(item.get("required", False)),
        }

        if field_type == "text":
            field_data["value"] = str(item.get("value", ""))
            field_data["multiline"] = bool(item.get("multiline", False))
        elif field_type == "checkbox":
            field_data["checked"] = bool(item.get("checked", False))
        elif field_type in {"combobox", "listbox", "radio"}:
            raw_options = item.get("options", [])
            if isinstance(raw_options, str):
                options = [o.strip() for o in raw_options.split(",") if o.strip()]
            elif isinstance(raw_options, list):
                options = [str(o).strip() for o in raw_options if str(o).strip()]
            else:
                options = []
            if not options:
                raise HTTPException(status_code=400, detail=f"Field #{idx} options are required for {field_type}")
            if len(options) > MAX_FORM_OPTIONS:
                raise HTTPException(status_code=400, detail=f"Field #{idx} options cannot exceed {MAX_FORM_OPTIONS}")
            field_data["options"] = options
            field_data["value"] = str(item.get("value", options[0]))

        normalized.append(field_data)

    return normalized


@router.post("/pdf-to-epub")
async def pdf_to_epub(file: UploadFile = File(...)):
    """Convert PDF to simple EPUB by extracting text per page."""
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a PDF file")

    data = await _read_upload(file, MAX_PDF_BYTES, "PDF")
    validate_pdf_content(data)

    doc = None
    tmp = None
    try:
        doc = _open_pdf(data)
        pages_html: list[str] = []
        for i, page in enumerate(doc):
            text = page.get_text("html")
            pages_html.append(f'<div id="page{i + 1}">{text}</div>')

        tmp = _new_temp_file(".epub")
        tmp.close()
        with zipfile.ZipFile(tmp.name, "w", zipfile.ZIP_DEFLATED) as archive:
            archive.writestr("mimetype", "application/epub+zip", compress_type=zipfile.ZIP_STORED)
            archive.writestr(
                "META-INF/container.xml",
                '<?xml version="1.0"?><container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles><rootfile full-path="content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>',
            )
            content_html = f'<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Converted PDF</title></head><body>{"".join(pages_html)}</body></html>'
            archive.writestr("content.xhtml", content_html)
            archive.writestr(
                "content.opf",
                """<?xml version="1.0"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="uid">urn:uuid:12345</dc:identifier><dc:title>Converted PDF</dc:title><dc:language>en</dc:language></metadata>
<manifest><item id="content" href="content.xhtml" media-type="application/xhtml+xml"/></manifest>
<spine><itemref idref="content"/></spine>
</package>""",
            )

        cleanup = BackgroundTask(remove_files, tmp.name)
        return FileResponse(tmp.name, media_type="application/epub+zip", filename="converted.epub", background=cleanup)
    except HTTPException:
        if tmp is not None:
            remove_files(tmp.name)
        raise
    except Exception as exc:
        if tmp is not None:
            remove_files(tmp.name)
        logger.exception("pdf-to-epub error")
        raise HTTPException(status_code=500, detail="PDF to EPUB conversion failed") from exc
    finally:
        if doc is not None:
            doc.close()


@router.post("/markdown-to-pdf")
async def markdown_to_pdf(file: UploadFile = File(...)):
    """Convert Markdown-like text to PDF."""
    raw = await _read_upload(file, MAX_TEXT_BYTES, "Input file")
    text = raw.decode("utf-8", errors="replace")

    html = text
    html = re.sub(r"^### (.+)$", r"<h3>\1</h3>", html, flags=re.MULTILINE)
    html = re.sub(r"^## (.+)$", r"<h2>\1</h2>", html, flags=re.MULTILINE)
    html = re.sub(r"^# (.+)$", r"<h1>\1</h1>", html, flags=re.MULTILINE)
    html = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", html)
    html = re.sub(r"\*(.+?)\*", r"<i>\1</i>", html)
    html = re.sub(r"`(.+?)`", r"<code>\1</code>", html)
    html = re.sub(r"^- (.+)$", r"<li>\1</li>", html, flags=re.MULTILINE)
    html = html.replace("\n\n", "<br/><br/>")

    full_html = (
        "<html><head><style>"
        "body{font-family:sans-serif;padding:40px;max-width:800px;margin:auto}"
        "code{background:#f0f0f0;padding:2px 6px;border-radius:3px}"
        "h1,h2,h3{color:#333}"
        "</style></head><body>"
        f"{html}</body></html>"
    )

    doc = fitz.open()
    tmp = None
    try:
        page = doc.new_page()
        try:
            rect = page.rect + fitz.Rect(40, 40, -40, -40)
            page.insert_htmlbox(rect, full_html)
        except Exception:
            page.insert_text((40, 60), text, fontsize=11)

        tmp = _new_temp_file(".pdf")
        tmp.close()
        doc.save(tmp.name)

        cleanup = BackgroundTask(remove_files, tmp.name)
        return FileResponse(tmp.name, media_type="application/pdf", filename="document.pdf", background=cleanup)
    except Exception as exc:
        if tmp is not None:
            remove_files(tmp.name)
        logger.exception("markdown-to-pdf error")
        raise HTTPException(status_code=500, detail="Markdown to PDF conversion failed") from exc
    finally:
        doc.close()


@router.post("/csv-to-pdf")
async def csv_to_pdf(file: UploadFile = File(...)):
    """Convert CSV to a PDF table."""
    raw = await _read_upload(file, MAX_TEXT_BYTES, "CSV file")
    text = raw.decode("utf-8", errors="replace")

    reader = csv.reader(io.StringIO(text))
    rows = list(reader)

    doc = fitz.open()
    tmp = None
    try:
        page = doc.new_page()
        y = 40
        for row in rows[:100]:
            line = " | ".join(str(cell)[:30] for cell in row)
            if y > page.rect.height - 40:
                page = doc.new_page()
                y = 40
            page.insert_text((40, y), line, fontsize=9)
            y += 14

        tmp = _new_temp_file(".pdf")
        tmp.close()
        doc.save(tmp.name)

        cleanup = BackgroundTask(remove_files, tmp.name)
        return FileResponse(tmp.name, media_type="application/pdf", filename="table.pdf", background=cleanup)
    except Exception as exc:
        if tmp is not None:
            remove_files(tmp.name)
        logger.exception("csv-to-pdf error")
        raise HTTPException(status_code=500, detail="CSV to PDF conversion failed") from exc
    finally:
        doc.close()


@router.post("/add-hyperlinks")
async def add_hyperlinks(file: UploadFile = File(...)):
    """Auto-detect URLs in a PDF and make them clickable."""
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a PDF file")

    data = await _read_upload(file, MAX_PDF_BYTES, "PDF")
    validate_pdf_content(data)

    doc = None
    tmp = None
    try:
        doc = _open_pdf(data)
        url_pattern = re.compile(r"https?://[^\s<>\"{}|\\^`\[\]]+")

        for page in doc:
            text_dict = page.get_text("dict")
            for block in text_dict.get("blocks", []):
                for line in block.get("lines", []):
                    for span in line.get("spans", []):
                        urls = url_pattern.findall(span.get("text", ""))
                        if not urls:
                            continue
                        rect = fitz.Rect(span["bbox"])
                        for url in urls:
                            page.insert_link({"kind": 2, "from": rect, "uri": url})

        tmp = _new_temp_file(".pdf")
        tmp.close()
        doc.save(tmp.name)

        cleanup = BackgroundTask(remove_files, tmp.name)
        return FileResponse(tmp.name, media_type="application/pdf", filename="linked.pdf", background=cleanup)
    except HTTPException:
        if tmp is not None:
            remove_files(tmp.name)
        raise
    except Exception as exc:
        if tmp is not None:
            remove_files(tmp.name)
        logger.exception("add-hyperlinks error")
        raise HTTPException(status_code=500, detail="Failed to add hyperlinks") from exc
    finally:
        if doc is not None:
            doc.close()


@router.post("/form-creator")
async def form_creator(
    file: UploadFile = File(...),
    form_fields: str = Form(...),
):
    """Create fillable form fields in an existing PDF."""
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a PDF file")

    fields = _parse_form_fields(form_fields)
    data = await _read_upload(file, MAX_PDF_BYTES, "PDF")
    validate_pdf_content(data)

    doc = None
    tmp = None
    try:
        doc = _open_pdf(data)
        if len(doc) == 0:
            raise HTTPException(status_code=400, detail="PDF has no pages")

        seen_non_radio_names: set[str] = set()
        for idx, field in enumerate(fields, start=1):
            page_index = int(field["page"]) - 1
            if page_index < 0 or page_index >= len(doc):
                raise HTTPException(status_code=400, detail=f"Field #{idx} references page {field['page']} but PDF has {len(doc)} pages")

            name = str(field["name"]).strip()
            field_type = str(field["type"])
            if field_type != "radio" and name in seen_non_radio_names:
                raise HTTPException(status_code=400, detail=f"Duplicate field name '{name}' is not allowed")
            if field_type != "radio":
                seen_non_radio_names.add(name)

            page = doc[page_index]
            rect = fitz.Rect(
                float(field["x"]),
                float(field["y"]),
                float(field["x"]) + float(field["width"]),
                float(field["y"]) + float(field["height"]),
            )
            if not page.rect.contains(rect):
                raise HTTPException(status_code=400, detail=f"Field '{name}' rectangle is out of page bounds")

            widget = fitz.Widget()
            widget.field_name = name
            widget.field_label = name
            widget.rect = rect
            widget.text_font = "Helv"
            widget.text_fontsize = 11
            widget.field_flags = 0
            if bool(field.get("required")):
                widget.field_flags |= (1 << 1)

            if field_type == "text":
                widget.field_type = fitz.PDF_WIDGET_TYPE_TEXT
                widget.field_value = str(field.get("value", ""))
                if bool(field.get("multiline", False)):
                    widget.field_flags |= (1 << 12)
            elif field_type == "checkbox":
                widget.field_type = fitz.PDF_WIDGET_TYPE_CHECKBOX
                widget.field_value = "Yes" if bool(field.get("checked", False)) else "Off"
            elif field_type == "radio":
                options = [str(o).strip() for o in field.get("options", []) if str(o).strip()]
                widget.field_type = fitz.PDF_WIDGET_TYPE_RADIOBUTTON
                widget.button_caption = options[0] if options else "Option"
                widget.field_value = str(field.get("value", widget.button_caption))
            elif field_type == "combobox":
                widget.field_type = fitz.PDF_WIDGET_TYPE_COMBOBOX
                widget.choice_values = [str(o) for o in field.get("options", [])]
                widget.field_value = str(field.get("value", ""))
            elif field_type == "listbox":
                widget.field_type = fitz.PDF_WIDGET_TYPE_LISTBOX
                widget.choice_values = [str(o) for o in field.get("options", [])]
                widget.field_value = str(field.get("value", ""))
            elif field_type == "signature":
                widget.field_type = fitz.PDF_WIDGET_TYPE_SIGNATURE
            else:
                raise HTTPException(status_code=400, detail=f"Unsupported field type: {field_type}")

            page.add_widget(widget)

        try:
            doc.need_appearances(True)
        except Exception:
            pass
        tmp = _new_temp_file(".pdf")
        tmp.close()
        doc.save(tmp.name)

        cleanup = BackgroundTask(remove_files, tmp.name)
        return FileResponse(tmp.name, media_type="application/pdf", filename="form.pdf", background=cleanup)
    except HTTPException:
        if tmp is not None:
            remove_files(tmp.name)
        raise
    except Exception as exc:
        if tmp is not None:
            remove_files(tmp.name)
        logger.exception("form-creator error")
        raise HTTPException(status_code=500, detail="Form creation failed") from exc
    finally:
        if doc is not None:
            doc.close()


@router.post("/transparent-background")
async def transparent_background(
    file: UploadFile = File(...),
    threshold: int = Form(245, ge=180, le=255),
    dpi: int = Form(144, ge=72, le=300),
):
    """Convert near-white pixels to transparent by rasterizing each page."""
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a PDF file")

    data = await _read_upload(file, MAX_PDF_BYTES, "PDF")
    validate_pdf_content(data)

    src_doc = None
    out_doc = None
    tmp = None
    try:
        src_doc = _open_pdf(data)
        if len(src_doc) == 0:
            raise HTTPException(status_code=400, detail="PDF has no pages")

        out_doc = fitz.open()
        matrix = fitz.Matrix(dpi / 72, dpi / 72)

        for page in src_doc:
            pix = page.get_pixmap(matrix=matrix, alpha=False)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            rgba = img.convert("RGBA")
            rgb_data = list(img.getdata())
            rgba_data = [
                (r, g, b, 0 if (r >= threshold and g >= threshold and b >= threshold) else 255)
                for (r, g, b) in rgb_data
            ]
            rgba.putdata(rgba_data)

            png_bytes = io.BytesIO()
            rgba.save(png_bytes, format="PNG", optimize=True)

            out_page = out_doc.new_page(width=page.rect.width, height=page.rect.height)
            out_page.insert_image(out_page.rect, stream=png_bytes.getvalue())

        tmp = _new_temp_file(".pdf")
        tmp.close()
        out_doc.save(tmp.name, deflate=True, clean=True)

        cleanup = BackgroundTask(remove_files, tmp.name)
        return FileResponse(tmp.name, media_type="application/pdf", filename="transparent.pdf", background=cleanup)
    except HTTPException:
        if tmp is not None:
            remove_files(tmp.name)
        raise
    except Exception as exc:
        if tmp is not None:
            remove_files(tmp.name)
        logger.exception("transparent-background error")
        raise HTTPException(status_code=500, detail="Transparent background conversion failed") from exc
    finally:
        if src_doc is not None:
            src_doc.close()
        if out_doc is not None:
            out_doc.close()
