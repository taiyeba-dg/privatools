from ..utils.cleanup import safe_open_pdf
from ..utils.filenames import temp_output


def strip_metadata(input_path: str) -> str:
    output_path = temp_output("stripped", "pdf")

    with safe_open_pdf(input_path) as pdf:
        # Clear the document information dictionary
        with pdf.open_metadata() as meta:
            meta.clear()

        # Also remove the /Info dictionary from the trailer
        if "/Info" in pdf.trailer:
            del pdf.trailer["/Info"]

        pdf.save(str(output_path))

    return str(output_path)
