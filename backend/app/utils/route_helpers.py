"""Shared route helpers to avoid duplication across route files."""

import os
from pathlib import Path

from fastapi import HTTPException, UploadFile

from .cleanup import remove_files

MAX_SIZE = int(os.getenv("MAX_UPLOAD_MB", "500")) * 1024 * 1024  # 500 MB default (24 GB RAM server)


def safe_filename(name: str | None, fallback: str = "file") -> str:
    """Sanitize an upload filename to prevent path traversal in zip archives."""
    if not name:
        return fallback
    # Strip directory components and null bytes
    clean = os.path.basename(name).replace("\x00", "")
    return clean if clean else fallback


async def read_upload(
    file: UploadFile,
    *,
    label: str = "File",
    max_bytes: int = MAX_SIZE,
) -> bytes:
    """Read and validate an uploaded file. Raises HTTPException on validation failure."""
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail=f"{label} is empty")
    if len(data) > max_bytes:
        size_mb = max_bytes / (1024 * 1024)
        raise HTTPException(
            status_code=413,
            detail=f"{label} exceeds the {size_mb:.0f} MB size limit",
        )
    return data


async def stream_upload_to_disk(
    file: UploadFile,
    dest: Path,
    *,
    label: str = "File",
    max_bytes: int = MAX_SIZE,
    chunk_size: int = 256 * 1024,  # 256 KB chunks
) -> int:
    """Stream an uploaded file to disk in chunks instead of buffering in RAM.

    Returns the total number of bytes written.
    Use this instead of read_upload() for large files (images, videos, PDFs > 50 MB).
    """
    total = 0
    with open(dest, "wb") as f:
        while True:
            chunk = await file.read(chunk_size)
            if not chunk:
                break
            total += len(chunk)
            if total > max_bytes:
                # Clean up partial file
                dest.unlink(missing_ok=True)
                size_mb = max_bytes / (1024 * 1024)
                raise HTTPException(
                    status_code=413,
                    detail=f"{label} exceeds the {size_mb:.0f} MB size limit",
                )
            f.write(chunk)
    if total == 0:
        dest.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=f"{label} is empty")
    return total


def cleanup_on_error(*paths: str | Path | None) -> None:
    """Remove temporary files on error, ignoring None paths."""
    remove_files(*[p for p in paths if p is not None])
