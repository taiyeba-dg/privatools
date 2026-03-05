# PrivaTools Full Tool Audit Report

Audit scope completed on 2026-03-05 for 99 tools (74 PDF + 25 non-PDF).


### Merge PDF — merge-pdf
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/merge.py:18`, backend/app/services/merge_service.py:6) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### Split PDF — split-pdf
**Status**: 🟡 Needs improvement

**Backend**:
- Range parsing only accepts numeric ranges and omits `end`/open ranges (`backend/app/services/split_service.py:8`), so inputs like `1-3,5,7-end` from the tool promise are unsupported.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Add explicit `except` cleanup (`remove_files`) for all temp paths created before service invocation, then re-raise typed HTTP errors.
2. Add failure-path tests that force service exceptions and assert no orphan temp files remain in `temp/`.

**Priority**: High

---

### Split by Bookmarks — split-by-bookmarks
**Status**: 🟡 Needs improvement

**Backend**:
- Error path cleanup is inconsistent in this route (`backend/app/routes/split_bookmarks.py:13`): temp input/output files are cleaned in `BackgroundTask` on success but not always removed before re-raising exceptions.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Add explicit `except` cleanup (`remove_files`) for all temp paths created before service invocation, then re-raise typed HTTP errors.
2. Add failure-path tests that force service exceptions and assert no orphan temp files remain in `temp/`.

**Priority**: Medium

---

### Split by Size — split-by-size
**Status**: 🟡 Needs improvement

**Backend**:
- Error path cleanup is inconsistent in this route (`backend/app/routes/split_by_size.py:13`): temp input/output files are cleaned in `BackgroundTask` on success but not always removed before re-raising exceptions.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Add explicit `except` cleanup (`remove_files`) for all temp paths created before service invocation, then re-raise typed HTTP errors.
2. Add failure-path tests that force service exceptions and assert no orphan temp files remain in `temp/`.

**Priority**: Medium

---

### Organize Pages — organize-pages
**Status**: 🟡 Needs improvement

**Backend**:
- Error path cleanup is inconsistent in this route (`backend/app/routes/organize_pages.py:36`): temp input/output files are cleaned in `BackgroundTask` on success but not always removed before re-raising exceptions.

**Frontend**:
- Organize UI shows page placeholders and arrow controls (`frontend/src/components/tool-ui/OrganizeUI.tsx:84`) instead of true thumbnail drag-and-drop with rotate/duplicate/undo actions.

**Recommendations**:
1. Add explicit `except` cleanup (`remove_files`) for all temp paths created before service invocation, then re-raise typed HTTP errors.
2. Add failure-path tests that force service exceptions and assert no orphan temp files remain in `temp/`.

**Priority**: Medium

---

### Delete Pages — delete-pages
**Status**: 🟡 Needs improvement

**Backend**:
- Error path cleanup is inconsistent in this route (`backend/app/routes/delete_pages.py:13`): temp input/output files are cleaned in `BackgroundTask` on success but not always removed before re-raising exceptions.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Add explicit `except` cleanup (`remove_files`) for all temp paths created before service invocation, then re-raise typed HTTP errors.
2. Add failure-path tests that force service exceptions and assert no orphan temp files remain in `temp/`.

**Priority**: Medium

---

### Extract Pages — extract-pages
**Status**: 🟡 Needs improvement

**Backend**:
- Error path cleanup is inconsistent in this route (`backend/app/routes/extract_pages.py:13`): temp input/output files are cleaned in `BackgroundTask` on success but not always removed before re-raising exceptions.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Add explicit `except` cleanup (`remove_files`) for all temp paths created before service invocation, then re-raise typed HTTP errors.
2. Add failure-path tests that force service exceptions and assert no orphan temp files remain in `temp/`.

**Priority**: Medium

---

### Edit PDF — edit-pdf
**Status**: 🟡 Needs improvement

**Backend**:
- Error path cleanup is inconsistent in this route (`backend/app/routes/edit_pdf.py:16`): temp input/output files are cleaned in `BackgroundTask` on success but not always removed before re-raising exceptions.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Add explicit `except` cleanup (`remove_files`) for all temp paths created before service invocation, then re-raise typed HTTP errors.
2. Add failure-path tests that force service exceptions and assert no orphan temp files remain in `temp/`.

**Priority**: Medium

---

### Sign PDF — sign-pdf
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/sign.py:16`, backend/app/services/sign_service.py:10) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### Watermark — watermark
**Status**: 🟡 Needs improvement

**Backend**:
- Backend supports text watermark only (`backend/app/services/watermark_service.py:9`); image watermark upload mentioned in tool description is not implemented in this route (`backend/app/routes/watermark.py:17`).

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Align tool copy with current fidelity limits (or upgrade backend algorithm) so user expectations match actual output quality.
2. Expose advanced options (quality profile, parsing mode, fallback strategy) and report post-run diagnostics in the success state.

**Priority**: High

---

### Header & Footer — header-footer
**Status**: 🟡 Needs improvement

**Backend**:
- Error path cleanup is inconsistent in this route (`backend/app/routes/header_footer.py:13`): temp input/output files are cleaned in `BackgroundTask` on success but not always removed before re-raising exceptions.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Add explicit `except` cleanup (`remove_files`) for all temp paths created before service invocation, then re-raise typed HTTP errors.
2. Add failure-path tests that force service exceptions and assert no orphan temp files remain in `temp/`.

**Priority**: Medium

---

