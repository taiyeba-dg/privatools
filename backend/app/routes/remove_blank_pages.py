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


def _process_blank_pages(data: bytes, sensitivity: int, out_path: str) -> str:
    """CPU-heavy pixel analysis — runs in a thread to avoid blocking the event loop."""
    import fitz

    doc = fitz.open(stream=data, filetype="pdf")
    threshold = (100 - sensitivity) / 100.0
    pages_to_keep = []
    for i in range(len(doc)):
        page = doc[i]
        # Quick check: if page has text content, keep it immediately (fast path)
        if page.get_text("text").strip():
            pages_to_keep.append(i)
            continue
        # Slow path: render to pixmap and check whiteness
        pix = page.get_pixmap(dpi=72)
        samples = pix.samples
        total = len(samples)
        white = sum(
            1
            for j in range(0, total, pix.n)
            if all(samples[j + c] > 250 for c in range(min(pix.n, 3)))
        )
        ratio = white / (total // pix.n) if total > 0 else 1
        if ratio < (1 - threshold):
            pages_to_keep.append(i)
    if not pages_to_keep:
        pages_to_keep = list(range(len(doc)))
    new_doc = fitz.open()
    for i in pages_to_keep:
        new_doc.insert_pdf(doc, from_page=i, to_page=i)
    new_doc.save(out_path)
    new_doc.close()
    doc.close()
    return out_path


@router.post("/remove-blank-pages")
async def remove_blank_pages(
    file: UploadFile = File(...),
    sensitivity: int = Form(85),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a PDF")

    ensure_temp_dir()

    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File exceeds 50 MB limit")

    try:
        validate_pdf_content(content)
        out_path = str(get_temp_path(f"cleaned_{uuid.uuid4().hex}.pdf"))
        await asyncio.to_thread(_process_blank_pages, content, sensitivity, out_path)
        cleanup = BackgroundTask(remove_files, out_path)
        return FileResponse(
            path=out_path,
            filename="cleaned.pdf",
            media_type="application/pdf",
            background=cleanup,
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception("Unexpected error")
        raise HTTPException(status_code=500, detail="An internal error occurred. Please try again.")
