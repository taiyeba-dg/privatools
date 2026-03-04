import uuid
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def txt_to_pdf(input_path: str, font_size: int = 11) -> str:
    """Convert a .txt file to PDF using reportlab."""
    ensure_temp_dir()
    output_path = get_temp_path(f"text_{uuid.uuid4().hex}.pdf")

    with open(input_path, "r", encoding="utf-8", errors="replace") as f:
        text = f.read()

    c = canvas.Canvas(str(output_path), pagesize=A4)
    width, height = A4
    margin = 72  # 1 inch
    usable_width = width - 2 * margin
    y = height - margin
    line_height = font_size + 4

    c.setFont("Courier", font_size)

    for line in text.split("\n"):
        if not line:
            y -= line_height * 0.5
            if y < margin:
                c.showPage()
                c.setFont("Courier", font_size)
                y = height - margin
            continue

        # Word wrap long lines
        words = line.split(" ")
        current_line = ""
        for word in words:
            test = f"{current_line} {word}".strip() if current_line else word
            if c.stringWidth(test, "Courier", font_size) < usable_width:
                current_line = test
            else:
                if current_line:
                    if y < margin:
                        c.showPage()
                        c.setFont("Courier", font_size)
                        y = height - margin
                    c.drawString(margin, y, current_line)
                    y -= line_height
                current_line = word

        if current_line:
            if y < margin:
                c.showPage()
                c.setFont("Courier", font_size)
                y = height - margin
            c.drawString(margin, y, current_line)
            y -= line_height

    c.save()
    return str(output_path)
