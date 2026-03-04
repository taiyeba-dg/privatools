import uuid
import zipfile
import io
import pikepdf
from PIL import Image
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def extract_images(input_path: str) -> str:
    ensure_temp_dir()
    zip_path = get_temp_path(f"extracted_images_{uuid.uuid4().hex}.zip")

    with pikepdf.open(input_path) as pdf:
        image_count = 0
        with zipfile.ZipFile(str(zip_path), "w", zipfile.ZIP_DEFLATED) as zf:
            for page_num, page in enumerate(pdf.pages, start=1):
                resources = page.get("/Resources")
                if resources is None:
                    continue
                xobjects = resources.get("/XObject")
                if xobjects is None:
                    continue
                for name, obj in xobjects.items():
                    try:
                        if obj.get("/Subtype") != "/Image":
                            continue
                        pdfimage = pikepdf.PdfImage(obj)
                        pil_image = pdfimage.as_pil_image()
                        image_count += 1
                        ext = "png" if pil_image.mode in ("RGBA", "P") else "jpg"
                        img_bytes = io.BytesIO()
                        if ext == "jpg":
                            pil_image = pil_image.convert("RGB")
                            pil_image.save(img_bytes, format="JPEG", quality=90)
                        else:
                            pil_image.save(img_bytes, format="PNG")
                        img_bytes.seek(0)
                        zf.writestr(f"page{page_num}_{name.lstrip('/')}_{image_count}.{ext}", img_bytes.read())
                    except Exception:
                        continue

    return str(zip_path)
