import logging
import uuid
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from starlette.background import BackgroundTask
from ..utils.cleanup import get_temp_path, ensure_temp_dir, remove_files, validate_pdf_content
from ..services import ocr_service

router = APIRouter()
logger = logging.getLogger(__name__)

MAX_UPLOAD_BYTES = 50 * 1024 * 1024  # 50 MB

VALID_LANGS = {
    "eng", "fra", "deu", "spa", "ita", "por", "chi_sim", "chi_tra", "jpn", "kor",
    "ara", "hin", "rus", "nld", "pol", "tur", "vie", "ukr", "ces", "ron", "hun",
    "ell", "bul", "hrv", "slk", "slv", "srp", "cat", "dan", "fin", "nor", "swe",
    "tha", "heb", "ind", "msa", "ben", "tam", "tel", "kan", "mal", "mar", "guj",
    "pan", "urd",
}


@router.post("/ocr")
async def ocr_pdf(
    file: UploadFile = File(...),
    lang: str = Form("eng"),
    output: str = Form("json"),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a PDF")

    if lang not in VALID_LANGS:
        raise HTTPException(status_code=400, detail=f"Invalid language code: {lang}")

    ensure_temp_dir()

    try:
        content = await file.read()
        if len(content) > MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=413, detail="File exceeds the 50 MB limit")
        temp_path = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
        validate_pdf_content(content)
        temp_path.write_bytes(content)

        if output == "txt":
            out_path = ocr_service.extract_text_to_file(str(temp_path), lang=lang)
            cleanup = BackgroundTask(remove_files, str(temp_path), out_path)
            return FileResponse(
                path=out_path,
                filename="extracted_text.txt",
                media_type="text/plain; charset=utf-8",
                background=cleanup,
            )
        else:
            text = ocr_service.extract_text(str(temp_path), lang=lang)
            remove_files(str(temp_path))
            return JSONResponse({"text": text})
    except HTTPException:
        raise
    except Exception:
        logger.exception("Unexpected error")
        raise HTTPException(status_code=500, detail="An internal error occurred. Please try again.")
