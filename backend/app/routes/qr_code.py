import uuid
import logging
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from fastapi.responses import FileResponse
from typing import Optional
from starlette.background import BackgroundTask
from ..utils.cleanup import get_temp_path, ensure_temp_dir, validate_pdf_content, remove_files
from ..services import qr_code_service

router = APIRouter()
logger = logging.getLogger(__name__)

MAX_SIZE = 50 * 1024 * 1024  # 50 MB


@router.post("/qr-code")
async def generate_qr_code(
    data: str = Form(...),
    size: int = Form(300, ge=64, le=2000),
    format: str = Form("png"),
    embed_in_pdf: Optional[UploadFile] = File(None),
    page: int = Form(1, ge=1),
    x: float = Form(50),
    y: float = Form(50),
    qr_size: float = Form(100, gt=0),
):
    if not data.strip():
        raise HTTPException(status_code=400, detail="QR code data cannot be empty")

    ensure_temp_dir()
    temp_pdf = None

    try:
        fmt = format.lower().strip()
        if fmt not in {"png", "pdf"}:
            raise HTTPException(status_code=400, detail="format must be either 'png' or 'pdf'")

        if embed_in_pdf and embed_in_pdf.filename:
            if not embed_in_pdf.filename.lower().endswith(".pdf"):
                raise HTTPException(status_code=400, detail="embed_in_pdf must be a PDF file")
            pdf_content = await embed_in_pdf.read()
            if len(pdf_content) > MAX_SIZE:
                raise HTTPException(status_code=413, detail="File exceeds 50 MB limit")
            validate_pdf_content(pdf_content)
            temp_pdf = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
            temp_pdf.write_bytes(pdf_content)
            output_path = qr_code_service.embed_qr_in_pdf(
                str(temp_pdf), data, page=page, x=x, y=y, qr_size=qr_size
            )
            cleanup = BackgroundTask(remove_files, str(temp_pdf), output_path)
            return FileResponse(
                path=output_path,
                filename="qr_embedded.pdf",
                media_type="application/pdf",
                background=cleanup,
            )

        if fmt == "pdf":
            output_path = qr_code_service.generate_qr_pdf(data, size=size)
            cleanup = BackgroundTask(remove_files, output_path)
            return FileResponse(
                path=output_path,
                filename="qr_code.pdf",
                media_type="application/pdf",
                background=cleanup,
            )
        else:
            output_path = qr_code_service.generate_qr_png(data, size=size)
            cleanup = BackgroundTask(remove_files, output_path)
            return FileResponse(
                path=output_path,
                filename="qr_code.png",
                media_type="image/png",
                background=cleanup,
            )
    except HTTPException:
        if temp_pdf is not None:
            remove_files(str(temp_pdf))
        raise
    except Exception:
        if temp_pdf is not None:
            remove_files(str(temp_pdf))
        logger.exception("Unexpected error")
        raise HTTPException(status_code=500, detail="An internal error occurred. Please try again.")
