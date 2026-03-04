import uuid
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def epub_to_pdf(input_path: str) -> str:
    """Convert EPUB to PDF by extracting text content."""
    ensure_temp_dir()
    output_path = get_temp_path(f"epub_{uuid.uuid4().hex}.pdf")

    import zipfile
    import html
    import re

    c = canvas.Canvas(str(output_path), pagesize=A4)
    width, height = A4
    margin = 72
    usable_width = width - 2 * margin
    y = height - margin
    font_size = 11
    line_height = 14

    c.setFont("Helvetica", font_size)

    # EPUB is a ZIP file with XHTML content
    with zipfile.ZipFile(input_path, "r") as zf:
        # Find content files
        content_files = [n for n in zf.namelist()
                        if n.endswith((".xhtml", ".html", ".htm"))
                        and "toc" not in n.lower()]
        content_files.sort()

        for cf in content_files:
            try:
                raw = zf.read(cf).decode("utf-8", errors="replace")
            except Exception:
                continue

            # Strip HTML tags
            text = re.sub(r'<[^>]+>', ' ', raw)
            text = html.unescape(text)
            # Clean whitespace
            text = re.sub(r'\s+', ' ', text).strip()

            if not text:
                continue

            # Word wrap and write
            words = text.split()
            line = ""
            for word in words:
                test = f"{line} {word}".strip()
                if c.stringWidth(test, "Helvetica", font_size) < usable_width:
                    line = test
                else:
                    if y < margin:
                        c.showPage()
                        c.setFont("Helvetica", font_size)
                        y = height - margin
                    c.drawString(margin, y, line)
                    y -= line_height
                    line = word

            if line:
                if y < margin:
                    c.showPage()
                    c.setFont("Helvetica", font_size)
                    y = height - margin
                c.drawString(margin, y, line)
                y -= line_height

            # Paragraph break
            y -= line_height * 0.5

    c.save()
    return str(output_path)
