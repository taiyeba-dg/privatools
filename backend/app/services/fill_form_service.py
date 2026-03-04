import uuid
import pikepdf
from fastapi import HTTPException
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def _iter_fields(fields_array):
    """Recursively iterate AcroForm fields including Kids."""
    for field in fields_array:
        ft = field.get("/FT")
        kids = field.get("/Kids")
        if kids is not None:
            yield from _iter_fields(kids)
        elif ft is not None:
            yield field


def get_form_fields(input_path: str) -> list:
    with pikepdf.open(input_path) as pdf:
        try:
            acroform = pdf.Root.AcroForm
            fields_array = acroform.Fields
        except AttributeError:
            raise HTTPException(status_code=400, detail="PDF has no form fields")

        result = []
        for field in _iter_fields(fields_array):
            name = str(field.get("/T", ""))
            ft = str(field.get("/FT", "/Tx"))
            value = str(field.get("/V", ""))
            result.append({"name": name, "type": ft, "value": value})
        return result


def fill_form(input_path: str, field_values: dict) -> str:
    ensure_temp_dir()
    output_path = get_temp_path(f"filled_form_{uuid.uuid4().hex}.pdf")

    with pikepdf.open(input_path) as pdf:
        try:
            acroform = pdf.Root.AcroForm
            fields_array = acroform.Fields
        except AttributeError:
            raise HTTPException(status_code=400, detail="PDF has no form fields")

        for field in _iter_fields(fields_array):
            name = str(field.get("/T", ""))
            if name in field_values:
                field["/V"] = pikepdf.String(field_values[name])
                # Remove appearance stream so viewer re-generates it
                if "/AP" in field:
                    del field["/AP"]

        # Set NeedAppearances so PDF viewers regenerate appearances
        try:
            acroform["/NeedAppearances"] = pikepdf.Boolean(True)
        except Exception:
            pass

        pdf.save(str(output_path))

    return str(output_path)
