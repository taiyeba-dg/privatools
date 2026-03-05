import uuid
import io

import fitz  # PyMuPDF
import pikepdf
import pytesseract
from PIL import Image
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def _render_page_to_image(page: fitz.Page, dpi: int = 200) -> Image.Image:
    mat = fitz.Matrix(dpi / 72, dpi / 72)
    pix = page.get_pixmap(matrix=mat)
    mode = "RGBA" if pix.alpha else "RGB"
    img = Image.frombytes(mode, [pix.width, pix.height], pix.samples)
    return img.convert("RGB") if mode == "RGBA" else img


def extract_text(input_path: str, lang: str = "eng") -> str:
    """Extract text from a PDF using OCR (Tesseract via pytesseract).
    
    Uses PyMuPDF for fast rendering instead of pdf2image/poppler.
    Keeps 200 DPI for OCR accuracy.
    """
    ensure_temp_dir()
    pages_text = []

    with fitz.open(input_path) as doc:
        for i, page in enumerate(doc, start=1):
            img = _render_page_to_image(page, dpi=200)
            text = pytesseract.image_to_string(img, lang=lang)
            pages_text.append(f"--- Page {i} ---\n{text}")

    return "\n\n".join(pages_text)


def extract_text_to_file(input_path: str, lang: str = "eng") -> str:
    """Extract text from a PDF and write to a .txt temp file; return the path."""
    text = extract_text(input_path, lang=lang)
    out_path = get_temp_path(f"ocr_{uuid.uuid4().hex}.txt")
    out_path.write_text(text, encoding="utf-8")
    return str(out_path)


def extract_searchable_pdf_to_file(input_path: str, lang: str = "eng") -> str:
    """Generate a searchable PDF by OCR'ing each page into a text-layer PDF page."""
    ensure_temp_dir()
    out_path = get_temp_path(f"ocr_searchable_{uuid.uuid4().hex}.pdf")

    with fitz.open(input_path) as doc:
        if len(doc) == 0:
            raise ValueError("Cannot run OCR on an empty PDF.")

        with pikepdf.Pdf.new() as merged_pdf:
            for page in doc:
                img = _render_page_to_image(page, dpi=200)
                ocr_page_pdf = pytesseract.image_to_pdf_or_hocr(img, extension="pdf", lang=lang)
                with pikepdf.open(io.BytesIO(ocr_page_pdf)) as page_pdf:
                    merged_pdf.pages.append(page_pdf.pages[0])
            merged_pdf.save(str(out_path))

    return str(out_path)
