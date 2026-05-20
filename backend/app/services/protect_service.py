import secrets

import pikepdf

from ..utils.cleanup import safe_open_pdf
from ..utils.filenames import temp_output


def protect_pdf(
    input_path: str,
    password: str,
    owner_pw: str | None = None,
    allow_print: bool = True,
    allow_extract: bool = False,
    allow_modify: bool = False,
) -> str:
    output_path = temp_output("protected", "pdf")

    owner_password = owner_pw if owner_pw else secrets.token_hex(16)

    with safe_open_pdf(input_path) as pdf:
        permissions = pikepdf.Permissions(
            extract=allow_extract,
            modify_annotation=allow_modify,
            modify_assembly=allow_modify,
            modify_form=allow_modify,
            modify_other=allow_modify,
            print_lowres=allow_print,
            print_highres=allow_print,
        )
        encryption = pikepdf.Encryption(
            user=password,
            owner=owner_password,
            allow=permissions,
        )
        pdf.save(str(output_path), encryption=encryption)
    return str(output_path)

