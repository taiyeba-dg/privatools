"""Final phase routes: White-Out, Attachment, Permissions, JSON/XML→PDF, Annotate, Shapes, EPUB→PDF, RTF→PDF."""
import uuid
import json
import logging
from pathlib import Path
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask
from ..utils.cleanup import get_temp_path, ensure_temp_dir, remove_files
from ..services import (
    whiteout_service,
    attachment_service,
    permissions_service,
    json_to_pdf_service,
    xml_to_pdf_service,
    annotate_service,
    shapes_service,
    epub_to_pdf_service,
    rtf_to_pdf_service,
)

router = APIRouter()
logger = logging.getLogger(__name__)
MAX_SIZE = 50 * 1024 * 1024


# ─── White-Out / Eraser ──────────────────────────────────
@router.post("/whiteout-pdf")
async def whiteout_pdf(
    file: UploadFile = File(...),
    regions: str = Form('[]'),
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
        region_list = json.loads(regions) if regions else []
        if not region_list:
            region_list = [{"page": 1, "x": 100, "y": 100, "width": 200, "height": 30}]
        out = whiteout_service.whiteout_pdf(str(temp), region_list)
        cleanup = BackgroundTask(remove_files, str(temp), out)
        return FileResponse(out, filename="whiteout.pdf", media_type="application/pdf", background=cleanup)
    except HTTPException:
        raise
    except Exception:
        logger.exception("whiteout error")
        raise HTTPException(status_code=500, detail="White-out failed")


# ─── Add Attachment ───────────────────────────────────────
@router.post("/add-attachment")
async def add_attachment(
    file: UploadFile = File(...),
    attachment: UploadFile = File(...),
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a PDF")
    ensure_temp_dir()
    try:
        pdf_content = await file.read()
        att_content = await attachment.read()
        if len(pdf_content) + len(att_content) > MAX_SIZE:
            raise HTTPException(status_code=413, detail="Files exceed 50 MB limit")
        temp_pdf = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
        temp_pdf.write_bytes(pdf_content)
        att_name = attachment.filename or "attachment"
        temp_att = get_temp_path(f"att_{uuid.uuid4().hex}_{att_name}")
        temp_att.write_bytes(att_content)
        out = attachment_service.add_attachment(str(temp_pdf), str(temp_att), att_name)
        cleanup = BackgroundTask(remove_files, str(temp_pdf), str(temp_att), out)
        return FileResponse(out, filename="with_attachment.pdf", media_type="application/pdf", background=cleanup)
    except HTTPException:
        raise
    except Exception:
        logger.exception("attachment error")
        raise HTTPException(status_code=500, detail="Attachment failed")


# ─── PDF Permissions ──────────────────────────────────────
@router.post("/set-permissions")
async def set_permissions(
    file: UploadFile = File(...),
    owner_password: str = Form(""),
    allow_print: bool = Form(True),
    allow_copy: bool = Form(True),
    allow_modify: bool = Form(True),
    allow_annotate: bool = Form(True),
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
        out = permissions_service.set_permissions(str(temp), owner_password,
            allow_print, allow_copy, allow_modify, allow_annotate)
        cleanup = BackgroundTask(remove_files, str(temp), out)
        return FileResponse(out, filename="permissions.pdf", media_type="application/pdf", background=cleanup)
    except HTTPException:
        raise
    except Exception:
        logger.exception("permissions error")
        raise HTTPException(status_code=500, detail="Permission setting failed")


# ─── JSON → PDF ──────────────────────────────────────────
@router.post("/json-to-pdf")
async def json_to_pdf(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".json"):
        raise HTTPException(status_code=400, detail="Please upload a .json file")
    ensure_temp_dir()
    try:
        content = await file.read()
        if len(content) > MAX_SIZE:
            raise HTTPException(status_code=413, detail="File exceeds 50 MB limit")
        temp = get_temp_path(f"upload_{uuid.uuid4().hex}.json")
        temp.write_bytes(content)
        out = json_to_pdf_service.json_to_pdf(str(temp))
        cleanup = BackgroundTask(remove_files, str(temp), out)
        return FileResponse(out, filename="document.pdf", media_type="application/pdf", background=cleanup)
    except HTTPException:
        raise
    except Exception:
        logger.exception("json-to-pdf error")
        raise HTTPException(status_code=500, detail="Conversion failed")


# ─── XML → PDF ───────────────────────────────────────────
@router.post("/xml-to-pdf")
async def xml_to_pdf(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".xml"):
        raise HTTPException(status_code=400, detail="Please upload an .xml file")
    ensure_temp_dir()
    try:
        content = await file.read()
        if len(content) > MAX_SIZE:
            raise HTTPException(status_code=413, detail="File exceeds 50 MB limit")
        temp = get_temp_path(f"upload_{uuid.uuid4().hex}.xml")
        temp.write_bytes(content)
        out = xml_to_pdf_service.xml_to_pdf(str(temp))
        cleanup = BackgroundTask(remove_files, str(temp), out)
        return FileResponse(out, filename="document.pdf", media_type="application/pdf", background=cleanup)
    except HTTPException:
        raise
    except Exception:
        logger.exception("xml-to-pdf error")
        raise HTTPException(status_code=500, detail="Conversion failed")


# ─── PDF Annotate ─────────────────────────────────────────
@router.post("/annotate-pdf")
async def annotate_pdf(
    file: UploadFile = File(...),
    annotations: str = Form('[]'),
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
        ann_list = json.loads(annotations) if annotations else []
        if not ann_list:
            ann_list = [{"type": "highlight", "page": 1, "x": 72, "y": 72, "width": 200, "height": 14}]
        out = annotate_service.annotate_pdf(str(temp), ann_list)
        cleanup = BackgroundTask(remove_files, str(temp), out)
        return FileResponse(out, filename="annotated.pdf", media_type="application/pdf", background=cleanup)
    except HTTPException:
        raise
    except Exception:
        logger.exception("annotate error")
        raise HTTPException(status_code=500, detail="Annotation failed")


# ─── Add Shapes ──────────────────────────────────────────
@router.post("/add-shapes")
async def add_shapes(
    file: UploadFile = File(...),
    shapes: str = Form('[]'),
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
        shape_list = json.loads(shapes) if shapes else []
        if not shape_list:
            shape_list = [{"type": "rectangle", "page": 1, "x": 100, "y": 100, "width": 200, "height": 100, "color": "#ff0000"}]
        out = shapes_service.add_shapes(str(temp), shape_list)
        cleanup = BackgroundTask(remove_files, str(temp), out)
        return FileResponse(out, filename="shapes.pdf", media_type="application/pdf", background=cleanup)
    except HTTPException:
        raise
    except Exception:
        logger.exception("shapes error")
        raise HTTPException(status_code=500, detail="Shape addition failed")


# ─── EPUB → PDF ──────────────────────────────────────────
@router.post("/epub-to-pdf")
async def epub_to_pdf(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".epub"):
        raise HTTPException(status_code=400, detail="Please upload an .epub file")
    ensure_temp_dir()
    try:
        content = await file.read()
        if len(content) > MAX_SIZE:
            raise HTTPException(status_code=413, detail="File exceeds 50 MB limit")
        temp = get_temp_path(f"upload_{uuid.uuid4().hex}.epub")
        temp.write_bytes(content)
        out = epub_to_pdf_service.epub_to_pdf(str(temp))
        cleanup = BackgroundTask(remove_files, str(temp), out)
        return FileResponse(out, filename="book.pdf", media_type="application/pdf", background=cleanup)
    except HTTPException:
        raise
    except Exception:
        logger.exception("epub-to-pdf error")
        raise HTTPException(status_code=500, detail="Conversion failed")


# ─── RTF → PDF ───────────────────────────────────────────
@router.post("/rtf-to-pdf")
async def rtf_to_pdf(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".rtf"):
        raise HTTPException(status_code=400, detail="Please upload a .rtf file")
    ensure_temp_dir()
    try:
        content = await file.read()
        if len(content) > MAX_SIZE:
            raise HTTPException(status_code=413, detail="File exceeds 50 MB limit")
        temp = get_temp_path(f"upload_{uuid.uuid4().hex}.rtf")
        temp.write_bytes(content)
        out = rtf_to_pdf_service.rtf_to_pdf(str(temp))
        cleanup = BackgroundTask(remove_files, str(temp), out)
        return FileResponse(out, filename="document.pdf", media_type="application/pdf", background=cleanup)
    except HTTPException:
        raise
    except Exception:
        logger.exception("rtf-to-pdf error")
        raise HTTPException(status_code=500, detail="Conversion failed")
