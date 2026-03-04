import pikepdf
import uuid
import io
from ..utils.cleanup import get_temp_path, ensure_temp_dir
from reportlab.pdfgen import canvas
from reportlab.lib.colors import black


def add_header_footer(
    input_path: str,
    header_text: str = "",
    footer_text: str = "",
    font_size: int = 10,
) -> str:
    ensure_temp_dir()
    output_path = get_temp_path(f"headerfooter_{uuid.uuid4().hex}.pdf")

    with pikepdf.open(input_path) as pdf:
        for page in pdf.pages:
            mediabox = page.mediabox
            width = float(mediabox[2]) - float(mediabox[0])
            height = float(mediabox[3]) - float(mediabox[1])

            packet = io.BytesIO()
            c = canvas.Canvas(packet, pagesize=(width, height))
            c.setFillColor(black)
            c.setFont("Helvetica", font_size)

            margin = 20

            if header_text:
                c.drawCentredString(width / 2, height - margin - font_size, header_text)

            if footer_text:
                c.drawCentredString(width / 2, margin, footer_text)

            c.save()
            packet.seek(0)

            overlay_pdf = pikepdf.Pdf.open(packet)
            overlay_page = overlay_pdf.pages[0]
            page_obj = pikepdf.Page(page)
            page_obj.add_overlay(overlay_page)

        pdf.save(str(output_path))

    return str(output_path)
