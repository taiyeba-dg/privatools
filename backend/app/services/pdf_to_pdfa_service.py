import asyncio
import uuid
from pathlib import Path
from ..utils.cleanup import get_temp_path, ensure_temp_dir


async def convert_to_pdfa(input_path: str) -> str:
    ensure_temp_dir()
    temp_dir = get_temp_path("").parent
    uid = uuid.uuid4().hex

    temp_input = get_temp_path(f"lo_input_{uid}.pdf")
    Path(temp_input).write_bytes(Path(input_path).read_bytes())

    proc = await asyncio.create_subprocess_exec(
        "libreoffice", "--headless",
        "--convert-to",
        "pdf:writer_pdf_Export:{\"SelectPdfVersion\":{\"type\":1,\"value\":2}}",
        "--outdir", str(temp_dir),
        str(temp_input),
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    await proc.communicate()

    output_path = get_temp_path(f"lo_input_{uid}.pdf")
    # LibreOffice outputs <stem>.pdf — the temp_input already ends in .pdf
    # so the output file would overwrite it; check existence
    if not output_path.exists():
        raise RuntimeError("LibreOffice PDF/A conversion failed: output file not found")

    return str(output_path)
