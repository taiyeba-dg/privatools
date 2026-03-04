import logging
import uuid
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask
from ..utils.cleanup import get_temp_path, ensure_temp_dir, remove_files, validate_pdf_content
from ..services import bates_numbering_service

router = APIRouter()
logger = logging.getLogger(__name__)

VALID_POSITIONS = {
    "bottom-right",
    "bottom-left",
    "bottom-center",
    "top-right",
    "top-left",
    "top-center",
}


@router.post("/bates-numbering")
async def bates_numbering(
    file: UploadFile = File(...),
    prefix: str = Form(""),
    start_number: int = Form(1),
    digits: int = Form(6),
    position: str = Form("bottom-right"),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a PDF")

    if position not in VALID_POSITIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Position must be one of: {', '.join(sorted(VALID_POSITIONS))}",
        )

    ensure_temp_dir()

    try:
        temp_path = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
        content = await file.read()
        if len(content) > 50 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size exceeds 50 MB limit")
        validate_pdf_content(content)
        temp_path.write_bytes(content)

        output_path = bates_numbering_service.add_bates_numbering(
            str(temp_path),
            prefix=prefix,
            start_number=start_number,
            digits=digits,
            position=position,
        )
        cleanup = BackgroundTask(remove_files, str(temp_path), output_path)
        return FileResponse(
            path=output_path,
            filename="bates_numbered.pdf",
            media_type="application/pdf",
            background=cleanup,
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception("Unexpected error")
        raise HTTPException(status_code=500, detail="An internal error occurred. Please try again.")
