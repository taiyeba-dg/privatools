import pikepdf
import uuid
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def parse_page_ranges(pages_str: str, total_pages: int) -> list[int]:
    """Parse a page range string like '2,4,6' into a list of 0-based page indices."""
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


def delete_pages(input_path: str, pages_str: str) -> str:
    ensure_temp_dir()
    output_path = get_temp_path(f"deleted_{uuid.uuid4().hex}.pdf")

    with pikepdf.open(input_path) as pdf:
        total = len(pdf.pages)
        to_delete = set(parse_page_ranges(pages_str, total))
        if not to_delete:
            raise ValueError("No valid pages specified")
        if len(to_delete) >= total:
            raise ValueError("Cannot delete all pages from a PDF")

        # Delete in reverse order to keep indices stable
        for idx in sorted(to_delete, reverse=True):
            del pdf.pages[idx]

        pdf.save(str(output_path))

    return str(output_path)
