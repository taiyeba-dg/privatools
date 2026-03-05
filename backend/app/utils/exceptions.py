"""Custom exception hierarchy for service layer.

Services should raise these instead of FastAPI's HTTPException,
keeping the service layer framework-agnostic.
"""


class ToolError(Exception):
    """Base exception for tool processing errors."""
    pass


class ValidationError(ToolError):
    """Raised when input validation fails (maps to HTTP 400)."""
    pass
