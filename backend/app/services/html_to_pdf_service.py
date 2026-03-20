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
    """Raise HTTPException(400) for URLs that could cause SSRF.

    Performs DNS resolution to prevent DNS rebinding attacks.
    """
    try:
        parsed = urlparse(url)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid URL")

    if parsed.scheme not in ("http", "https"):
        raise HTTPException(status_code=400, detail="Only http and https URLs are allowed")

    hostname = parsed.hostname or ""
    if hostname.lower() in _BLOCKED_HOSTNAMES:
        raise HTTPException(status_code=400, detail="URL points to a blocked host")

    # Check if hostname is a literal IP
    try:
        addr = ipaddress.ip_address(hostname)
        for network in _PRIVATE_NETWORKS:
            if addr in network:
                raise HTTPException(status_code=400, detail="URL points to a private or reserved IP address")
    except ValueError:
        pass

    # Resolve hostname to prevent DNS rebinding attacks
    import socket
    try:
        resolved = socket.getaddrinfo(hostname, None)
        for family, _type, _proto, _canonname, sockaddr in resolved:
            ip_str = sockaddr[0]
            try:
                addr = ipaddress.ip_address(ip_str)
                for network in _PRIVATE_NETWORKS:
                    if addr in network:
                        raise HTTPException(
                            status_code=400,
                            detail="URL resolves to a private or reserved IP address",
                        )
            except ValueError:
                continue
    except socket.gaierror:
        raise HTTPException(status_code=400, detail="Could not resolve hostname")


def _fitz_html_to_pdf(html_content: str, output_path: str) -> None:
    """Use PyMuPDF to render HTML to PDF."""
    import fitz
    doc = fitz.open()

    # Wrap with basic styling if not already a full HTML document
    if "<html" not in html_content.lower():
        html_content = f"""<html><head><style>
        body {{ font-family: sans-serif; padding: 20px; line-height: 1.6; }}
        h1 {{ color: #333; }} h2 {{ color: #555; }} h3 {{ color: #777; }}
        code {{ background: #f0f0f0; padding: 2px 6px; border-radius: 3px; }}
        table {{ border-collapse: collapse; }} td, th {{ border: 1px solid #ccc; padding: 4px 8px; }}
        </style></head><body>{html_content}</body></html>"""

    # Use story for multi-page HTML rendering
    try:
        writer = fitz.DocumentWriter(output_path)
        story = fitz.Story(html=html_content)
        body = story.body
        mediabox = fitz.paper_rect("a4")
        where = mediabox + fitz.Rect(40, 40, -40, -40)

        more = True
        while more:
            dev = writer.begin_page(mediabox)
            more, _ = story.place(where)
            story.draw(dev)
            writer.end_page()
        writer.close()
    except Exception:
        # Fallback for older PyMuPDF
        page = doc.new_page()
        rect = page.rect + fitz.Rect(40, 40, -40, -40)
        try:
            page.insert_htmlbox(rect, html_content)
        except Exception:
            plain = re.sub(r"<[^>]+>", "", html_content)
            page.insert_text((40, 60), plain, fontsize=11)
        doc.save(output_path)
        doc.close()


def html_to_pdf(html_content: str) -> str:
    """Convert an HTML string to a PDF file."""
    ensure_temp_dir()
    output_path = str(get_temp_path(f"html2pdf_{uuid.uuid4().hex}.pdf"))
    _fitz_html_to_pdf(html_content, output_path)
    return output_path


def url_to_pdf(url: str) -> str:
    """Fetch a URL and convert it to a PDF file."""
    _validate_url(url)
    ensure_temp_dir()
    output_path = str(get_temp_path(f"html2pdf_{uuid.uuid4().hex}.pdf"))

    import urllib.request
    with urllib.request.urlopen(url, timeout=30) as resp:
        html_content = resp.read().decode("utf-8", errors="replace")
    _fitz_html_to_pdf(html_content, output_path)
    return output_path
