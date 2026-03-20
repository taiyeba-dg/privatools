import json
import logging
import re
import uuid
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from starlette.background import BackgroundTask
from ..utils.cleanup import get_temp_path, ensure_temp_dir, remove_files, validate_pdf_content
from ..services import redact_service

router = APIRouter()
logger = logging.getLogger(__name__)



@router.post("/redact")
async def redact_pdf(
    file: UploadFile = File(...),
    redactions: str = Form(...),
    color: str = Form("#000000"),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a PDF")

    content = await file.read()
    try:
        rects = json.loads(redactions)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid redactions JSON")

    if not isinstance(rects, list):
        raise HTTPException(status_code=400, detail="Redactions must be a JSON array")

    if not re.match(r'^#[0-9a-fA-F]{6}$', color):
        raise HTTPException(status_code=400, detail="Color must be a valid hex color (e.g. #000000)")

    ensure_temp_dir()
    temp_pdf = None
    output_path = None

    try:
        validate_pdf_content(content)
        temp_pdf = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
        temp_pdf.write_bytes(content)

        output_path = redact_service.redact_pdf(str(temp_pdf), rects, color=color)
        cleanup = BackgroundTask(remove_files, str(temp_pdf), output_path)
        return FileResponse(
            path=output_path,
            filename="redacted.pdf",
            media_type="application/pdf",
            background=cleanup,
        )
    except HTTPException:
        to_remove = ([str(temp_pdf)] if temp_pdf is not None else []) + ([output_path] if output_path else [])
        remove_files(*to_remove)
        raise
    except Exception as e:
        to_remove = ([str(temp_pdf)] if temp_pdf is not None else []) + ([output_path] if output_path else [])
        remove_files(*to_remove)
        logger.exception("Unexpected error")
        raise HTTPException(status_code=500, detail=f"Processing failed: {e}")
