import io
import json
import uuid
import fitz  # PyMuPDF
import pikepdf
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def _hex_to_color(hex_color: str):
    try:
        return HexColor(hex_color)
    except Exception:
        return HexColor("#000000")


def redact_pdf(input_path: str, redactions: list, color: str = "#000000") -> str:
    ensure_temp_dir()
    output_path = get_temp_path(f"redacted_{uuid.uuid4().hex}.pdf")

    fill_color = _hex_to_color(color)

    with pikepdf.open(input_path) as pdf:
        page_count = len(pdf.pages)

        # Group redactions by page
        by_page: dict[int, list] = {}
        for r in redactions:
            pg = int(r.get("page", 1))
            by_page.setdefault(pg, []).append(r)

        for pg_num, rects in by_page.items():
            pg_idx = pg_num - 1
            if pg_idx < 0 or pg_idx >= page_count:
                continue
            page = pdf.pages[pg_idx]
            mediabox = page.mediabox
            pg_width = float(mediabox[2]) - float(mediabox[0])
            pg_height = float(mediabox[3]) - float(mediabox[1])

            packet = io.BytesIO()
            c = canvas.Canvas(packet, pagesize=(pg_width, pg_height))
            c.setFillColor(fill_color)
            c.setStrokeColor(fill_color)
            for r in rects:
                rx = float(r.get("x", 0))
                ry = float(r.get("y", 0))
                rw = float(r.get("width", 10))
                rh = float(r.get("height", 10))
                c.rect(rx, ry, rw, rh, stroke=0, fill=1)
            c.save()
            packet.seek(0)

            overlay_pdf = pikepdf.Pdf.open(packet)
            pikepdf.Page(page).add_overlay(overlay_pdf.pages[0])

        pdf.save(str(output_path))

    # Flatten using PyMuPDF (fast, no pdf2image/poppler)
    flat_path = _flatten_pdf(str(output_path))
    return flat_path


def _flatten_pdf(input_path: str) -> str:
    """Flatten redacted PDF using PyMuPDF — much faster than pdf2image at 300 DPI."""
    ensure_temp_dir()
    output_path = get_temp_path(f"flat_{uuid.uuid4().hex}.pdf")

    src = fitz.open(input_path)
    dst = fitz.open()

    for page in src:
        # Render at 150 DPI (sufficient for redaction flattening)
        mat = fitz.Matrix(150 / 72, 150 / 72)
        pix = page.get_pixmap(matrix=mat)
        new_page = dst.new_page(width=page.rect.width, height=page.rect.height)
        new_page.insert_image(new_page.rect, pixmap=pix)

    if len(dst) == 0:
        src.close()
        return input_path

    dst.save(str(output_path), garbage=4, deflate=True)
    dst.close()
    src.close()

    return str(output_path)
