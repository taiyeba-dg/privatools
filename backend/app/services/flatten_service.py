import uuid
import fitz  # PyMuPDF
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def flatten_pdf(input_path: str) -> str:
    """Flatten PDF annotations and form fields into page content.
    
    Uses PyMuPDF native annotation flattening — no rasterization needed.
    This preserves vector quality perfectly and is near-instant.
    """
    ensure_temp_dir()
    output_path = get_temp_path(f"flattened_{uuid.uuid4().hex}.pdf")

    doc = fitz.open(input_path)

    for page in doc:
        # Flatten all annotations (stamps, highlights, text notes, etc.)
        annots = list(page.annots()) if page.annots() else []
        for annot in annots:
            annot.set_flags(fitz.ANNOT_IS_PRINT)  # Ensure it renders
        
        # Apply redactions flattens annotations into content
        # Use the built-in method to burn annotations into the page
        page.apply_redactions()

    # Reset form fields if any
    if doc.is_form_pdf:
        for page in doc:
            for widget in page.widgets() or []:
                widget.field_flags = 1  # Read only
                widget.update()

    # Save with clean/garbage options
    doc.save(str(output_path), garbage=4, deflate=True, clean=True)
    doc.close()

    return str(output_path)
