import uuid
import json
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def json_to_pdf(input_path: str) -> str:
    """Convert a JSON file to a formatted PDF."""
    ensure_temp_dir()
    output_path = get_temp_path(f"json_{uuid.uuid4().hex}.pdf")

    with open(input_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    c = canvas.Canvas(str(output_path), pagesize=A4)
    width, height = A4
    margin = 54
    y = height - margin
    font_size = 9
    line_height = 12

    c.setFont("Courier", font_size)

    # Pretty-print JSON
    formatted = json.dumps(data, indent=2, ensure_ascii=False)

    for line in formatted.split("\n"):
        if y < margin:
            c.showPage()
            c.setFont("Courier", font_size)
            y = height - margin

        # Colorize keys vs values
        stripped = line.lstrip()
        indent = len(line) - len(stripped)
        x = margin + indent * 4.5

        if ":" in stripped and stripped.startswith('"'):
            # Key-value pair - draw key in bold
            key_end = stripped.index(":")
            key = stripped[:key_end + 1]
            val = stripped[key_end + 1:]
            c.setFont("Courier-Bold", font_size)
            c.setFillColorRGB(0.2, 0.2, 0.6)
            c.drawString(x, y, key)
            kw = c.stringWidth(key, "Courier-Bold", font_size)
            c.setFont("Courier", font_size)
            c.setFillColorRGB(0, 0, 0)
            c.drawString(x + kw, y, val)
        else:
            c.drawString(x, y, stripped)

        y -= line_height

    c.save()
    return str(output_path)
