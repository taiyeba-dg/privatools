import asyncio
import uuid
from pathlib import Path
from ..utils.cleanup import get_temp_path, ensure_temp_dir


async def convert_to_pptx(input_path: str) -> str:
    ensure_temp_dir()
    temp_dir = get_temp_path("").parent
    uid = uuid.uuid4().hex

    temp_input = get_temp_path(f"lo_input_{uid}.pdf")
    Path(temp_input).write_bytes(Path(input_path).read_bytes())

    proc = await asyncio.create_subprocess_exec(
        "libreoffice", "--headless", "--convert-to", "pptx",
        "--outdir", str(temp_dir),
        str(temp_input),
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    await proc.communicate()

    output_path = get_temp_path(f"lo_input_{uid}.pptx")
    if not output_path.exists():
        raise RuntimeError("LibreOffice conversion failed: output file not found")

    return str(output_path)
