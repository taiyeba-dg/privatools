"""Add page numbers using PyMuPDF direct text insertion (no reportlab overhead)."""
import uuid
import fitz  # PyMuPDF
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def add_page_numbers(
    input_path: str,
    position: str = "bottom-center",
    start_number: int = 1,
    font_size: int = 12,
) -> str:
    ensure_temp_dir()
    output_path = get_temp_path(f"numbered_{uuid.uuid4().hex}.pdf")

    doc = fitz.open(input_path)
    margin = 20

    for i, page in enumerate(doc):
        page_num = i + start_number
        text = str(page_num)
        rect = page.rect
        w, h = rect.width, rect.height

        # Calculate insertion point based on position
        if position == "bottom-center":
            point = fitz.Point(w / 2, h - margin)
        elif position == "bottom-left":
            point = fitz.Point(margin, h - margin)
        elif position == "bottom-right":
            point = fitz.Point(w - margin, h - margin)
        elif position == "top-center":
            point = fitz.Point(w / 2, margin + font_size)
        elif position == "top-left":
            point = fitz.Point(margin, margin + font_size)
        elif position == "top-right":
            point = fitz.Point(w - margin, margin + font_size)
        else:
            point = fitz.Point(w / 2, h - margin)

        # Insert text directly on the page
        page.insert_text(
            point,
            text,
            fontsize=font_size,
            fontname="helv",  # Helvetica
            color=(0, 0, 0),
        )

    doc.save(str(output_path), garbage=4, deflate=True)
    doc.close()
    return str(output_path)
