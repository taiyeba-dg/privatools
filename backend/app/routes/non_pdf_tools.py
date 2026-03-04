"""Non-PDF tool routes: image, video/audio, and archive processing."""
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask
import tempfile, os, io

router = APIRouter()

# ─── Image Tools ───

@router.post("/image-compressor")
async def image_compressor(file: UploadFile = File(...), quality: int = Form(82)):
    from PIL import Image
    data = await file.read()
    img = Image.open(io.BytesIO(data))
    if img.mode == "RGBA":
        img = img.convert("RGB")
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
    img.save(tmp.name, "JPEG", quality=quality, optimize=True)
    cleanup = BackgroundTask(os.unlink, tmp.name)
    return FileResponse(tmp.name, media_type="image/jpeg", filename=f"compressed_{file.filename}", background=cleanup)

@router.post("/image-converter")
async def image_converter(file: UploadFile = File(...), target_format: str = Form("png")):
    from PIL import Image
    data = await file.read()
    img = Image.open(io.BytesIO(data))
    fmt_map = {"jpeg": "JPEG", "jpg": "JPEG", "png": "PNG", "webp": "WEBP", "bmp": "BMP", "tiff": "TIFF"}
    pil_fmt = fmt_map.get(target_format.lower(), "PNG")
    mime_map = {"jpeg": "image/jpeg", "jpg": "image/jpeg", "png": "image/png", "webp": "image/webp", "bmp": "image/bmp", "tiff": "image/tiff"}
    if pil_fmt == "JPEG" and img.mode == "RGBA":
        img = img.convert("RGB")
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=f".{target_format}")
    img.save(tmp.name, pil_fmt)
    cleanup = BackgroundTask(os.unlink, tmp.name)
    return FileResponse(tmp.name, media_type=mime_map.get(target_format.lower(), "application/octet-stream"), filename=f"converted.{target_format}", background=cleanup)

@router.post("/remove-exif")
async def remove_exif(file: UploadFile = File(...)):
    from PIL import Image
    data = await file.read()
    img = Image.open(io.BytesIO(data))
    clean = Image.new(img.mode, img.size)
    clean.putdata(list(img.getdata()))
    ext = os.path.splitext(file.filename or "image.jpg")[1] or ".jpg"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
    fmt = "JPEG" if ext.lower() in [".jpg", ".jpeg"] else "PNG"
    if fmt == "JPEG" and clean.mode == "RGBA":
        clean = clean.convert("RGB")
    clean.save(tmp.name, fmt)
    cleanup = BackgroundTask(os.unlink, tmp.name)
    return FileResponse(tmp.name, media_type="image/jpeg", filename=f"clean_{file.filename}", background=cleanup)

@router.post("/resize-crop-image")
async def resize_crop_image(file: UploadFile = File(...), width: int = Form(800), height: int = Form(600), mode: str = Form("resize")):
    from PIL import Image, ImageOps
    data = await file.read()
    img = Image.open(io.BytesIO(data))
    if mode == "crop":
        img = ImageOps.fit(img, (width, height))
    else:
        img = img.resize((width, height), Image.LANCZOS)
    ext = os.path.splitext(file.filename or "image.jpg")[1] or ".jpg"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
    fmt = "JPEG" if ext.lower() in [".jpg", ".jpeg"] else "PNG"
    if fmt == "JPEG" and img.mode == "RGBA":
        img = img.convert("RGB")
    img.save(tmp.name, fmt)
    cleanup = BackgroundTask(os.unlink, tmp.name)
    return FileResponse(tmp.name, media_type="image/jpeg", filename=f"{mode}_{file.filename}", background=cleanup)

# ─── Video/Audio Tools ─── (require ffmpeg)

@router.post("/video-to-gif")
async def video_to_gif(file: UploadFile = File(...), fps: int = Form(10), width: int = Form(480)):
    import subprocess
    data = await file.read()
    input_tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
    input_tmp.write(data)
    input_tmp.close()
    output_tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".gif")
    try:
        subprocess.run(["ffmpeg", "-y", "-i", input_tmp.name, "-vf", f"fps={fps},scale={width}:-1:flags=lanczos", "-loop", "0", output_tmp.name],
                       capture_output=True, timeout=120)
    except FileNotFoundError:
        os.unlink(input_tmp.name)
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=500, content={"detail": "ffmpeg not installed"})
    os.unlink(input_tmp.name)
    cleanup = BackgroundTask(os.unlink, output_tmp.name)
    return FileResponse(output_tmp.name, media_type="image/gif", filename="output.gif", background=cleanup)