### Page Numbers — page-numbers
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/page_numbers.py:24`, backend/app/services/page_numbers_service.py:9) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### Bates Numbering — bates-numbering
**Status**: 🟡 Needs improvement

**Backend**:
- Error path cleanup is inconsistent in this route (`backend/app/routes/bates_numbering.py:22`): temp input/output files are cleaned in `BackgroundTask` on success but not always removed before re-raising exceptions.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Add explicit `except` cleanup (`remove_files`) for all temp paths created before service invocation, then re-raise typed HTTP errors.
2. Add failure-path tests that force service exceptions and assert no orphan temp files remain in `temp/`.

**Priority**: Medium

---

### Bookmarks — bookmarks
**Status**: 🟡 Needs improvement

**Backend**:
- Error path cleanup is inconsistent in this route (`backend/app/routes/bookmarks.py:13`): temp input/output files are cleaned in `BackgroundTask` on success but not always removed before re-raising exceptions.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Add explicit `except` cleanup (`remove_files`) for all temp paths created before service invocation, then re-raise typed HTTP errors.
2. Add failure-path tests that force service exceptions and assert no orphan temp files remain in `temp/`.

**Priority**: Medium

---

### Compress PDF — compress-pdf
**Status**: 🟡 Needs improvement

**Backend**:
- Error path cleanup is inconsistent in this route (`backend/app/routes/compress.py:17`): temp input/output files are cleaned in `BackgroundTask` on success but not always removed before re-raising exceptions.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Add explicit `except` cleanup (`remove_files`) for all temp paths created before service invocation, then re-raise typed HTTP errors.
2. Add failure-path tests that force service exceptions and assert no orphan temp files remain in `temp/`.

**Priority**: Medium

---

### Flatten PDF — flatten-pdf
**Status**: 🟡 Needs improvement

**Backend**:
- Error path cleanup is inconsistent in this route (`backend/app/routes/flatten.py:13`): temp input/output files are cleaned in `BackgroundTask` on success but not always removed before re-raising exceptions.

**Frontend**:
- This tool uses the shared minimal `SimpleConvertUI` flow (`frontend/src/components/tool-ui/SimpleConvertUI.tsx:17`) with no tool-specific options, previews, or size-warning feedback.

**Recommendations**:
1. Add explicit `except` cleanup (`remove_files`) for all temp paths created before service invocation, then re-raise typed HTTP errors.
2. Add failure-path tests that force service exceptions and assert no orphan temp files remain in `temp/`.

**Priority**: Medium

---

### Deskew PDF — deskew-pdf
**Status**: 🟡 Needs improvement

**Backend**:
- Error path cleanup is inconsistent in this route (`backend/app/routes/deskew.py:13`): temp input/output files are cleaned in `BackgroundTask` on success but not always removed before re-raising exceptions.

**Frontend**:
- This tool uses the shared minimal `SimpleConvertUI` flow (`frontend/src/components/tool-ui/SimpleConvertUI.tsx:17`) with no tool-specific options, previews, or size-warning feedback.

**Recommendations**:
1. Add explicit `except` cleanup (`remove_files`) for all temp paths created before service invocation, then re-raise typed HTTP errors.
2. Add failure-path tests that force service exceptions and assert no orphan temp files remain in `temp/`.

**Priority**: Medium

---

### Repair PDF — repair-pdf
**Status**: 🟡 Needs improvement

**Backend**:
- Repair currently does a basic open/save via pikepdf (`backend/app/services/repair_service.py:10`) without recovery strategy tiers or diagnostics for truly damaged files.

**Frontend**:
- This tool uses the shared minimal `SimpleConvertUI` flow (`frontend/src/components/tool-ui/SimpleConvertUI.tsx:17`) with no tool-specific options, previews, or size-warning feedback.

**Recommendations**:
1. Add explicit `except` cleanup (`remove_files`) for all temp paths created before service invocation, then re-raise typed HTTP errors.
2. Add failure-path tests that force service exceptions and assert no orphan temp files remain in `temp/`.

**Priority**: Medium

---

### Resize PDF — resize-pdf
**Status**: 🟡 Needs improvement

**Backend**:
- Error path cleanup is inconsistent in this route (`backend/app/routes/resize.py:16`): temp input/output files are cleaned in `BackgroundTask` on success but not always removed before re-raising exceptions.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Add explicit `except` cleanup (`remove_files`) for all temp paths created before service invocation, then re-raise typed HTTP errors.
2. Add failure-path tests that force service exceptions and assert no orphan temp files remain in `temp/`.

**Priority**: Medium

---

### Rotate PDF — rotate-pdf
**Status**: 🟡 Needs improvement

**Backend**:
- Error path cleanup is inconsistent in this route (`backend/app/routes/rotate.py:15`): temp input/output files are cleaned in `BackgroundTask` on success but not always removed before re-raising exceptions.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Add explicit `except` cleanup (`remove_files`) for all temp paths created before service invocation, then re-raise typed HTTP errors.
2. Add failure-path tests that force service exceptions and assert no orphan temp files remain in `temp/`.

**Priority**: Medium

---

### Grayscale PDF — grayscale-pdf
**Status**: 🟡 Needs improvement

**Backend**:
- Error path cleanup is inconsistent in this route (`backend/app/routes/grayscale.py:13`): temp input/output files are cleaned in `BackgroundTask` on success but not always removed before re-raising exceptions.

**Frontend**:
- This tool uses the shared minimal `SimpleConvertUI` flow (`frontend/src/components/tool-ui/SimpleConvertUI.tsx:17`) with no tool-specific options, previews, or size-warning feedback.

**Recommendations**:
1. Add explicit `except` cleanup (`remove_files`) for all temp paths created before service invocation, then re-raise typed HTTP errors.
2. Add failure-path tests that force service exceptions and assert no orphan temp files remain in `temp/`.

**Priority**: Medium

---

### Crop PDF — crop-pdf
**Status**: 🔴 Needs redesign

**Backend**:
- Error path cleanup is inconsistent in this route (`backend/app/routes/crop.py:13`): temp input/output files are cleaned in `BackgroundTask` on success but not always removed before re-raising exceptions.

**Frontend**:
- UI relies on manual coordinates/JSON forms (`frontend/src/components/tool-ui/CropUI.tsx:61`) instead of visual page selection, which is high-friction and error-prone for redaction/cropping/annotation tasks.

**Recommendations**:
1. Implement a page-canvas editor (zoom/pan, rectangle handles, snap guides) so users can select areas visually instead of entering coordinates/JSON.
2. Add real-time before/after preview and per-action undo stack persisted in component state before final export.

**Priority**: High

---

### Protect PDF — protect-pdf
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/protect.py:16`, backend/app/services/protect_service.py:7) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### Unlock PDF — unlock-pdf
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/unlock.py:16`, backend/app/services/unlock_service.py:6) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### Redact PDF — redact-pdf
**Status**: 🔴 Needs redesign

**Backend**:
- Error path cleanup is inconsistent in this route (`backend/app/routes/redact.py:17`): temp input/output files are cleaned in `BackgroundTask` on success but not always removed before re-raising exceptions.

**Frontend**:
- UI relies on manual coordinates/JSON forms (`frontend/src/components/tool-ui/RedactUI.tsx:56`) instead of visual page selection, which is high-friction and error-prone for redaction/cropping/annotation tasks.

**Recommendations**:
1. Implement a page-canvas editor (zoom/pan, rectangle handles, snap guides) so users can select areas visually instead of entering coordinates/JSON.
2. Add real-time before/after preview and per-action undo stack persisted in component state before final export.

**Priority**: High

---

### Strip Metadata — strip-metadata
**Status**: 🟡 Needs improvement

**Backend**:
- Error path cleanup is inconsistent in this route (`backend/app/routes/strip_metadata.py:13`): temp input/output files are cleaned in `BackgroundTask` on success but not always removed before re-raising exceptions.

**Frontend**:
- This tool uses the shared minimal `SimpleConvertUI` flow (`frontend/src/components/tool-ui/SimpleConvertUI.tsx:17`) with no tool-specific options, previews, or size-warning feedback.

**Recommendations**:
1. Add explicit `except` cleanup (`remove_files`) for all temp paths created before service invocation, then re-raise typed HTTP errors.
2. Add failure-path tests that force service exceptions and assert no orphan temp files remain in `temp/`.

**Priority**: Medium

---

### Delete Annotations — delete-annotations
**Status**: 🟡 Needs improvement

**Backend**:
- Error path cleanup is inconsistent in this route (`backend/app/routes/delete_annotations.py:13`): temp input/output files are cleaned in `BackgroundTask` on success but not always removed before re-raising exceptions.

**Frontend**:
- This tool uses the shared minimal `SimpleConvertUI` flow (`frontend/src/components/tool-ui/SimpleConvertUI.tsx:17`) with no tool-specific options, previews, or size-warning feedback.

**Recommendations**:
1. Add explicit `except` cleanup (`remove_files`) for all temp paths created before service invocation, then re-raise typed HTTP errors.
2. Add failure-path tests that force service exceptions and assert no orphan temp files remain in `temp/`.

**Priority**: Medium

---

### Metadata — metadata
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/metadata.py:16`, backend/app/services/metadata_service.py:7) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### HTML to PDF — html-to-pdf
**Status**: 🟡 Needs improvement

