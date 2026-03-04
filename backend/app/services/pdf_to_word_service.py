"""PDF to Word conversion using PyMuPDF + python-docx."""
import uuid
import fitz
from docx import Document
from docx.shared import Pt, Inches
from pathlib import Path
from ..utils.cleanup import get_temp_path, ensure_temp_dir


async def pdf_to_word(input_path: str) -> str:
    ensure_temp_dir()
    doc = fitz.open(input_path)
    word = Document()

    for page_num in range(len(doc)):
        page = doc[page_num]
        if page_num > 0:
            word.add_page_break()

        blocks = page.get_text("dict")["blocks"]
        for block in blocks:
            if block["type"] == 0:  # text block
                for line in block.get("lines", []):
                    para = word.add_paragraph()
                    for span in line.get("spans", []):
                        run = para.add_run(span["text"])
                        run.font.size = Pt(max(6, min(span.get("size", 11), 72)))
                        if span.get("flags", 0) & 2 ** 0:  # superscript
                            run.font.superscript = True
                        if span.get("flags", 0) & 2 ** 4:  # bold
                            run.font.bold = True
                        if span.get("flags", 0) & 2 ** 1:  # italic
                            run.font.italic = True
            elif block["type"] == 1:  # image block
                try:
                    img_data = block.get("image")
                    if img_data:
                        import io
                        img_stream = io.BytesIO(img_data)
                        word.add_picture(img_stream, width=Inches(4))
                except Exception:
                    pass

    doc.close()
    output_path = get_temp_path(f"converted_{uuid.uuid4().hex}.docx")
    word.save(str(output_path))
    return str(output_path)
