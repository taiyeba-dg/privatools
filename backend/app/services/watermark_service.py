import pikepdf
import uuid
import io
from ..utils.cleanup import get_temp_path, ensure_temp_dir
from reportlab.pdfgen import canvas
from reportlab.lib.colors import Color
from reportlab.lib.utils import ImageReader
from PIL import Image


def add_watermark(
    input_path: str,
    text: str = "",
    opacity: float = 0.3,
    font_size: int = 40,
    position: str = "center",
    watermark_image_path: str | None = None,
    image_scale: float = 0.25,
) -> str:
    ensure_temp_dir()
    output_path = get_temp_path(f"watermarked_{uuid.uuid4().hex}.pdf")
    image_reader = None
    image_size = (0, 0)

    if watermark_image_path:
        with Image.open(watermark_image_path) as img:
            rgba = img.convert("RGBA")
            alpha = rgba.getchannel("A").point(lambda p: int(p * opacity))
            rgba.putalpha(alpha)
            image_size = rgba.size
            image_reader = ImageReader(rgba)

    with pikepdf.open(input_path) as pdf:
        for page in pdf.pages:
            mediabox = page.mediabox
            width = float(mediabox[2]) - float(mediabox[0])
            height = float(mediabox[3]) - float(mediabox[1])

            packet = io.BytesIO()
            c = canvas.Canvas(packet, pagesize=(width, height))

            if image_reader is not None:
                iw, ih = image_size
                draw_w = max(20.0, width * image_scale)
                draw_h = draw_w * (ih / max(iw, 1))
                max_h = height * 0.9
                if draw_h > max_h:
                    scale = max_h / draw_h
                    draw_w *= scale
                    draw_h *= scale

                def draw_image(x: float, y: float) -> None:
                    c.drawImage(image_reader, x, y, width=draw_w, height=draw_h, mask="auto")

                if position == "center":
                    draw_image((width - draw_w) / 2, (height - draw_h) / 2)
                elif position == "top":
                    draw_image((width - draw_w) / 2, height - draw_h - 10)
                elif position == "bottom":
                    draw_image((width - draw_w) / 2, 10)
                elif position == "top-left":
                    draw_image(10, height - draw_h - 10)
                elif position == "top-right":
                    draw_image(width - draw_w - 10, height - draw_h - 10)
                elif position == "bottom-left":
                    draw_image(10, 10)
                elif position == "bottom-right":
                    draw_image(width - draw_w - 10, 10)
                elif position == "diagonal":
                    c.saveState()
                    c.translate(width / 2, height / 2)
                    c.rotate(45)
                    c.drawImage(image_reader, -draw_w / 2, -draw_h / 2, width=draw_w, height=draw_h, mask="auto")
                    c.restoreState()
                elif position == "tile":
                    step_x = max(50, int(draw_w * 1.6))
                    step_y = max(40, int(draw_h * 1.6))
                    for tx in range(0, int(width), step_x):
                        for ty in range(0, int(height), step_y):
                            c.drawImage(image_reader, tx, ty, width=draw_w, height=draw_h, mask="auto")
            else:
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
                    step_x = max(40, int(font_size * max(len(text), 1) * 0.7))
                    step_y = max(30, int(font_size * 3))
                    for tx in range(0, int(width), step_x):
                        for ty in range(0, int(height), step_y):
                            c.saveState()
                            c.translate(tx, ty)
                            c.rotate(45)
                            c.drawString(0, 0, text)
                            c.restoreState()

            c.save()
            packet.seek(0)

            watermark_pdf = pikepdf.Pdf.open(packet)
            watermark_page = watermark_pdf.pages[0]

            page_obj = pikepdf.Page(page)
            page_obj.add_overlay(watermark_page)

        pdf.save(str(output_path))
    return str(output_path)
