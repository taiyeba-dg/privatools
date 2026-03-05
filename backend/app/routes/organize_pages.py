import uuid
import json
import logging
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from starlette.background import BackgroundTask
from ..utils.cleanup import get_temp_path, ensure_temp_dir, remove_files, validate_pdf_content
from ..services import organize_pages_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/organize-pages/thumbnails")
async def get_thumbnails(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a PDF")
    ensure_temp_dir()
    temp_path = None
    try:
        temp_path = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
        content = await file.read()
        if len(content) > 50 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="File too large (max 50 MB)")
        validate_pdf_content(content)
        temp_path.write_bytes(content)
        thumbnails = organize_pages_service.generate_thumbnails(str(temp_path))
        remove_files(str(temp_path))
        return JSONResponse({"thumbnails": thumbnails})
    except HTTPException:
        if temp_path is not None:
            remove_files(str(temp_path))
        raise
    except Exception:
        if temp_path is not None:
            remove_files(str(temp_path))
        logger.exception("Unexpected error")
        raise HTTPException(status_code=500, detail="An internal error occurred. Please try again.")


@router.post("/organize-pages")
async def organize_pages(file: UploadFile = File(...), page_order: str = Form(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a PDF")
    ensure_temp_dir()
    temp_path = None
    output_path = None
    try:
        temp_path = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
        content = await file.read()
        if len(content) > 50 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="File too large (max 50 MB)")
        validate_pdf_content(content)
        temp_path.write_bytes(content)
        order = json.loads(page_order)
        output_path = organize_pages_service.reorder_pages(str(temp_path), order)
        cleanup = BackgroundTask(remove_files, str(temp_path), output_path)
        return FileResponse(
            path=output_path,
            filename="organized.pdf",
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
