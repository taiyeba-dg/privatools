import logging
import threading

from ..utils.exceptions import DependencyError
from ..utils.filenames import temp_output

logger = logging.getLogger(__name__)

# Use the lightweight u2netp model (44MB vs 170MB for u2net) — fits in 1GB RAM.
# rembg sessions wrap an ONNX runtime that is not safe to mutate concurrently —
# guard initialization with a lock and serialize inference with another so we
# never hand the same session to two threads at once.
_session = None
_session_init_lock = threading.Lock()
_session_inference_lock = threading.Lock()


def _get_session():
    """Lazy singleton ONNX session for the u2netp background-remove model.

    First call downloads / loads the ~44 MB ONNX model — subsequent calls
    re-use the same in-memory session. We never tear it down because the
    one-time load cost is too high to repeat per-request.
    """
    global _session
    if _session is None:
        with _session_init_lock:
            if _session is None:
                try:
                    from rembg import new_session
                except ImportError as exc:
                    raise DependencyError(
                        "Background removal requires the rembg package. "
                        "Install with: pip install rembg onnxruntime"
                    ) from exc
                logger.info("bg_remover: initialising u2netp session")
                _session = new_session("u2netp")
    return _session


def remove_background(input_path: str) -> str:
    """Remove image background using rembg (runs locally, no API).

    Uses the u2netp model (~44MB) which runs entirely on-device for privacy.
    """
    output_path = temp_output("nobg", "png")

    try:
        from rembg import remove
    except ImportError as exc:
        raise DependencyError(
            "Background removal requires the rembg package."
        ) from exc

    session = _get_session()

    with open(input_path, "rb") as f:
        input_data = f.read()

    logger.info("bg_remover: processing image bytes=%d", len(input_data))
    with _session_inference_lock:
        output_data = remove(input_data, session=session)

    with open(str(output_path), "wb") as f:
        f.write(output_data)

    return str(output_path)

