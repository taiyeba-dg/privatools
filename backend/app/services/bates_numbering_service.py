import io

import pikepdf
from reportlab.lib.colors import black
from reportlab.pdfgen import canvas

from ..utils.cleanup import safe_open_pdf
from ..utils.filenames import temp_output

VALID_POSITIONS = {
    "bottom-right",
    "bottom-left",
    "bottom-center",
    "top-right",
    "top-left",
    "top-center",
}


def add_bates_numbering(
    input_path: str,
    prefix: str = "",
    start_number: int = 1,
    digits: int = 6,
    position: str = "bottom-right",
) -> str:
    output_path = temp_output("bates", "pdf")

    with safe_open_pdf(input_path) as pdf:
        for i, page in enumerate(pdf.pages):
            bates_num = f"{prefix}{str(start_number + i).zfill(digits)}"
            mediabox = page.mediabox
            width = float(mediabox[2]) - float(mediabox[0])
            height = float(mediabox[3]) - float(mediabox[1])

            font_size = 10
            margin = 20

            packet = io.BytesIO()
            c = canvas.Canvas(packet, pagesize=(width, height))
            c.setFillColor(black)
            c.setFont("Helvetica", font_size)

            if position == "bottom-right":
                c.drawRightString(width - margin, margin, bates_num)
            elif position == "bottom-left":
                c.drawString(margin, margin, bates_num)
            elif position == "bottom-center":
                c.drawCentredString(width / 2, margin, bates_num)
            elif position == "top-right":
                c.drawRightString(width - margin, height - margin - font_size, bates_num)
            elif position == "top-left":
                c.drawString(margin, height - margin - font_size, bates_num)
            elif position == "top-center":
                c.drawCentredString(width / 2, height - margin - font_size, bates_num)

            c.save()
            packet.seek(0)

            overlay_pdf = pikepdf.Pdf.open(packet)
            overlay_page = overlay_pdf.pages[0]
            page_obj = pikepdf.Page(page)
            page_obj.add_overlay(overlay_page)

        pdf.save(str(output_path))

    return str(output_path)
