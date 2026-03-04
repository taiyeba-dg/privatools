import io
import pikepdf
import uuid
from PIL import Image
from ..utils.cleanup import get_temp_path, ensure_temp_dir

_MAX_IMAGE_DIM = 1800
_JPEG_QUALITY = 75


def _recompress_image(data: bytes, current_filter: str) -> bytes | None:
    """Downsample and re-compress an image; return new bytes or None to skip."""
    try:
        img = Image.open(io.BytesIO(data))
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        w, h = img.size
        if w > _MAX_IMAGE_DIM or h > _MAX_IMAGE_DIM:
            img.thumbnail((_MAX_IMAGE_DIM, _MAX_IMAGE_DIM), Image.LANCZOS)
        out = io.BytesIO()
        img.save(out, format="JPEG", quality=_JPEG_QUALITY, optimize=True)
        return out.getvalue()
    except Exception:
        return None


def compress_pdf(input_path: str) -> str:
    ensure_temp_dir()
    output_path = get_temp_path(f"compressed_{uuid.uuid4().hex}.pdf")
    with pikepdf.open(input_path) as pdf:
        for page in pdf.pages:
            resources = page.get("/Resources")
            if resources is None:
                continue
            xobjects = resources.get("/XObject")
            if xobjects is None:
                continue
            for key in list(xobjects.keys()):
                xobj = xobjects[key]
                try:
                    if xobj.get("/Subtype") != "/Image":
                        continue
                    raw = xobj.read_raw_bytes()
                    new_bytes = _recompress_image(raw, str(xobj.get("/Filter", "")))
                    if new_bytes and len(new_bytes) < len(raw):
                        xobj.write(new_bytes, filter=pikepdf.Name("/DCTDecode"))
                        if "/Width" in xobj and "/Height" in xobj:
                            img_check = Image.open(io.BytesIO(new_bytes))
                            xobj["/Width"] = img_check.width
                            xobj["/Height"] = img_check.height
                except Exception:
                    continue
        pdf.save(str(output_path), compress_streams=True, recompress_flate=True)
    return str(output_path)
