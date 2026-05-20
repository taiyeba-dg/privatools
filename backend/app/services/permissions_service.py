import pikepdf

from ..utils.cleanup import safe_open_pdf
from ..utils.filenames import temp_output


def set_permissions(input_path: str, owner_password: str = "",
                    allow_print: bool = True, allow_copy: bool = True,
                    allow_modify: bool = True, allow_annotate: bool = True) -> str:
    """Set PDF permissions (print, copy, modify, annotate)."""
    output_path = temp_output("perms", "pdf")

    perms = pikepdf.Permissions(
        print_lowres=allow_print,
        print_highres=allow_print,
        extract=allow_copy,
        modify_other=allow_modify,
        modify_annotation=allow_annotate,
        modify_form=allow_modify,
        modify_assembly=allow_modify,
        accessibility=True,
    )

    with safe_open_pdf(input_path) as pdf:
        pdf.save(
            str(output_path),
            encryption=pikepdf.Encryption(
                owner=owner_password or "defaultpdfowner",
                user="",
                allow=perms,
            ),
        )

    return str(output_path)
