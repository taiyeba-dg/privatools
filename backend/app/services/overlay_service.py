from ..utils.cleanup import safe_open_pdf
from ..utils.exceptions import ValidationError
from ..utils.filenames import temp_output


def overlay(base_path: str, overlay_path: str, mode: str = "stamp") -> str:
    output_path = temp_output("overlay", "pdf")

    with safe_open_pdf(base_path) as base_pdf, safe_open_pdf(overlay_path) as ovl_pdf:
        ovl_pages = list(ovl_pdf.pages)
        if not ovl_pages:
            raise ValidationError("Overlay PDF has no pages")

        for i, page in enumerate(base_pdf.pages):
            ovl_page = ovl_pages[i] if i < len(ovl_pages) else ovl_pages[0]
            if mode == "overlay":
                page.add_overlay(ovl_page)
            else:
                page.add_underlay(ovl_page)

        base_pdf.save(str(output_path))

    return str(output_path)