@router.post("/extract-audio")
async def extract_audio(file: UploadFile = File(...), format: str = Form("mp3")):
    import subprocess
    data = await file.read()
    input_tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
    input_tmp.write(data)
    input_tmp.close()
    output_tmp = tempfile.NamedTemporaryFile(delete=False, suffix=f".{format}")
    try:
        subprocess.run(["ffmpeg", "-y", "-i", input_tmp.name, "-vn", "-acodec", "libmp3lame" if format == "mp3" else "copy", output_tmp.name],
                       capture_output=True, timeout=120)
    except FileNotFoundError:
        os.unlink(input_tmp.name)
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=500, content={"detail": "ffmpeg not installed"})
    os.unlink(input_tmp.name)
    mime_map = {"mp3": "audio/mpeg", "wav": "audio/wav", "aac": "audio/aac", "flac": "audio/flac", "ogg": "audio/ogg"}
    cleanup = BackgroundTask(os.unlink, output_tmp.name)
    return FileResponse(output_tmp.name, media_type=mime_map.get(format, "audio/mpeg"), filename=f"audio.{format}", background=cleanup)

@router.post("/trim-media")
async def trim_media(file: UploadFile = File(...), start: str = Form("00:00:00"), end: str = Form("00:00:10")):
    import subprocess
    data = await file.read()
    ext = os.path.splitext(file.filename or "media.mp4")[1] or ".mp4"
    input_tmp = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
    input_tmp.write(data)
    input_tmp.close()
    output_tmp = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
    try:
        subprocess.run(["ffmpeg", "-y", "-i", input_tmp.name, "-ss", start, "-to", end, "-c", "copy", output_tmp.name],
                       capture_output=True, timeout=120)
    except FileNotFoundError:
        os.unlink(input_tmp.name)
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=500, content={"detail": "ffmpeg not installed"})
    os.unlink(input_tmp.name)
    cleanup = BackgroundTask(os.unlink, output_tmp.name)
    return FileResponse(output_tmp.name, media_type="application/octet-stream", filename=f"trimmed{ext}", background=cleanup)

@router.post("/compress-video")
async def compress_video(file: UploadFile = File(...), quality: int = Form(28)):
    import subprocess
    data = await file.read()
    input_tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
    input_tmp.write(data)
    input_tmp.close()
    output_tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
    try:
        subprocess.run(["ffmpeg", "-y", "-i", input_tmp.name, "-vcodec", "libx264", "-crf", str(quality), output_tmp.name],
                       capture_output=True, timeout=300)
    except FileNotFoundError:
        os.unlink(input_tmp.name)
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=500, content={"detail": "ffmpeg not installed"})
    os.unlink(input_tmp.name)
    cleanup = BackgroundTask(os.unlink, output_tmp.name)
    return FileResponse(output_tmp.name, media_type="video/mp4", filename=f"compressed_{file.filename}", background=cleanup)

# ─── Archive Tools ───

@router.post("/extract-archive")
async def extract_archive(file: UploadFile = File(...)):
    import zipfile, shutil
    data = await file.read()
    input_tmp = tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename or ".zip")[1])
    input_tmp.write(data)
    input_tmp.close()
    extract_dir = tempfile.mkdtemp()
    output_tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".zip")
    try:
        shutil.unpack_archive(input_tmp.name, extract_dir)
    except Exception:
        with zipfile.ZipFile(input_tmp.name, 'r') as z:
            z.extractall(extract_dir)
    with zipfile.ZipFile(output_tmp.name, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(extract_dir):
            for f in files:
                fp = os.path.join(root, f)
                zf.write(fp, os.path.relpath(fp, extract_dir))
    os.unlink(input_tmp.name)
    shutil.rmtree(extract_dir, ignore_errors=True)
    cleanup = BackgroundTask(os.unlink, output_tmp.name)
    return FileResponse(output_tmp.name, media_type="application/zip", filename="extracted.zip", background=cleanup)

@router.post("/create-zip")
async def create_zip(files: list[UploadFile] = File(...), password: str = Form("")):
    import zipfile
    output_tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".zip")
    with zipfile.ZipFile(output_tmp.name, 'w', zipfile.ZIP_DEFLATED) as zf:
        for f in files:
            data = await f.read()
            zf.writestr(f.filename or "file", data)
    cleanup = BackgroundTask(os.unlink, output_tmp.name)
    return FileResponse(output_tmp.name, media_type="application/zip", filename="archive.zip", background=cleanup)
