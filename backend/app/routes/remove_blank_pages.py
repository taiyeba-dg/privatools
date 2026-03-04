from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import FileResponse
import tempfile, os, fitz

router = APIRouter()

@router.post("/remove-blank-pages")
async def remove_blank_pages(file: UploadFile = File(...), sensitivity: int = Form(85)):
    data = await file.read()
    doc = fitz.open(stream=data, filetype="pdf")
    threshold = (100 - sensitivity) / 100.0
    pages_to_keep = []
    for i in range(len(doc)):
        page = doc[i]
        pix = page.get_pixmap(dpi=72)
        samples = pix.samples
        total = len(samples)
        white = sum(1 for j in range(0, total, pix.n) if all(samples[j+c] > 250 for c in range(min(pix.n, 3))))
        ratio = white / (total // pix.n) if total > 0 else 1
        if ratio < (1 - threshold):
            pages_to_keep.append(i)
    if not pages_to_keep:
        pages_to_keep = list(range(len(doc)))
    new_doc = fitz.open()
    for i in pages_to_keep:
        new_doc.insert_pdf(doc, from_page=i, to_page=i)
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    new_doc.save(tmp.name)
    new_doc.close()
    doc.close()
    return FileResponse(tmp.name, media_type="application/pdf", filename="cleaned.pdf")
