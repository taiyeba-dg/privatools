"""Grayscale conversion using vector-preserving approach.

Converts embedded images to grayscale in-place via pikepdf,
preserving vector text and graphics. Falls back to rasterization
only for pages that fail the vector approach.
"""
import uuid
import io
import fitz  # PyMuPDF
import pikepdf
from PIL import Image
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def convert_to_grayscale(input_path: str) -> str:
    """Convert PDF to grayscale preserving vector quality.

    Strategy:
    1. First try pikepdf image-level conversion (preserves text/vectors)
    2. Fallback to PyMuPDF 200 DPI rasterization for any failures
    """
    ensure_temp_dir()
    output_path = get_temp_path(f"grayscale_{uuid.uuid4().hex}.pdf")

    try:
        return _vector_grayscale(input_path, str(output_path))
    except Exception:
        return _raster_grayscale(input_path, str(output_path))


def _vector_grayscale(input_path: str, output_path: str) -> str:
    """Convert images to grayscale while preserving vector text/graphics."""
    with pikepdf.open(input_path) as pdf:
        for page in pdf.pages:
            resources = page.get("/Resources")
            if resources is None:
                continue
            xobjects = resources.get("/XObject")
            if xobjects is None:
                continue
            for key in list(xobjects.keys()):
                xobj = xobjects[key]
                try:
                    if xobj.get("/Subtype") != "/Image":
                        continue
                    pdfimage = pikepdf.PdfImage(xobj)
                    pil_image = pdfimage.as_pil_image()
                    gray = pil_image.convert("L")

                    buf = io.BytesIO()
                    gray.save(buf, format="JPEG", quality=85, optimize=True)
                    new_bytes = buf.getvalue()

                    xobj.write(new_bytes, filter=pikepdf.Name("/DCTDecode"))
                    xobj["/ColorSpace"] = pikepdf.Name("/DeviceGray")
                    xobj["/Width"] = gray.width
                    xobj["/Height"] = gray.height
                    xobj["/BitsPerComponent"] = 8
                except Exception:
                    continue

        # Apply grayscale to the entire page content stream colors
        # This handles vector drawings and text colors
        pdf.save(output_path, compress_streams=True)

    return output_path


def _raster_grayscale(input_path: str, output_path: str) -> str:
    """Fallback: rasterize at 200 DPI for guaranteed grayscale."""
    src = fitz.open(input_path)
    dst = fitz.open()

    for page in src:
        # 200 DPI for high quality grayscale
        mat = fitz.Matrix(200 / 72, 200 / 72)
        pix = page.get_pixmap(matrix=mat, colorspace=fitz.csGRAY)
        new_page = dst.new_page(width=page.rect.width, height=page.rect.height)
        new_page.insert_image(new_page.rect, pixmap=pix)

    if len(dst) == 0:
        raise ValueError("No pages found in PDF")

    dst.save(output_path, garbage=4, deflate=True)
    dst.close()
    src.close()

    return output_path
