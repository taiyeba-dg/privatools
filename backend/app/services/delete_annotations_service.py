import pikepdf
import uuid
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def delete_annotations(input_path: str) -> str:
    ensure_temp_dir()
    output_path = get_temp_path(f"no_annots_{uuid.uuid4().hex}.pdf")

    with pikepdf.open(input_path) as pdf:
        for page in pdf.pages:
            if "/Annots" in page:
                del page["/Annots"]
        pdf.save(str(output_path))

    return str(output_path)
