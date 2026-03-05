import tempfile

import fitz
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from starlette.background import BackgroundTask

from ..utils.cleanup import remove_files, validate_pdf_content

router = APIRouter()

MAX_SIZE = 50 * 1024 * 1024


async def _read_pdf(upload: UploadFile, label: str = "PDF") -> bytes:
    data = await upload.read()
    if not data:
        raise HTTPException(status_code=400, detail=f"{label} is empty")
    if len(data) > MAX_SIZE:
        raise HTTPException(status_code=413, detail=f"{label} exceeds 50 MB limit")
    validate_pdf_content(data)
    return data


@router.post("/pdfa-validator")
async def pdfa_validator(file: UploadFile = File(...)):
    data = await _read_pdf(file)

    doc = None
    try:
        doc = fitz.open(stream=data, filetype="pdf")
        meta = doc.metadata or {}
        errors = []
        standard = ""
        is_pdfa = False

        xml_meta = doc.get_xml_metadata() if hasattr(doc, "get_xml_metadata") else ""
        xml_meta_lower = str(xml_meta).lower()
        if "pdfaid" in xml_meta_lower or "pdfa" in xml_meta_lower:
            is_pdfa = True
            standard = "PDF/A (detected)"

        if not meta.get("title"):
            errors.append("Missing title metadata")
        if not meta.get("author"):
            errors.append("Missing author metadata")
        if doc.is_encrypted:
            errors.append("Encrypted PDFs cannot be PDF/A compliant")

        return JSONResponse({"valid": is_pdfa and len(errors) == 0, "standard": standard, "errors": errors})
    except fitz.FileDataError as exc:
        raise HTTPException(status_code=400, detail="Invalid or corrupted PDF") from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to validate PDF/A") from exc
    finally:
        if doc is not None:
            doc.close()


@router.post("/verify-signature")
async def verify_signature(file: UploadFile = File(...)):
    data = await _read_pdf(file)

    doc = None
    try:
        doc = fitz.open(stream=data, filetype="pdf")
        signatures = []
        for page in doc:
            widgets = page.widgets()
            if not widgets:
                continue
            for widget in widgets:
                if widget.field_type_string == "Sig":
                    signatures.append(
                        {"signer": widget.field_value or "Unknown", "date": "", "status": "detected"}
                    )

        has_signatures = len(signatures) > 0
        return JSONResponse({
            "has_signatures": has_signatures,
            "signatures": signatures,
            "note": "Signatures detected but cryptographic verification is not yet supported. Use a dedicated PDF reader (e.g. Adobe Acrobat) for full validation."
        })
    except fitz.FileDataError as exc:
        raise HTTPException(status_code=400, detail="Invalid or corrupted PDF") from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to verify signatures") from exc
    finally:
        if doc is not None:
            doc.close()


@router.post("/sanitize")
async def sanitize_pdf(file: UploadFile = File(...)):
    data = await _read_pdf(file)

    doc = None
    tmp = None
    try:
        doc = fitz.open(stream=data, filetype="pdf")
        doc.set_metadata({})

        for page in doc:
            annot = page.first_annot
            while annot is not None:
                next_annot = annot.next
                # Screen and widget annotations may contain actions/scripts.
                if annot.type[0] in (19, 20):
                    page.delete_annot(annot)
                annot = next_annot

        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        tmp.close()
        doc.save(tmp.name, clean=True, garbage=4, deflate=True)

        cleanup = BackgroundTask(remove_files, tmp.name)
        return FileResponse(tmp.name, media_type="application/pdf", filename="sanitized.pdf", background=cleanup)
    except fitz.FileDataError as exc:
        raise HTTPException(status_code=400, detail="Invalid or corrupted PDF") from exc
    except Exception as exc:
        if tmp is not None:
            remove_files(tmp.name)
        raise HTTPException(status_code=500, detail="Failed to sanitize PDF") from exc
    finally:
        if doc is not None:
            doc.close()
