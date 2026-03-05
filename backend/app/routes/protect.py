import uuid
import logging
from typing import Optional
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask
from ..utils.cleanup import get_temp_path, ensure_temp_dir, remove_files, validate_pdf_content
from ..services import protect_service

router = APIRouter()
logger = logging.getLogger(__name__)



@router.post("/protect")
async def protect_pdf(
    file: UploadFile = File(...),
    password: str = Form(...),
    owner_password: Optional[str] = Form(None),
    allow_print: bool = Form(True),
    allow_extract: bool = Form(False),
    allow_modify: bool = Form(False),
):
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a PDF")

    clean_password = (password or "").strip()
    if not clean_password:
        raise HTTPException(status_code=400, detail="Password cannot be empty")
    if len(clean_password) > 128:
        raise HTTPException(status_code=400, detail="Password must be 128 characters or fewer")
    clean_owner_password = (owner_password or "").strip() or None
    if clean_owner_password and len(clean_owner_password) > 128:
        raise HTTPException(status_code=400, detail="Owner password must be 128 characters or fewer")

    ensure_temp_dir()
    temp_path = None
    output_path = None

    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")
            temp_path = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
        validate_pdf_content(content)
        temp_path.write_bytes(content)

        output_path = protect_service.protect_pdf(
            str(temp_path),
            password=clean_password,
            owner_pw=clean_owner_password,
            allow_print=allow_print,
            allow_extract=allow_extract,
            allow_modify=allow_modify,
        )
        cleanup = BackgroundTask(remove_files, str(temp_path), output_path)
        return FileResponse(
            path=output_path,
            filename="protected.pdf",
            media_type="application/pdf",
            background=cleanup,
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
