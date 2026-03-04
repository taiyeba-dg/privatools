"""
URL fetch proxy — downloads a file from a remote URL for processing.
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import httpx

router = APIRouter()

class FetchUrlRequest(BaseModel):
    url: str

@router.post("/fetch-url")
async def fetch_url(req: FetchUrlRequest):
    if not req.url.startswith(("http://", "https://")):
        raise HTTPException(400, "Invalid URL — must start with http:// or https://")

    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=30) as client:
            resp = await client.get(req.url)
            resp.raise_for_status()

            content_type = resp.headers.get("content-type", "application/octet-stream")
            filename = req.url.split("/")[-1].split("?")[0] or "downloaded-file"

            return StreamingResponse(
                iter([resp.content]),
                media_type=content_type,
                headers={"Content-Disposition": f"attachment; filename={filename}"},
            )
    except httpx.HTTPError as e:
        raise HTTPException(400, f"Failed to fetch URL: {str(e)}")
    except Exception as e:
        raise HTTPException(500, f"Unexpected error: {str(e)}")
