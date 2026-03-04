import pikepdf
import uuid
import io
from ..utils.cleanup import get_temp_path, ensure_temp_dir
from reportlab.pdfgen import canvas
from reportlab.lib.colors import black


def add_page_numbers(
    input_path: str,
    position: str = "bottom-center",
    start_number: int = 1,
    font_size: int = 12,
) -> str:
    ensure_temp_dir()
    output_path = get_temp_path(f"numbered_{uuid.uuid4().hex}.pdf")

    with pikepdf.open(input_path) as pdf:
        for i, page in enumerate(pdf.pages):
            page_num = i + start_number
            mediabox = page.mediabox
            width = float(mediabox[2]) - float(mediabox[0])
            height = float(mediabox[3]) - float(mediabox[1])

            packet = io.BytesIO()
            c = canvas.Canvas(packet, pagesize=(width, height))
            c.setFillColor(black)
            c.setFont("Helvetica", font_size)

            margin = 20
            text = str(page_num)

            if position == "bottom-center":
                c.drawCentredString(width / 2, margin, text)
            elif position == "bottom-left":
                c.drawString(margin, margin, text)
            elif position == "bottom-right":
                c.drawRightString(width - margin, margin, text)
            elif position == "top-center":
                c.drawCentredString(width / 2, height - margin - font_size, text)
            elif position == "top-left":
                c.drawString(margin, height - margin - font_size, text)
            elif position == "top-right":
                c.drawRightString(width - margin, height - margin - font_size, text)

            c.save()
            packet.seek(0)

            num_pdf = pikepdf.Pdf.open(packet)
            num_page = num_pdf.pages[0]
            page_obj = pikepdf.Page(page)
            page_obj.add_overlay(num_page)

        pdf.save(str(output_path))
    return str(output_path)
