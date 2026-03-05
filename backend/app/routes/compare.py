import uuid
import logging
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from starlette.background import BackgroundTask
from ..utils.cleanup import get_temp_path, ensure_temp_dir, remove_files, validate_pdf_content
from ..services import compare_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/compare")
async def compare(
    file1: UploadFile = File(...),
    file2: UploadFile = File(...),
    mode: str = Form("visual"),
    highlight_color: str = Form("#ff0000"),
):
    for f in (file1, file2):
        if not f.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail=f"File {f.filename} is not a PDF")
    if mode not in {"visual", "text"}:
        raise HTTPException(status_code=400, detail="mode must be one of: visual, text")
    ensure_temp_dir()
    path1 = None
    path2 = None
    output_path = None
    try:
        path1 = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
        content1 = await file1.read()
        if len(content1) > 50 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="File too large (max 50 MB)")
        validate_pdf_content(content1)
        path1.write_bytes(content1)

        path2 = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
        content2 = await file2.read()
        if len(content2) > 50 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="File too large (max 50 MB)")
        validate_pdf_content(content2)
        path2.write_bytes(content2)

        if mode == "visual":
            output_path = compare_service.compare_visual(
                str(path1), str(path2), highlight_color=highlight_color
            )
            cleanup = BackgroundTask(remove_files, str(path1), str(path2), output_path)
            return FileResponse(
                path=output_path,
                filename="comparison.pdf",
                media_type="application/pdf",
                background=cleanup,
            )

        result = compare_service.compare_text(str(path1), str(path2))
        remove_files(str(path1), str(path2))
        return JSONResponse(result)
    except HTTPException:
        to_remove = (
            ([str(path1)] if path1 is not None else [])
            + ([str(path2)] if path2 is not None else [])
            + ([output_path] if output_path else [])
        )
        remove_files(*to_remove)
        raise
    except Exception:
        to_remove = (
            ([str(path1)] if path1 is not None else [])
            + ([str(path2)] if path2 is not None else [])
            + ([output_path] if output_path else [])
        )
        remove_files(*to_remove)
        logger.exception("Unexpected error")
        raise HTTPException(status_code=500, detail="An internal error occurred. Please try again.")
