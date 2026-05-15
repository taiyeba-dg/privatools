# Changelog

All notable changes to PrivaTools will be documented in this file.

## [1.3.0] — 2026-05-15 — SEO / AEO / GEO sweep

### 🔍 SEO (technical)

- **robots.txt rewritten** with explicit allows for every major AI crawler: GPTBot, ChatGPT-User, OAI-SearchBot, Google-Extended, GoogleOther, PerplexityBot, Perplexity-User, ClaudeBot, anthropic-ai, Claude-Web, Claude-SearchBot, cohere-ai, Cohere-Web, CCBot, Applebot, Applebot-Extended, Meta-ExternalAgent/Fetcher, FacebookBot, Mistral-AI, YouBot, Diffbot, PetalBot. Yandex/Baidu/DDG explicitly allowed. Aggressive crawlers (Bytespider, AhrefsBot, SemrushBot, MJ12bot, DotBot) blocked.
- **Google Search Console verification fix**: SPA middleware was intercepting `/google*.html` paths and returning index.html shell instead of the 53-byte verification token. Now passes through (`/google`, `/BingSiteAuth`, `/yandex`, `/baidu_verify`).
- **Schema upgrades** (`seo_meta.py`):
  - Tool pages: `WebApplication` → `SoftwareApplication` with richer fields (`applicationSubCategory`, `browserRequirements`, `isAccessibleForFree`, `softwareVersion`, full `Offer` with `availability` + `category`)
  - Homepage: new `ItemList` schema enumerating 25 featured tools as `SoftwareApplication`s
  - Organization: enriched with `alternateName`, `foundingDate`, `license`, `description`, `ImageObject` logo, `ContactPoint`
  - Blog posts: author upgraded from `Organization` to `Person` with `sameAs` + `worksFor`; added `image`, `keywords`, `mainEntityOfPage`
  - Compare pages: `Article` → `["Article", "Review"]` with `mainEntityOfPage` + `author`

### 🎙️ AEO (Answer Engine Optimisation)

- **`speakable` JSON-LD** added to FAQ entries on tool pages, blog posts, and compare pages — gives voice assistants and featured-snippet pickers an explicit "read this aloud" target.
- **TL;DR / Key facts boxes** on every blog post (15/15). Short, snippet-optimised summary at the top of each article, with `.post-tldr` CSS class referenced by the `speakable` selector.
- **Visible author byline** with semantic `<time>` elements (E-E-A-T signal).

### 🤖 GEO (Generative Engine Optimisation)

- **`llms.txt` substantially enriched** (now ~30 KB):
  - Quick-answer comparison matrix (PrivaTools vs 7 competitors)
  - "What makes PrivaTools different (for AI citation)" section with three architectural commitments + auditable source paths
  - Auto-generated section with the 10 most-recent blog posts including their TL;DRs (parsed from `blog.ts`)
  - Inline FAQ section with 7 direct-answer Q&As
  - All competitor comparison links with one-liner verdicts

### 🔗 Internal linking

- **Auto-derived "Related articles" sidebar** on every tool page (PDF + non-PDF) from each post's `relatedTools` field — replaces a stale hand-maintained map.
- **"Tools mentioned in this article" panel** at the bottom of every blog post (15/15), with cards linking to the specific tools each post references.
- All 15 blog posts now have a `relatedTools` array — distributes link equity + gives AI engines a clean entity graph.

### 📊 By the numbers

- AI crawlers explicitly allowed: 21 (was 9)
- TL;DR boxes on blog posts: 15/15
- Blog post → tool internal links: 15 posts × avg 4 tools = ~60 new internal links
- JSON-LD types emitted: SoftwareApplication, BreadcrumbList, FAQPage, BlogPosting, Article+Review, Organization, WebSite, Person, ImageObject, ItemList, SpeakableSpecification, ContactPoint, Offer

## [1.2.1] — 2026-05-15 — SEO content push

### 📝 6 new long-form blog posts (~17,000 words of new content)

