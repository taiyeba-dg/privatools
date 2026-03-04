import uuid
import fitz  # PyMuPDF
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def convert_to_grayscale(input_path: str) -> str:
    """Convert PDF to grayscale using PyMuPDF.
    
    Renders each page as a grayscale pixmap and rebuilds the PDF.
    Much faster than pdf2image/poppler approach.
    """
    ensure_temp_dir()
    output_path = get_temp_path(f"grayscale_{uuid.uuid4().hex}.pdf")

    src = fitz.open(input_path)
    dst = fitz.open()

    for page in src:
        # Render page at 150 DPI in grayscale (cs=fitz.csGRAY)
        mat = fitz.Matrix(150 / 72, 150 / 72)
        pix = page.get_pixmap(matrix=mat, colorspace=fitz.csGRAY)
        
        # Create new page with same dimensions
        new_page = dst.new_page(width=page.rect.width, height=page.rect.height)
        new_page.insert_image(new_page.rect, pixmap=pix)

    if len(dst) == 0:
        raise ValueError("No pages found in PDF")

    dst.save(str(output_path), garbage=4, deflate=True)
    dst.close()
    src.close()

    return str(output_path)
