<div align="center">

# 🛡️ PrivaTools

**Every file task, done privately.**

90+ tools for PDFs, images, video, and developer utilities — all running on your own server.  
Zero uploads to third parties. Zero tracking. Zero accounts.

[![Live Demo](https://img.shields.io/badge/Live-privatools.me-blue?style=for-the-badge&logo=vercel)](https://privatools.me)
[![MIT License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Stars](https://img.shields.io/github/stars/taiyeba-dg/privatools?style=for-the-badge&logo=github)](https://github.com/taiyeba-dg/privatools/stargazers)

</div>

---

## ✨ Why PrivaTools?

| Feature | PrivaTools | Other tools |
|---|---|---|
| **Privacy** | Files stay on YOUR server | Uploaded to unknown servers |
| **Cost** | Free forever | Freemium, watermarks, limits |
| **Speed** | Sub-100ms for most tools | Depends on upload speed |
| **No sign-up** | Just open and use | Email, credit card, etc. |
| **Open source** | MIT — fork, modify, deploy | Proprietary |

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
git clone https://github.com/taiyeba-dg/privatools.git
cd privatools
docker compose up --build
```

Open **http://localhost:8080** — that's it!

### Option 2: Manual Setup

```bash
# Clone
git clone https://github.com/taiyeba-dg/privatools.git
cd privatools

# Backend
pip install -r requirements.txt
uvicorn backend.app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

### System Dependencies (for all features)

```bash
# macOS
brew install tesseract ffmpeg
brew install --cask libreoffice

# Ubuntu/Debian
sudo apt install tesseract-ocr ffmpeg libreoffice
```

---

## 🛠️ All Tools (90+)

### 📄 PDF Tools

<details>
<summary><b>Organize & Manage (10)</b></summary>

Merge PDF · Split PDF · Split by Bookmarks · Split by Size · Organize Pages · Delete Pages · Extract Pages · Alternate Mix · Overlay PDF · Repair PDF

</details>

<details>
<summary><b>Edit Content (15)</b></summary>

Edit PDF · Sign PDF · E-Sign PDF · Watermark · Stamp PDF · Header/Footer · Page Numbers · Bates Numbering · Fill Form · Bookmarks · Add Hyperlinks · White-Out / Eraser · Annotate PDF · Add Shapes · Add Attachment

</details>

<details>
<summary><b>Optimize & Fix (9)</b></summary>

Compress · Flatten · Grayscale · Deskew · Crop · Auto Crop · Resize · Remove Blank Pages · Invert Colors

</details>

<details>
<summary><b>Security & Privacy (8)</b></summary>

Protect PDF · Unlock PDF · Redact · Strip Metadata · Delete Annotations · Sanitize PDF · PDF Permissions · Verify Signature

</details>

<details>
<summary><b>Convert to PDF (12)</b></summary>

Image → PDF · HTML → PDF · Word → PDF · Excel → PDF · PowerPoint → PDF · TXT → PDF · Markdown → PDF · CSV → PDF · EPUB → PDF · RTF → PDF · JSON → PDF · XML → PDF

</details>

<details>
<summary><b>Convert from PDF (8)</b></summary>

PDF → Image · PDF → Text · PDF → Word · PDF → Excel · PDF → PPTX · PDF → EPUB · PDF → Markdown · Extract Tables (CSV)

</details>

<details>
<summary><b>Advanced (8)</b></summary>

OCR · Compare · QR Code · NUP · PDF/A Validator · Transparent Background · Form Creator · Metadata Editor

</details>

### 🖼️ Image Tools

Image Compressor · Image Converter · Remove EXIF · Resize & Crop · Background Remover (local AI) · SVG → PNG · HEIC → JPG · Image Watermark · Favicon Generator · Photo Collage

### 🎬 Video & Audio

Video → GIF · Extract Audio · Trim Media · Compress Video

### 💻 Developer & Text

JSON/XML Formatter · Text Diff · Base64 Encode/Decode · Hash Generator · Barcode & QR Generator · URL → PDF · Image OCR

### 📦 Archive

Extract Archive · Create ZIP

### 📝 Documents & Office

CSV ↔ JSON · Markdown → HTML

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `⌘K` / `Ctrl+K` | Open Command Palette |
| `↑` `↓` | Navigate results |
| `Enter` | Open selected tool |
| `Escape` | Close palette |

---

## 📁 Project Structure

```
privatools/
├── backend/                  # FastAPI (Python)
│   ├── app/
│   │   ├── main.py           # Entry point, CORS, route registration
│   │   ├── routes/           # API handlers
│   │   │   ├── pdf_tools.py
│   │   │   ├── non_pdf_tools.py
│   │   │   ├── phase1_tools.py   # Word/Excel/PPT/TXT → PDF, Stamp, HEIC
│   │   │   ├── phase2_tools.py   # E-Sign, Table Extract, BG Remover
│   │   │   ├── phase3_tools.py   # Barcode, Favicon, Collage, etc.
│   │   │   └── phase4_tools.py   # Annotate, Shapes, Permissions, etc.
│   │   ├── services/         # Business logic (one file per tool)
│   │   └── utils/            # Cleanup, temp files
│   └── requirements.txt
├── frontend/                 # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/       # Tool UIs + Command Palette
│   │   ├── data/             # Tool definitions (tools.ts, non-pdf-tools.ts)
│   │   ├── hooks/            # useHistory, etc.
│   │   ├── pages/            # Index, ToolPage, NonPdfToolPage
│   │   └── lib/              # API client, utils
│   └── package.json
├── Dockerfile
├── docker-compose.yml
└── requirements.txt
```

---

## 🤝 Contributing

We love contributions! PrivaTools is MIT-licensed and open to everyone.

### How to Contribute

#### 1. Fork & Clone

```bash
git fork https://github.com/taiyeba-dg/privatools
git clone https://github.com/YOUR_USERNAME/privatools.git
cd privatools
```

#### 2. Set Up Development Environment

```bash
# Install backend deps
pip install -r requirements.txt

# Install frontend deps
cd frontend && npm install

# Start both (two terminals)
# Terminal 1:
uvicorn backend.app.main:app --reload --port 8000

# Terminal 2:
cd frontend && npm run dev
```

#### 3. Adding a New Tool

Adding a tool follows a simple 3-step pattern:

**Step 1: Create the service** — `backend/app/services/my_tool_service.py`

```python
import uuid
from ..utils.cleanup import get_temp_path, ensure_temp_dir

def my_tool(input_path: str, option: str = "default") -> str:
    """Your tool description."""
    ensure_temp_dir()
    output_path = get_temp_path(f"output_{uuid.uuid4().hex}.pdf")
    
    # Your processing logic here
    # ...
    
    return str(output_path)
```

**Step 2: Create the route** — add to an existing `routes/phase*_tools.py` or create a new one

```python
@router.post("/my-tool")
async def my_tool_endpoint(file: UploadFile = File(...)):
    content = await file.read()
    temp = get_temp_path(f"upload_{uuid.uuid4().hex}.pdf")
    temp.write_bytes(content)
    
    out = my_tool_service.my_tool(str(temp))
    cleanup = BackgroundTask(remove_files, str(temp), out)
    return FileResponse(out, filename="output.pdf", background=cleanup)
```

**Step 3: Register in the frontend** — add to `frontend/src/data/tools.ts`

```typescript
{
  slug: "my-tool",           // Must match the API endpoint
  icon: FileText,            // Any Lucide icon
  name: "My Tool",
  description: "Short description",
  longDescription: "Detailed description for the tool page.",
  category: "edit",          // organize | edit | optimize | security | to-pdf | from-pdf | advanced
  accepts: ".pdf",
  outputLabel: "output.pdf",
},
```

That's it! The `GenericUI` component automatically handles file upload/download for any tool that follows this pattern.

#### 4. Submit a Pull Request

```bash
git checkout -b feature/my-new-tool
git add -A
git commit -m "Add: My New Tool - description"
git push origin feature/my-new-tool
```

Then open a PR on GitHub!

### Contribution Ideas

- 🐛 **Bug fixes** — found something broken? Fix it!
- 🎨 **UI improvements** — make tools look even better
- 🔧 **New tools** — check our [Issues](https://github.com/taiyeba-dg/privatools/issues) for requests
- 📝 **Documentation** — improve docs, add examples
- 🌍 **i18n** — help translate the interface
- ⚡ **Performance** — make tools faster

### Guidelines

- **Privacy first** — never add external API calls for processing
- **Keep it simple** — one service file per tool
- **Test your changes** — make sure existing tools still work
- **Match the style** — follow existing code patterns

---

## 🔒 Privacy Promise

PrivaTools is built on a simple principle: **your files are yours**.

- ✅ All processing happens on YOUR server
- ✅ No files are ever uploaded to third parties
- ✅ No analytics, no tracking, no cookies
- ✅ No accounts, no sign-ups, no email required
- ✅ No AI APIs — even our Background Remover runs locally
- ✅ Temp files auto-deleted after processing
- ✅ Open source — audit the code yourself

---

## 📜 License

MIT — free to use, modify, and distribute. See [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ for privacy**

[Live Demo](https://privatools.me) · [Report Bug](https://github.com/taiyeba-dg/privatools/issues) · [Request Feature](https://github.com/taiyeba-dg/privatools/issues)

</div>
