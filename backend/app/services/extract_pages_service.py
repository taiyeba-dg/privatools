import pikepdf
import uuid
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def parse_page_ranges(pages_str: str, total_pages: int) -> list[int]:
    """Parse a page range string like '1,3,5-8' into a list of 0-based page indices."""
    indices = set()
    for part in pages_str.split(","):
        part = part.strip()
        if not part:
            continue
        if "-" in part:
            start_s, end_s = part.split("-", 1)
            start = int(start_s.strip())
            end = int(end_s.strip())
            for p in range(start, end + 1):
                if 1 <= p <= total_pages:
                    indices.add(p - 1)
        else:
            p = int(part)
            if 1 <= p <= total_pages:
                indices.add(p - 1)
    return sorted(indices)


def extract_pages(input_path: str, pages_str: str) -> str:
    ensure_temp_dir()
    output_path = get_temp_path(f"extracted_{uuid.uuid4().hex}.pdf")

    with pikepdf.open(input_path) as pdf:
        total = len(pdf.pages)
        indices = parse_page_ranges(pages_str, total)
        if not indices:
            raise ValueError("No valid pages specified")

        new_pdf = pikepdf.Pdf.new()
        for idx in indices:
            new_pdf.pages.append(pdf.pages[idx])
        new_pdf.save(str(output_path))

    return str(output_path)
