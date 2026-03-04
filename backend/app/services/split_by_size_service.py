import uuid
import zipfile
import io
import pikepdf
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def split_by_size(input_path: str, max_size_mb: float = 10.0) -> str:
    ensure_temp_dir()
    zip_path = get_temp_path(f"split_size_{uuid.uuid4().hex}.zip")
    max_bytes = int(max_size_mb * 1024 * 1024)

    with pikepdf.open(input_path) as pdf:
        chunks = []
        current_pages = []

        for page in pdf.pages:
            current_pages.append(page)
            # Test current size using in-memory buffer
            buf = io.BytesIO()
            with pikepdf.Pdf.new() as test_pdf:
                test_pdf.pages.extend(current_pages)
                test_pdf.save(buf)
            size = buf.tell()

            if size > max_bytes and len(current_pages) > 1:
                # Save all but the last page as a chunk.
                # Note: if a single page exceeds max_bytes, it is kept in its own chunk
                # (no further splitting is possible at the page level).
                chunks.append(current_pages[:-1])
                current_pages = [page]

        if current_pages:
            chunks.append(current_pages)

        with zipfile.ZipFile(str(zip_path), "w", zipfile.ZIP_DEFLATED) as zf:
            for idx, pages in enumerate(chunks, start=1):
                chunk_path = get_temp_path(f"chunk_{uuid.uuid4().hex}.pdf")
                with pikepdf.Pdf.new() as out:
                    out.pages.extend(pages)
                    out.save(str(chunk_path))
                zf.write(str(chunk_path), f"part_{idx:03d}.pdf")

    return str(zip_path)
