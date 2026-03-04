import pikepdf
import uuid
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def rotate_pdf(input_path: str, angle: int = 90, pages: str = "all") -> str:
    ensure_temp_dir()
    output_path = get_temp_path(f"rotated_{uuid.uuid4().hex}.pdf")

    with pikepdf.open(input_path) as pdf:
        total = len(pdf.pages)
        if pages == "all":
            page_indices = list(range(total))
        else:
            page_indices = [
                int(p.strip()) - 1 for p in pages.split(",") if p.strip().isdigit()
            ]

        for i in page_indices:
            if 0 <= i < total:
                page = pdf.pages[i]
                current = int(page.get("/Rotate", 0))
                page["/Rotate"] = (current + angle) % 360

        pdf.save(str(output_path))
    return str(output_path)
