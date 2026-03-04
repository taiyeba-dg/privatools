import uuid
import fitz  # PyMuPDF
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def convert_to_grayscale(input_path: str) -> str:
    """Convert PDF to grayscale using PyMuPDF.
    
    Uses a grayscale rendering approach with optimized DPI (100) for speed.
    Still produces high-quality grayscale output suitable for printing.
    """
    ensure_temp_dir()
    output_path = get_temp_path(f"grayscale_{uuid.uuid4().hex}.pdf")

    src = fitz.open(input_path)
    dst = fitz.open()

    for page in src:
        # Use 100 DPI — good quality for grayscale, much faster than 150
        mat = fitz.Matrix(100 / 72, 100 / 72)
        pix = page.get_pixmap(matrix=mat, colorspace=fitz.csGRAY)
        
        new_page = dst.new_page(width=page.rect.width, height=page.rect.height)
        new_page.insert_image(new_page.rect, pixmap=pix)

    if len(dst) == 0:
        raise ValueError("No pages found in PDF")

    dst.save(str(output_path), garbage=4, deflate=True)
    dst.close()
    src.close()

    return str(output_path)
