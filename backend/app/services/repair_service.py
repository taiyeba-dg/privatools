import pikepdf
import uuid
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def repair_pdf(input_path: str) -> str:
    ensure_temp_dir()
    output_path = get_temp_path(f"repaired_{uuid.uuid4().hex}.pdf")

    with pikepdf.open(input_path, suppress_warnings=True) as pdf:
        pdf.save(str(output_path))

    return str(output_path)
