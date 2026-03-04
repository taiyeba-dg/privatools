import uuid
import asyncio
import shutil
from pathlib import Path
from ..utils.cleanup import get_temp_path, ensure_temp_dir

ALLOWED_EXTENSIONS = {".docx", ".xlsx", ".pptx", ".doc", ".xls", ".ppt", ".odt", ".ods", ".odp"}


async def office_to_pdf(input_path: str) -> str:
    """Convert an Office document to PDF using LibreOffice headless."""
    ensure_temp_dir()
    temp_input = get_temp_path(f"office_{uuid.uuid4().hex}{Path(input_path).suffix}")
    shutil.copy2(input_path, str(temp_input))

    temp_dir = temp_input.parent

    proc = await asyncio.create_subprocess_exec(
        "libreoffice",
        "--headless",
        "--convert-to",
        "pdf",
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

    output_path = temp_input.with_suffix(".pdf")
    if not output_path.exists():
        raise Exception("Conversion output file not found")

    return str(output_path)
