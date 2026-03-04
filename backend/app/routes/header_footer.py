import uuid
import logging
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from fastapi.responses import FileResponse
from ..utils.cleanup import get_temp_path, ensure_temp_dir, validate_pdf_content
from ..services import header_footer_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/header-footer")
async def add_header_footer(
    file: UploadFile = File(...),
    header_text: str = Form(""),
    footer_text: str = Form(""),
    font_size: int = Form(10),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a PDF")

    if not header_text.strip() and not footer_text.strip():
        raise HTTPException(
            status_code=400, detail="At least one of header or footer text must be provided"
        )

    ensure_temp_dir()

    try:
        temp_path = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
        content = await file.read()
        if len(content) > 50 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size exceeds 50 MB limit")
        validate_pdf_content(content)
        temp_path.write_bytes(content)

        output_path = header_footer_service.add_header_footer(
            str(temp_path),
            header_text=header_text,
            footer_text=footer_text,
            font_size=font_size,
        )
        return FileResponse(
            path=output_path,
            filename="header_footer.pdf",
            media_type="application/pdf",
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception("Unexpected error")
        raise HTTPException(status_code=500, detail="An internal error occurred. Please try again.")
