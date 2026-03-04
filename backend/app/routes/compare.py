import uuid
import logging
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from ..utils.cleanup import get_temp_path, ensure_temp_dir, validate_pdf_content
from ..services import compare_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/compare")
async def compare(
    file1: UploadFile = File(...),
    file2: UploadFile = File(...),
    mode: str = Form("text"),
):
    for f in (file1, file2):
        if not f.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail=f"File {f.filename} is not a PDF")
    ensure_temp_dir()
    try:
        path1 = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
        content1 = await file1.read()
        if len(content1) > 50 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large (max 50 MB)")
        validate_pdf_content(content1)
        path1.write_bytes(content1)

        path2 = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
        content2 = await file2.read()
        if len(content2) > 50 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large (max 50 MB)")
        validate_pdf_content(content2)
        path2.write_bytes(content2)

        if mode == "visual":
            output_path = compare_service.compare_visual(str(path1), str(path2))
            return FileResponse(path=output_path, filename="comparison.pdf", media_type="application/pdf")
        else:
            result = compare_service.compare_text(str(path1), str(path2))
            return JSONResponse(result)
    except HTTPException:
        raise
    except Exception:
        logger.exception("Unexpected error")
        raise HTTPException(status_code=500, detail="An internal error occurred. Please try again.")
