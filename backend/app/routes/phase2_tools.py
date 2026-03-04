"""Phase 2 tool routes: E-Sign PDF, Table Extractor, Background Remover."""
import uuid
import logging
from pathlib import Path
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from starlette.background import BackgroundTask
from ..utils.cleanup import get_temp_path, ensure_temp_dir, remove_files
from ..services import (
    esign_service,
    table_extractor_service,
    bg_remover_service,
)

router = APIRouter()
logger = logging.getLogger(__name__)

MAX_SIZE = 50 * 1024 * 1024  # 50 MB


# ─── E-Sign PDF ───────────────────────────────────────────
@router.post("/esign-pdf")
async def esign_pdf(
    file: UploadFile = File(...),
    signature: str = Form(...),
    page: int = Form(1),
    x: float = Form(100),
    y: float = Form(600),
    width: float = Form(200),
    height: float = Form(80),
):
    """Sign a PDF with an uploaded/drawn signature image."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a PDF")

    ensure_temp_dir()
    try:
        content = await file.read()
        if len(content) > MAX_SIZE:
            raise HTTPException(status_code=413, detail="File exceeds 50 MB limit")
        temp = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
        temp.write_bytes(content)

        out = esign_service.esign_pdf(
            str(temp), signature, page_number=page,
            x=x, y=y, width=width, height=height
        )
        cleanup = BackgroundTask(remove_files, str(temp), out)
        return FileResponse(out, filename="signed.pdf", media_type="application/pdf", background=cleanup)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception:
        logger.exception("esign-pdf error")
        raise HTTPException(status_code=500, detail="Signing failed")


# ─── PDF Table Extractor ─────────────────────────────────
@router.post("/extract-tables")
async def extract_tables(
    file: UploadFile = File(...),
    pages: str = Form("all"),
):
    """Extract tables from a PDF and return as CSV."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a PDF")

    ensure_temp_dir()
    try:
        content = await file.read()
        if len(content) > MAX_SIZE:
            raise HTTPException(status_code=413, detail="File exceeds 50 MB limit")
        temp = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
        temp.write_bytes(content)

        out = table_extractor_service.extract_tables(str(temp), pages=pages)
        cleanup = BackgroundTask(remove_files, str(temp), out)
        return FileResponse(out, filename="tables.csv", media_type="text/csv", background=cleanup)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception:
        logger.exception("extract-tables error")
        raise HTTPException(status_code=500, detail="Table extraction failed")


# ─── Background Remover ──────────────────────────────────
@router.post("/remove-background")
async def remove_background(
    file: UploadFile = File(...),
):
    """Remove the background from an image (runs locally, no API)."""
    fname = file.filename or ""
    if not fname.lower().endswith((".jpg", ".jpeg", ".png", ".webp", ".bmp")):
        raise HTTPException(status_code=400, detail="Please upload an image (JPG, PNG, WebP)")

    ensure_temp_dir()
    try:
        content = await file.read()
        if len(content) > MAX_SIZE:
            raise HTTPException(status_code=413, detail="File exceeds 50 MB limit")
        suffix = Path(fname).suffix.lower()
        temp = get_temp_path(f"upload_{uuid.uuid4().hex}{suffix}")
        temp.write_bytes(content)

        out = bg_remover_service.remove_background(str(temp))
        cleanup = BackgroundTask(remove_files, str(temp), out)
        return FileResponse(out, filename="no_background.png", media_type="image/png", background=cleanup)
    except HTTPException:
        raise
    except Exception:
        logger.exception("remove-background error")
        raise HTTPException(status_code=500, detail="Background removal failed")
