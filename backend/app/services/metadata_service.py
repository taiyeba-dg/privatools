import uuid
from datetime import datetime
import pikepdf
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def read_metadata(input_path: str) -> dict:
    """Read PDF metadata (title, author, subject, keywords, creation date)."""
    with pikepdf.open(input_path) as pdf:
        meta = pdf.open_metadata()
        docinfo = pdf.docinfo

        def _get(key: str) -> str:
            val = docinfo.get(key)
            if val is None:
                return ""
            return str(val)

        return {
            "title":        _get("/Title"),
            "author":       _get("/Author"),
            "subject":      _get("/Subject"),
            "keywords":     _get("/Keywords"),
            "creator":      _get("/Creator"),
            "producer":     _get("/Producer"),
            "creation_date": _get("/CreationDate"),
            "mod_date":     _get("/ModDate"),
            "pages":        len(pdf.pages),
        }


def write_metadata(input_path: str, title: str = "", author: str = "",
                   subject: str = "", keywords: str = "") -> str:
    """Write PDF metadata fields and return path to the updated file."""
    ensure_temp_dir()
    output_path = get_temp_path(f"metadata_{uuid.uuid4().hex}.pdf")

    with pikepdf.open(input_path) as pdf:
        with pdf.open_metadata() as meta:
            if title:
                meta["dc:title"] = title
            if author:
                meta["dc:creator"] = [author]
            if subject:
                meta["dc:description"] = subject
            if keywords:
                meta["pdf:Keywords"] = keywords

        if title:
            pdf.docinfo["/Title"] = title
        if author:
            pdf.docinfo["/Author"] = author
        if subject:
            pdf.docinfo["/Subject"] = subject
        if keywords:
            pdf.docinfo["/Keywords"] = keywords

        pdf.save(str(output_path))

    return str(output_path)
