from fastapi import APIRouter, UploadFile, File
from fastapi.responses import FileResponse
import tempfile, fitz

router = APIRouter()

@router.post("/invert-colors")
async def invert_colors(file: UploadFile = File(...)):
    data = await file.read()
    src = fitz.open(stream=data, filetype="pdf")
    doc = fitz.open()
    for page in src:
        pix = page.get_pixmap(dpi=150)
        pix.invert_irect(pix.irect)
        new_page = doc.new_page(width=page.rect.width, height=page.rect.height)
        new_page.insert_image(new_page.rect, pixmap=pix)
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    doc.save(tmp.name)
    doc.close()
    src.close()
    return FileResponse(tmp.name, media_type="application/pdf", filename="inverted.pdf")
