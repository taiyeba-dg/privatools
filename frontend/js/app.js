/* ============================================================
   PDF Studio – app.js  (v3)
   ============================================================ */
'use strict';

/* ── Bootstrap ─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  setupDragDrop();
  setupFileInputs();
  setupRadioHighlight();
  setupChipGroups();
  setupSliders();
  setupHamburger();
  setupThemeToggle();
  setupPdfPreview();
  setupMergeDragReorder();
});

/* ── Theme (Dark/Light Toggle) ──────────────────────────────── */
function applyTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.body.classList.add('dark');
  } else if (saved === 'light') {
    document.body.classList.remove('dark');
  }
}

function setupThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  updateThemeIcon(btn);
  btn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon(btn);
  });
}

function updateThemeIcon(btn) {
  const isDark = document.body.classList.contains('dark');
  btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  btn.innerHTML = isDark
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
}

/* ── Hamburger Menu ─────────────────────────────────────────── */
function setupHamburger() {
  const btn = document.getElementById('hamburger-btn');
  const nav = document.querySelector('.header-nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !nav.contains(e.target)) {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ── PDF Preview (PDF.js) ───────────────────────────────────── */
function setupPdfPreview() {
  const canvas = document.getElementById('pdf-preview');
  if (!canvas) return;
  const wrap = canvas.closest('.pdf-preview-wrap');

  const fileInput = document.getElementById('file-input');
  if (!fileInput) return;

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
      wrap && wrap.classList.remove('visible');
      return;
    }
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjsLib = window.pdfjsLib || window['pdfjs-dist/build/pdf'];
      if (!pdfjsLib) return;
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1 });
      const maxW = 300;
      const scale = Math.min(maxW / viewport.width, 1);
      const scaledViewport = page.getViewport({ scale });
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;
      wrap && wrap.classList.add('visible');
    } catch (e) {
      console.warn('PDF preview error:', e);
      wrap && wrap.classList.remove('visible');
    }
  });
}

/* ── Merge Drag-to-Reorder ──────────────────────────────────── */
let _mergeFiles = [];

function setupMergeDragReorder() {
  // Only applies to merge page; no-op elsewhere
}

function renderMergeFileList(container, files) {
  _mergeFiles = Array.from(files);
  _renderMergeItems(container);
}

