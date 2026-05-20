"""Video tools backed by ffmpeg + (for video-to-pdf) PIL+ReportLab.

These all share the same constraints:
  - input goes to a temp .mp4/.mov/etc, output to a temp file
  - ffmpeg invoked via subprocess with a hard timeout
  - non-zero ffmpeg exit raises ValueError so the route returns a clean 400
"""

from __future__ import annotations

import logging
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

from ..utils.exceptions import ToolTimeoutError, ValidationError
from ..utils.filenames import temp_output

logger = logging.getLogger(__name__)

FFMPEG_TIMEOUT = 180  # seconds — covers ~10 min of input at preset speeds

# Supported output formats per tool — kept lower-case for sanity.
VIDEO_OUTPUT_FORMATS = {"mp4", "mov", "webm", "mkv", "avi"}

# ─── helpers ─────────────────────────────────────────────────────────────


def _run_ffmpeg(args: list[str], timeout: int = FFMPEG_TIMEOUT) -> None:
    """Run ffmpeg with full args list; raise typed exception on failure."""
    try:
        proc = subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", *args],
            capture_output=True, timeout=timeout, text=True,
            check=False,  # we handle returncode ourselves
        )
    except subprocess.TimeoutExpired as exc:
        raise ToolTimeoutError(
            f"ffmpeg timed out after {timeout}s — try a shorter clip."
        ) from exc
    except FileNotFoundError as exc:
        raise ValidationError("ffmpeg is not installed on this server.") from exc

    if proc.returncode != 0:
        # Trim ffmpeg stderr so the user gets the most relevant line.
        last = (proc.stderr or "").strip().splitlines()
        msg = last[-1] if last else f"ffmpeg exited with code {proc.returncode}"
        raise ValidationError(f"ffmpeg failed: {msg}")


def _probe_duration(input_path: str) -> float:
    """Return video duration in seconds (0 if probe fails)."""
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "default=noprint_wrappers=1:nokey=1", input_path],
            capture_output=True, timeout=15, text=True, check=True,
        )
        return float(result.stdout.strip())
    except (subprocess.SubprocessError, FileNotFoundError, ValueError) as exc:
        logger.debug("ffprobe duration failed: %s", exc)
        return 0.0


# ─── 1. Video → PDF ──────────────────────────────────────────────────────


def video_to_pdf(input_path: str, frames: int = 12) -> str:
    """Extract `frames` evenly-spaced frames from the video and lay them out
    one per PDF page. Useful for storyboarding or sharing a video preview
    with someone who only opens PDFs.
    """
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import Image as RLImage
    from reportlab.platypus import SimpleDocTemplate

    if frames < 1 or frames > 100:
        raise ValidationError("frames must be between 1 and 100")

    duration = _probe_duration(input_path) or 1.0
    work_dir = tempfile.mkdtemp(prefix="vid2pdf_")
    output_path = temp_output("video_to_pdf", "pdf")

    try:
        # Extract evenly-spaced frames — fps filter avoids re-decoding the
        # whole stream and gives us roughly the count we want.
        rate = max(0.001, frames / duration)
        _run_ffmpeg([
            "-i", input_path,
            "-vf", f"fps={rate},scale=1280:-1",
            os.path.join(work_dir, "frame_%03d.jpg"),
        ])
        files = sorted(Path(work_dir).glob("frame_*.jpg"))[:frames]
        if not files:
            raise ValidationError("Could not extract any frames from the video.")

        page_w, page_h = letter
        margin = 36
        max_w = page_w - 2 * margin

        doc = SimpleDocTemplate(str(output_path), pagesize=letter,
                                topMargin=margin, bottomMargin=margin,
                                leftMargin=margin, rightMargin=margin)
        story = []
        from PIL import Image as PILImage
        for f in files:
            with PILImage.open(f) as im:
                w, h = im.size
            ratio = max_w / w
            story.append(RLImage(str(f), width=max_w, height=h * ratio))
        doc.build(story)
        return str(output_path)
    finally:
        shutil.rmtree(work_dir, ignore_errors=True)


# ─── 2. Video converter ─────────────────────────────────────────────────