**Backend**:
- Error path cleanup is inconsistent in this route (`backend/app/routes/html_to_pdf.py:15`): temp input/output files are cleaned in `BackgroundTask` on success but not always removed before re-raising exceptions.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Add explicit `except` cleanup (`remove_files`) for all temp paths created before service invocation, then re-raise typed HTTP errors.
2. Add failure-path tests that force service exceptions and assert no orphan temp files remain in `temp/`.

**Priority**: Medium

---

### Image to PDF — image-to-pdf
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/image_to_pdf.py:20`, backend/app/services/image_to_pdf_service.py:13) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### Office to PDF — office-to-pdf
**Status**: 🟡 Needs improvement

**Backend**:
- Route and service are wired correctly (`backend/app/routes/office_to_pdf.py:18`, backend/app/services/office_to_pdf_service.py:1) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- This tool uses the shared minimal `SimpleConvertUI` flow (`frontend/src/components/tool-ui/SimpleConvertUI.tsx:17`) with no tool-specific options, previews, or size-warning feedback.

**Recommendations**:
1. Replace `SimpleConvertUI` alias with tool-specific controls (format/quality/page scope) where backend supports parameters.
2. Add size warning + estimated processing time + accessible upload interactions to match high-quality UIs like CompressUI.

**Priority**: Medium

---

### PDF to Excel — pdf-to-excel
**Status**: 🟡 Needs improvement

**Backend**:
- Fallback path writes one text line per row when table detection fails (`backend/app/services/pdf_to_excel_service.py:37`), leading to low-fidelity spreadsheet output for non-tabular PDFs.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Add explicit `except` cleanup (`remove_files`) for all temp paths created before service invocation, then re-raise typed HTTP errors.
2. Add failure-path tests that force service exceptions and assert no orphan temp files remain in `temp/`.

**Priority**: Medium

---

### PDF to Image — pdf-to-image
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/pdf_to_image.py:15`, backend/app/services/pdf_to_image_service.py:9) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### PDF to PowerPoint — pdf-to-pptx
**Status**: 🔴 Needs redesign

**Backend**:
- Slides are rendered as page images (`backend/app/services/pdf_to_pptx_service.py:22`), so resulting PPTX is not meaningfully editable despite frontend copy implying editable conversion.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Add explicit `except` cleanup (`remove_files`) for all temp paths created before service invocation, then re-raise typed HTTP errors.
2. Add failure-path tests that force service exceptions and assert no orphan temp files remain in `temp/`.

**Priority**: High

---

### PDF to Text — pdf-to-text
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/pdf_to_text.py:12`, backend/app/services/pdf_to_text_service.py:4) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### PDF to Word — pdf-to-word
**Status**: 🟡 Needs improvement

**Backend**:
- Conversion extracts text spans and inserts fixed-size pictures (`backend/app/services/pdf_to_word_service.py:20`), so complex layouts/tables are not preserved reliably.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Align tool copy with current fidelity limits (or upgrade backend algorithm) so user expectations match actual output quality.
2. Expose advanced options (quality profile, parsing mode, fallback strategy) and report post-run diagnostics in the success state.

**Priority**: Medium

---

### Alternate Mix — alternate-mix
**Status**: 🟡 Needs improvement

**Backend**:
- Error path cleanup is inconsistent in this route (`backend/app/routes/alternate_mix.py:14`): temp input/output files are cleaned in `BackgroundTask` on success but not always removed before re-raising exceptions.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Add explicit `except` cleanup (`remove_files`) for all temp paths created before service invocation, then re-raise typed HTTP errors.
2. Add failure-path tests that force service exceptions and assert no orphan temp files remain in `temp/`.

**Priority**: Medium

---

### Compare PDF — compare-pdf
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/compare.py:13`, backend/app/services/compare_service.py:11) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Compare UI downloads visual diff immediately (`frontend/src/components/tool-ui/CompareUI.tsx:87`) and lacks in-app side-by-side page preview, making iterative review slower for large docs.

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### Extract Images — extract-images
**Status**: 🟡 Needs improvement