function _renderMergeItems(container) {
  container.innerHTML = '';
  container.classList.remove('hidden');
  let dragSrcIndex = null;
  _mergeFiles.forEach((f, idx) => {
    const item = document.createElement('div');
    item.className = 'file-item fade-in';
    item.draggable = true;
    item.dataset.index = String(idx);
    item.innerHTML =
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style="cursor:grab;color:var(--text-light)">
         <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
         <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
       </svg>
       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
         <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
         <polyline points="14 2 14 8 20 8"/>
       </svg>
       <span title="${escHtml(f.name)}">${escHtml(f.name)}</span>
       <span class="text-muted" style="flex-shrink:0;font-size:.78rem">${formatSize(f.size)}</span>`;

    item.addEventListener('dragstart', (e) => {
      dragSrcIndex = idx;
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      container.querySelectorAll('.file-item').forEach(el => el.classList.remove('drag-over'));
    });

    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      container.querySelectorAll('.file-item').forEach(el => el.classList.remove('drag-over'));
      item.classList.add('drag-over');
    });

    item.addEventListener('drop', (e) => {
      e.preventDefault();
      const targetIndex = parseInt(item.dataset.index, 10);
      if (dragSrcIndex !== null && dragSrcIndex !== targetIndex) {
        const moved = _mergeFiles.splice(dragSrcIndex, 1)[0];
        _mergeFiles.splice(targetIndex, 0, moved);
        dragSrcIndex = null;
        _renderMergeItems(container);
        _syncMergeFormData();
      }
    });

    container.appendChild(item);
  });
}

function _syncMergeFormData() {
  // Rebuild the file input's DataTransfer so FormData submission uses reordered files
  try {
    const input = document.getElementById('file-input');
    if (!input) return;
    const dt = new DataTransfer();
    _mergeFiles.forEach(f => dt.items.add(f));
    input.files = dt.files;
  } catch (_) {}
}

/* ── Drag & Drop ───────────────────────────────────────────── */
function setupDragDrop() {
  document.querySelectorAll('.upload-area').forEach(area => {
    const input = area.querySelector('input[type="file"]');
    if (!input) return;

    area.addEventListener('click', (e) => {
      if (e.target !== input) input.click();
    });

    area.addEventListener('dragenter', (e) => { e.preventDefault(); e.stopPropagation(); });
    area.addEventListener('dragover',  (e) => { e.preventDefault(); e.stopPropagation(); area.classList.add('dragover'); });
    area.addEventListener('dragleave', (e) => {
      if (!area.contains(e.relatedTarget)) area.classList.remove('dragover');
    });
    area.addEventListener('drop', (e) => {
      e.preventDefault();
      area.classList.remove('dragover');
      if (!e.dataTransfer.files.length) return;
      try {
        const dt = new DataTransfer();
        Array.from(e.dataTransfer.files).forEach(f => dt.items.add(f));
        input.files = dt.files;
        handleFileSelection(input);
      } catch (err) {
        console.warn('DataTransfer assignment not supported:', err);
        handleFileSelectionWithFiles(input, Array.from(e.dataTransfer.files));
      }
    });
  });
}

/* ── File Inputs ───────────────────────────────────────────── */
function setupFileInputs() {
  document.querySelectorAll('input[type="file"]').forEach(input => {
    input.addEventListener('change', () => handleFileSelection(input));
  });
}

function handleFileSelection(input) {
  if (!input.files || input.files.length === 0) return;
  _updateFileUI(Array.from(input.files));
}

function handleFileSelectionWithFiles(input, files) {
  if (!files || files.length === 0) return;
  _updateFileUI(files);
}

function _updateFileUI(files) {
  const fileInfo  = document.getElementById('file-info');
  const fileList  = document.getElementById('file-list');
  const submitBtn = document.getElementById('submit-btn');

  if (fileInfo) {
    fileInfo.textContent = files.map(f => `📄 ${f.name} (${formatSize(f.size)})`).join('\n');
    fileInfo.classList.remove('hidden');
  }

  if (fileList) {
    const isMerge = document.body.dataset.tool === 'merge';
    if (isMerge) {
      renderMergeFileList(fileList, files);
    } else {
      renderFileList(fileList, files);
    }
  }

  if (submitBtn) submitBtn.disabled = false;

  // Advance steps bar to step 2 if present
  setStep(2);
}

function renderFileList(container, files) {
  container.innerHTML = '';
  container.classList.remove('hidden');
  files.forEach(f => {
    const item = document.createElement('div');
    item.className = 'file-item fade-in';
    item.innerHTML =
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
         <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
         <polyline points="14 2 14 8 20 8"/>
       </svg>
       <span title="${escHtml(f.name)}">${escHtml(f.name)}</span>
       <span class="text-muted" style="flex-shrink:0;font-size:.78rem">${formatSize(f.size)}</span>`;
    container.appendChild(item);
  });
}

/* ── Step Indicator ────────────────────────────────────────── */
function setStep(n) {
  const steps = document.querySelectorAll('.steps-bar .step');
  const connectors = document.querySelectorAll('.steps-bar .step-connector');
  steps.forEach((s, i) => {
    s.classList.remove('active', 'done');
    if (i + 1 < n)  s.classList.add('done');
    if (i + 1 === n) s.classList.add('active');
  });
  connectors.forEach((c, i) => {
    c.classList.remove('active', 'done');
    if (i + 1 < n)  c.classList.add('done');
    if (i + 1 === n) c.classList.add('active');
  });
}

