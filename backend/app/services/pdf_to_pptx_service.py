"""PDF to PPTX conversion using PyMuPDF + python-pptx."""
import uuid
import io
import fitz
from pptx import Presentation
from pptx.util import Inches, Pt
from pathlib import Path
from ..utils.cleanup import get_temp_path, ensure_temp_dir


async def convert_to_pptx(input_path: str) -> str:
    ensure_temp_dir()
    doc = fitz.open(input_path)
    prs = Presentation()
    prs.slide_width = Inches(10)
    prs.slide_height = Inches(7.5)

    for page_num in range(len(doc)):
        page = doc[page_num]
        slide = prs.slides.add_slide(prs.slide_layouts[6])  # blank layout

        # Render page as image and add to slide
        pix = page.get_pixmap(dpi=150)
        img_data = pix.tobytes("png")
        img_stream = io.BytesIO(img_data)

        # Calculate dimensions to fit slide
        slide_w = prs.slide_width
        slide_h = prs.slide_height
        img_ratio = pix.width / pix.height
        slide_ratio = slide_w / slide_h

        if img_ratio > slide_ratio:
            width = slide_w
            height = int(slide_w / img_ratio)
        else:
            height = slide_h
            width = int(slide_h * img_ratio)

        left = int((slide_w - width) / 2)
        top = int((slide_h - height) / 2)

        slide.shapes.add_picture(img_stream, left, top, width, height)

    doc.close()
    output_path = get_temp_path(f"converted_{uuid.uuid4().hex}.pptx")
    prs.save(str(output_path))
    return str(output_path)
