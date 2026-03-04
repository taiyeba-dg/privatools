import uuid
from typing import List
import logging
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask
from ..utils.cleanup import get_temp_path, ensure_temp_dir, remove_files
from ..services import image_to_pdf_service

ALLOWED_IMAGE_TYPES = {".jpg", ".jpeg", ".png", ".bmp", ".gif", ".tiff", ".webp"}

router = APIRouter()
logger = logging.getLogger(__name__)

MAX_UPLOAD_BYTES = 50 * 1024 * 1024  # 50 MB


@router.post("/image-to-pdf")
async def image_to_pdf(
    files: List[UploadFile] = File(...),
    page_size: str = Form("A4"),
):
    if not files:
        raise HTTPException(status_code=400, detail="Please upload at least one image")

    ensure_temp_dir()
    input_paths = []

    try:
        for file in files:
            suffix = "." + file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
            if suffix not in ALLOWED_IMAGE_TYPES:
                raise HTTPException(
                    status_code=400, detail=f"File {file.filename} is not a supported image"
                )
            content = await file.read()
            if len(content) > MAX_UPLOAD_BYTES:
                raise HTTPException(status_code=413, detail=f"File {file.filename} exceeds the 50 MB limit")
            temp_path = get_temp_path(f"upload_{uuid.uuid4().hex}{suffix}")
            temp_path.write_bytes(content)
            input_paths.append(str(temp_path))

        output_path = image_to_pdf_service.images_to_pdf(input_paths, page_size=page_size)
        cleanup = BackgroundTask(remove_files, *input_paths, output_path)
        return FileResponse(
            path=output_path,
            filename="images.pdf",
            media_type="application/pdf",
            background=cleanup,
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception("Unexpected error")
        raise HTTPException(status_code=500, detail="An internal error occurred. Please try again.")
