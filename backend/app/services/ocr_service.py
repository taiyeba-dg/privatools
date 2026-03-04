import uuid
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def extract_text(input_path: str, lang: str = "eng") -> str:
    """Extract text from a PDF using OCR (Tesseract via pytesseract).
    
    Uses PyMuPDF for fast rendering instead of pdf2image/poppler.
    Keeps 200 DPI for OCR accuracy.
    """
    ensure_temp_dir()
    doc = fitz.open(input_path)
    pages_text = []
    
    for i, page in enumerate(doc, start=1):
        # Render at 200 DPI (same as before for accuracy)
        mat = fitz.Matrix(200 / 72, 200 / 72)
        pix = page.get_pixmap(matrix=mat)
        
        # Convert to PIL Image for Tesseract
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        
        text = pytesseract.image_to_string(img, lang=lang)
        pages_text.append(f"--- Page {i} ---\n{text}")
    
    doc.close()
    return "\n\n".join(pages_text)


def extract_text_to_file(input_path: str, lang: str = "eng") -> str:
    """Extract text from a PDF and write to a .txt temp file; return the path."""
    text = extract_text(input_path, lang=lang)
    out_path = get_temp_path(f"ocr_{uuid.uuid4().hex}.txt")
    out_path.write_text(text, encoding="utf-8")
    return str(out_path)
