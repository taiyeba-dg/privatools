import logging
import os

import fitz  # PyMuPDF

from ..utils.exceptions import ValidationError
from ..utils.filenames import temp_output

logger = logging.getLogger(__name__)

# Cap embedded attachments at 50 MB. Larger files balloon the resulting
# PDF and tend to fail at the upload layer anyway — fail fast with a
# clean error rather than letting fitz hang on a huge buffer.
MAX_ATTACHMENT_BYTES = 50 * 1024 * 1024


def add_attachment(
    input_path: str, attachment_path: str, attachment_name: str
) -> str:
    """Embed a file as an attachment inside a PDF."""
    output_path = temp_output("attached", "pdf")

    if os.path.getsize(attachment_path) > MAX_ATTACHMENT_BYTES:
        raise ValidationError(
            f"Attachment too large (> {MAX_ATTACHMENT_BYTES // (1024 * 1024)} MB)."
        )

    # Strip directory components from the attachment name — PDF attachments
    # are stored with the filename we give here, and we don't want an
    # accidental "/tmp/foo.pdf" leaking server paths into the resulting PDF.
    safe_name = os.path.basename(attachment_name) or "attachment.bin"

    with open(attachment_path, "rb") as f:
        data = f.read()

    # Log only the file size + the extension (e.g. `.pdf`); the basename
    # is user-supplied and may contain PII (e.g. `Resume - Jane Doe.pdf`).
    _, ext = os.path.splitext(safe_name)
    logger.info(
        "attachment.add ext=%s size=%d",
        ext.lower() or "<none>", len(data),
    )
    doc = fitz.open(input_path)
    try:
        doc.embfile_add(safe_name, data, filename=safe_name)
        doc.save(str(output_path), garbage=4, deflate=True)
    finally:
        doc.close()
    return str(output_path)
