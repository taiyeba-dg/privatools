import pikepdf
import uuid
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def merge_pdfs(input_paths: list) -> str:
    ensure_temp_dir()
    output_path = get_temp_path(f"merged_{uuid.uuid4().hex}.pdf")
    with pikepdf.Pdf.new() as output_pdf:
        for path in input_paths:
            with pikepdf.open(path) as src:
                output_pdf.pages.extend(src.pages)
        output_pdf.save(str(output_path))
    return str(output_path)
