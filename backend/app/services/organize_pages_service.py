import base64
import io

import pikepdf
from pdf2image import convert_from_path

from ..utils.cleanup import safe_open_pdf
from ..utils.exceptions import PageRangeError
from ..utils.filenames import temp_output


def generate_thumbnails(input_path: str) -> list[str]:
    """Return one base64-encoded PNG thumbnail per page."""
    images = convert_from_path(input_path, dpi=72, size=(150, None))
    thumbnails: list[str] = []
    for img in images:
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)
        thumbnails.append(base64.b64encode(buf.read()).decode("utf-8"))
    return thumbnails


def reorder_pages(input_path: str, page_order: list) -> str:
    output_path = temp_output("organized", "pdf")
    with safe_open_pdf(input_path) as pdf:
        total = len(pdf.pages)
        with pikepdf.Pdf.new() as out:
            for page_num in page_order:
                idx = int(page_num) - 1
                if idx < 0 or idx >= total:
                    raise PageRangeError(
                        f"Page {page_num} is out of range (PDF has {total} pages)."
                    )
                out.pages.append(pdf.pages[idx])
            out.save(str(output_path))
    return str(output_path)
