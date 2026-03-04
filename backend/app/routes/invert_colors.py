import asyncio
import uuid
import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask
from ..utils.cleanup import get_temp_path, ensure_temp_dir, remove_files, validate_pdf_content

router = APIRouter()
logger = logging.getLogger(__name__)

MAX_SIZE = 50 * 1024 * 1024  # 50 MB


def _invert(input_path: str, dpi: int) -> str:
    """CPU-heavy pixmap inversion — runs in a thread."""
    import fitz

    src = fitz.open(input_path)
    doc = fitz.open()
    for page in src:
        pix = page.get_pixmap(matrix=fitz.Matrix(dpi/72, dpi/72))
        pix.invert_irect(pix.irect)
        new_page = doc.new_page(width=page.rect.width, height=page.rect.height)
        new_page.insert_image(new_page.rect, pixmap=pix)

    out_path = str(get_temp_path(f"inverted_{uuid.uuid4().hex}.pdf"))
    doc.save(out_path, deflate=True, garbage=4)
    doc.close()
    src.close()
    return out_path


@router.post("/invert-colors")
async def invert_colors(
    file: UploadFile = File(...),
    dpi: int = Form(72),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a PDF")

    ensure_temp_dir()

    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File exceeds 50 MB limit")

    try:
        validate_pdf_content(content)
        temp_pdf = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
        temp_pdf.write_bytes(content)

        # Clamp DPI to a reasonable range (72–200)
        safe_dpi = max(72, min(dpi, 200))

        output_path = await asyncio.to_thread(_invert, str(temp_pdf), safe_dpi)
        cleanup = BackgroundTask(remove_files, str(temp_pdf), output_path)
        return FileResponse(
            path=output_path,
            filename="inverted.pdf",
            media_type="application/pdf",
            background=cleanup,
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception("Unexpected error")
        raise HTTPException(status_code=500, detail="An internal error occurred. Please try again.")
