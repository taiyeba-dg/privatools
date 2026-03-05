import base64
import io
import uuid
import pikepdf
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.utils import ImageReader
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def _hex_to_rgb(hex_color: str):
    """Return (r, g, b) floats in 0-1 range from a hex color string."""
    hex_color = hex_color.lstrip("#")
    if len(hex_color) == 3:
        hex_color = "".join(c * 2 for c in hex_color)
    r = int(hex_color[0:2], 16) / 255
    g = int(hex_color[2:4], 16) / 255
    b = int(hex_color[4:6], 16) / 255
    return r, g, b


def edit_pdf(input_path: str, edits: list) -> str:
    ensure_temp_dir()
    output_path = get_temp_path(f"edited_{uuid.uuid4().hex}.pdf")

    # Group edits by page number
    by_page: dict[int, list] = {}
    for edit in edits:
        pg = int(edit.get("page", 1))
        by_page.setdefault(pg, []).append(edit)

    with pikepdf.open(input_path) as pdf:
        page_count = len(pdf.pages)

        for pg_num, page_edits in by_page.items():
            pg_idx = pg_num - 1
            if pg_idx < 0 or pg_idx >= page_count:
                continue

            page = pdf.pages[pg_idx]
            mediabox = page.mediabox
            pg_width = float(mediabox[2]) - float(mediabox[0])
            pg_height = float(mediabox[3]) - float(mediabox[1])

            packet = io.BytesIO()
            c = canvas.Canvas(packet, pagesize=(pg_width, pg_height))

            temp_images = []
            for edit in page_edits:
                edit_type = edit.get("type", "")

                if edit_type == "text":
                    text = edit.get("text", "")
                    tx = float(edit.get("x", 0))
                    ty = float(edit.get("y", 0))
                    font_size = float(edit.get("font_size", 12))
                    font_family = edit.get("font_family", "Helvetica")
                    color = edit.get("color", "#000000")
                    r, g, b = _hex_to_rgb(color)
                    c.setFillColor(Color(r, g, b))
                    try:
                        c.setFont(font_family, font_size)
                    except KeyError:
                        c.setFont("Helvetica", font_size)
                    c.drawString(tx, ty, text)

                elif edit_type == "rectangle":
                    rx = float(edit.get("x", 0))
                    ry = float(edit.get("y", 0))
                    rw = float(edit.get("width", 100))
                    rh = float(edit.get("height", 50))
                    stroke_color = edit.get("stroke_color", "#000000")
                    fill_color = edit.get("fill_color", "")
                    stroke_width = float(edit.get("stroke_width", 1))
                    sr, sg, sb = _hex_to_rgb(stroke_color)
                    c.setStrokeColor(Color(sr, sg, sb))
                    c.setLineWidth(stroke_width)
                    do_fill = 0
                    if fill_color:
                        fr, fg, fb = _hex_to_rgb(fill_color)
                        c.setFillColor(Color(fr, fg, fb))
                        do_fill = 1
                    c.rect(rx, ry, rw, rh, stroke=1, fill=do_fill)

                elif edit_type == "circle":
                    cx = float(edit.get("x", 0))
                    cy = float(edit.get("y", 0))
                    radius = float(edit.get("radius", 50))
                    stroke_color = edit.get("stroke_color", "#000000")
                    fill_color = edit.get("fill_color", "")
                    stroke_width = float(edit.get("stroke_width", 1))
                    sr, sg, sb = _hex_to_rgb(stroke_color)
                    c.setStrokeColor(Color(sr, sg, sb))
                    c.setLineWidth(stroke_width)
                    do_fill = 0
                    if fill_color:
                        fr, fg, fb = _hex_to_rgb(fill_color)
                        c.setFillColor(Color(fr, fg, fb))
                        do_fill = 1
                    c.circle(cx, cy, radius, stroke=1, fill=do_fill)

                elif edit_type == "line":
                    x1 = float(edit.get("x1", 0))
                    y1 = float(edit.get("y1", 0))
                    x2 = float(edit.get("x2", 100))
                    y2 = float(edit.get("y2", 0))
                    color = edit.get("color", "#000000")
                    stroke_width = float(edit.get("stroke_width", 1))
                    r, g, b = _hex_to_rgb(color)
                    c.setStrokeColor(Color(r, g, b))
                    c.setLineWidth(stroke_width)
                    c.line(x1, y1, x2, y2)

                elif edit_type == "highlight":
                    hx = float(edit.get("x", 0))
                    hy = float(edit.get("y", 0))
                    hw = float(edit.get("width", 100))
                    hh = float(edit.get("height", 20))
                    color = edit.get("color", "#FFFF00")
                    opacity = float(edit.get("opacity", 0.4))
                    r, g, b = _hex_to_rgb(color)
                    c.setFillColor(Color(r, g, b, alpha=opacity))
                    c.rect(hx, hy, hw, hh, stroke=0, fill=1)

                elif edit_type == "image":
                    img_x = float(edit.get("x", 0))
                    img_y = float(edit.get("y", 0))
                    img_w = float(edit.get("width", 100))
                    img_h = float(edit.get("height", 100))
                    image_data = edit.get("image_data", "")
                    if image_data:
                        if image_data.startswith("data:"):
                            _, encoded = image_data.split(",", 1)
                        else:
                            encoded = image_data
                        img_bytes = base64.b64decode(encoded)
                        img_path = get_temp_path(f"img_{uuid.uuid4().hex}.png")
                        img_path.write_bytes(img_bytes)
                        temp_images.append(img_path)
                        c.drawImage(
                            ImageReader(str(img_path)),
                            img_x, img_y,
                            width=img_w, height=img_h,
                            mask="auto",
                        )

            c.save()
            packet.seek(0)

            overlay_pdf = pikepdf.Pdf.open(packet)
            if len(overlay_pdf.pages) > 0:
                pikepdf.Page(page).add_overlay(overlay_pdf.pages[0])

        pdf.save(str(output_path))

    return str(output_path)
