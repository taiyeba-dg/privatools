import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
FRONTEND_DATA_FILES = [
    ROOT / "frontend" / "src" / "data" / "tools.ts",
    ROOT / "frontend" / "src" / "data" / "non-pdf-tools.ts",
]
TOOL_ENDPOINTS_FILE = ROOT / "frontend" / "src" / "lib" / "tool-endpoints.ts"
BACKEND_ROUTES_DIR = ROOT / "backend" / "app" / "routes"


def _parse_tools(data_file: Path) -> list[tuple[str, bool]]:
    tools: list[tuple[str, bool]] = []
    current_slug: str | None = None
    current_client_only = False

    for raw_line in data_file.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()

        slug_match = re.search(r'slug:\s*"([^"]+)"', line)
        if slug_match:
            current_slug = slug_match.group(1)
            current_client_only = False

        if current_slug is not None and re.search(r"clientOnly:\s*true", line):
            current_client_only = True

        if current_slug is not None and (line == "}," or line == "}"):
            tools.append((current_slug, current_client_only))
            current_slug = None

    return tools


def _parse_endpoint_overrides() -> dict[str, str]:
    text = TOOL_ENDPOINTS_FILE.read_text(encoding="utf-8")
    return {
        slug: endpoint
        for slug, endpoint in re.findall(r'"([^"]+)":\s*"([^"]+)"', text)
    }


def _parse_backend_post_endpoints() -> set[str]:
    endpoints: set[str] = set()
    for route_file in BACKEND_ROUTES_DIR.glob("*.py"):
        text = route_file.read_text(encoding="utf-8")
        for endpoint in re.findall(r'@router\.post\("([^"]+)"\)', text):
            endpoints.add(endpoint)
    return endpoints


def test_all_non_client_only_tools_have_backend_routes():
    tools: list[tuple[str, bool]] = []
    for data_file in FRONTEND_DATA_FILES:
        tools.extend(_parse_tools(data_file))

    endpoint_overrides = _parse_endpoint_overrides()
    backend_endpoints = _parse_backend_post_endpoints()

    missing: list[tuple[str, str]] = []
    for slug, client_only in tools:
        if client_only:
            continue
        endpoint = endpoint_overrides.get(slug, f"/{slug}")
        if endpoint not in backend_endpoints:
            missing.append((slug, endpoint))

    assert not missing, (
        "Missing backend routes for non-client-only tools: "
        + ", ".join(f"{slug} -> {endpoint}" for slug, endpoint in missing)
    )
