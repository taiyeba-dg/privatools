import uuid
import logging
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from fastapi.responses import FileResponse
from ..utils.cleanup import get_temp_path, ensure_temp_dir, validate_pdf_content
from ..services import nup_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/nup")
async def nup(file: UploadFile = File(...), pages_per_sheet: int = Form(2)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a PDF")
    if pages_per_sheet not in (2, 4, 6, 9, 16):
        raise HTTPException(status_code=400, detail="pages_per_sheet must be one of 2, 4, 6, 9, 16")
    ensure_temp_dir()
    try:
        temp_path = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
        content = await file.read()
        if len(content) > 50 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large (max 50 MB)")
        validate_pdf_content(content)
        temp_path.write_bytes(content)
        output_path = nup_service.nup(str(temp_path), pages_per_sheet=pages_per_sheet)
        return FileResponse(path=output_path, filename="nup.pdf", media_type="application/pdf")
    except HTTPException:
        raise
    except Exception:
        logger.exception("Unexpected error")
        raise HTTPException(status_code=500, detail="An internal error occurred. Please try again.")
