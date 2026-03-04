# PrivaTools

**All-in-one private file processing toolkit.** 73 tools for PDFs, images, video, and more — all running 100% locally on your machine. No files ever leave your computer.

## Quick Start

```bash
# Start the backend
cd backend && pip install -r requirements.txt
cd .. && uvicorn backend.app.main:app --reload --port 8000

# Start the frontend (separate terminal)
cd frontend && npm install && npm run dev
```

Open **http://localhost:8080** in your browser.

## Project Structure

```
├── backend/          # FastAPI backend (Python)
│   ├── app/
│   │   ├── main.py          # App entry point, CORS, route registration
│   │   ├── routes/          # API endpoint handlers
│   │   ├── services/        # Business logic for each tool
│   │   └── utils/           # Shared utilities
│   └── requirements.txt
├── frontend/         # React + Vite + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/      # UI components for each tool
│   │   ├── pages/           # Route pages
│   │   └── lib/api.ts       # Centralized API client
│   └── package.json
├── Dockerfile        # Production Docker build
├── docker-compose.yml
└── requirements.txt  # Root-level Python deps
```

## Tools (73)

### PDF (57)
Merge, Split, Compress, Protect, Unlock, Rotate, Watermark, Page Numbers, Header/Footer, Bates Numbering, PDF→Image, Image→PDF, PDF→Word, PDF→Text, PDF→Excel, PDF→PPTX, PDF→PDF/A, HTML→PDF, Office→PDF, Extract Pages, Delete Pages, Organize Pages, Crop, Resize, Flatten, Grayscale, Deskew, Edit PDF, Fill Form, Metadata, Strip Metadata, Delete Annotations, Repair, Redact, Sign, OCR, Compare, Alternate Mix, Overlay, NUP, QR Code, Bookmarks, Extract Images, Split by Bookmarks, Split by Size, Remove Blank Pages, Auto Crop, Invert Colors, PDF/A Validator, Verify Signature, Sanitize, PDF→EPUB, Markdown→PDF, CSV→PDF, Add Hyperlinks, Form Creator, Transparent Background

### Non-PDF (16)
Image Compressor, Image Converter, Remove EXIF, Resize/Crop Image, Video→GIF, Extract Audio, Trim Media, Compress Video, Extract Archive, Create ZIP, JSON/XML Formatter, Text Diff, Base64, Hash Generator, CSV↔JSON, Markdown→HTML

## System Dependencies

```bash
brew install tesseract ffmpeg
brew install --cask libreoffice
```

## Docker

```bash
docker compose up --build
```

## Privacy

All processing happens locally. No external API calls. No data storage. No tracking.
