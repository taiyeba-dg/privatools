import pikepdf
import uuid
import zipfile
from pathlib import Path
from typing import List

from ..utils.cleanup import get_temp_path, ensure_temp_dir


def _parse_page_number(token: str, total_pages: int, context: str) -> int:
    if token == "end":
        return total_pages
    if not token.isdigit():
        raise ValueError(f"Invalid page value '{token}' in range '{context}'.")
    page = int(token)
    if page < 1 or page > total_pages:
        raise ValueError(f"Page {page} is out of bounds. Valid range is 1-{total_pages}.")
    return page


def parse_page_selection(pages: str, total_pages: int) -> List[int]:
    if total_pages <= 0:
        raise ValueError("Cannot split an empty PDF with no pages.")
    if not pages or not pages.strip():
        raise ValueError("No page range provided. Please specify pages to extract (e.g. '1-3,5,7-end').")

    selections: List[int] = []
    seen: set[int] = set()
    parts = [part.strip() for part in pages.split(",") if part.strip()]
    if not parts:
        raise ValueError("No valid page numbers found in the provided range.")

    for part in parts:
        token = part.lower()
        current: List[int] = []

        if "-" in token:
            start_raw, end_raw = [x.strip() for x in token.split("-", 1)]
            if not start_raw and not end_raw:
                raise ValueError(f"Invalid range '{part}'.")

            start_page = 1 if start_raw == "" else _parse_page_number(start_raw, total_pages, part)
            end_page = total_pages if end_raw in {"", "end"} else _parse_page_number(end_raw, total_pages, part)
            if start_page > end_page:
                raise ValueError(f"Invalid range '{part}': start page must be <= end page.")

            current = list(range(start_page - 1, end_page))
        else:
            page = _parse_page_number(token, total_pages, part)
            current = [page - 1]

        for index in current:
            if index not in seen:
                seen.add(index)
                selections.append(index)

    if not selections:
        raise ValueError("No valid page numbers found in the provided range.")
    return selections


def split_pdf(input_path: str, mode: str = "pages", pages: str = "", n: int = 2) -> str:
    ensure_temp_dir()

    with pikepdf.open(input_path) as pdf:
        total_pages = len(pdf.pages)
        if total_pages <= 0:
            raise ValueError("Cannot split an empty PDF with no pages.")

        if mode == "individual":
            output_files = []
            for i in range(total_pages):
                out_path = get_temp_path(f"page_{i+1}_{uuid.uuid4().hex}.pdf")
                with pikepdf.Pdf.new() as out:
                    out.pages.append(pdf.pages[i])
                    out.save(str(out_path))
                output_files.append(str(out_path))

        elif mode == "every_n":
            if n <= 0:
                raise ValueError("Chunk size 'n' must be greater than 0.")
            output_files = []
            for start in range(0, total_pages, n):
                end = min(start + n, total_pages)
                out_path = get_temp_path(f"pages_{start+1}_{end}_{uuid.uuid4().hex}.pdf")
                with pikepdf.Pdf.new() as out:
                    for i in range(start, end):
                        out.pages.append(pdf.pages[i])
                    out.save(str(out_path))
                output_files.append(str(out_path))

        else:  # specific pages
            page_nums = parse_page_selection(pages, total_pages)
            out_path = get_temp_path(f"extracted_{uuid.uuid4().hex}.pdf")
            with pikepdf.Pdf.new() as out:
                for i in page_nums:
                    out.pages.append(pdf.pages[i])
                out.save(str(out_path))
            output_files = [str(out_path)]

    if len(output_files) == 1:
        return output_files[0]

    zip_path = get_temp_path(f"split_{uuid.uuid4().hex}.zip")
    with zipfile.ZipFile(str(zip_path), "w") as zf:
        for f in output_files:
            zf.write(f, Path(f).name)
    return str(zip_path)
