import uuid
import base64
import io
import pikepdf
from pdf2image import convert_from_path
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def generate_thumbnails(input_path: str) -> list:
    images = convert_from_path(input_path, dpi=72, size=(150, None))
    thumbnails = []
    for img in images:
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)
        thumbnails.append(base64.b64encode(buf.read()).decode("utf-8"))
    return thumbnails


def reorder_pages(input_path: str, page_order: list) -> str:
    ensure_temp_dir()
    output_path = get_temp_path(f"organized_{uuid.uuid4().hex}.pdf")
    with pikepdf.open(input_path) as pdf:
        with pikepdf.Pdf.new() as out:
            for page_num in page_order:
                idx = int(page_num) - 1
                out.pages.append(pdf.pages[idx])
            out.save(str(output_path))
    return str(output_path)
