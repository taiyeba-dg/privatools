"""Custom exception hierarchy for the service / route layer.

Services raise these instead of FastAPI's HTTPException so they stay
framework-agnostic. The global exception handler in
`app.middleware.error_handlers` maps each one to an HTTPException with a
clear, human-readable `detail` string.

Detail strings are intentionally written so they contain substrings the
frontend's `friendlyError()` (`frontend/src/lib/utils.ts`) recognises:
`password`, `encrypted`, `protected`, `too large`, `network`,
`page range`, `out of range`, `corrupt`, `invalid`, `not found`,
`timeout`. Keeping the wording consistent here means the user sees a
helpful sentence instead of a stack-trace echo.
"""

from __future__ import annotations


# ---------------------------------------------------------------------------
# Base class
# ---------------------------------------------------------------------------
class ToolError(Exception):
    """Base exception for tool processing errors.

    `status_code` is the HTTP code the global handler should map this to.
    `detail` is the message returned in the JSON body — keep it short and
    user-readable, no stack-trace fragments.
    """

    status_code: int = 500
    default_detail: str = "Processing failed"

    def __init__(self, detail: str | None = None) -> None:
        self.detail = detail or self.default_detail
        super().__init__(self.detail)


# ---------------------------------------------------------------------------
# 4xx — client errors
# ---------------------------------------------------------------------------
class ValidationError(ToolError):
    """Generic input-validation failure (HTTP 400)."""

    status_code = 400
    default_detail = "Invalid input"


class PdfCorruptError(ToolError):
    """The uploaded PDF is malformed and cannot be parsed (HTTP 400)."""

    status_code = 400
    default_detail = "This PDF appears to be corrupt or invalid."


class PdfEncryptedError(ToolError):
    """The uploaded PDF is password-protected (HTTP 400).

    The frontend keys off the substring `password` to route to its
    "unlock first" toast — keep that word in `detail`.
    """

    status_code = 400
    default_detail = "This PDF is password-protected. Unlock it first, then try again."


class PageRangeError(ToolError):
    """A page number was supplied that doesn't exist in the PDF (HTTP 400)."""

    status_code = 400
    default_detail = "Page number is out of range."


class UnsupportedFileError(ToolError):
    """File type isn't one we accept for this tool (HTTP 400)."""

    status_code = 400
    default_detail = "Unsupported file type."


class FileNotProvidedError(ToolError):
    """The route required a file upload and didn't get one (HTTP 400)."""

    status_code = 400
    default_detail = "File not provided."


class FileTooLargeError(ToolError):
    """Upload exceeds the configured size cap (HTTP 413)."""

    status_code = 413
    default_detail = "File is too large for the server. Try compressing it first."


# ---------------------------------------------------------------------------
# 5xx — server errors
# ---------------------------------------------------------------------------
class ProcessingError(ToolError):
    """The tool ran but couldn't produce a result (HTTP 500)."""

    status_code = 500
    default_detail = "Couldn't finish processing this file."


class DependencyError(ToolError):
    """A required external binary / library is missing (HTTP 503).

    Uses 503 (Service Unavailable) rather than 500 because this endpoint
    can't function until ops installs the system dep (libzbar, lxml,
    weasyprint, rembg, etc.). 503 is the right signal: the rest of the
    server is fine, just this tool isn't reachable on this host.
    """

    status_code = 503
    default_detail = "This tool is temporarily unavailable — a system dependency is missing on the server."


class ExternalToolError(ToolError):
    """An external subprocess (LibreOffice, qpdf, ffmpeg) reported failure
    (HTTP 502).

    Use this instead of bare `Exception(...)` so the global handler can map
    to a meaningful HTTP status and the frontend can show a stable message.
    Keep `detail` free of file paths or stderr blobs — extract the most
    relevant line and discard the rest.
    """

    status_code = 502
    default_detail = "External conversion tool failed."


class ToolTimeoutError(ToolError):
    """External tool exceeded its time budget (HTTP 504).

    Named with the `Tool` prefix so we don't shadow Python's built-in
    TimeoutError when this module is star-imported.
    """

    status_code = 504
    default_detail = "Conversion timed out — try a smaller file."


__all__ = [
    "ToolError",
    "ValidationError",
    "PdfCorruptError",
    "PdfEncryptedError",
    "PageRangeError",
    "UnsupportedFileError",
    "FileNotProvidedError",
    "FileTooLargeError",
    "ProcessingError",
    "DependencyError",
    "ExternalToolError",
    "ToolTimeoutError",
]
