import uuid
import re
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def rtf_to_pdf(input_path: str) -> str:
    """Convert RTF file to PDF by extracting plain text."""
    ensure_temp_dir()
    output_path = get_temp_path(f"rtf_{uuid.uuid4().hex}.pdf")

    with open(input_path, "r", encoding="utf-8", errors="replace") as f:
        raw = f.read()

    # Strip RTF control words and extract plain text
    text = _strip_rtf(raw)

    c = canvas.Canvas(str(output_path), pagesize=A4)
    width, height = A4
    margin = 72
    usable_width = width - 2 * margin
    y = height - margin
    font_size = 11
    line_height = 14

    c.setFont("Helvetica", font_size)

    for line in text.split("\n"):
        if not line.strip():
            y -= line_height * 0.5
            if y < margin:
                c.showPage()
                c.setFont("Helvetica", font_size)
                y = height - margin
            continue

        words = line.split()
        current = ""
        for word in words:
            test = f"{current} {word}".strip()
            if c.stringWidth(test, "Helvetica", font_size) < usable_width:
                current = test
            else:
                if y < margin:
                    c.showPage()
                    c.setFont("Helvetica", font_size)
                    y = height - margin
                c.drawString(margin, y, current)
                y -= line_height
                current = word
        if current:
            if y < margin:
                c.showPage()
                c.setFont("Helvetica", font_size)
                y = height - margin
            c.drawString(margin, y, current)
            y -= line_height

    c.save()
    return str(output_path)


def _strip_rtf(rtf_text: str) -> str:
    """Strip RTF control codes and return plain text."""
    # Remove RTF header/groups
    text = rtf_text

    # Remove {\...} groups that are metadata
    for pattern in [r'\{\\fonttbl[^}]*\}', r'\{\\colortbl[^}]*\}',
                    r'\{\\stylesheet[^}]*\}', r'\{\\info[^}]*\}']:
        text = re.sub(pattern, '', text, flags=re.DOTALL)

    # Remove control words
    text = re.sub(r'\\[a-z]+\d*\s?', ' ', text)
    # Remove \' hex chars
    text = re.sub(r"\\'[0-9a-f]{2}", '', text)
    # Remove remaining braces
    text = text.replace('{', '').replace('}', '')
    # Clean up
    text = re.sub(r'  +', ' ', text)
    text = text.strip()

    return text
