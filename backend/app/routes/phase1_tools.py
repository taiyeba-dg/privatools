"""Phase 1 new tool routes: Word→PDF, Excel→PDF, PPT→PDF, TXT→PDF, Stamp, HEIC→JPG."""
import uuid
import logging
from pathlib import Path
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask
from ..utils.cleanup import get_temp_path, ensure_temp_dir, remove_files
from ..services import (
    word_to_pdf_service,
    excel_to_pdf_service,
    pptx_to_pdf_service,
    stamp_service,
    txt_to_pdf_service,
    heic_to_jpg_service,
)

router = APIRouter()
logger = logging.getLogger(__name__)

MAX_SIZE = 50 * 1024 * 1024  # 50 MB


# ─── Word → PDF ───────────────────────────────────────────
@router.post("/word-to-pdf")
async def word_to_pdf(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith((".docx", ".doc")):
        raise HTTPException(status_code=400, detail="Please upload a .docx file")

    ensure_temp_dir()
    try:
        content = await file.read()
        if len(content) > MAX_SIZE:
            raise HTTPException(status_code=413, detail="File exceeds 50 MB limit")
        temp = get_temp_path(f"upload_{uuid.uuid4().hex}.docx")
        temp.write_bytes(content)

        out = word_to_pdf_service.word_to_pdf(str(temp))
        cleanup = BackgroundTask(remove_files, str(temp), out)
        return FileResponse(out, filename="converted.pdf", media_type="application/pdf", background=cleanup)
    except HTTPException:
        raise
    except Exception:
        logger.exception("word-to-pdf error")
        raise HTTPException(status_code=500, detail="Conversion failed")


# ─── Excel → PDF ──────────────────────────────────────────
@router.post("/excel-to-pdf")
async def excel_to_pdf(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Please upload an .xlsx file")

    ensure_temp_dir()
    try:
        content = await file.read()
        if len(content) > MAX_SIZE:
            raise HTTPException(status_code=413, detail="File exceeds 50 MB limit")
        temp = get_temp_path(f"upload_{uuid.uuid4().hex}.xlsx")
        temp.write_bytes(content)

        out = excel_to_pdf_service.excel_to_pdf(str(temp))
        cleanup = BackgroundTask(remove_files, str(temp), out)
        return FileResponse(out, filename="converted.pdf", media_type="application/pdf", background=cleanup)
    except HTTPException:
        raise
    except Exception:
        logger.exception("excel-to-pdf error")
        raise HTTPException(status_code=500, detail="Conversion failed")


# ─── PowerPoint → PDF ────────────────────────────────────
@router.post("/pptx-to-pdf-convert")
async def pptx_to_pdf(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith((".pptx", ".ppt")):
        raise HTTPException(status_code=400, detail="Please upload a .pptx file")

    ensure_temp_dir()
    try:
        content = await file.read()
        if len(content) > MAX_SIZE:
            raise HTTPException(status_code=413, detail="File exceeds 50 MB limit")
        temp = get_temp_path(f"upload_{uuid.uuid4().hex}.pptx")
        temp.write_bytes(content)

        out = pptx_to_pdf_service.pptx_to_pdf(str(temp))
        cleanup = BackgroundTask(remove_files, str(temp), out)
        return FileResponse(out, filename="converted.pdf", media_type="application/pdf", background=cleanup)
    except HTTPException:
        raise
    except Exception:
        logger.exception("pptx-to-pdf error")
        raise HTTPException(status_code=500, detail="Conversion failed")


# ─── PDF Stamp ────────────────────────────────────────────
@router.post("/stamp-pdf")
async def stamp_pdf(
    file: UploadFile = File(...),
    stamp_type: str = Form("confidential"),
    custom_text: str = Form(None),
    opacity: float = Form(0.3),
    position: str = Form("center"),
    pages: str = Form("all"),
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a PDF")

    ensure_temp_dir()
    try:
        content = await file.read()
        if len(content) > MAX_SIZE:
            raise HTTPException(status_code=413, detail="File exceeds 50 MB limit")
        temp = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
        temp.write_bytes(content)

        out = stamp_service.stamp_pdf(str(temp), stamp_type, custom_text, opacity, position, pages)
        cleanup = BackgroundTask(remove_files, str(temp), out)
        return FileResponse(out, filename="stamped.pdf", media_type="application/pdf", background=cleanup)
    except HTTPException:
        raise
    except Exception:
        logger.exception("stamp error")
        raise HTTPException(status_code=500, detail="Stamping failed")


# ─── TXT → PDF ────────────────────────────────────────────
@router.post("/txt-to-pdf")
async def txt_to_pdf(
    file: UploadFile = File(...),
    font_size: int = Form(11),
):
    if not file.filename or not file.filename.lower().endswith(".txt"):
        raise HTTPException(status_code=400, detail="Please upload a .txt file")

    ensure_temp_dir()
    try:
        content = await file.read()
        if len(content) > MAX_SIZE:
            raise HTTPException(status_code=413, detail="File exceeds 50 MB limit")
        temp = get_temp_path(f"upload_{uuid.uuid4().hex}.txt")
        temp.write_bytes(content)

        out = txt_to_pdf_service.txt_to_pdf(str(temp), font_size=font_size)
        cleanup = BackgroundTask(remove_files, str(temp), out)
        return FileResponse(out, filename="converted.pdf", media_type="application/pdf", background=cleanup)
    except HTTPException:
        raise
    except Exception:
        logger.exception("txt-to-pdf error")
        raise HTTPException(status_code=500, detail="Conversion failed")


# ─── HEIC → JPG ──────────────────────────────────────────
@router.post("/heic-to-jpg")
async def heic_to_jpg(
    file: UploadFile = File(...),
    quality: int = Form(90),
):
    fname = file.filename or ""
    if not fname.lower().endswith((".heic", ".heif")):
        raise HTTPException(status_code=400, detail="Please upload a .heic or .heif file")

    ensure_temp_dir()
    try:
        content = await file.read()
        if len(content) > MAX_SIZE:
            raise HTTPException(status_code=413, detail="File exceeds 50 MB limit")
        suffix = Path(fname).suffix.lower()
        temp = get_temp_path(f"upload_{uuid.uuid4().hex}{suffix}")
        temp.write_bytes(content)

        out = heic_to_jpg_service.heic_to_jpg(str(temp), quality=quality)
        cleanup = BackgroundTask(remove_files, str(temp), out)
        return FileResponse(out, filename="converted.jpg", media_type="image/jpeg", background=cleanup)
    except HTTPException:
        raise
    except Exception:
        logger.exception("heic-to-jpg error")
        raise HTTPException(status_code=500, detail="Conversion failed")