**Backend**:
- Error path cleanup is inconsistent in this route (`backend/app/routes/extract_images.py:13`): temp input/output files are cleaned in `BackgroundTask` on success but not always removed before re-raising exceptions.

**Frontend**:
- This tool uses the shared minimal `SimpleConvertUI` flow (`frontend/src/components/tool-ui/SimpleConvertUI.tsx:17`) with no tool-specific options, previews, or size-warning feedback.

**Recommendations**:
1. Add explicit `except` cleanup (`remove_files`) for all temp paths created before service invocation, then re-raise typed HTTP errors.
2. Add failure-path tests that force service exceptions and assert no orphan temp files remain in `temp/`.

**Priority**: Medium

---

### Fill Form — fill-form
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/fill_form.py:41`, backend/app/services/fill_form_service.py:9) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### N-Up PDF — nup
**Status**: 🟡 Needs improvement

**Backend**:
- Error path cleanup is inconsistent in this route (`backend/app/routes/nup.py:13`): temp input/output files are cleaned in `BackgroundTask` on success but not always removed before re-raising exceptions.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Add explicit `except` cleanup (`remove_files`) for all temp paths created before service invocation, then re-raise typed HTTP errors.
2. Add failure-path tests that force service exceptions and assert no orphan temp files remain in `temp/`.

**Priority**: Medium

---

### OCR PDF — ocr-pdf
**Status**: 🟡 Needs improvement

**Backend**:
- OCR output is only `json`/`txt` (`backend/app/routes/ocr.py:13`) and does not provide searchable PDF output, which limits expected OCR workflows (`backend/app/services/ocr_service.py:33`).

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Align tool copy with current fidelity limits (or upgrade backend algorithm) so user expectations match actual output quality.
2. Expose advanced options (quality profile, parsing mode, fallback strategy) and report post-run diagnostics in the success state.

**Priority**: High

---

### Overlay PDF — overlay
**Status**: 🟡 Needs improvement

**Backend**:
- Error path cleanup is inconsistent in this route (`backend/app/routes/overlay.py:15`): temp input/output files are cleaned in `BackgroundTask` on success but not always removed before re-raising exceptions.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Add explicit `except` cleanup (`remove_files`) for all temp paths created before service invocation, then re-raise typed HTTP errors.
2. Add failure-path tests that force service exceptions and assert no orphan temp files remain in `temp/`.

**Priority**: Medium

---

### QR Code PDF — qr-code
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/qr_code.py:16`, backend/app/services/qr_code_service.py:12) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### PDF to PDF/A — pdf-to-pdfa
**Status**: 🟡 Needs improvement

**Backend**:
- Error path cleanup is inconsistent in this route (`backend/app/routes/pdf_to_pdfa.py:13`): temp input/output files are cleaned in `BackgroundTask` on success but not always removed before re-raising exceptions.

**Frontend**:
- This tool uses the shared minimal `SimpleConvertUI` flow (`frontend/src/components/tool-ui/SimpleConvertUI.tsx:17`) with no tool-specific options, previews, or size-warning feedback.

**Recommendations**:
1. Add explicit `except` cleanup (`remove_files`) for all temp paths created before service invocation, then re-raise typed HTTP errors.
2. Add failure-path tests that force service exceptions and assert no orphan temp files remain in `temp/`.

**Priority**: Medium

---

### Remove Blank Pages — remove-blank-pages
**Status**: 🟡 Needs improvement

**Backend**:
- Error path cleanup is inconsistent in this route (`backend/app/routes/remove_blank_pages.py:51`): temp input/output files are cleaned in `BackgroundTask` on success but not always removed before re-raising exceptions.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Add explicit `except` cleanup (`remove_files`) for all temp paths created before service invocation, then re-raise typed HTTP errors.
2. Add failure-path tests that force service exceptions and assert no orphan temp files remain in `temp/`.

**Priority**: Medium

---

### Remove Margins — auto-crop
**Status**: 🟡 Needs improvement

**Backend**:
- Error path cleanup is inconsistent in this route (`backend/app/routes/auto_crop.py:14`): temp input/output files are cleaned in `BackgroundTask` on success but not always removed before re-raising exceptions.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Add explicit `except` cleanup (`remove_files`) for all temp paths created before service invocation, then re-raise typed HTTP errors.
2. Add failure-path tests that force service exceptions and assert no orphan temp files remain in `temp/`.

**Priority**: Medium

---

