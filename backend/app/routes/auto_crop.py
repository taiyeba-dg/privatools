from fastapi import APIRouter, UploadFile, File
from fastapi.responses import FileResponse
import tempfile, fitz

router = APIRouter()

@router.post("/auto-crop")
async def auto_crop(file: UploadFile = File(...)):
    data = await file.read()
    doc = fitz.open(stream=data, filetype="pdf")
    for page in doc:
        blocks = page.get_text("dict")["blocks"]
        if not blocks:
            continue
        rects = [fitz.Rect(b["bbox"]) for b in blocks]
        union = rects[0]
        for r in rects[1:]:
            union |= r
        margin = 20
        crop = fitz.Rect(max(0, union.x0 - margin), max(0, union.y0 - margin),
                         min(page.rect.width, union.x1 + margin), min(page.rect.height, union.y1 + margin))
        page.set_cropbox(crop)
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    doc.save(tmp.name)
    doc.close()
    return FileResponse(tmp.name, media_type="application/pdf", filename="cropped.pdf")
