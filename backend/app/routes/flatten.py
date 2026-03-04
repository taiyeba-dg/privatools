import uuid
import logging
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from ..utils.cleanup import get_temp_path, ensure_temp_dir, validate_pdf_content
from ..services import flatten_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/flatten")
async def flatten_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a PDF")

    ensure_temp_dir()

    try:
        temp_path = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
        content = await file.read()
        if len(content) > 50 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size exceeds 50 MB limit")
        validate_pdf_content(content)
        temp_path.write_bytes(content)

        output_path = flatten_service.flatten_pdf(str(temp_path))
        return FileResponse(
            path=output_path,
            filename="flattened.pdf",
            media_type="application/pdf",
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception("Unexpected error")
        raise HTTPException(status_code=500, detail="An internal error occurred. Please try again.")
