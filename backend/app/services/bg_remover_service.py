import uuid
import logging
from PIL import Image
from ..utils.cleanup import get_temp_path, ensure_temp_dir

logger = logging.getLogger(__name__)

# Use the lightweight u2netp model (44MB vs 170MB for u2net) — fits in 1GB RAM
_session = None

def _get_session():
    global _session
    if _session is None:
        from rembg import new_session
        _session = new_session("u2netp")
    return _session


def remove_background(input_path: str) -> str:
    """Remove image background using rembg (runs locally, no API).
    
    Uses the u2netp model (lightweight, ~44MB) which runs entirely on-device for privacy.
    """
    ensure_temp_dir()
    output_path = get_temp_path(f"nobg_{uuid.uuid4().hex}.png")

    from rembg import remove

    session = _get_session()

    with open(input_path, "rb") as f:
        input_data = f.read()

    output_data = remove(input_data, session=session)

    with open(str(output_path), "wb") as f:
        f.write(output_data)

    return str(output_path)