- **AI PDF Summarizer: How to Summarize Long PDFs in Your Browser (2026 Guide)** — explains browser-side distilbart, step-by-step walkthrough, what cloud summarizers do with your data
- **10 Best iLovePDF Alternatives in 2026 (Free, Private, Open-Source)** — full comparison matrix, ranked
- **How to Redact a PDF Properly (Don't Use Black Boxes)** — proper redaction technique, common pitfalls, verification steps
- **Why Most Online PDF Tools Are Tracking You (And What to Do About It)** — privacy-policy analysis, tracker breakdown, the open-source test
- **How to Convert HEIC to PDF, JPG, and PNG on Any Device (2026)** — online + Mac + Windows + CLI + iPhone settings
- **How to Decode a JWT Token Safely (and What Each Part Means)** — JWT structure, claims reference, why public decoders are unsafe

### 🔍 Rich-result schemas added

- **HowTo + FAQPage JSON-LD** for 18 additional tools: highlight-pdf, summarize-pdf, smart-redact, split-in-half, pdf-to-svg, pdf-to-html, pdf-to-rtf, web-optimize-pdf, split-by-text, view-exif, jwt-decoder, regex-tester, timestamp-converter, batch-compress-pdf, pdf-page-counter, webp-to-jpg, webp-to-png, heic-to-png — for richer Google SERPs.
- All 6 new blog posts wired into seo_meta `_BLOG_POSTS` for BlogPosting + Article JSON-LD.

### 📊 Numbers

- HowTo coverage: 42 → **60** tools (39% of 152 → 76% of high-traffic tools)
- FAQ coverage: 42 → **60** tools
- Blog posts: 9 → **15**
- Words of content on the site: roughly doubled

## [1.2.0] — 2026-05-15

### 🆕 New tools (11) — total now 152

**PDF**
- **Web Optimize PDF** — `qpdf --linearize` for fast byte-range / first-page-fast-render serving
- **Split by Text** — split a PDF at every page containing a search keyword (with case-sensitive toggle)
- **PDF to HTML** — full HTML export preserving fonts and positioning
- **PDF to RTF** — Rich Text Format extraction, opens in WordPad / Pages / Word / LibreOffice

**Image**
- **View EXIF Data** — counterpart to Remove EXIF; inspect GPS / camera / timestamps / IPTC / XMP metadata as JSON
- **WebP to JPG** — SEO landing page hitting the existing image-converter
- **WebP to PNG** — same, target PNG
- **HEIC to PNG** — same, HEIC input

**Browser-only dev utilities**
- **JWT Decoder** — paste a JWT, see header + payload + signature + expiry status (decoded entirely client-side)
- **Regex Tester** — live JavaScript RegExp tester with match highlighting and capture groups
- **Timestamp Converter** — Unix epoch ↔ ISO 8601 ↔ UTC ↔ local ↔ relative ("in 3 days")

### 🐛 Bug fixes

- **office-to-pdf no longer 500s.** The LibreOffice path was failing with "User installation could not be completed" because the container's appuser had no `$HOME`. Each call now gets its own per-conversion `-env:UserInstallation` profile dir under `/tmp`.

### 🛠️ Backend

- New router `v12_tools.py` with `/api/web-optimize`, `/api/split-by-text`, `/api/pdf-to-html`, `/api/pdf-to-rtf`, `/api/view-exif`
- `pdf-to-html` uses PyMuPDF's HTML exporter; `pdf-to-rtf` does its own minimal RTF generation with Unicode escapes; `view-exif` uses PIL's getexif + GPS sub-IFD

## [1.1.0] — 2026-05-04

### 🆕 New tools (33)

**PDF**
- Image-to-PDF variants: JPG, PNG, HEIC, WebP, TIFF, BMP, GIF, SVG, ODT
- PDF-to-image variants: JPG, PNG, TIFF, BMP, GIF, SVG
- Split in Half — split each page horizontally or vertically (for two-up scans)
- Highlight PDF — yellow-highlight every match of a phrase
- Summarize PDF (AI) — local distilbart, runs in your browser via WebAssembly
- Smart Redact (AI) — local BERT-NER auto-detects PII (names, emails, phones, SSNs)
- Batch Compress PDF — compress up to 50 PDFs in parallel
- PDF Page Counter — count pages across up to 100 PDFs at once

**Video & Audio**
- Video to PDF — extract frames as PDF pages
- Video Converter — MP4/WebM/MOV/AVI/MKV via FFmpeg
- Video Resizer — change resolution/aspect ratio
- Video Thumbnail — extract poster frames at any timestamp
- Video Merge — concatenate clips
- GIF to MP4 — animated GIF → smaller, smoother MP4
- Burn Subtitles — embed .srt or .vtt into MP4
- Audio Converter — MP3/WAV/OGG/FLAC/AAC with bitrate control
- Audio Merge — concatenate audio tracks
- Image Upscaler — 2x or 4x with Lanczos resampling

**Browser-only utilities**
- Subtitle Converter — SRT ↔ VTT ↔ ASS in browser
- Password Generator — cryptographically-secure with custom rules
- UUID Generator — bulk v4 UUIDs
- Lorem Ipsum — placeholder text by paragraph/sentence/word
- Word Counter — live word/character/sentence/reading-time
- Color Converter — HEX ↔ RGB ↔ HSL with picker
- URL & JWT Encoder — percent-encode + JWT decode

### 🎨 Redesign
- Linear/Vercel/Smallpdf-inspired complete UI overhaul (monochrome primary + amber accent)
- 21 custom per-tool SVG illustrations replacing generic icons (Merge, Compress, Rotate, Sign, Watermark, Convert, OCR, Highlight, Lock, Unlock, Summarize, ImageCompress, RemoveBg, VideoToGif, QrCode, Hash, Base64, PageCounter, MergeMedia, etc.)
- Animated SVG hero artwork with floating category chips orbiting a shield
- Animated Pipeline diagram (CSS-keyframed file particle drifting through stages)
- Asymmetric homepage hero, 88px H1, search-shaped CTA opening ⌘K
- Dropzone-style skeleton loaders

### ⌨️ UX
- ⌘K palette: synonym scoring (typing "join" finds Merge, "shrink" finds Compress, "md5" finds Hash, etc.)
- Onboarding tour for first-time visitors (5 cards — keyboard-dismissible)
- Reduced-motion compliance — global safety net disables decorative animations
- Light + dark themes both at zero accessibility violations (axe-core verified)

### ♿ Accessibility
- WCAG-AA color contrast across all routes in both themes
- Proper landmark structure: every page wrapped in `<main>` with aria-labelled `<section>` children
- ARIA dialog semantics on CommandPalette + OnboardingTour
- All sliders forward `aria-label` to the Radix thumb
- Focus rings via `:focus-visible`
- 0 serious + 0 moderate axe violations across 6 audited routes × 2 themes

### 🔍 SEO / AI Discoverability
- llms.txt auto-generated from data files at build time (always in sync, currently 141 tools)
- Per-tool SEO meta on all 141 tools (title + 140-160 char description)
- Dynamic OG images per route via `/api/og-image?p=<path>`
- robots.txt allows GPTBot/Claudebot/Perplexity, blocks aggressive crawlers
- JSON-LD: Organization, Person, BlogPosting, BreadcrumbList, ItemList

### 🛠️ Backend
- Mtime-keyed SEO HTML cache → frontend deploys no longer need a worker restart
- 17 Tesseract language packs baked into image
- rembg model pre-warmed at build time (`/tmp/u2net`, NUMBA_DISABLE_JIT)
- Memory-safety caps on collage, json-to-pdf, split-by-size, compare
- video-merge auto-detects audio tracks (anullsrc padding for silent inputs)
- 6 dedicated UIs replacing single-file GenericUI fallback for batch/multi-file tools
- 94/94 endpoints pass regression sweep

## [1.0.0] — 2026-03-05

### 🚀 Launch

**90+ privacy-first file tools** — all processing happens locally.

### PDF Tools (70+)
- Organize: Merge, Split, Split by Bookmarks, Split by Size, Organize Pages, Delete Pages, Extract Pages, Alternate Mix, Overlay, Repair
- Edit: Edit PDF, Sign, E-Sign, Watermark, Stamp, Header/Footer, Page Numbers, Bates Numbering, Fill Form, Bookmarks, Add Hyperlinks, White-Out, Annotate, Add Shapes, Add Attachment
- Optimize: Compress, Flatten, Grayscale, Deskew, Crop, Auto Crop, Resize, Remove Blank Pages, Invert Colors
- Security: Protect, Unlock, Redact, Strip Metadata, Delete Annotations, Sanitize, Permissions, Verify Signature
- Convert to PDF: Image, HTML, Word, Excel, PowerPoint, TXT, Markdown, CSV, EPUB, RTF, JSON, XML
- Convert from PDF: Image, Text, Word, Excel, PPTX, EPUB, Markdown, Extract Tables

### Non-PDF Tools (16)
- Image: Compressor, Converter, Remove EXIF, Resize & Crop
- Video/Audio: Video→GIF, Extract Audio, Trim Media, Compress Video
- Developer: JSON/XML Formatter, Text Diff, Base64, Hash Generator
- Archive: Extract Archive, Create ZIP
- Document: CSV↔JSON, Markdown→HTML

### App Features
- ⌘K Command Palette with keyboard navigation
- History / Recent Tools tracking
- Dark/Light mode toggle with persistence
- Batch Process — apply one tool to many files
- PDF Pipeline — chain tools sequentially
- PWA support — install as desktop/mobile app
- Per-tool SEO (dynamic meta tags)
- Dynamic sitemap.xml
- Custom 404 page
