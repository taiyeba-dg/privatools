import secrets
import pikepdf
import uuid
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def protect_pdf(input_path: str, password: str, owner_pw: str = None) -> str:
    ensure_temp_dir()
    output_path = get_temp_path(f"protected_{uuid.uuid4().hex}.pdf")

    owner_password = owner_pw if owner_pw else secrets.token_hex(16)

    with pikepdf.open(input_path) as pdf:
        permissions = pikepdf.Permissions(
            extract=False,
            modify_annotation=False,
            modify_assembly=False,
            modify_form=False,
            modify_other=False,
            print_lowres=True,
            print_highres=True,
        )
        encryption = pikepdf.Encryption(
            user=password,
            owner=owner_password,
            allow=permissions,
        )
        pdf.save(str(output_path), encryption=encryption)
    return str(output_path)
