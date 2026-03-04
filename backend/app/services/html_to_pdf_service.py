import ipaddress
import re
import uuid
from urllib.parse import urlparse

from fastapi import HTTPException

from ..utils.cleanup import get_temp_path, ensure_temp_dir

_PRIVATE_NETWORKS = [
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("169.254.0.0/16"),
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("fc00::/7"),
]

_BLOCKED_HOSTNAMES = {"localhost", "0.0.0.0", "127.0.0.1", "::1", "169.254.169.254"}


def _validate_url(url: str) -> None:
    """Raise HTTPException(400) for URLs that could cause SSRF."""
    try:
        parsed = urlparse(url)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid URL")

    if parsed.scheme not in ("http", "https"):
        raise HTTPException(status_code=400, detail="Only http and https URLs are allowed")

    hostname = parsed.hostname or ""
    if hostname.lower() in _BLOCKED_HOSTNAMES:
        raise HTTPException(status_code=400, detail="URL points to a blocked host")

    try:
        addr = ipaddress.ip_address(hostname)
        for network in _PRIVATE_NETWORKS:
            if addr in network:
                raise HTTPException(status_code=400, detail="URL points to a private or reserved IP address")
    except ValueError:
        pass  # hostname is not an IP address — that's fine


def html_to_pdf(html_content: str) -> str:
    """Convert an HTML string to a PDF file using WeasyPrint."""
    from weasyprint import HTML  # imported lazily to avoid startup cost

    ensure_temp_dir()
    output_path = get_temp_path(f"html2pdf_{uuid.uuid4().hex}.pdf")
    HTML(string=html_content).write_pdf(str(output_path))
    return str(output_path)


def url_to_pdf(url: str) -> str:
    """Fetch a URL and convert it to a PDF file using WeasyPrint."""
    _validate_url(url)

    from weasyprint import HTML  # imported lazily to avoid startup cost

    ensure_temp_dir()
    output_path = get_temp_path(f"html2pdf_{uuid.uuid4().hex}.pdf")
    HTML(url=url).write_pdf(str(output_path))
    return str(output_path)
