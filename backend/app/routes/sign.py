import logging
import uuid
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask
from typing import Optional
from ..utils.cleanup import get_temp_path, ensure_temp_dir, remove_files, validate_pdf_content
from ..services import sign_service

router = APIRouter()
logger = logging.getLogger(__name__)



@router.post("/sign-pdf")
async def sign_pdf(
    file: UploadFile = File(...),
    signature: Optional[UploadFile] = File(None),
    signature_data: Optional[str] = Form(None),
    page: int = Form(1),
    x: float = Form(50),
    y: float = Form(50),
    width: float = Form(200),
    height: float = Form(80),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a PDF")

    ensure_temp_dir()

    pdf_content = await file.read()
    temp_pdf = None
    signature_path = None
    try:
        validate_pdf_content(pdf_content)
        temp_pdf = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
        temp_pdf.write_bytes(pdf_content)

        # Resolve signature image path
        if signature and signature.filename:
            sig_content = await signature.read()
            ext = "png"
            if signature.filename.lower().endswith(".jpg") or signature.filename.lower().endswith(".jpeg"):
                ext = "jpg"
            sig_path = get_temp_path(f"sig_{uuid.uuid4().hex}.{ext}")
            sig_path.write_bytes(sig_content)
            signature_path = str(sig_path)
        elif signature_data:
            signature_path = sign_service.decode_base64_signature(signature_data)
        else:
            raise HTTPException(status_code=400, detail="A signature image or drawn signature is required")

        output_path = sign_service.sign_pdf(
            str(temp_pdf),
            signature_path,
            page=page,
            x=x,
            y=y,
            width=width,
            height=height,
        )
        cleanup = BackgroundTask(remove_files, str(temp_pdf), signature_path, output_path)
        return FileResponse(
            path=output_path,
            filename="signed.pdf",
            media_type="application/pdf",
            background=cleanup,
        )
    except HTTPException:
        if temp_pdf is not None:
            remove_files(str(temp_pdf))
        if signature_path is not None:
            remove_files(signature_path)
        raise
    except Exception:
        if temp_pdf is not None:
            remove_files(str(temp_pdf))
        if signature_path is not None:
            remove_files(signature_path)
        logger.exception("Unexpected error")
        raise HTTPException(status_code=500, detail="An internal error occurred. Please try again.")
