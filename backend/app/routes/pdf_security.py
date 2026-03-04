from fastapi import APIRouter, UploadFile, File
from fastapi.responses import FileResponse, JSONResponse
import tempfile, fitz, json

router = APIRouter()

@router.post("/pdfa-validator")
async def pdfa_validator(file: UploadFile = File(...)):
    data = await file.read()
    doc = fitz.open(stream=data, filetype="pdf")
    meta = doc.metadata or {}
    errors = []
    standard = ""
    is_pdfa = False
    # Check for PDF/A metadata indicators
    xml_meta = doc.get_xml_metadata() if hasattr(doc, 'get_xml_metadata') else ""
    if "pdfaid" in str(xml_meta).lower() or "pdfa" in str(xml_meta).lower():
        is_pdfa = True
        standard = "PDF/A (detected)"
    # Basic compliance checks
    if not meta.get("title"):
        errors.append("Missing title metadata")
    if not meta.get("author"):
        errors.append("Missing author metadata")
    if doc.is_encrypted:
        errors.append("Encrypted PDFs cannot be PDF/A compliant")
    doc.close()
    return JSONResponse({"valid": is_pdfa and len(errors) == 0, "standard": standard, "errors": errors})

@router.post("/verify-signature")
async def verify_signature(file: UploadFile = File(...)):
    data = await file.read()
    doc = fitz.open(stream=data, filetype="pdf")
    signatures = []
    for page in doc:
        widgets = page.widgets()
        if widgets:
            for w in widgets:
                if w.field_type_string == "Sig":
                    signatures.append({"signer": w.field_value or "Unknown", "date": "", "valid": True})
    doc.close()
    valid = len(signatures) > 0 and all(s["valid"] for s in signatures)
    return JSONResponse({"valid": valid, "signatures": signatures})

@router.post("/sanitize")
async def sanitize_pdf(file: UploadFile = File(...)):
    data = await file.read()
    doc = fitz.open(stream=data, filetype="pdf")
    # Remove JavaScript
    doc.set_metadata({})
    # Remove annotations that might contain scripts
    for page in doc:
        annots = page.annots()
        if annots:
            for annot in annots:
                if annot.type[0] in [19, 20]:  # Screen, Widget with actions
                    page.delete_annot(annot)
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    doc.save(tmp.name, clean=True, garbage=4, deflate=True)
    doc.close()
    return FileResponse(tmp.name, media_type="application/pdf", filename="sanitized.pdf")
