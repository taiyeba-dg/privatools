import logging
import os

import fitz
import pikepdf

from ..utils.exceptions import ProcessingError
from ..utils.filenames import temp_output

logger = logging.getLogger(__name__)


def repair_pdf(input_path: str) -> tuple[str, str]:
    """Repair a PDF using multiple strategies.

    Returns (output_path, status) where status is one of:
    - "repaired" — issues were found and fixed
    - "already-valid" — PDF was already valid
    - "partial" — some issues could not be fixed
    """
    output_path = temp_output("repaired", "pdf")
    status = "already-valid"

    # Strategy 1: pikepdf repair (handles xref issues, linearization errors).
    try:
        with pikepdf.open(input_path, suppress_warnings=True) as pdf:
            pdf.save(str(output_path))
        orig_size = os.path.getsize(input_path)
        new_size = os.path.getsize(str(output_path))
        if abs(orig_size - new_size) > 100:
            status = "repaired"
        return str(output_path), status
    except (pikepdf.PdfError, OSError) as pikepdf_err:
        logger.warning("repair: pikepdf failed (%s) — trying fitz fallback", pikepdf_err)

    # Strategy 2: fitz/MuPDF recovery (handles more severe corruption).
    try:
        doc = fitz.open(input_path)
        try:
            doc.save(str(output_path), garbage=4, deflate=True)
        finally:
            doc.close()
        return str(output_path), "repaired"
    except (RuntimeError, ValueError, OSError) as fitz_err:
        logger.warning("repair: fitz failed (%s) — trying byte-level recovery", fitz_err)

    # Strategy 3: pikepdf with allow_overwriting_input disabled (last-ditch).
    try:
        with pikepdf.open(
            input_path,
            suppress_warnings=True,
            allow_overwriting_input=False,
        ) as pdf:
            pdf.remove_unreferenced_resources()
            pdf.save(str(output_path))
        return str(output_path), "partial"
    except (pikepdf.PdfError, OSError) as final_err:
        logger.error("repair: all strategies failed (%s)", final_err)
        raise ProcessingError(
            "PDF is too corrupted to repair. The file may be severely damaged."
        ) from final_err
