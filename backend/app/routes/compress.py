import os
import uuid
import logging
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask
from ..utils.cleanup import get_temp_path, ensure_temp_dir, remove_files, validate_pdf_content
from ..services import compress_service

router = APIRouter()
logger = logging.getLogger(__name__)

VALID_LEVELS = {"light", "recommended", "extreme"}


@router.post("/compress")
async def compress_pdf(
    file: UploadFile = File(...),
    level: str = Form("recommended"),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a PDF")
    if level not in VALID_LEVELS:
        raise HTTPException(status_code=400, detail=f"level must be one of: {', '.join(sorted(VALID_LEVELS))}")

    ensure_temp_dir()
    temp_path = None
    output_path = None

    try:
        content = await file.read()
        original_size = len(content)
        temp_path = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
        validate_pdf_content(content)
        temp_path.write_bytes(content)

        output_path = compress_service.compress_pdf(str(temp_path), level=level)
        compressed_size = os.path.getsize(output_path)
        cleanup = BackgroundTask(remove_files, str(temp_path), output_path)
        return FileResponse(
            path=output_path,
            filename="compressed.pdf",
            media_type="application/pdf",
            background=cleanup,
            headers={
                "X-Original-Size": str(original_size),
                "X-Compressed-Size": str(compressed_size),
            },
        )
    except HTTPException:
        to_remove = ([str(temp_path)] if temp_path is not None else []) + ([output_path] if output_path else [])
        remove_files(*to_remove)
        raise
    except Exception:
        to_remove = ([str(temp_path)] if temp_path is not None else []) + ([output_path] if output_path else [])
        remove_files(*to_remove)
        logger.exception("Unexpected error")
        raise HTTPException(status_code=500, detail="An internal error occurred. Please try again.")
