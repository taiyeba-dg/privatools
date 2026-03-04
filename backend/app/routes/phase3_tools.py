"""Phase 3 tool routes: URL→PDF, PDF→Markdown, SVG→PNG, Barcode, Image Watermark, Favicon, Collage."""
import uuid
import logging
from pathlib import Path
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask
from ..utils.cleanup import get_temp_path, ensure_temp_dir, remove_files
from ..services import (
    url_to_pdf_service,
    pdf_to_markdown_service,
    svg_to_png_service,
    barcode_service,
    image_watermark_service,
    favicon_service,
    collage_service,
)

router = APIRouter()
logger = logging.getLogger(__name__)
MAX_SIZE = 50 * 1024 * 1024


# ─── URL → PDF ────────────────────────────────────────────
@router.post("/url-to-pdf")
async def url_to_pdf(url: str = Form(...)):
    """Convert a URL to PDF."""
    if not url.startswith(("http://", "https://")):
        raise HTTPException(status_code=400, detail="Please provide a valid URL starting with http:// or https://")
    try:
        out = url_to_pdf_service.url_to_pdf(url)
        cleanup = BackgroundTask(remove_files, out)
        return FileResponse(out, filename="webpage.pdf", media_type="application/pdf", background=cleanup)
    except Exception:
        logger.exception("url-to-pdf error")
        raise HTTPException(status_code=500, detail="Failed to convert URL to PDF")


# ─── PDF → Markdown ───────────────────────────────────────
@router.post("/pdf-to-markdown")
async def pdf_to_markdown(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a PDF")
    ensure_temp_dir()
    try:
        content = await file.read()
        if len(content) > MAX_SIZE:
            raise HTTPException(status_code=413, detail="File exceeds 50 MB limit")
        temp = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
        temp.write_bytes(content)
        out = pdf_to_markdown_service.pdf_to_markdown(str(temp))
        cleanup = BackgroundTask(remove_files, str(temp), out)
        return FileResponse(out, filename="document.md", media_type="text/markdown", background=cleanup)
    except HTTPException:
        raise
    except Exception:
        logger.exception("pdf-to-markdown error")
        raise HTTPException(status_code=500, detail="Conversion failed")


# ─── SVG → PNG ────────────────────────────────────────────
@router.post("/svg-to-png")
async def svg_to_png(file: UploadFile = File(...), scale: float = Form(2.0)):
    if not file.filename or not file.filename.lower().endswith(".svg"):
        raise HTTPException(status_code=400, detail="Please upload an SVG file")
    ensure_temp_dir()
    try:
        content = await file.read()
        if len(content) > MAX_SIZE:
            raise HTTPException(status_code=413, detail="File exceeds 50 MB limit")
        temp = get_temp_path(f"upload_{uuid.uuid4().hex}.svg")
        temp.write_bytes(content)
        out = svg_to_png_service.svg_to_png(str(temp), scale=scale)
        cleanup = BackgroundTask(remove_files, str(temp), out)
        return FileResponse(out, filename="converted.png", media_type="image/png", background=cleanup)
    except HTTPException:
        raise
    except Exception:
        logger.exception("svg-to-png error")
        raise HTTPException(status_code=500, detail="Conversion failed")


# ─── Barcode Generator ───────────────────────────────────
@router.post("/generate-barcode")
async def generate_barcode(
    data: str = Form(...),
    barcode_type: str = Form("code128"),
):
    try:
        out = barcode_service.generate_barcode(data, barcode_type)
        cleanup = BackgroundTask(remove_files, out)
        return FileResponse(out, filename="barcode.png", media_type="image/png", background=cleanup)
    except Exception:
        logger.exception("barcode error")
        raise HTTPException(status_code=500, detail="Barcode generation failed")


# ─── Image Watermark ──────────────────────────────────────
@router.post("/image-watermark")
async def image_watermark(
    file: UploadFile = File(...),
    text: str = Form("WATERMARK"),
    opacity: int = Form(80),
    position: str = Form("center"),
    font_size: int = Form(40),
):
    fname = file.filename or ""
    if not fname.lower().endswith((".jpg", ".jpeg", ".png", ".webp", ".bmp")):
        raise HTTPException(status_code=400, detail="Please upload an image")
    ensure_temp_dir()
    try:
        content = await file.read()
        if len(content) > MAX_SIZE:
            raise HTTPException(status_code=413, detail="File exceeds 50 MB limit")
        suffix = Path(fname).suffix.lower()
        temp = get_temp_path(f"upload_{uuid.uuid4().hex}{suffix}")
        temp.write_bytes(content)
        out = image_watermark_service.add_watermark(str(temp), text, opacity, position, font_size)
        cleanup = BackgroundTask(remove_files, str(temp), out)
        return FileResponse(out, filename="watermarked.png", media_type="image/png", background=cleanup)
    except HTTPException:
        raise
    except Exception:
        logger.exception("watermark error")
        raise HTTPException(status_code=500, detail="Watermark failed")


# ─── Favicon Generator ───────────────────────────────────
@router.post("/generate-favicon")
async def generate_favicon(file: UploadFile = File(...)):
    fname = file.filename or ""
    if not fname.lower().endswith((".jpg", ".jpeg", ".png", ".webp", ".bmp", ".svg")):
        raise HTTPException(status_code=400, detail="Please upload an image")
    ensure_temp_dir()
    try:
        content = await file.read()
        if len(content) > MAX_SIZE:
            raise HTTPException(status_code=413, detail="File exceeds 50 MB limit")
        suffix = Path(fname).suffix.lower()
        temp = get_temp_path(f"upload_{uuid.uuid4().hex}{suffix}")
        temp.write_bytes(content)
        out = favicon_service.generate_favicon(str(temp))
        cleanup = BackgroundTask(remove_files, str(temp), out)
        return FileResponse(out, filename="favicon.ico", media_type="image/x-icon", background=cleanup)
    except HTTPException:
        raise
    except Exception:
        logger.exception("favicon error")
        raise HTTPException(status_code=500, detail="Favicon generation failed")


# ─── Collage Maker ────────────────────────────────────────
@router.post("/make-collage")
async def make_collage(
    files: list[UploadFile] = File(...),
    columns: int = Form(3),
    spacing: int = Form(10),
    bg_color: str = Form("#ffffff"),
):
    if not files or len(files) < 2:
        raise HTTPException(status_code=400, detail="Please upload at least 2 images")
    ensure_temp_dir()
    try:
        temp_paths = []
        for f in files:
            content = await f.read()
            suffix = Path(f.filename or "img.jpg").suffix.lower()
            temp = get_temp_path(f"upload_{uuid.uuid4().hex}{suffix}")
            temp.write_bytes(content)
            temp_paths.append(str(temp))

        out = collage_service.make_collage(temp_paths, columns, spacing, bg_color)
        all_temps = temp_paths + [out]
        cleanup = BackgroundTask(remove_files, *all_temps)
        return FileResponse(out, filename="collage.jpg", media_type="image/jpeg", background=cleanup)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception:
        logger.exception("collage error")
        raise HTTPException(status_code=500, detail="Collage creation failed")
