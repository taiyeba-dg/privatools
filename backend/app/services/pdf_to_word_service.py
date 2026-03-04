import asyncio
import uuid
import shutil
from pathlib import Path
from ..utils.cleanup import get_temp_path, ensure_temp_dir


async def pdf_to_word(input_path: str) -> str:
    ensure_temp_dir()
    temp_input = get_temp_path(f"input_{uuid.uuid4().hex}.pdf")
    shutil.copy2(input_path, str(temp_input))

    temp_dir = temp_input.parent

    proc = await asyncio.create_subprocess_exec(
        "libreoffice",
        "--headless",
        "--convert-to",
        "docx",
        "--outdir",
        str(temp_dir),
        str(temp_input),
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )

    try:
        _, stderr = await asyncio.wait_for(proc.communicate(), timeout=120)
    except asyncio.TimeoutError:
        proc.kill()
        raise Exception("LibreOffice conversion timed out")

    if proc.returncode != 0:
        raise Exception(f"LibreOffice conversion failed: {stderr.decode()}")

    output_path = temp_input.with_suffix(".docx")
    if not output_path.exists():
        raise Exception("Conversion output file not found")

    return str(output_path)
