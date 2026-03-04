import json
import logging
import uuid
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask
from ..utils.cleanup import get_temp_path, ensure_temp_dir, remove_files, validate_pdf_content
from ..services import edit_pdf_service

router = APIRouter()
logger = logging.getLogger(__name__)

MAX_SIZE = 50 * 1024 * 1024  # 50 MB


@router.post("/edit-pdf")
async def edit_pdf(
    file: UploadFile = File(...),
    edits: str = Form(...),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a PDF")

    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File exceeds 50 MB limit")

    try:
        edits_list = json.loads(edits)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid edits JSON")

    if not isinstance(edits_list, list):
        raise HTTPException(status_code=400, detail="Edits must be a JSON array")

    ensure_temp_dir()

    try:
        validate_pdf_content(content)
        temp_pdf = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
        temp_pdf.write_bytes(content)

        output_path = edit_pdf_service.edit_pdf(str(temp_pdf), edits_list)
        cleanup = BackgroundTask(remove_files, str(temp_pdf), output_path)
        return FileResponse(
            path=output_path,
            filename="edited.pdf",
            media_type="application/pdf",
            background=cleanup,
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception("Unexpected error")
        raise HTTPException(status_code=500, detail="An internal error occurred. Please try again.")
