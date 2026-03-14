import uuid
import zipfile
import pikepdf
import logging
from typing import List
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask
from ..utils.cleanup import get_temp_path, ensure_temp_dir, remove_files, validate_pdf_content
from ..services import unlock_service

router = APIRouter()
logger = logging.getLogger(__name__)

MAX_FILES = 100


@router.post("/unlock")
async def unlock_pdf(
    files: List[UploadFile] = File(...),
    password: str = Form(...),
):
    if len(files) > MAX_FILES:
        raise HTTPException(status_code=400, detail=f"Please upload at most {MAX_FILES} PDF files")

    clean_password = (password or "").strip()
    if not clean_password:
        raise HTTPException(status_code=400, detail="Password cannot be empty")
    if len(clean_password) > 128:
        raise HTTPException(status_code=400, detail="Password must be 128 characters or fewer")

    ensure_temp_dir()
    input_paths: list[str] = []
    output_paths: list[str] = []

    try:
        for file in files:
            if not (file.filename or "").lower().endswith(".pdf"):
                raise HTTPException(status_code=400, detail=f"File {file.filename} is not a PDF")
            content = await file.read()
            if not content:
                raise HTTPException(status_code=400, detail=f"File {file.filename or 'unknown'} is empty")
            validate_pdf_content(content)
            temp_path = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
            temp_path.write_bytes(content)
            input_paths.append(str(temp_path))

        for inp in input_paths:
            out = unlock_service.unlock_pdf(inp, password=clean_password)
            output_paths.append(out)

        # Single file: return the PDF directly
        if len(output_paths) == 1:
            cleanup = BackgroundTask(remove_files, *input_paths, *output_paths)
            return FileResponse(
                path=output_paths[0],
                filename="unlocked.pdf",
                media_type="application/pdf",
                background=cleanup,
            )

        # Multiple files: return a ZIP
        zip_path = str(get_temp_path(f"unlocked_{uuid.uuid4().hex}.zip"))
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
            for i, out in enumerate(output_paths):
                original_name = files[i].filename or f"file_{i+1}.pdf"
                arcname = f"unlocked_{original_name}"
                zf.write(out, arcname)

        cleanup = BackgroundTask(remove_files, *input_paths, *output_paths, zip_path)
        return FileResponse(
            path=zip_path,
            filename="unlocked_pdfs.zip",
            media_type="application/zip",
            background=cleanup,
        )
    except HTTPException:
        remove_files(*input_paths, *output_paths)
        raise
    except pikepdf.PasswordError:
        remove_files(*input_paths, *output_paths)
        raise HTTPException(status_code=400, detail="Incorrect password")
    except Exception:
        remove_files(*input_paths, *output_paths)
        logger.exception("Unexpected error")
        raise HTTPException(status_code=500, detail="An internal error occurred. Please try again.")
