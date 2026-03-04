import uuid
import fitz  # PyMuPDF
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def flatten_pdf(input_path: str) -> str:
    """Flatten PDF by rendering each page as an image and rebuilding.
    
    Uses PyMuPDF for fast rendering instead of poppler/pdf2image.
    """
    ensure_temp_dir()
    output_path = get_temp_path(f"flattened_{uuid.uuid4().hex}.pdf")

    src = fitz.open(input_path)
    dst = fitz.open()

    for page in src:
        # Render page to pixmap at 150 DPI
        mat = fitz.Matrix(150 / 72, 150 / 72)
        pix = page.get_pixmap(matrix=mat)
        
        # Create new page with same dimensions
        new_page = dst.new_page(width=page.rect.width, height=page.rect.height)
        
        # Insert the rendered image
        img_rect = new_page.rect
        new_page.insert_image(img_rect, pixmap=pix)

    if len(dst) == 0:
        raise ValueError("No pages found in PDF")

    dst.save(str(output_path), garbage=4, deflate=True)
    dst.close()
    src.close()

    return str(output_path)
