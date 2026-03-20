import logging
import uuid
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask
from ..utils.cleanup import get_temp_path, ensure_temp_dir, remove_files, validate_pdf_content
from ..services import crop_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/crop")
async def crop_pdf(
    file: UploadFile = File(...),
    top: float = Form(0.0),
    bottom: float = Form(0.0),
    left: float = Form(0.0),
    right: float = Form(0.0),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a PDF")

    if any(v < 0 for v in (top, bottom, left, right)):
        raise HTTPException(status_code=400, detail="Crop values must be non-negative")

    ensure_temp_dir()
    temp_path = None
    output_path = None

    try:
        temp_path = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
        content = await file.read()
        validate_pdf_content(content)
        temp_path.write_bytes(content)

        output_path = crop_service.crop_pdf(
            str(temp_path), top=top, bottom=bottom, left=left, right=right
        )
        cleanup = BackgroundTask(remove_files, str(temp_path), output_path)
        return FileResponse(
            path=output_path,
            filename="cropped.pdf",
            media_type="application/pdf",
            background=cleanup,
        )
    except HTTPException:
        to_remove = ([str(temp_path)] if temp_path is not None else []) + ([output_path] if output_path else [])
        remove_files(*to_remove)
        raise
    except Exception as e:
        to_remove = ([str(temp_path)] if temp_path is not None else []) + ([output_path] if output_path else [])
        remove_files(*to_remove)
        logger.exception("Unexpected error")
        raise HTTPException(status_code=500, detail=f"Processing failed: {e}")
