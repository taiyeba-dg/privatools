import pikepdf
from ..utils.cleanup import ensure_temp_dir, get_temp_path, safe_open_pdf


def merge_pdfs(input_paths: list[str]) -> str:
    ensure_temp_dir()
    dst = pikepdf.Pdf.new()
    for path in input_paths:
        with safe_open_pdf(path) as src:
            dst.pages.extend(src.pages)
    output = get_temp_path("merged.pdf")
    dst.save(str(output))
    return str(output)
