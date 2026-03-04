import logging
import uuid
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask
from ..utils.cleanup import get_temp_path, ensure_temp_dir, remove_files, validate_pdf_content
from ..services import watermark_service

router = APIRouter()
logger = logging.getLogger(__name__)

MAX_UPLOAD_BYTES = 50 * 1024 * 1024  # 50 MB

VALID_POSITIONS = {"center", "top", "bottom"}


@router.post("/watermark")
async def watermark_pdf(
    file: UploadFile = File(...),
    text: str = Form(...),
    opacity: float = Form(0.3),
    font_size: int = Form(40),
    position: str = Form("center"),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a PDF")

    if not text.strip():
        raise HTTPException(status_code=400, detail="Watermark text cannot be empty")

    if not 0.0 <= opacity <= 1.0:
        raise HTTPException(status_code=400, detail="Opacity must be between 0.0 and 1.0")

    if position not in VALID_POSITIONS:
        raise HTTPException(status_code=400, detail=f"Position must be one of: {', '.join(sorted(VALID_POSITIONS))}")

    ensure_temp_dir()

    try:
        content = await file.read()
        if len(content) > MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=413, detail="File exceeds the 50 MB limit")
        temp_path = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
        validate_pdf_content(content)
        temp_path.write_bytes(content)

        output_path = watermark_service.add_watermark(
            str(temp_path),
            text=text,
            opacity=opacity,
            font_size=font_size,
            position=position,
        )
        cleanup = BackgroundTask(remove_files, str(temp_path), output_path)
        return FileResponse(
            path=output_path,
            filename="watermarked.pdf",
            media_type="application/pdf",
            background=cleanup,
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception("Unexpected error")
        raise HTTPException(status_code=500, detail="An internal error occurred. Please try again.")
