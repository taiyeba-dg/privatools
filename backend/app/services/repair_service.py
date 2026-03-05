import pikepdf
import fitz
import uuid
import logging
from ..utils.cleanup import get_temp_path, ensure_temp_dir

logger = logging.getLogger(__name__)


def repair_pdf(input_path: str) -> tuple[str, str]:
    """Repair a PDF using multiple strategies.

    Returns (output_path, status) where status is one of:
    - "repaired" — issues were found and fixed
    - "already-valid" — PDF was already valid
    - "partial" — some issues could not be fixed
    """
    ensure_temp_dir()
    output_path = get_temp_path(f"repaired_{uuid.uuid4().hex}.pdf")
    status = "already-valid"

    # Strategy 1: pikepdf repair (handles xref issues, linearization errors)
    try:
        with pikepdf.open(input_path, suppress_warnings=True) as pdf:
            pdf.save(str(output_path))
            # Check if pikepdf modified anything by comparing file sizes
            import os
            orig_size = os.path.getsize(input_path)
            new_size = os.path.getsize(str(output_path))
            if abs(orig_size - new_size) > 100:
                status = "repaired"
    except Exception as pikepdf_err:
        logger.warning("pikepdf repair failed: %s — trying fitz fallback", pikepdf_err)

        # Strategy 2: fitz/MuPDF recovery (handles more severe corruption)
        try:
            doc = fitz.open(input_path)
            doc.save(str(output_path), garbage=4, deflate=True)
            doc.close()
            status = "repaired"
        except Exception as fitz_err:
            logger.warning("fitz repair also failed: %s — trying byte-level recovery", fitz_err)

            # Strategy 3: pikepdf with allow_overwriting_input disabled
            try:
                with pikepdf.open(input_path, suppress_warnings=True, allow_overwriting_input=False) as pdf:
                    pdf.remove_unreferenced_resources()
                    pdf.save(str(output_path))
                    status = "partial"
            except Exception as final_err:
                logger.error("All repair strategies failed: %s", final_err)
                raise ValueError("PDF is too corrupted to repair. The file may be severely damaged.")

    return str(output_path), status
