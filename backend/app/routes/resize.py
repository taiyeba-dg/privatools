import uuid
from typing import Optional
import logging
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from fastapi.responses import FileResponse
from ..utils.cleanup import get_temp_path, ensure_temp_dir, validate_pdf_content
from ..services import resize_service

router = APIRouter()
logger = logging.getLogger(__name__)

VALID_PAGE_SIZES = {"a4", "letter", "a3", "legal", "custom"}


@router.post("/resize")
async def resize_pdf(
    file: UploadFile = File(...),
    page_size: str = Form("a4"),
    width: Optional[float] = Form(None),
    height: Optional[float] = Form(None),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a PDF")

    if page_size.lower() not in VALID_PAGE_SIZES:
        raise HTTPException(
            status_code=400,
            detail=f"page_size must be one of: {', '.join(sorted(VALID_PAGE_SIZES))}",
        )

    if page_size.lower() == "custom" and (width is None or height is None):
        raise HTTPException(
            status_code=400, detail="Custom page size requires both width and height"
        )

    ensure_temp_dir()

    try:
        temp_path = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
        content = await file.read()
        if len(content) > 50 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size exceeds 50 MB limit")
        validate_pdf_content(content)
        temp_path.write_bytes(content)

        output_path = resize_service.resize_pdf(
            str(temp_path), page_size=page_size, width=width, height=height
        )
        return FileResponse(
            path=output_path,
            filename="resized.pdf",
            media_type="application/pdf",
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception("Unexpected error")
        raise HTTPException(status_code=500, detail="An internal error occurred. Please try again.")
