import os
import time
from pathlib import Path

from fastapi import HTTPException

# Use TEMP_DIR env var if set, otherwise fall back to a temp/ dir relative to CWD
TEMP_DIR = Path(os.environ.get("TEMP_DIR", "temp"))


def ensure_temp_dir():
    """Create the temp directory if it does not exist."""
    TEMP_DIR.mkdir(parents=True, exist_ok=True)


def cleanup_old_files(max_age_seconds: int = 600):
    """Remove files from TEMP_DIR that are older than max_age_seconds."""
    if not TEMP_DIR.exists():
        return
    now = time.time()
    for item in TEMP_DIR.iterdir():
        if item.is_file():
            try:
                age = now - item.stat().st_mtime
                if age > max_age_seconds:
                    item.unlink()
            except OSError:
                pass


def get_temp_path(filename: str) -> Path:
    """Return a Path object for a file inside TEMP_DIR."""
    return TEMP_DIR / filename


def remove_files(*paths: str | Path) -> None:
    """Delete one or more files, ignoring errors (used as a background cleanup task)."""
    for p in paths:
        try:
            Path(p).unlink(missing_ok=True)
        except OSError:
            pass


def validate_pdf_content(content: bytes) -> None:
    """Raise HTTPException(400) if content doesn't look like a valid PDF."""
    if not content[:5] == b'%PDF-':
        raise HTTPException(status_code=400, detail="File does not appear to be a valid PDF")


def safe_open_pdf(path: str, **kwargs):
    """Open a PDF with pikepdf, converting PasswordError to a friendly ValueError.

    Usage:
        with safe_open_pdf(input_path) as pdf:
            ...
    """
    import pikepdf
    try:
        return pikepdf.open(path, **kwargs)
    except pikepdf.PasswordError:
        raise ValueError(
            "This PDF is password-protected. Please unlock it first using the Unlock PDF tool."
        )

