"""Extract images from PDF using PyMuPDF native extraction (fast, no roundtrip)."""
import uuid
import zipfile
import fitz  # PyMuPDF
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def extract_images(input_path: str) -> str:
    """Extract all images from a PDF using PyMuPDF's native extraction.

    Uses doc.extract_image() which returns raw bytes directly,
    avoiding the pikepdf → PIL → bytes roundtrip.
    """
    ensure_temp_dir()
    zip_path = get_temp_path(f"extracted_images_{uuid.uuid4().hex}.zip")

    doc = fitz.open(input_path)
    image_count = 0

    with zipfile.ZipFile(str(zip_path), "w", zipfile.ZIP_DEFLATED) as zf:
        for page_num in range(len(doc)):
            page = doc[page_num]
            image_list = page.get_images(full=True)

            for img_index, img_info in enumerate(image_list):
                xref = img_info[0]
                try:
                    img_data = doc.extract_image(xref)
                    if not img_data:
                        continue

                    image_bytes = img_data["image"]
                    ext = img_data["ext"]  # "png", "jpeg", etc.
                    if ext == "jpeg":
                        ext = "jpg"

                    image_count += 1
                    filename = f"page{page_num + 1}_img{img_index + 1}.{ext}"
                    zf.writestr(filename, image_bytes)
                except Exception:
                    continue

    doc.close()
    return str(zip_path)