def video_convert(input_path: str, target_format: str) -> str:
    fmt = target_format.lower().strip()
    if fmt not in VIDEO_OUTPUT_FORMATS:
        raise ValidationError(
            f"target_format must be one of: {', '.join(sorted(VIDEO_OUTPUT_FORMATS))}"
        )
    output_path = temp_output("video_convert", fmt)

    # Sensible per-format codec choices:
    args = ["-i", input_path]
    if fmt == "webm":
        args += ["-c:v", "libvpx-vp9", "-b:v", "1M", "-c:a", "libopus"]
    elif fmt == "mkv":
        args += ["-c:v", "libx264", "-crf", "23", "-preset", "veryfast", "-c:a", "aac"]
    elif fmt == "avi":
        args += ["-c:v", "mpeg4", "-q:v", "5", "-c:a", "mp3"]
    elif fmt == "mov":
        args += ["-c:v", "libx264", "-crf", "23", "-preset", "veryfast",
                 "-c:a", "aac", "-movflags", "+faststart"]
    else:  # mp4 (default)
        args += ["-c:v", "libx264", "-crf", "23", "-preset", "veryfast",
                 "-c:a", "aac", "-movflags", "+faststart"]
    args.append(str(output_path))
    _run_ffmpeg(args)
    return str(output_path)


# ─── 3. Video resizer ────────────────────────────────────────────────────


VIDEO_PRESETS = {
    "240p":  (-2, 240),
    "360p":  (-2, 360),
    "480p":  (-2, 480),
    "720p":  (-2, 720),
    "1080p": (-2, 1080),
    "1440p": (-2, 1440),
}


def video_resize(input_path: str, preset: str = "720p") -> str:
    if preset not in VIDEO_PRESETS:
        raise ValidationError(
            f"preset must be one of: {', '.join(VIDEO_PRESETS.keys())}"
        )
    w, h = VIDEO_PRESETS[preset]
    output_path = temp_output("video_resize", "mp4")
    _run_ffmpeg([
        "-i", input_path,
        "-vf", f"scale={w}:{h}",
        "-c:v", "libx264", "-crf", "23", "-preset", "veryfast",
        "-c:a", "aac", "-movflags", "+faststart",
        str(output_path),
    ])
    return str(output_path)


# ─── 4. Video → single thumbnail JPG ─────────────────────────────────────


def video_thumbnail(input_path: str, time_seconds: float = 1.0) -> str:
    if time_seconds < 0:
        time_seconds = 0
    output_path = temp_output("video_thumb", "jpg")
    _run_ffmpeg([
        "-ss", str(time_seconds),
        "-i", input_path,
        "-frames:v", "1",
        "-vf", "scale=1280:-1",
        "-q:v", "3",
        str(output_path),
    ])
    return str(output_path)


# ─── 5. GIF → MP4 ────────────────────────────────────────────────────────


def gif_to_mp4(input_path: str) -> str:
    output_path = temp_output("gif_to_mp4", "mp4")
    _run_ffmpeg([
        "-i", input_path,
        # H.264 needs even dimensions; the pad filter keeps it safe for any input.
        "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2",
        "-c:v", "libx264", "-pix_fmt", "yuv420p",
        "-crf", "23", "-preset", "veryfast",
        "-movflags", "+faststart",
        str(output_path),
    ])
    return str(output_path)


# ─── 6. Burn-in subtitles (.srt) onto a video ────────────────────────────


def _has_audio(path: str) -> bool:
    """Return True if the file has at least one audio stream."""
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "error", "-select_streams", "a",
             "-show_entries", "stream=codec_type",
             "-of", "default=nw=1", path],
            capture_output=True, timeout=10, text=True, check=True,
        )
        return "audio" in result.stdout
    except (subprocess.SubprocessError, FileNotFoundError):
        return False


