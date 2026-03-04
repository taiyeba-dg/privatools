FROM python:3.10-slim AS base

# Install system dependencies in one layer
RUN apt-get update && apt-get install -y --no-install-recommends \
    poppler-utils \
    tesseract-ocr \
    libreoffice \
    ffmpeg \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf-xlib-2.0-0 \
    libffi-dev \
    libcairo2 \
    shared-mime-info \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps (cached layer)
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Build frontend (cached until frontend changes)
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm ci --production=false
COPY frontend/ ./frontend/
RUN cd frontend && npm run build && rm -rf node_modules

# Copy backend code
COPY backend/ ./backend/

# Create temp directory
RUN mkdir -p temp

# Set frontend path to built output
ENV FRONTEND_PATH=/app/frontend/dist
ENV ENVIRONMENT=production

# DigitalOcean App Platform passes PORT env var
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/api/health || exit 1

# Use shell form so $PORT expands at runtime
CMD uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 2
