"""Shared route helpers to avoid duplication across route files."""

import os
from pathlib import Path

from fastapi import HTTPException, UploadFile

from .cleanup import remove_files

MAX_SIZE = 100 * 1024 * 1024  # 100 MB per file (protects 1 GB RAM server)


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


def cleanup_on_error(*paths: str | Path | None) -> None:
    """Remove temporary files on error, ignoring None paths."""
    remove_files(*[p for p in paths if p is not None])