/* ── Radio Highlight ───────────────────────────────────────── */
function setupRadioHighlight() {
  document.querySelectorAll('.radio-option').forEach(opt => {
    const radio = opt.querySelector('input[type="radio"]');
    if (!radio) return;
    if (radio.checked) opt.classList.add('selected');
    radio.addEventListener('change', () => {
      document.querySelectorAll('.radio-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });
}

/* ── Chip / Button Groups ──────────────────────────────────── */
function setupChipGroups() {
  document.querySelectorAll('.btn-group[data-name]').forEach(group => {
    const name = group.dataset.name;
    group.querySelectorAll('.btn-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        group.querySelectorAll('.btn-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const hidden = document.querySelector(`input[name="${name}"]`);
        if (hidden) hidden.value = chip.dataset.value || chip.textContent.trim();
      });
    });
  });
}

/* ── Sliders ───────────────────────────────────────────────── */
function setupSliders() {
  document.querySelectorAll('input[type="range"]').forEach(slider => {
    const valueEl = document.getElementById(slider.id + '-value');
    if (!valueEl) return;
    valueEl.textContent = slider.value;
    slider.addEventListener('input', () => { valueEl.textContent = slider.value; });
  });
}

/* ── UI State Helpers ──────────────────────────────────────── */
function showProgress() {
  document.getElementById('progress-section')?.classList.remove('hidden');
  document.getElementById('result-section')?.classList.add('hidden');
  document.getElementById('error-section')?.classList.add('hidden');
  const btn = document.getElementById('submit-btn');
  if (btn) btn.disabled = true;
  setStep(2);
}

function showResult(blob, filename) {
  const url = URL.createObjectURL(blob);
  const downloadBtn = document.getElementById('download-btn');
  if (downloadBtn) {
    downloadBtn.href     = url;
    downloadBtn.download = filename;
  }
  document.getElementById('progress-section')?.classList.add('hidden');
  const rs = document.getElementById('result-section');
  if (rs) {
    rs.classList.remove('hidden');
    rs.classList.add('fade-in');
  }
  setStep(3);
  toast('Your file is ready to download!', 'success');
}

function showError(message) {
  document.getElementById('progress-section')?.classList.add('hidden');
  const es = document.getElementById('error-section');
  if (es) {
    es.classList.remove('hidden');
    es.classList.add('fade-in');
  }
  // Also update inline error message element if present
  const em = document.getElementById('error-message');
  if (em) em.textContent = message;
  toast(message, 'error');
  setStep(2);
}

/* ── Upload Progress Bar helper ─────────────────────────────── */
function updateUploadProgress(percent) {
  const bar = document.querySelector('.upload-progress-bar-inner');
  const text = document.querySelector('.upload-progress-text');
  const wrap = document.querySelector('.upload-progress-wrap');
  if (wrap) wrap.classList.add('visible');
  if (bar) bar.style.width = percent + '%';
  if (text) text.textContent = percent < 100 ? `Uploading… ${percent}%` : 'Processing…';
}

/* ── Form Submission ───────────────────────────────────────── */
async function submitForm(formId, endpoint, filename) {
  const form = document.getElementById(formId);
  if (!form) { showError('Form not found.'); return; }

  const fileInput = form.querySelector('input[type="file"]');
  if (fileInput && fileInput.files.length === 0) {
    showError('Please select a file first.'); return;
  }

  const formData = new FormData(form);
  showProgress();

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        updateUploadProgress(pct);
      }
    });

    xhr.addEventListener('load', async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const blob = xhr.response;

        // Compression stats
        const origSize = xhr.getResponseHeader('X-Original-Size');
        const compSize = xhr.getResponseHeader('X-Compressed-Size');
        if (origSize && compSize) {
          const orig = parseInt(origSize, 10);
          const comp = parseInt(compSize, 10);
          const pct  = Math.max(0, Math.round((1 - comp / orig) * 100));
          const statsEl = document.getElementById('compress-stats');
          if (statsEl) {
            statsEl.textContent = `${formatSize(orig)} → ${formatSize(comp)} (${pct}% smaller)`;
            statsEl.classList.add('visible');
          }
        }

        showResult(blob, filename);
      } else {
        let errMsg = `Server error (${xhr.status})`;
        try {
          const j = JSON.parse(xhr.responseText);
          errMsg = j.detail || j.error || errMsg;
        } catch (_) {}
        showError(errMsg);
      }
      resolve();
    });

    xhr.addEventListener('error', () => {
      showError('Network error. Please try again.');
      resolve();
    });

    xhr.addEventListener('abort', () => {
      showError('Upload cancelled.');
      resolve();
    });

    xhr.open('POST', endpoint);
    xhr.responseType = 'blob';
    xhr.send(formData);
  });
}

/* ── Toast Notifications ───────────────────────────────────── */
function toast(message, type = 'info', duration = 4500) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'assertive');
    container.setAttribute('aria-atomic', 'false');
    document.body.appendChild(container);
  }

  const icons = {
    error:   '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    success: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
    info:    '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  };

  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.setAttribute('role', 'alert');
  el.innerHTML =
    `${icons[type] || icons.info}
     <span class="toast-msg">${escHtml(message)}</span>
     <button class="toast-close" aria-label="Close notification">✕</button>`;

  const close = () => {
    el.style.animation = 'toastSlideOut 0.25s ease forwards';
    setTimeout(() => el.remove(), 260);
  };

  el.querySelector('.toast-close').addEventListener('click', close);
  container.appendChild(el);
  setTimeout(close, duration);
}

/* ── Utilities ─────────────────────────────────────────────── */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatSize(bytes) {
  if (bytes < 1024)          return bytes + ' B';
  if (bytes < 1024 * 1024)   return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
