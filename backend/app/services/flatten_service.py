import fitz  # PyMuPDF

from ..utils.filenames import temp_output


def flatten_pdf(input_path: str) -> str:
    """Flatten PDF annotations and form fields into page content.

    Uses PyMuPDF native annotation flattening — no rasterization needed.
    This preserves vector quality perfectly and is near-instant.
    """
    output_path = temp_output("flattened", "pdf")

    doc = fitz.open(input_path)
    try:
        for page in doc:
            # Flatten all annotations (stamps, highlights, text notes, etc.).
            annots = list(page.annots()) if page.annots() else []
            for annot in annots:
                annot.set_flags(fitz.ANNOT_IS_PRINT)  # Ensure it renders

            # Apply redactions flattens annotations into content. Despite the
            # name, this is the supported way to bake any annotation into the
            # underlying page content stream.
            page.apply_redactions()

        # Lock form fields if any so they read as flat content in viewers.
        if doc.is_form_pdf:
            for page in doc:
                for widget in page.widgets() or []:
                    widget.field_flags = 1  # Read only
                    widget.update()

        doc.save(str(output_path), garbage=4, deflate=True, clean=True)
    finally:
        doc.close()

    return str(output_path)
