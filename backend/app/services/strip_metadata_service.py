import pikepdf
import uuid
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def strip_metadata(input_path: str) -> str:
    ensure_temp_dir()
    output_path = get_temp_path(f"stripped_{uuid.uuid4().hex}.pdf")

    with pikepdf.open(input_path) as pdf:
        # Clear the document information dictionary
        with pdf.open_metadata() as meta:
            meta.clear()

        # Also remove the /Info dictionary from the trailer
        if "/Info" in pdf.trailer:
            del pdf.trailer["/Info"]

        pdf.save(str(output_path))

    return str(output_path)
