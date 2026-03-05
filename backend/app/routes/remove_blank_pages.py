import asyncio
import uuid
import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask
from ..utils.cleanup import get_temp_path, ensure_temp_dir, remove_files, validate_pdf_content

router = APIRouter()
logger = logging.getLogger(__name__)



def _process_blank_pages(data: bytes, sensitivity: int, out_path: str) -> str:
    """Detect and remove blank pages using fast pixel sampling."""
    import fitz

    doc = fitz.open(stream=data, filetype="pdf")
    threshold = (100 - sensitivity) / 100.0
    pages_to_keep = []

    for i in range(len(doc)):
        page = doc[i]

        # Fast path: if page has text content, keep it immediately
        if page.get_text("text").strip():
            pages_to_keep.append(i)
            continue

        # Render at low DPI for blank detection
        pix = page.get_pixmap(dpi=72)
        samples = pix.samples
        total_pixels = pix.width * pix.height
        n = pix.n  # channels per pixel

        # Fast sampling: check every 8th pixel instead of every pixel
        # This is 64x faster with negligible accuracy loss for blank detection
        stride = 8
        white_count = 0
        sample_count = 0

        # Use memoryview for zero-copy access
        mv = memoryview(samples)
        for y in range(0, pix.height, stride):
            row_offset = y * pix.width * n
            for x in range(0, pix.width, stride):
                offset = row_offset + x * n
                sample_count += 1
                # Check if pixel is near-white (all channels > 250)
                is_white = True
                for c in range(min(n, 3)):
                    if mv[offset + c] <= 250:
                        is_white = False
                        break
                if is_white:
                    white_count += 1

        ratio = white_count / sample_count if sample_count > 0 else 1
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
    out_path = None
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
        if out_path:
            remove_files(out_path)
        raise
    except Exception:
        if out_path:
            remove_files(out_path)
        logger.exception("Unexpected error")
        raise HTTPException(status_code=500, detail="An internal error occurred. Please try again.")
