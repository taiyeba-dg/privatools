import uuid
import logging
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from fastapi.responses import FileResponse
from ..utils.cleanup import get_temp_path, ensure_temp_dir, validate_pdf_content
from ..services import overlay_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/overlay")
async def overlay(
    base_file: UploadFile = File(...),
    overlay_file: UploadFile = File(...),
    mode: str = Form("stamp"),
):
    for f in (base_file, overlay_file):
        if not f.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail=f"File {f.filename} is not a PDF")
    ensure_temp_dir()
    try:
        base_path = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
        content1 = await base_file.read()
        if len(content1) > 50 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large (max 50 MB)")
        validate_pdf_content(content1)
        base_path.write_bytes(content1)

        ovl_path = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
        content2 = await overlay_file.read()
        if len(content2) > 50 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large (max 50 MB)")
        validate_pdf_content(content2)
        ovl_path.write_bytes(content2)

        output_path = overlay_service.overlay(str(base_path), str(ovl_path), mode=mode)
        return FileResponse(path=output_path, filename="overlaid.pdf", media_type="application/pdf")
    except HTTPException:
        raise
    except Exception:
        logger.exception("Unexpected error")
        raise HTTPException(status_code=500, detail="An internal error occurred. Please try again.")
