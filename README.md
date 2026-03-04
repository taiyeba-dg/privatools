# 📄 PDF Studio — Privacy-First PDF Tools

> A self-hosted, open-source alternative to iLovePDF. Your files, your server, your privacy.

[![Python](https://img.shields.io/badge/Python-3.10+-blue)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-green)](https://fastapi.tiangolo.com)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](https://hub.docker.com)

---

## ✨ What It Does

| Tool | Description |
|------|-------------|
| 📎 **Merge PDF** | Combine multiple PDFs into one |
| ✂️ **Split PDF** | Extract pages or split into parts |
| 🗜️ **Compress PDF** | Reduce file size while keeping quality |
| 🖼️ **PDF to Image** | Convert pages to JPG or PNG |
| 📁 **Image to PDF** | Combine images into a PDF |
| 🔄 **Rotate PDF** | Rotate pages by 90°, 180°, or 270° |
| 🔒 **Protect PDF** | Add password encryption |
| 🔓 **Unlock PDF** | Remove password protection |
| 💧 **Add Watermark** | Stamp text watermark on pages |
| 📝 **PDF to Word** | Convert PDF to DOCX |
| 🔢 **Add Page Numbers** | Number your pages |

---

## 🚀 How to Access / Quick Start

### Option 1 — Docker (Recommended, easiest)

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

```bash
# 1. Clone the repository
git clone https://github.com/taiyeba-dg/lakshya-pdf.git
cd lakshya-pdf

# 2. Build and start with Docker Compose (one command)
docker-compose up --build
```

That's it. Open **http://localhost:8000** in your browser. 🎉

To stop the server: press `Ctrl+C`, then `docker-compose down`.

---

### Option 2 — Local Python (no Docker)

**Prerequisites:**

| Requirement | Why | Install |
|-------------|-----|---------|
| Python 3.10+ | Backend runtime | [python.org/downloads](https://python.org/downloads) |
| `poppler-utils` | PDF→Image conversion | see below |
| `libreoffice` | PDF→Word conversion | see below |

**Install system dependencies:**

```bash
# Ubuntu / Debian / WSL
sudo apt-get update && sudo apt-get install -y poppler-utils libreoffice

# macOS (Homebrew)
brew install poppler libreoffice

# Windows (WSL strongly recommended)
# Install WSL first: https://learn.microsoft.com/windows/wsl/install
# Then use the Ubuntu commands above inside WSL
```

**Run the app:**

```bash
# 1. Clone
git clone https://github.com/taiyeba-dg/lakshya-pdf.git
cd lakshya-pdf

# 2. Install Python dependencies
pip install -r backend/requirements.txt

# 3. Start the server
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

Open **http://localhost:8000** in your browser.

> **`--reload`** makes the server auto-restart when you edit code. Remove it in production.

---

### Option 3 — Deploy to Heroku (share with others)

```bash
# Install the Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli

heroku login
heroku create your-app-name
git push heroku main
heroku ps:scale web=1
heroku open          # opens https://your-app-name.herokuapp.com
```

> Heroku's ephemeral filesystem auto-deletes temp files between restarts — this is actually a privacy feature!

---

## 🔗 What URL to open

| Method | URL |
|--------|-----|
| Local Python or Docker | http://localhost:8000 |
| Docker with custom port | http://localhost:`<your-port>` |
| Heroku | https://`<your-app-name>`.herokuapp.com |

---

## 🛠️ Troubleshooting

<details>
<summary><strong>Port 8000 is already in use</strong></summary>

Change the port:
```bash
uvicorn backend.app.main:app --port 8080
# Then open http://localhost:8080
```

Or with Docker Compose, edit `docker-compose.yml`:
```yaml
ports:
  - "8080:8000"   # change left side (host port)
```
</details>

<details>
<summary><strong>"No module named 'pikepdf'" or similar import error</strong></summary>

Make sure you installed dependencies in the right environment:
```bash
pip install -r backend/requirements.txt
```

If you use a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload --port 8000
```
</details>

<details>
<summary><strong>PDF to Image doesn't work / returns error</strong></summary>

`poppler-utils` must be installed at the system level (not via pip):
```bash
# Ubuntu/Debian/WSL
sudo apt-get install poppler-utils

# macOS
brew install poppler
```
Then restart the server.
</details>

<details>
<summary><strong>PDF to Word doesn't work</strong></summary>

`libreoffice` must be installed:
```bash
# Ubuntu/Debian/WSL
sudo apt-get install libreoffice

# macOS
brew install --cask libreoffice
```
Then restart the server.
</details>

<details>
<summary><strong>Page loads but "All Tools" links don't work</strong></summary>

Make sure you are opening **http://localhost:8000**, not the HTML file directly (`file://…`). The tool pages make API calls to the backend server and must be served through it.
</details>

<details>
<summary><strong>Docker image build fails</strong></summary>

Make sure Docker Desktop is running, then try:
```bash
docker-compose down
docker-compose up --build --force-recreate
```
</details>

---

## 📁 Project Structure

```
lakshya-pdf/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI entry point — serves frontend + API
│   │   ├── routes/          # One file per tool (merge.py, split.py …)
│   │   ├── services/        # PDF processing logic
│   │   └── utils/           # Temp-file cleanup
│   └── requirements.txt
├── frontend/
│   ├── index.html           # Homepage with tool grid
│   ├── css/style.css
│   ├── js/app.js
│   └── pages/               # Individual tool pages + getting-started.html
├── Dockerfile
├── docker-compose.yml
├── Procfile                 # Heroku
└── runtime.txt
```

---

## 🔒 Privacy Guarantee

- **All processing is local** — files never leave your server
- **Zero external API calls** — no cloud services involved
- **Auto-deleted** — temp files are removed after 10 minutes
- **No analytics** — no tracking, no telemetry, no logging of file contents

---

## 📋 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/merge` | Merge multiple PDFs |
| `POST` | `/api/split` | Split a PDF |
| `POST` | `/api/compress` | Compress a PDF |
| `POST` | `/api/pdf-to-image` | Convert PDF to images |
| `POST` | `/api/image-to-pdf` | Convert images to PDF |
| `POST` | `/api/rotate` | Rotate PDF pages |
| `POST` | `/api/protect` | Password-protect a PDF |
| `POST` | `/api/unlock` | Remove PDF password |
| `POST` | `/api/watermark` | Add watermark |
| `POST` | `/api/pdf-to-word` | Convert PDF to DOCX |
| `POST` | `/api/page-numbers` | Add page numbers |
| `GET`  | `/api/health` | Health check (`{"status":"ok"}`) |

Interactive API docs are also available at **http://localhost:8000/docs** (Swagger UI) when the server is running.

---

## 🛠️ Tech Stack

- **Backend:** Python 3.10+, FastAPI, Uvicorn
- **PDF Processing:** pikepdf, pypdf, pdf2image, Pillow, reportlab
- **Office Conversions:** LibreOffice headless
- **Frontend:** Pure HTML/CSS/JS — zero framework dependencies
- **Deployment:** Docker, docker-compose, Heroku-ready

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
