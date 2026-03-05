import uuid
import json
import logging
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from starlette.background import BackgroundTask
from ..utils.cleanup import get_temp_path, ensure_temp_dir, validate_pdf_content, remove_files
from ..services import fill_form_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/fill-form/fields")
async def get_fields(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a PDF")
    ensure_temp_dir()
    temp_path = None
    try:
        temp_path = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
        content = await file.read()
        validate_pdf_content(content)
        temp_path.write_bytes(content)
        fields = fill_form_service.get_form_fields(str(temp_path))
        remove_files(str(temp_path))
        return JSONResponse({"fields": fields})
    except HTTPException:
        if temp_path is not None:
            remove_files(str(temp_path))
        raise
    except Exception as exc:
        if temp_path is not None:
            remove_files(str(temp_path))
        if "no form field" in str(exc).lower() or type(exc).__name__ == "ValidationError":
            return JSONResponse({"fields": []})
        logger.exception("Unexpected error")
        raise HTTPException(status_code=500, detail="An internal error occurred. Please try again.")


@router.post("/fill-form")
async def fill_form(file: UploadFile = File(...), field_values: str = Form(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a PDF")
    ensure_temp_dir()
    temp_path = None
    try:
        temp_path = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
        content = await file.read()
        validate_pdf_content(content)
        temp_path.write_bytes(content)
        values = json.loads(field_values)
        output_path = fill_form_service.fill_form(str(temp_path), values)
        cleanup = BackgroundTask(remove_files, str(temp_path), output_path)
        return FileResponse(
            path=output_path,
            filename="filled_form.pdf",
            media_type="application/pdf",
            background=cleanup,
        )
    except json.JSONDecodeError as exc:
        if temp_path is not None:
            remove_files(str(temp_path))
        raise HTTPException(status_code=400, detail="field_values must be valid JSON") from exc
    except HTTPException:
        if temp_path is not None:
            remove_files(str(temp_path))
        raise
    except (ValueError, Exception) as exc:
        if temp_path is not None:
            remove_files(str(temp_path))
        # Check if it's a validation-type error (e.g. no form fields)
        exc_name = type(exc).__name__
        if exc_name == "ValidationError" or "no form field" in str(exc).lower():
            raise HTTPException(status_code=400, detail=str(exc))
        logger.exception("Unexpected error")
        raise HTTPException(status_code=500, detail="An internal error occurred. Please try again.")
