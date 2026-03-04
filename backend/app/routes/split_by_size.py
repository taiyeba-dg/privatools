import uuid
import logging
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from fastapi.responses import FileResponse
from ..utils.cleanup import get_temp_path, ensure_temp_dir, validate_pdf_content
from ..services import split_by_size_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/split-by-size")
async def split_by_size(file: UploadFile = File(...), max_size_mb: float = Form(10.0)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a PDF")
    if max_size_mb <= 0:
        raise HTTPException(status_code=400, detail="max_size_mb must be greater than 0")
    ensure_temp_dir()
    try:
        temp_path = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
        content = await file.read()
        if len(content) > 50 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large (max 50 MB)")
        validate_pdf_content(content)
        temp_path.write_bytes(content)
        output_path = split_by_size_service.split_by_size(str(temp_path), max_size_mb=max_size_mb)
        return FileResponse(path=output_path, filename="split_by_size.zip", media_type="application/zip")
    except HTTPException:
        raise
    except Exception:
        logger.exception("Unexpected error")
        raise HTTPException(status_code=500, detail="An internal error occurred. Please try again.")
