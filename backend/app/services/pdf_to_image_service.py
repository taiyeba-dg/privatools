import uuid
import zipfile
import fitz  # PyMuPDF
from PIL import Image
from pathlib import Path
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def pdf_to_images(input_path: str, fmt: str = "jpeg", dpi: int = 150) -> str:
    """Convert PDF pages to images using PyMuPDF for fast rendering.
    
    Same DPI and quality as before, just faster rendering engine.
    """
    ensure_temp_dir()
    doc = fitz.open(input_path)
    
    pil_format = "JPEG" if fmt.lower() in ("jpeg", "jpg") else fmt.upper()
    ext = "jpg" if fmt.lower() in ("jpeg", "jpg") else fmt.lower()

    if len(doc) == 1:
        mat = fitz.Matrix(dpi / 72, dpi / 72)
        pix = doc[0].get_pixmap(matrix=mat)
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        img_path = get_temp_path(f"page_1_{uuid.uuid4().hex}.{ext}")
        img.save(str(img_path), pil_format)
        doc.close()
        return str(img_path)

    image_paths = []
    for i, page in enumerate(doc):
        mat = fitz.Matrix(dpi / 72, dpi / 72)
        pix = page.get_pixmap(matrix=mat)
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        img_path = get_temp_path(f"page_{i+1}_{uuid.uuid4().hex}.{ext}")
        img.save(str(img_path), pil_format)
        image_paths.append(str(img_path))

    doc.close()

    zip_path = get_temp_path(f"images_{uuid.uuid4().hex}.zip")
    with zipfile.ZipFile(str(zip_path), "w") as zf:
        for f in image_paths:
            zf.write(f, Path(f).name)
    return str(zip_path)
