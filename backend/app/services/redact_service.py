import io
import json
import uuid
import pikepdf
from PIL import Image
from pdf2image import convert_from_path
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

    # Flatten: render to images at 300 DPI and rebuild PDF
    flat_path = _flatten_pdf(str(output_path))
    return flat_path


def _flatten_pdf(input_path: str) -> str:
    """Render each page as an image and reconstruct to make redactions permanent."""
    ensure_temp_dir()
    output_path = get_temp_path(f"flat_{uuid.uuid4().hex}.pdf")

    images = convert_from_path(input_path, dpi=300)
    if not images:
        return input_path

    first = images[0]
    rest = images[1:] if len(images) > 1 else []
    first.save(
        str(output_path),
        "PDF",
        resolution=300,
        save_all=True,
        append_images=rest,
    )
    return str(output_path)
