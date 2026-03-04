import uuid
import math
import io
import pikepdf
from pdf2image import convert_from_path
from PIL import Image
from ..utils.cleanup import get_temp_path, ensure_temp_dir

# A4 landscape at 150 DPI
A4_W = int(297 * 150 / 25.4)
A4_H = int(210 * 150 / 25.4)


def nup(input_path: str, pages_per_sheet: int = 2) -> str:
    ensure_temp_dir()
    output_path = get_temp_path(f"nup_{uuid.uuid4().hex}.pdf")

    pages_per_sheet = max(1, pages_per_sheet)
    cols = math.ceil(math.sqrt(pages_per_sheet))
    rows = math.ceil(pages_per_sheet / cols)

    images = convert_from_path(input_path, dpi=150)

    cell_w = A4_W // cols
    cell_h = A4_H // rows

    sheet_images = []
    for sheet_start in range(0, len(images), pages_per_sheet):
        sheet = Image.new("RGB", (A4_W, A4_H), "white")
        batch = images[sheet_start:sheet_start + pages_per_sheet]
        for i, img in enumerate(batch):
            col = i % cols
            row = i // cols
            img_copy = img.copy()
            img_copy.thumbnail((cell_w, cell_h), Image.Resampling.LANCZOS)
            x = col * cell_w + (cell_w - img_copy.width) // 2
            y = row * cell_h + (cell_h - img_copy.height) // 2
            sheet.paste(img_copy, (x, y))
        sheet_images.append(sheet)

    if not sheet_images:
        raise ValueError("No pages found in PDF")

    first = sheet_images[0]
    rest = sheet_images[1:]
    first.save(str(output_path), format="PDF", save_all=True, append_images=rest)

    return str(output_path)
