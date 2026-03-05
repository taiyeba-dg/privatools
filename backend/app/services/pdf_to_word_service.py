"""PDF to Word conversion using PyMuPDF + python-docx.

Enhanced to preserve font names, text colors, and paragraph spacing.
"""
import uuid
import io
import fitz
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from pathlib import Path
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def _fitz_color_to_rgb(color_int: int) -> RGBColor | None:
    """Convert a PyMuPDF color integer to docx RGBColor."""
    if color_int is None or color_int == 0:
        return None  # black / default
    try:
        r = (color_int >> 16) & 0xFF
        g = (color_int >> 8) & 0xFF
        b = color_int & 0xFF
        if r == 0 and g == 0 and b == 0:
            return None
        return RGBColor(r, g, b)
    except Exception:
        return None


async def pdf_to_word(input_path: str) -> str:
    ensure_temp_dir()
    doc = fitz.open(input_path)
    word = Document()

    # Set default style
    style = word.styles["Normal"]
    style.font.size = Pt(11)

    for page_num in range(len(doc)):
        page = doc[page_num]
        if page_num > 0:
            word.add_page_break()

        blocks = page.get_text("dict")["blocks"]
        for block in blocks:
            if block["type"] == 0:  # text block
                for line in block.get("lines", []):
                    para = word.add_paragraph()
                    # Reduce paragraph spacing for tighter layout
                    para.paragraph_format.space_before = Pt(0)
                    para.paragraph_format.space_after = Pt(1)

                    for span in line.get("spans", []):
                        run = para.add_run(span["text"])

                        # Font size with clamping
                        font_size = max(6, min(span.get("size", 11), 72))
                        run.font.size = Pt(font_size)

                        # Preserve font name
                        font_name = span.get("font", "")
                        if font_name:
                            # Map common PDF font names to Word-compatible names
                            name_lower = font_name.lower()
                            if "arial" in name_lower or "helvetica" in name_lower:
                                run.font.name = "Arial"
                            elif "times" in name_lower:
                                run.font.name = "Times New Roman"
                            elif "courier" in name_lower:
                                run.font.name = "Courier New"
                            elif "calibri" in name_lower:
                                run.font.name = "Calibri"
                            else:
                                run.font.name = font_name.split("+")[-1].split("-")[0]

                        # Preserve text color
                        color_val = span.get("color")
                        if color_val and color_val != 0:
                            rgb = _fitz_color_to_rgb(color_val)
                            if rgb:
                                run.font.color.rgb = rgb

                        # Font flags
                        flags = span.get("flags", 0)
                        if flags & (1 << 0):  # superscript
                            run.font.superscript = True
                        if flags & (1 << 4):  # bold
                            run.font.bold = True
                        if flags & (1 << 1):  # italic
                            run.font.italic = True

            elif block["type"] == 1:  # image block
                try:
                    img_data = block.get("image")
                    if img_data:
                        img_stream = io.BytesIO(img_data)
                        word.add_picture(img_stream, width=Inches(5))
                except Exception:
                    pass

    doc.close()
    output_path = get_temp_path(f"converted_{uuid.uuid4().hex}.docx")
    word.save(str(output_path))
    return str(output_path)