### PDF to EPUB — pdf-to-epub
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/pdf_extra.py:42`) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### Markdown / Config to PDF — markdown-to-pdf
**Status**: 🟡 Needs improvement

**Backend**:
- Markdown conversion uses regex substitutions (`backend/app/routes/pdf_extra.py:103`) rather than a parser, so nested lists/code blocks/tables are rendered inaccurately.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Align tool copy with current fidelity limits (or upgrade backend algorithm) so user expectations match actual output quality.
2. Expose advanced options (quality profile, parsing mode, fallback strategy) and report post-run diagnostics in the success state.

**Priority**: Medium

---

### CSV to PDF — csv-to-pdf
**Status**: 🟡 Needs improvement

**Backend**:
- CSV rendering writes plain text rows (`backend/app/routes/pdf_extra.py:160`) without table cell layout, wrapping control, or page header repetition.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Align tool copy with current fidelity limits (or upgrade backend algorithm) so user expectations match actual output quality.
2. Expose advanced options (quality profile, parsing mode, fallback strategy) and report post-run diagnostics in the success state.

**Priority**: Medium

---

### Word to PDF — word-to-pdf
**Status**: 🟡 Needs improvement

**Backend**:
- Route and service are wired correctly (`backend/app/routes/phase1_tools.py:45`, backend/app/services/word_to_pdf_service.py:10) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- This tool uses the shared minimal `SimpleConvertUI` flow (`frontend/src/components/tool-ui/SimpleConvertUI.tsx:17`) with no tool-specific options, previews, or size-warning feedback.

**Recommendations**:
1. Replace `SimpleConvertUI` alias with tool-specific controls (format/quality/page scope) where backend supports parameters.
2. Add size warning + estimated processing time + accessible upload interactions to match high-quality UIs like CompressUI.

**Priority**: Medium

---

### Excel to PDF — excel-to-pdf
**Status**: 🟡 Needs improvement

**Backend**:
- Route and service are wired correctly (`backend/app/routes/phase1_tools.py:71`, backend/app/services/excel_to_pdf_service.py:9) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- This tool uses the shared minimal `SimpleConvertUI` flow (`frontend/src/components/tool-ui/SimpleConvertUI.tsx:17`) with no tool-specific options, previews, or size-warning feedback.

**Recommendations**:
1. Replace `SimpleConvertUI` alias with tool-specific controls (format/quality/page scope) where backend supports parameters.
2. Add size warning + estimated processing time + accessible upload interactions to match high-quality UIs like CompressUI.

**Priority**: Medium

---

### PowerPoint to PDF — pptx-to-pdf-convert
**Status**: 🟡 Needs improvement

**Backend**:
- Route and service are wired correctly (`backend/app/routes/phase1_tools.py:97`, backend/app/services/pptx_to_pdf_service.py:10) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- This tool uses the shared minimal `SimpleConvertUI` flow (`frontend/src/components/tool-ui/SimpleConvertUI.tsx:17`) with no tool-specific options, previews, or size-warning feedback.

**Recommendations**:
1. Replace `SimpleConvertUI` alias with tool-specific controls (format/quality/page scope) where backend supports parameters.
2. Add size warning + estimated processing time + accessible upload interactions to match high-quality UIs like CompressUI.

**Priority**: Medium

---

### Text to PDF — txt-to-pdf
**Status**: 🟡 Needs improvement

**Backend**:
- Route and service are wired correctly (`backend/app/routes/phase1_tools.py:174`, backend/app/services/txt_to_pdf_service.py:7) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- This tool uses the shared minimal `SimpleConvertUI` flow (`frontend/src/components/tool-ui/SimpleConvertUI.tsx:17`) with no tool-specific options, previews, or size-warning feedback.

**Recommendations**:
1. Replace `SimpleConvertUI` alias with tool-specific controls (format/quality/page scope) where backend supports parameters.
2. Add size warning + estimated processing time + accessible upload interactions to match high-quality UIs like CompressUI.

**Priority**: Medium

---

### PDF Stamp — stamp-pdf
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/phase1_tools.py:123`, backend/app/services/stamp_service.py:19) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### E-Sign PDF — esign-pdf
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/phase2_tools.py:37`, backend/app/services/esign_service.py:9) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### PDF Table Extractor — extract-tables
**Status**: 🟡 Needs improvement

**Backend**:
- Table extraction relies on PyMuPDF detection and simple whitespace fallback (`backend/app/services/table_extractor_service.py:42`), which misses many scanned/ruled-table cases.

**Frontend**:
- This tool uses the shared minimal `SimpleConvertUI` flow (`frontend/src/components/tool-ui/SimpleConvertUI.tsx:17`) with no tool-specific options, previews, or size-warning feedback.

**Recommendations**:
1. Replace `SimpleConvertUI` alias with tool-specific controls (format/quality/page scope) where backend supports parameters.
2. Add size warning + estimated processing time + accessible upload interactions to match high-quality UIs like CompressUI.

**Priority**: Medium

---

### PDF to Markdown — pdf-to-markdown
**Status**: 🟡 Needs improvement

**Backend**:
- Route and service are wired correctly (`backend/app/routes/phase3_tools.py:105`, backend/app/services/pdf_to_markdown_service.py:6) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- This tool uses the shared minimal `SimpleConvertUI` flow (`frontend/src/components/tool-ui/SimpleConvertUI.tsx:17`) with no tool-specific options, previews, or size-warning feedback.

**Recommendations**:
1. Replace `SimpleConvertUI` alias with tool-specific controls (format/quality/page scope) where backend supports parameters.
2. Add size warning + estimated processing time + accessible upload interactions to match high-quality UIs like CompressUI.

**Priority**: Medium

---

### White-Out / Eraser — whiteout-pdf
**Status**: 🔴 Needs redesign

**Backend**:
- Route and service are wired correctly (`backend/app/routes/phase4_tools.py:88`, backend/app/services/whiteout_service.py:6) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- UI relies on manual coordinates/JSON forms (`frontend/src/components/tool-ui/WhiteoutUI.tsx:104`) instead of visual page selection, which is high-friction and error-prone for redaction/cropping/annotation tasks.

**Recommendations**:
1. Implement a page-canvas editor (zoom/pan, rectangle handles, snap guides) so users can select areas visually instead of entering coordinates/JSON.
2. Add real-time before/after preview and per-action undo stack persisted in component state before final export.

**Priority**: High

---

### Annotate PDF — annotate-pdf
**Status**: 🔴 Needs redesign

**Backend**:
- Route and service are wired correctly (`backend/app/routes/phase4_tools.py:259`, backend/app/services/annotate_service.py:6) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- UI relies on manual coordinates/JSON forms (`frontend/src/components/tool-ui/AnnotateUI.tsx:95`) instead of visual page selection, which is high-friction and error-prone for redaction/cropping/annotation tasks.

**Recommendations**:
1. Implement a page-canvas editor (zoom/pan, rectangle handles, snap guides) so users can select areas visually instead of entering coordinates/JSON.
2. Add real-time before/after preview and per-action undo stack persisted in component state before final export.

**Priority**: High

---

### Add Shapes to PDF — add-shapes
**Status**: 🔴 Needs redesign

**Backend**:
- Route and service are wired correctly (`backend/app/routes/phase4_tools.py:290`, backend/app/services/shapes_service.py:7) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- UI relies on manual coordinates/JSON forms (`frontend/src/components/tool-ui/ShapesUI.tsx:119`) instead of visual page selection, which is high-friction and error-prone for redaction/cropping/annotation tasks.

**Recommendations**:
1. Implement a page-canvas editor (zoom/pan, rectangle handles, snap guides) so users can select areas visually instead of entering coordinates/JSON.
2. Add real-time before/after preview and per-action undo stack persisted in component state before final export.

**Priority**: High

---

### PDF Permissions — set-permissions
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/phase4_tools.py:159`, backend/app/services/permissions_service.py:6) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### Add Attachment — add-attachment
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/phase4_tools.py:119`, backend/app/services/attachment_service.py:6) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### JSON to PDF — json-to-pdf
**Status**: 🟡 Needs improvement

**Backend**:
- Route and service are wired correctly (`backend/app/routes/phase4_tools.py:203`, backend/app/services/json_to_pdf_service.py:8) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- This tool uses the shared minimal `SimpleConvertUI` flow (`frontend/src/components/tool-ui/SimpleConvertUI.tsx:17`) with no tool-specific options, previews, or size-warning feedback.

**Recommendations**:
1. Replace `SimpleConvertUI` alias with tool-specific controls (format/quality/page scope) where backend supports parameters.
2. Add size warning + estimated processing time + accessible upload interactions to match high-quality UIs like CompressUI.

**Priority**: Medium

---

### XML to PDF — xml-to-pdf
**Status**: 🟡 Needs improvement

**Backend**:
- Route and service are wired correctly (`backend/app/routes/phase4_tools.py:234`, backend/app/services/xml_to_pdf_service.py:8) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- This tool uses the shared minimal `SimpleConvertUI` flow (`frontend/src/components/tool-ui/SimpleConvertUI.tsx:17`) with no tool-specific options, previews, or size-warning feedback.

**Recommendations**:
1. Replace `SimpleConvertUI` alias with tool-specific controls (format/quality/page scope) where backend supports parameters.
2. Add size warning + estimated processing time + accessible upload interactions to match high-quality UIs like CompressUI.

**Priority**: Medium

---

### EPUB to PDF — epub-to-pdf
**Status**: 🟡 Needs improvement

**Backend**:
- Route and service are wired correctly (`backend/app/routes/phase4_tools.py:321`, backend/app/services/epub_to_pdf_service.py:7) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- This tool uses the shared minimal `SimpleConvertUI` flow (`frontend/src/components/tool-ui/SimpleConvertUI.tsx:17`) with no tool-specific options, previews, or size-warning feedback.

**Recommendations**:
1. Replace `SimpleConvertUI` alias with tool-specific controls (format/quality/page scope) where backend supports parameters.
2. Add size warning + estimated processing time + accessible upload interactions to match high-quality UIs like CompressUI.

**Priority**: Medium

---

### RTF to PDF — rtf-to-pdf
**Status**: 🟡 Needs improvement

**Backend**:
- Route and service are wired correctly (`backend/app/routes/phase4_tools.py:346`, backend/app/services/rtf_to_pdf_service.py:8) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- This tool uses the shared minimal `SimpleConvertUI` flow (`frontend/src/components/tool-ui/SimpleConvertUI.tsx:17`) with no tool-specific options, previews, or size-warning feedback.

**Recommendations**:
1. Replace `SimpleConvertUI` alias with tool-specific controls (format/quality/page scope) where backend supports parameters.
2. Add size warning + estimated processing time + accessible upload interactions to match high-quality UIs like CompressUI.

**Priority**: Medium

---

### Add Hyperlinks — add-hyperlinks
**Status**: 🟡 Needs improvement

**Backend**:
- Auto-linking applies span-level rectangles (`backend/app/routes/pdf_extra.py:206`) which can over-link surrounding text and does not handle multi-URL span geometry precisely.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Align tool copy with current fidelity limits (or upgrade backend algorithm) so user expectations match actual output quality.
2. Expose advanced options (quality profile, parsing mode, fallback strategy) and report post-run diagnostics in the success state.

**Priority**: Medium

---

### Form Creator — form-creator
**Status**: 🔴 Needs redesign

**Backend**:
- Route is effectively pass-through (`backend/app/routes/pdf_extra.py:230`) and does not create fields; frontend promise is stronger than backend behavior.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Implement full backend behavior (standards-based validation/verification or actual transformation) behind the current endpoint.
2. Until full implementation lands, update tool description/UI copy to clearly state current limitations and avoid overstating output guarantees.

**Priority**: High

---

### Transparent Background — transparent-background
**Status**: 🔴 Needs redesign

**Backend**:
- Implementation only re-saves PDF with `clean=True` (`backend/app/routes/pdf_extra.py:278`) and does not actually remove white backgrounds/object fills.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Implement full backend behavior (standards-based validation/verification or actual transformation) behind the current endpoint.
2. Until full implementation lands, update tool description/UI copy to clearly state current limitations and avoid overstating output guarantees.

**Priority**: High

---

### Invert Colors — invert-colors
**Status**: 🟡 Needs improvement

**Backend**:
- Error path cleanup is inconsistent in this route (`backend/app/routes/invert_colors.py:34`): temp input/output files are cleaned in `BackgroundTask` on success but not always removed before re-raising exceptions.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Add explicit `except` cleanup (`remove_files`) for all temp paths created before service invocation, then re-raise typed HTTP errors.
2. Add failure-path tests that force service exceptions and assert no orphan temp files remain in `temp/`.

**Priority**: Medium

---

### PDF/A Validator — pdfa-validator
**Status**: 🔴 Needs redesign

**Backend**:
- PDF/A validation is heuristic metadata checking (`backend/app/routes/pdf_security.py:37`) and not standards-compliant profile validation (A-1/A-2/A-3 rules).

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Implement full backend behavior (standards-based validation/verification or actual transformation) behind the current endpoint.
2. Until full implementation lands, update tool description/UI copy to clearly state current limitations and avoid overstating output guarantees.

**Priority**: High

---

### Verify Digital Signature — verify-signature
**Status**: 🔴 Needs redesign

**Backend**:
- Signature validation is structural only; widgets of type `Sig` are marked valid (`backend/app/routes/pdf_security.py:73`) without cryptographic certificate verification.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Implement full backend behavior (standards-based validation/verification or actual transformation) behind the current endpoint.
2. Until full implementation lands, update tool description/UI copy to clearly state current limitations and avoid overstating output guarantees.

**Priority**: High

---

### Sanitize Document — sanitize-pdf
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/pdf_security.py:89`) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### Image Compressor — image-compressor
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/non_pdf_tools.py:225`) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### Image Format Converter — image-converter
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/non_pdf_tools.py:247`) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### Remove EXIF Data — remove-exif
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/non_pdf_tools.py:275`) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### Resize & Crop Image — resize-crop-image
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/non_pdf_tools.py:320`) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### Video / Audio to GIF — video-to-gif
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/non_pdf_tools.py:368`) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### Image OCR — image-ocr
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/image_ocr.py:43`) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### Extract Audio from Video — extract-audio
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/non_pdf_tools.py:402`) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### Cut / Trim Video & Audio — trim-media
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/non_pdf_tools.py:447`) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### Compress Video — compress-video
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/non_pdf_tools.py:489`) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### JSON / XML Formatter — json-xml-formatter
**Status**: 🟡 Needs improvement

**Backend**:
- No FastAPI endpoint is defined for this tool slug; current behavior is client-only (`frontend/src/lib/tool-endpoints.ts:24`) and there is no matching `@router.post` route in backend routes.

**Frontend**:
- Frontend implementation exists (`frontend/src/components/tool-ui/JsonXmlFormatterUI.tsx:1`), but tool behavior is not explicitly labeled client-only, creating consistency confusion with server-backed tools.

**Recommendations**:
1. Add an explicit `clientOnly: true` flag in tool data and render a clear 'Processed in browser' badge with no API fallback attempts.
2. If server-side support is intended, implement matching FastAPI route + service and add a route-coverage CI test that fails for unmapped slugs.

**Priority**: High

---

### Text Diff / Comparator — text-diff
**Status**: 🟡 Needs improvement

**Backend**:
- No FastAPI endpoint is defined for this tool slug; current behavior is client-only (`frontend/src/lib/tool-endpoints.ts:24`) and there is no matching `@router.post` route in backend routes.

**Frontend**:
- Frontend implementation exists (`frontend/src/components/tool-ui/TextDiffUI.tsx:1`), but tool behavior is not explicitly labeled client-only, creating consistency confusion with server-backed tools.

**Recommendations**:
1. Add an explicit `clientOnly: true` flag in tool data and render a clear 'Processed in browser' badge with no API fallback attempts.
2. If server-side support is intended, implement matching FastAPI route + service and add a route-coverage CI test that fails for unmapped slugs.

**Priority**: High

---

### Base64 Encoder / Decoder — base64
**Status**: 🟡 Needs improvement

**Backend**:
- No FastAPI endpoint is defined for this tool slug; current behavior is client-only (`frontend/src/lib/tool-endpoints.ts:24`) and there is no matching `@router.post` route in backend routes.

**Frontend**:
- Frontend implementation exists (`frontend/src/components/tool-ui/Base64UI.tsx:1`), but tool behavior is not explicitly labeled client-only, creating consistency confusion with server-backed tools.

**Recommendations**:
1. Add an explicit `clientOnly: true` flag in tool data and render a clear 'Processed in browser' badge with no API fallback attempts.
2. If server-side support is intended, implement matching FastAPI route + service and add a route-coverage CI test that fails for unmapped slugs.

**Priority**: High

---

### Hash Generator — hash-generator
**Status**: 🟡 Needs improvement

**Backend**:
- No FastAPI endpoint is defined for this tool slug; current behavior is client-only (`frontend/src/lib/tool-endpoints.ts:24`) and there is no matching `@router.post` route in backend routes.

**Frontend**:
- Frontend implementation exists (`frontend/src/components/tool-ui/HashGeneratorUI.tsx:1`), but tool behavior is not explicitly labeled client-only, creating consistency confusion with server-backed tools.

**Recommendations**:
1. Add an explicit `clientOnly: true` flag in tool data and render a clear 'Processed in browser' badge with no API fallback attempts.
2. If server-side support is intended, implement matching FastAPI route + service and add a route-coverage CI test that fails for unmapped slugs.

**Priority**: High

---

### Extract ZIP / TAR — extract-archive
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/non_pdf_tools.py:532`) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### Create ZIP Archive — create-zip
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/non_pdf_tools.py:585`) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### CSV ↔ JSON Converter — csv-json
**Status**: 🟡 Needs improvement

**Backend**:
- No FastAPI endpoint is defined for this tool slug; current behavior is client-only (`frontend/src/lib/tool-endpoints.ts:24`) and there is no matching `@router.post` route in backend routes.

**Frontend**:
- Frontend implementation exists (`frontend/src/components/tool-ui/CsvJsonUI.tsx:1`), but tool behavior is not explicitly labeled client-only, creating consistency confusion with server-backed tools.

**Recommendations**:
1. Add an explicit `clientOnly: true` flag in tool data and render a clear 'Processed in browser' badge with no API fallback attempts.
2. If server-side support is intended, implement matching FastAPI route + service and add a route-coverage CI test that fails for unmapped slugs.

**Priority**: High

---

### Markdown to HTML — markdown-html
**Status**: 🟡 Needs improvement

**Backend**:
- No FastAPI endpoint is defined for this tool slug; current behavior is client-only (`frontend/src/lib/tool-endpoints.ts:24`) and there is no matching `@router.post` route in backend routes.

**Frontend**:
- Frontend implementation exists (`frontend/src/components/tool-ui/MarkdownHtmlUI.tsx:1`), but tool behavior is not explicitly labeled client-only, creating consistency confusion with server-backed tools.

**Recommendations**:
1. Add an explicit `clientOnly: true` flag in tool data and render a clear 'Processed in browser' badge with no API fallback attempts.
2. If server-side support is intended, implement matching FastAPI route + service and add a route-coverage CI test that fails for unmapped slugs.

**Priority**: High

---

### HEIC to JPG — heic-to-jpg
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/phase1_tools.py:203`, backend/app/services/heic_to_jpg_service.py:6) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### Background Remover — remove-background
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/phase2_tools.py:119`, backend/app/services/bg_remover_service.py:6) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### SVG to PNG — svg-to-png
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/phase3_tools.py:131`, backend/app/services/svg_to_png_service.py:6) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### Image Watermark — image-watermark
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/phase3_tools.py:201`, backend/app/services/image_watermark_service.py:6) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### Favicon Generator — generate-favicon
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/phase3_tools.py:244`, backend/app/services/favicon_service.py:6) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### Photo Collage — make-collage
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/phase3_tools.py:271`, backend/app/services/collage_service.py:7) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### Barcode Generator — generate-barcode
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/phase3_tools.py:159`, backend/app/services/barcode_service.py:22) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: Low