def video_merge(input_paths: list[str]) -> str:
    """Concatenate multiple videos using ffmpeg's concat filter (re-encodes
    once for compatibility — concat demuxer would be faster but only works
    when every input has identical codecs/dimensions, which uploaded clips
    rarely do).

    Handles mixed audio-presence inputs by padding video-only clips with a
    silent audio track at concat time, so the user never gets the cryptic
    "Error binding filtergraph inputs/outputs" failure.
    """
    if len(input_paths) < 2:
        raise ValidationError("Need at least 2 videos to merge.")
    if len(input_paths) > 20:
        raise ValidationError("Too many videos to merge in one call (max 20).")
    output_path = temp_output("video_merge", "mp4")
    n = len(input_paths)

    # Probe whether ANY input has audio. If none do, drop the audio stream
    # entirely. If some do, pad the silent ones with anullsrc so concat works.
    audio_flags = [_has_audio(p) for p in input_paths]
    any_audio = any(audio_flags)

    inputs: list[str] = []
    for p in input_paths:
        inputs += ["-i", p]

    if any_audio:
        # Add an anullsrc per silent input as additional inputs.
        anull_indices: dict[int, int] = {}
        for idx, has in enumerate(audio_flags):
            if not has:
                anull_indices[idx] = len(inputs) // 2  # next ffmpeg input index
                inputs += ["-f", "lavfi", "-t", "0.1", "-i",
                           "anullsrc=channel_layout=stereo:sample_rate=44100"]
        # Build concat input list — use real audio when available, anullsrc when not.
        # The `aresample=async=1` keeps audio in sync after concat.
        parts = []
        for i in range(n):
            parts.append(f"[{i}:v:0]")
            if audio_flags[i]:
                parts.append(f"[{i}:a:0]")
            else:
                parts.append(f"[{anull_indices[i]}:a:0]")
        filter_complex = "".join(parts) + f"concat=n={n}:v=1:a=1[v][a]"
        map_args = ["-map", "[v]", "-map", "[a]"]
        codec_args = ["-c:v", "libx264", "-crf", "23", "-preset", "veryfast",
                      "-c:a", "aac"]
    else:
        # Video-only concat — drop audio entirely.
        filter_complex = "".join(f"[{i}:v:0]" for i in range(n)) + f"concat=n={n}:v=1:a=0[v]"
        map_args = ["-map", "[v]"]
        codec_args = ["-c:v", "libx264", "-crf", "23", "-preset", "veryfast", "-an"]

    _run_ffmpeg([
        *inputs,
        "-filter_complex", filter_complex,
        *map_args,
        *codec_args,
        "-movflags", "+faststart",
        str(output_path),
    ])
    return str(output_path)


def audio_merge(input_paths: list[str]) -> str:
    """Concatenate audio tracks. Output is MP3 for broadest compatibility."""
    if len(input_paths) < 2:
        raise ValidationError("Need at least 2 audio files to merge.")
    if len(input_paths) > 50:
        raise ValidationError("Too many audio files to merge in one call (max 50).")
    output_path = temp_output("audio_merge", "mp3")
    inputs: list[str] = []
    for p in input_paths:
        inputs += ["-i", p]
    n = len(input_paths)
    filter_complex = "".join(f"[{i}:a:0]" for i in range(n)) + f"concat=n={n}:v=0:a=1[a]"
    _run_ffmpeg([
        *inputs,
        "-filter_complex", filter_complex,
        "-map", "[a]",
        "-c:a", "libmp3lame", "-q:a", "2",
        str(output_path),
    ])
    return str(output_path)


def burn_subtitles(video_path: str, srt_path: str) -> str:
    """Burn-in subtitles from `srt_path` onto `video_path`.

    The .srt path is interpolated inline into ffmpeg's `subtitles=` filter
    expression, which uses ':' as an argument separator, ',' as a filter
    separator, '\\' as an escape and quotes for protection — every one of
    those needs special handling, or a path containing `:`, `,`, or `\\`
    (entirely possible since temp filenames are random) silently produces
    a bogus filter and ffmpeg fails.

    We copy the srt file to a sanitized path inside the temp dir and use
    that — much simpler and lets us avoid the escape-rule maze entirely.
    """
    output_path = temp_output("video_subs", "mp4")

    # Re-stage the .srt at a path that contains nothing the ffmpeg filter
    # syntax treats as special (alphanumerics + underscore + dot only).
    safe_srt_path = temp_output("subs", "srt")
    shutil.copy2(srt_path, str(safe_srt_path))

    try:
        _run_ffmpeg([
            "-i", video_path,
            "-vf", f"subtitles={safe_srt_path}",
            "-c:v", "libx264", "-crf", "23", "-preset", "veryfast",
            "-c:a", "copy",
            "-movflags", "+faststart",
            str(output_path),
        ])
        return str(output_path)
    finally:
        # The sanitized copy is only useful for the duration of this call.
        try:
            safe_srt_path.unlink(missing_ok=True)
        except OSError:
            pass
