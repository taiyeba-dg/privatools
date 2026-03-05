import uuid
from typing import List
import logging
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask
from ..utils.cleanup import get_temp_path, ensure_temp_dir, remove_files, validate_pdf_content
from ..services import merge_service

router = APIRouter()
logger = logging.getLogger(__name__)

MAX_UPLOAD_BYTES = 50 * 1024 * 1024  # 50 MB
MAX_FILES = 100
MAX_TOTAL_UPLOAD_BYTES = 200 * 1024 * 1024  # 200 MB


@router.post("/merge")
async def merge_pdfs(files: List[UploadFile] = File(...)):
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="Please upload at least 2 PDF files")
    if len(files) > MAX_FILES:
        raise HTTPException(status_code=400, detail=f"Please upload at most {MAX_FILES} PDF files")

    ensure_temp_dir()
    input_paths: list[str] = []
    output_path: str | None = None
    total_bytes = 0

    try:
        for file in files:
            if not (file.filename or "").lower().endswith(".pdf"):
                raise HTTPException(
                    status_code=400, detail=f"File {file.filename} is not a PDF"
                )
            content = await file.read()
            if not content:
                raise HTTPException(status_code=400, detail=f"File {file.filename or 'unknown'} is empty")
            if len(content) > MAX_UPLOAD_BYTES:
                raise HTTPException(status_code=413, detail=f"File {file.filename} exceeds the 50 MB limit")
            total_bytes += len(content)
            if total_bytes > MAX_TOTAL_UPLOAD_BYTES:
                raise HTTPException(status_code=413, detail="Combined PDF size exceeds the 200 MB limit")
            validate_pdf_content(content)
            temp_path = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
            temp_path.write_bytes(content)
            input_paths.append(str(temp_path))

        output_path = merge_service.merge_pdfs(input_paths)
        cleanup = BackgroundTask(remove_files, *input_paths, output_path)
        return FileResponse(
            path=output_path,
            filename="merged.pdf",
            media_type="application/pdf",
            background=cleanup,
        )
    except HTTPException:
        to_remove = input_paths + ([output_path] if output_path else [])
        remove_files(*to_remove)
        raise
    except Exception:
        to_remove = input_paths + ([output_path] if output_path else [])
        remove_files(*to_remove)
        logger.exception("Unexpected error")
        raise HTTPException(status_code=500, detail="An internal error occurred. Please try again.")
