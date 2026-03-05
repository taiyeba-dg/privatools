import uuid
import logging
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from starlette.background import BackgroundTask
from ..utils.cleanup import get_temp_path, ensure_temp_dir, remove_files, validate_pdf_content
from ..services import metadata_service

router = APIRouter()
logger = logging.getLogger(__name__)

MAX_METADATA_FIELD_CHARS = 500


@router.post("/metadata")
async def get_metadata(file: UploadFile = File(...)):
    """Read metadata from a PDF and return as JSON."""
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a PDF")

    ensure_temp_dir()
    temp_path = None

    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")        temp_path = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
        validate_pdf_content(content)
        temp_path.write_bytes(content)

        meta = metadata_service.read_metadata(str(temp_path))
        return JSONResponse(meta)
    except HTTPException:
        if temp_path is not None:
            remove_files(str(temp_path))
        raise
    except Exception:
        if temp_path is not None:
            remove_files(str(temp_path))
        logger.exception("Unexpected error")
        raise HTTPException(status_code=500, detail="An internal error occurred. Please try again.")
    finally:
        if temp_path is not None:
            remove_files(str(temp_path))


@router.post("/metadata/update")
async def update_metadata(
    file: UploadFile = File(...),
    title: str = Form(""),
    author: str = Form(""),
    subject: str = Form(""),
    keywords: str = Form(""),
):
    """Update metadata fields in a PDF and return the updated file."""
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a PDF")
    for field_name, field_value in {
        "title": title,
        "author": author,
        "subject": subject,
        "keywords": keywords,
    }.items():
        if len(field_value or "") > MAX_METADATA_FIELD_CHARS:
            raise HTTPException(
                status_code=400,
                detail=f"{field_name} must be {MAX_METADATA_FIELD_CHARS} characters or fewer",
            )

    ensure_temp_dir()
    temp_path = None
    output_path = None

    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")        temp_path = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
        validate_pdf_content(content)
        temp_path.write_bytes(content)

        output_path = metadata_service.write_metadata(
            str(temp_path),
            title=title,
            author=author,
            subject=subject,
            keywords=keywords,
        )
        cleanup = BackgroundTask(remove_files, str(temp_path), output_path)
        return FileResponse(
            path=output_path,
            filename="updated_metadata.pdf",
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
