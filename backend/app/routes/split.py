import logging
import uuid
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask
from ..utils.cleanup import get_temp_path, ensure_temp_dir, remove_files, validate_pdf_content
from ..services import split_service

router = APIRouter()
logger = logging.getLogger(__name__)


VALID_MODES = {"pages", "individual", "every_n"}


@router.post("/split")
async def split_pdf(
    file: UploadFile = File(...),
    mode: str = Form("pages"),
    pages: str = Form(""),
    n: int = Form(2),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a PDF")

    if mode not in VALID_MODES:
        raise HTTPException(status_code=400, detail=f"Mode must be one of: {', '.join(sorted(VALID_MODES))}")

    ensure_temp_dir()
    temp_path = None
    output_path = None

    try:
        content = await file.read()
        temp_path = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
        validate_pdf_content(content)
        temp_path.write_bytes(content)

        output_path = split_service.split_pdf(str(temp_path), mode=mode, pages=pages, n=n)

        cleanup = BackgroundTask(remove_files, str(temp_path), output_path)
        if output_path.endswith(".zip"):
            return FileResponse(
                path=output_path,
                filename="split_pages.zip",
                media_type="application/zip",
                background=cleanup,
            )
        return FileResponse(
            path=output_path,
            filename="split.pdf",
            media_type="application/pdf",
            background=cleanup,
        )
    except HTTPException:
        to_remove = ([str(temp_path)] if temp_path is not None else []) + ([output_path] if output_path else [])
        remove_files(*to_remove)
        raise
    except ValueError as e:
        to_remove = ([str(temp_path)] if temp_path is not None else []) + ([output_path] if output_path else [])
        remove_files(*to_remove)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        to_remove = ([str(temp_path)] if temp_path is not None else []) + ([output_path] if output_path else [])
        remove_files(*to_remove)
        logger.exception("Unexpected error")
        raise HTTPException(status_code=500, detail=f"Processing failed: {e}")
