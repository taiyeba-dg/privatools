import pikepdf
import uuid
import io
from ..utils.cleanup import get_temp_path, ensure_temp_dir
from reportlab.pdfgen import canvas
from reportlab.lib.colors import Color


def add_watermark(
    input_path: str,
    text: str,
    opacity: float = 0.3,
    font_size: int = 40,
    position: str = "center",
) -> str:
    ensure_temp_dir()
    output_path = get_temp_path(f"watermarked_{uuid.uuid4().hex}.pdf")

    with pikepdf.open(input_path) as pdf:
        for page in pdf.pages:
            mediabox = page.mediabox
            width = float(mediabox[2]) - float(mediabox[0])
            height = float(mediabox[3]) - float(mediabox[1])

            packet = io.BytesIO()
            c = canvas.Canvas(packet, pagesize=(width, height))
            c.setFillColor(Color(0.5, 0.5, 0.5, alpha=opacity))
            c.setFont("Helvetica", font_size)

            if position == "center":
                c.saveState()
                c.translate(width / 2, height / 2)
                c.rotate(45)
                c.drawCentredString(0, 0, text)
                c.restoreState()
            elif position == "top":
                c.drawCentredString(width / 2, height - font_size - 10, text)
            elif position == "bottom":
                c.drawCentredString(width / 2, 10, text)
            elif position == "top-left":
                c.drawString(10, height - font_size - 10, text)
            elif position == "top-right":
                c.drawRightString(width - 10, height - font_size - 10, text)
            elif position == "bottom-left":
                c.drawString(10, 10, text)
            elif position == "bottom-right":
                c.drawRightString(width - 10, 10, text)
            elif position == "diagonal":
                c.saveState()
                c.translate(width / 2, height / 2)
                c.rotate(45)
                c.drawCentredString(0, 0, text)
                c.restoreState()
            elif position == "tile":
                c.saveState()
                for tx in range(0, int(width), int(font_size * len(text) * 0.7)):
                    for ty in range(0, int(height), int(font_size * 3)):
                        c.saveState()
                        c.translate(tx, ty)
                        c.rotate(45)
                        c.drawString(0, 0, text)
                        c.restoreState()
                c.restoreState()

            c.save()
            packet.seek(0)

            watermark_pdf = pikepdf.Pdf.open(packet)
            watermark_page = watermark_pdf.pages[0]

            page_obj = pikepdf.Page(page)
            page_obj.add_overlay(watermark_page)

        pdf.save(str(output_path))
    return str(output_path)
