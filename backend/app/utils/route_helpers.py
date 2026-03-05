"""Shared route helpers to avoid duplication across route files."""

from pathlib import Path

from fastapi import HTTPException, UploadFile

from .cleanup import remove_files

MAX_SIZE = 50 * 1024 * 1024  # 50 MB


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
        raise HTTPException(status_code=413, detail=f"File exceeds {max_bytes // (1024 * 1024)} MB limit")
    return data


def cleanup_on_error(*paths: str | Path | None) -> None:
    """Remove temporary files on error, ignoring None paths."""
    remove_files(*[p for p in paths if p is not None])
