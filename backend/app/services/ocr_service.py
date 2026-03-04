import uuid
from pathlib import Path
from pdf2image import convert_from_path
import pytesseract
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def extract_text(input_path: str, lang: str = "eng") -> str:
    """Extract text from a PDF using OCR (Tesseract via pytesseract)."""
    ensure_temp_dir()
    images = convert_from_path(input_path, dpi=200)
    pages_text = []
    for i, img in enumerate(images, start=1):
        text = pytesseract.image_to_string(img, lang=lang)
        pages_text.append(f"--- Page {i} ---\n{text}")
    return "\n\n".join(pages_text)


def extract_text_to_file(input_path: str, lang: str = "eng") -> str:
    """Extract text from a PDF and write to a .txt temp file; return the path."""
    text = extract_text(input_path, lang=lang)
    out_path = get_temp_path(f"ocr_{uuid.uuid4().hex}.txt")
    out_path.write_text(text, encoding="utf-8")
    return str(out_path)
