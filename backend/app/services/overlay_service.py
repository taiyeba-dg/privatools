import uuid
import pikepdf
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def overlay(base_path: str, overlay_path: str, mode: str = "stamp") -> str:
    ensure_temp_dir()
    output_path = get_temp_path(f"overlay_{uuid.uuid4().hex}.pdf")

    with pikepdf.open(base_path) as base_pdf, pikepdf.open(overlay_path) as ovl_pdf:
        ovl_pages = list(ovl_pdf.pages)
        if not ovl_pages:
            raise ValueError("Overlay PDF has no pages")

        for i, page in enumerate(base_pdf.pages):
            ovl_page = ovl_pages[i] if i < len(ovl_pages) else ovl_pages[0]
            if mode == "stamp":
                page.add_overlay(ovl_page)
            else:
                page.add_underlay(ovl_page)

        base_pdf.save(str(output_path))

    return str(output_path)