---

### URL to PDF — url-to-pdf
**Status**: 🟢 Good

**Backend**:
- Route and service are wired correctly (`backend/app/routes/phase3_tools.py:86`, backend/app/services/url_to_pdf_service.py:5) with bounded input checks and file-response cleanup; remaining improvements are mostly feature-depth and UX parity.

**Frontend**:
- Upload/drop patterns are inconsistent and frequently miss keyboard-accessible semantics; shared `FileUploadZone` still lacks `role`/`tabIndex` key handling (`frontend/src/components/tool-ui/FileUploadZone.tsx:70`).

**Recommendations**:
1. Standardize upload-zone accessibility and loading/error/success patterns through a shared, typed UI primitive used by every tool component.
2. Add integration tests for invalid file types, empty uploads, and response headers (`Content-Type`, `Content-Disposition`) on this endpoint.

**Priority**: High

---

## Top 10 Highest-Impact Improvements
1. Implement visual area-selection editors for `redact-pdf`, `whiteout-pdf`, `annotate-pdf`, `add-shapes`, and `crop-pdf` (replace coordinate/JSON-first UX).
2. Replace placeholder security checks with standards-based engines: true PDF/A conformance validation and cryptographic signature verification.
3. Fix route error-path temp-file cleanup in legacy routes where `except HTTPException: raise` currently skips cleanup.
4. Upgrade `pdf-to-pptx` to produce editable text objects/shapes instead of image-only slides.
5. Add searchable-PDF OCR output mode (hidden text layer) in addition to JSON/TXT extraction.
6. Add image watermark support for PDF watermarking to match tool description and user expectations.
7. Introduce route-coverage CI check to ensure every tool slug is either server-backed or explicitly `clientOnly`.
8. Unify upload accessibility: keyboard activation, ARIA labels, and consistent drag/drop behavior across all tool UIs.
9. Enhance simple conversion UIs with per-tool options, size warnings, and richer success diagnostics.
10. Harden output-quality messaging and diagnostics for conversion tools with known fidelity limitations (`pdf-to-word`, `pdf-to-excel`, `extract-tables`).

