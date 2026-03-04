import uuid
import xml.etree.ElementTree as ET
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def xml_to_pdf(input_path: str) -> str:
    """Convert an XML file to a formatted PDF."""
    ensure_temp_dir()
    output_path = get_temp_path(f"xml_{uuid.uuid4().hex}.pdf")

    with open(input_path, "r", encoding="utf-8") as f:
        content = f.read()

    c = canvas.Canvas(str(output_path), pagesize=A4)
    width, height = A4
    margin = 54
    y = height - margin
    font_size = 9
    line_height = 12

    c.setFont("Courier", font_size)

    # Try to pretty-print if valid XML
    try:
        root = ET.fromstring(content)
        formatted = ET.tostring(root, encoding="unicode")
        # Simple indentation
        import xml.dom.minidom
        dom = xml.dom.minidom.parseString(content)
        formatted = dom.toprettyxml(indent="  ")
    except Exception:
        formatted = content

    for line in formatted.split("\n"):
        if y < margin:
            c.showPage()
            c.setFont("Courier", font_size)
            y = height - margin

        stripped = line.rstrip()
        if not stripped:
            y -= line_height * 0.3
            continue

        indent = len(line) - len(line.lstrip())
        x = margin + indent * 4

        # Colorize tags
        if stripped.lstrip().startswith("<"):
            c.setFillColorRGB(0.1, 0.3, 0.6)
        else:
            c.setFillColorRGB(0, 0, 0)

        # Truncate long lines
        max_w = width - 2 * margin
        display = stripped.lstrip()
        while c.stringWidth(display, "Courier", font_size) > max_w and len(display) > 10:
            display = display[:-1]

        c.drawString(x, y, display)
        y -= line_height

    c.setFillColorRGB(0, 0, 0)
    c.save()
    return str(output_path)
