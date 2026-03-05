"""
URL fetch proxy — downloads a file from a remote URL for processing.
Uses Python's built-in urllib — no extra dependencies.
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
import urllib.request
import urllib.error

router = APIRouter()

class FetchUrlRequest(BaseModel):
    url: str

@router.post("/fetch-url")
async def fetch_url(req: FetchUrlRequest):
    if not req.url.startswith(("http://", "https://")):
        raise HTTPException(400, "Invalid URL — must start with http:// or https://")

    try:
        request = urllib.request.Request(
            req.url,
            headers={"User-Agent": "PrivaTools/1.0"},
        )
        with urllib.request.urlopen(request, timeout=30) as resp:
            data = resp.read()
            content_type = resp.headers.get("Content-Type", "application/octet-stream")
            filename = req.url.split("/")[-1].split("?")[0] or "downloaded-file"

            return Response(
                content=data,
                media_type=content_type,
                headers={"Content-Disposition": f"attachment; filename={filename}"},
            )
    except urllib.error.HTTPError as e:
        raise HTTPException(400, f"Failed to fetch URL: HTTP {e.code}")
    except urllib.error.URLError as e:
        raise HTTPException(400, f"Failed to fetch URL: {str(e.reason)}")
    except Exception as e:
        raise HTTPException(500, f"Unexpected error: {str(e)}")
