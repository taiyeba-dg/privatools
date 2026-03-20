import uuid
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask
from ..utils.cleanup import get_temp_path, ensure_temp_dir, remove_files, validate_pdf_content

router = APIRouter()
logger = logging.getLogger(__name__)



@router.post("/auto-crop")
async def auto_crop(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a PDF")

    ensure_temp_dir()

    content = await file.read()
    doc = None
    out_path = None
    try:
        validate_pdf_content(content)
        import fitz

        doc = fitz.open(stream=content, filetype="pdf")
        for page in doc:
            blocks = page.get_text("dict")["blocks"]
            if not blocks:
                continue
            rects = [fitz.Rect(b["bbox"]) for b in blocks]
            union = rects[0]
            for r in rects[1:]:
                union |= r
            margin = 20
            crop = fitz.Rect(
                max(0, union.x0 - margin),
                max(0, union.y0 - margin),
                min(page.rect.width, union.x1 + margin),
                min(page.rect.height, union.y1 + margin),
            )
            page.set_cropbox(crop)

        out_path = str(get_temp_path(f"cropped_{uuid.uuid4().hex}.pdf"))
        doc.save(out_path)
        doc.close()

        cleanup = BackgroundTask(remove_files, out_path)
        return FileResponse(
            path=out_path,
            filename="cropped.pdf",
            media_type="application/pdf",
            background=cleanup,
        )
    except HTTPException:
        if doc is not None:
            try:
                doc.close()
            except Exception as e:
                pass
        if out_path:
            remove_files(out_path)
        raise
    except Exception as e:
        if doc is not None:
            try:
                doc.close()
            except Exception as e:
                pass
        if out_path:
            remove_files(out_path)
        logger.exception("Unexpected error")
        raise HTTPException(status_code=500, detail=f"Processing failed: {e}")