## Tools Needing Complete UI Redesign
- `redact-pdf`: Two-pane PDF viewer with selectable redaction boxes, keyboard nudging, color presets, and irreversible-action warnings.
- `crop-pdf`: Visual crop overlay with draggable handles, per-page/apply-to-all toggle, and live margin readout.
- `whiteout-pdf`: Canvas-based whiteout brush/rect mode with zoom, list-sync, and undo history.
- `annotate-pdf`: Layered annotation panel (sticky note/highlight/shape) with direct on-page placement and edit handles.
- `add-shapes`: Shape toolbox (line/arrow/rect/ellipse), snap-to-grid, stroke/fill inspector, and z-order controls.
- `organize-pages`: True thumbnail grid with drag-sort, rotate, duplicate, multi-select delete, and undo/redo timeline.
- `form-creator`: Field palette (text/checkbox/radio/signature), click-to-place controls, tab-order editor, and validation rules.

## New Tools to Add
- Digital Signature Creation (cert generation + signing): **Difficulty High**
- Visual PDF Diff Overlay (blink/heatmap modes): **Difficulty Medium**
- Batch Image Rename: **Difficulty Low**
- Image Upscaling (local ESRGAN/waifu2x): **Difficulty High**
- Palette Extractor + Color Picker: **Difficulty Low**
- Video Format Converter (MP4/WebM/AVI): **Difficulty Medium**
- Video Merge + Speed Change: **Difficulty Medium**
- Regex Tester: **Difficulty Low**
- JWT Decoder/Inspector: **Difficulty Low**
- Archive Preview (list files without extraction): **Difficulty Medium**

