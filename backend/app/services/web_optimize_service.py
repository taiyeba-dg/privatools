"""Linearize a PDF for byte-range / web streaming.

A linearized ("fast web view") PDF lets a viewer render the first page
before the whole file has finished downloading, which matters for PDFs
served from a CDN. Done via `qpdf --linearize`, which is already in the
base image.
"""

from __future__ import annotations

import asyncio
import uuid

from ..utils.cleanup import ensure_temp_dir, get_temp_path


async def web_optimize(input_path: str) -> str:
    ensure_temp_dir()
    output_path = get_temp_path(f"weboptim_{uuid.uuid4().hex}.pdf")

    proc = await asyncio.create_subprocess_exec(
        "qpdf",
        "--linearize",
        input_path,
        str(output_path),
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    try:
        _, stderr = await asyncio.wait_for(proc.communicate(), timeout=60)
    except asyncio.TimeoutError:
        proc.kill()
        raise Exception("qpdf linearize timed out")

    # qpdf exit codes: 0 = ok, 3 = warnings (file still produced)
    if proc.returncode not in (0, 3):
        raise Exception(f"qpdf linearize failed: {stderr.decode()[:200]}")

    if not output_path.exists():
        raise Exception("qpdf produced no output")

    return str(output_path)
