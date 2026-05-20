from ..utils.cleanup import safe_open_pdf
from ..utils.filenames import temp_output


def delete_annotations(input_path: str) -> str:
    output_path = temp_output("no_annots", "pdf")

    with safe_open_pdf(input_path) as pdf:
        for page in pdf.pages:
            if "/Annots" in page:
                del page["/Annots"]
        pdf.save(str(output_path))

    return str(output_path)
