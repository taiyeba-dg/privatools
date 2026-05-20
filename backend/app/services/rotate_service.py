from ..utils.cleanup import safe_open_pdf
from ..utils.filenames import temp_output
from ..utils.page_range import parse_page_range


def rotate_pdf(input_path: str, angle: int = 90, pages: str = "all") -> str:
    output_path = temp_output("rotated", "pdf")

    # Normalise the angle into the legal pikepdf rotate space.
    angle = int(angle) % 360

    with safe_open_pdf(input_path) as pdf:
        total = len(pdf.pages)
        # `allow_empty=True` so the legacy "all" / blank behaviour still
        # falls through to "rotate every page".
        page_indices = parse_page_range(pages or "all", total, allow_empty=True)
        if not page_indices:
            page_indices = list(range(total))

        for i in page_indices:
            page = pdf.pages[i]
            current = int(page.get("/Rotate", 0))
            page["/Rotate"] = (current + angle) % 360

        pdf.save(str(output_path))
    return str(output_path)