## Architecture Improvements
- Create a `tool-contract` manifest (slug, endpoint, clientOnly, accepts, output) and generate frontend routing + backend coverage checks from it.
- Extract a single accessible `UploadSurface` component and replace bespoke dropzones in tool UIs.
- Introduce shared backend decorators/utilities for upload size limits, extension checks, and standardized error responses.
- Adopt consistent response metadata headers (`X-Original-Size`, `X-Output-Size`, processing ms) for success screens.
- Add typed endpoint helpers for multi-file/binary/json variants to reduce ad-hoc fetch logic in individual components.

## Performance Quick Wins (< 1 hour each)
- Add temp cleanup in `except` blocks for legacy routes using existing `remove_files` helper.
- Enable thumbnail lazy loading and virtualization for page-heavy UIs (`organize-pages`, `compare-pdf`).
- Return early when compression result is larger than original and surface 'no savings' message.
- Cache OCR language availability check at startup instead of per-request validation branching.
- Add client-side file-size prechecks before upload for known limits (50 MB single, 200 MB total).
- Debounce command-palette search input for large tool catalogs.
- Reuse parsed PDF handles within services that currently reopen files during a single request path.
- Add GZip middleware for JSON responses where safe (metadata, validation endpoints).
- Use persistent temp subdirectories per request to simplify bulk cleanup and reduce orphan risk.
- Add route benchmark script for representative files and report P50/P95 timings in CI artifacts.