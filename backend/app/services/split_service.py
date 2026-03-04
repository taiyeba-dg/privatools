import pikepdf
import uuid
import zipfile
from pathlib import Path
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def split_pdf(input_path: str, mode: str = "pages", pages: str = "", n: int = 2) -> str:
    ensure_temp_dir()

    with pikepdf.open(input_path) as pdf:
        total_pages = len(pdf.pages)

        if mode == "individual":
            output_files = []
            for i in range(total_pages):
                out_path = get_temp_path(f"page_{i+1}_{uuid.uuid4().hex}.pdf")
                with pikepdf.Pdf.new() as out:
                    out.pages.append(pdf.pages[i])
                    out.save(str(out_path))
                output_files.append(str(out_path))

        elif mode == "every_n":
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
            if not pages or not pages.strip():
                raise ValueError("No page range provided. Please specify pages to extract (e.g. '1-3,5').")
            page_nums = []
            for part in pages.split(","):
                part = part.strip()
                if "-" in part:
                    bounds = part.split("-", 1)
                    if bounds[0].isdigit() and bounds[1].isdigit():
                        for p in range(int(bounds[0]) - 1, int(bounds[1])):
                            page_nums.append(p)
                elif part.isdigit():
                    page_nums.append(int(part) - 1)
            if not page_nums:
                raise ValueError("No valid page numbers found in the provided range.")
            out_path = get_temp_path(f"extracted_{uuid.uuid4().hex}.pdf")
            with pikepdf.Pdf.new() as out:
                for i in page_nums:
                    if 0 <= i < total_pages:
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
