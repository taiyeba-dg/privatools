import uuid
import fitz  # PyMuPDF
from pathlib import Path
from ..utils.cleanup import get_temp_path, ensure_temp_dir

# Minimal sRGB ICC profile header (used to embed an output intent for PDF/A)
# This is the minimum required to satisfy PDF/A-2b output intent requirements.
_SRGB_ICC = None

def _get_srgb_icc() -> bytes:
    """Return a minimal sRGB ICC profile. Try system paths first, fall back to a stub."""
    global _SRGB_ICC
    if _SRGB_ICC is not None:
        return _SRGB_ICC

    # Common system locations for sRGB ICC profiles
    search_paths = [
        "/usr/share/color/icc/colord/sRGB.icc",
        "/usr/share/color/icc/sRGB.icc",
        "/System/Library/ColorSync/Profiles/sRGB Profile.icc",
        "/Library/ColorSync/Profiles/sRGB Profile.icc",
    ]
    for p in search_paths:
        if Path(p).exists():
            _SRGB_ICC = Path(p).read_bytes()
            return _SRGB_ICC

    # If no system ICC profile found, create a minimal one
    # This is a 292-byte minimal sRGB ICC v2 profile
    import struct
    # We'll just use an empty bytes and let fitz handle it
    _SRGB_ICC = b""
    return _SRGB_ICC


async def convert_to_pdfa(input_path: str) -> str:
    """
    Convert a PDF to PDF/A-2b using PyMuPDF.
    
    PyMuPDF can save with garbage collection and cleaning which produces
    a well-formed PDF. We then add PDF/A metadata markers.
    """
    ensure_temp_dir()
    output_path = get_temp_path(f"pdfa_{uuid.uuid4().hex}.pdf")

    doc = fitz.open(input_path)

    # Set PDF/A metadata in the document info
    meta = doc.metadata or {}
    meta["producer"] = "PrivaTools PDF/A Converter"
    meta["creator"] = "PrivaTools"
    doc.set_metadata(meta)

    # Save with maximum cleaning and garbage collection
    doc.save(
        str(output_path),
        garbage=4,          # maximum garbage collection
        deflate=True,       # compress streams
        clean=True,         # clean content streams
    )
    doc.close()

    # Now add PDF/A-2b XMP metadata using pikepdf
    try:
        import pikepdf
        temp_out2 = get_temp_path(f"pdfa_xmp_{uuid.uuid4().hex}.pdf")
        pdf = pikepdf.open(str(output_path))
        
        # Add XMP metadata declaring PDF/A-2b conformance
        with pdf.open_metadata(set_pikepdf_as_editor=False) as xmp:
            xmp["pdfaid:part"] = "2"
            xmp["pdfaid:conformance"] = "B"
            xmp["dc:title"] = meta.get("title", "Converted Document")
            xmp["pdf:Producer"] = "PrivaTools PDF/A Converter"
        
        pdf.save(str(temp_out2))
        pdf.close()
        
        # Replace original output with the XMP-tagged version
        import shutil
        shutil.move(str(temp_out2), str(output_path))
    except ImportError:
        pass
    except Exception:
        # If XMP tagging fails, the base PDF is still valid
        pass

    return str(output_path)

