from pdf2image import convert_from_path
import uuid
import zipfile
from pathlib import Path
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def pdf_to_images(input_path: str, fmt: str = "jpeg", dpi: int = 150) -> str:
    ensure_temp_dir()
    images = convert_from_path(input_path, dpi=dpi)

    pil_format = "JPEG" if fmt.lower() in ("jpeg", "jpg") else fmt.upper()
    ext = "jpg" if fmt.lower() in ("jpeg", "jpg") else fmt.lower()

    if len(images) == 1:
        img_path = get_temp_path(f"page_1_{uuid.uuid4().hex}.{ext}")
        images[0].save(str(img_path), pil_format)
        return str(img_path)

    image_paths = []
    for i, img in enumerate(images):
        img_path = get_temp_path(f"page_{i+1}_{uuid.uuid4().hex}.{ext}")
        img.save(str(img_path), pil_format)
        image_paths.append(str(img_path))

    zip_path = get_temp_path(f"images_{uuid.uuid4().hex}.zip")
    with zipfile.ZipFile(str(zip_path), "w") as zf:
        for f in image_paths:
            zf.write(f, Path(f).name)
    return str(zip_path)
