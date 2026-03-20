"""Image OCR route: extract text from images using Tesseract."""
import asyncio
import logging
import tempfile
import os
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from starlette.background import BackgroundTask
from ..utils.cleanup import remove_files

router = APIRouter()
logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif", ".webp", ".gif"}

VALID_LANGS = {
    "eng", "fra", "deu", "spa", "ita", "por", "chi_sim", "chi_tra", "jpn", "kor",
    "ara", "hin", "rus", "nld", "pol", "tur", "vie", "ukr", "ces", "ron", "hun",
    "ell", "bul", "hrv", "slk", "slv", "srp", "cat", "dan", "fin", "nor", "swe",
    "tha", "heb", "ind", "msa", "ben", "tam", "tel", "kan", "mal", "mar", "guj",
    "pan", "urd",
}
VALID_OUTPUTS = {"json", "txt"}


def _extract_text(image_path: str, lang: str) -> str:
    """Run Tesseract OCR on an image — CPU-bound, runs in thread."""
    try:
        import pytesseract
        from PIL import Image
    except ImportError:
        raise RuntimeError("pytesseract and Pillow are required for image OCR")

    img = Image.open(image_path)
    # Convert to RGB if needed (e.g. RGBA PNGs)
    if img.mode not in ("L", "RGB"):
        img = img.convert("RGB")
    text = pytesseract.image_to_string(img, lang=lang)
    return text.strip()


@router.post("/image-ocr")
async def image_ocr(
    file: UploadFile = File(...),
    lang: str = Form("eng"),
    output: str = Form("json"),
):
    # Validate extension
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image format. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    if lang not in VALID_LANGS:
        raise HTTPException(status_code=400, detail=f"Invalid language code: {lang}")
    if output not in VALID_OUTPUTS:
        raise HTTPException(status_code=400, detail=f"output must be one of: {', '.join(sorted(VALID_OUTPUTS))}")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded image is empty")
    # Write to temp file
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
    tmp.write(content)
    tmp.close()

    try:
        text = await asyncio.to_thread(_extract_text, tmp.name, lang)
    except RuntimeError as e:
        remove_files(tmp.name)
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        remove_files(tmp.name)
        logger.exception("OCR failed")
        raise HTTPException(status_code=500, detail="OCR processing failed. Is Tesseract installed?")
    finally:
        # Clean up input file
        remove_files(tmp.name)

    if output == "txt":
        txt_tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".txt", mode="w", encoding="utf-8")
        txt_tmp.write(text)
        txt_tmp.close()
        cleanup = BackgroundTask(remove_files, txt_tmp.name)
        return FileResponse(
            path=txt_tmp.name,
            filename="extracted_text.txt",
            media_type="text/plain; charset=utf-8",
            background=cleanup,
        )
    else:
        return JSONResponse({"text": text, "language": lang, "characters": len(text)})
