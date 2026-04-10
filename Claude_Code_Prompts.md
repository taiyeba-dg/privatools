# Claude Code Prompts for PrivaTools UI Improvements

Copy-paste these prompts directly into Claude Code. Each one is self-contained.

**Setup:** Place `PrivaTools_Competitive_Analysis.md` at your project root before running these.

---

## PROMPT 1: Hero / Featured Tools Section (CRITICAL PRIORITY)

```
Read ./PrivaTools_Competitive_Analysis.md for full competitive context on why this change is needed.

Our competitive analysis found that PrivaTools' homepage dumps 99+ tools on first-time visitors with no hierarchy. Smallpdf (36M monthly visits) shows only 6 curated tools upfront. iLovePDF uses a filtered card grid. Sejda uses a single prominent CTA. We need to fix this.

First, explore the project structure to understand the codebase — find the homepage component, the tool card components, the routing setup, and the styling approach (CSS modules, Tailwind, styled-components, etc.). Then implement:

Add a "Featured Tools" hero section to the homepage, positioned ABOVE the existing search bar and tool grid. Requirements:

1. Show 4 featured tools as large, visually prominent cards: Merge PDF, Compress PDF, Convert to PDF, Edit PDF
2. Each card should have: the tool icon, tool name, a short tagline, and be clickable (linking to the tool page at /tool/<slug>)
3. Cards should be significantly larger than the regular tool grid cards — think 2x the height with more padding
4. Style them to match our existing dark theme with amber accents, but make them stand out with a subtle border or background differentiation
5. Below the featured section, add a subtle divider or "All Tools" label before the existing search bar + grid
6. On mobile, the 4 cards should stack into a 2x2 grid
7. Include a small tagline above the cards: "Start with our most popular tools" in the same monospace style as our date bar

Keep the existing search bar and full tool grid exactly as they are — this is purely additive above them. Match the existing design language (dark background, amber accents, monospace secondary text). Verify it renders correctly in both dark and light themes by checking the theme toggle logic in the codebase.
```

---

## PROMPT 2: Privacy Trust Banner (HIGH PRIORITY)

```
Read ./PrivaTools_Competitive_Analysis.md for full competitive context on why this change is needed.

Our biggest competitive advantage is that files never leave the user's device — every competitor (iLovePDF, Smallpdf, PDF24, Sejda, PDF Candy) uploads files to their servers. But this message is currently buried in the footer. We need to make it impossible to miss.

First, explore the codebase to find: the homepage layout component, the header/nav component, the footer (to see the existing privacy messaging text and style), and the theme/styling system. Then implement:

Add a privacy trust banner to the homepage, positioned between the header navigation and the featured tools section (or search bar). Requirements:

1. Create a horizontal banner/strip with the message: "Your files never leave your device. 100% local processing — no uploads, no servers, no tracking."
2. Include a small lock/shield icon on the left side — check if the project already uses an icon library (lucide, heroicons, etc.) and use the same one
3. Style it subtly but noticeably — NOT a flashy alert banner, more like a confident statement. Think: slightly different background shade from the main dark bg, maybe a thin top/bottom border in amber
4. Add a small "Learn more" link that either scrolls to a section or links to an about page
5. Find the individual tool page sidebar component — look for the existing "Your files stay private" or "Open Source" card. Move it higher in the sidebar order
6. The banner should appear on the homepage only (not on every page)
7. Support both dark and light themes — check how the existing theme toggle works and follow the same pattern

This banner is our #1 conversion differentiator. Every user who cares about privacy (enterprise users, legal professionals, healthcare) should see this within 2 seconds of landing on the site.
```

---

## PROMPT 3: Fix Dark Mode Text Contrast (HIGH PRIORITY)

```
Read ./PrivaTools_Competitive_Analysis.md — see section 5.2 for the specific contrast issue details.

The competitive analysis flagged that our dark mode has text contrast issues. The gray description text on our dark background is borderline for WCAG AA compliance. Tool descriptions like "Combine multiple PDFs into one" are hard to read.

First, explore the codebase to find all CSS/style files that define text colors. Look for:
- Global CSS variables or theme tokens (search for terms like --color, --text, theme, dark, muted, secondary, description)
- The main stylesheet or tailwind config
- Component-level styles for tool cards, the date bar, tagline bar, footer, and sidebar

Then audit and fix all text contrast across the site in dark mode:

1. Find all text color definitions used for secondary/description text in the dark theme
2. Check each against WCAG AA contrast requirements (minimum 4.5:1 for normal text, 3:1 for large text) using the actual dark background color from the codebase
3. Increase brightness of any failing text. Target: description text should be at least #B0B0A0 or equivalent
4. Specifically check and fix these elements:
   - Tool card descriptions ("Combine multiple PDFs into one", etc.)
   - Category count numbers next to tab labels (the "78", "15", etc.)
   - The date bar text ("MARCH 29, 2026")
   - The tagline bar text ("99+ TOOLS FOR EVERY FILE TASK")
   - Footer text
   - Sidebar text on tool pages
5. Don't change the amber accent color — that's our brand color
6. Don't change the white heading text — that's fine
7. Make sure the light theme isn't affected negatively — check if dark/light use separate variables or a single set

After making changes, print a summary table of all text/background color pairs with their contrast ratios to confirm WCAG AA compliance.
```

---

## PROMPT 4: Promote Pipeline Feature (HIGH PRIORITY)

```
Read ./PrivaTools_Competitive_Analysis.md — see section 4.2 and 5.6 for why Pipeline is our biggest untapped differentiator.

The Pipeline feature (chaining multiple PDF tools together) is UNIQUE in the entire market. Zero competitors offer anything like it. But right now it's just a plain nav link. We need to make it stand out.

First, explore the codebase to find: the nav/header component (to add the badge), the homepage layout (to add the callout), the individual tool page template (to add the tip), and the Pipeline page itself (to understand the feature). Then implement:

1. NAV BAR: Find the navigation component and add a "NEW" badge next to the "PIPELINE" nav link. Style it as a small pill/tag in a contrasting color (e.g., bright green or amber with inverted text). It should look like a product feature badge. Make sure it works in both the desktop nav and mobile menu.

2. HOMEPAGE CALLOUT: Add a promotional card/banner on the homepage between the featured tools section (or search bar) and the full tool grid:
   - Headline: "Chain Tools Together with Pipeline"
   - Description: "Run multiple operations in sequence — merge, compress, watermark, and more — all in one go. No other tool offers this."
   - A CTA button: "Try Pipeline →" linking to /pipeline
   - Style it as a distinct callout with a subtle gradient border or different card style
   - Include a small CSS-based visual showing 3 connected steps/dots

3. TOOL PAGES: Find the tool page template/layout component. Add a small tip below the file upload area: "Tip: Need to run multiple operations? Try our Pipeline feature." with a link to /pipeline.

4. All changes must work in both dark and light themes — follow the existing theme pattern in the codebase.

The Pipeline feature should feel like a flagship differentiator, not an afterthought.
```

---

## PROMPT 5: Collapsible Sticky Header (MEDIUM PRIORITY)

```
Read ./PrivaTools_Competitive_Analysis.md — see section 5.3 for the header height issue.

Our sticky header currently takes up ~170px of vertical space at all times, showing: the full PRIVATOOLS logo/branding, the nav links, the date bar, and the tagline bar. On a page with 99+ tools, this wastes significant screen real estate.

First, explore the codebase to find: the header/nav component, the logo component, the date bar and tagline bar elements, and how the sticky positioning is currently implemented. Understand the full header structure before making changes. Then implement:

1. DEFAULT STATE (top of page, scroll position 0): Full header exactly as it currently exists — logo, nav, date bar, tagline bar. No changes to the initial render.

2. SCROLLED STATE (after scrolling down ~100px): Smoothly transition to a compact header (~50-60px tall):
   - Hide the large PRIVATOOLS text/logo — replace with a smaller version or just the brand name in smaller text
   - Hide the date bar and tagline bar completely (use opacity + max-height transition, not display:none)
   - Keep the nav links (ALL TOOLS, BATCH, PIPELINE, BLOG, COMPARE)
   - Keep the theme toggle and any other utility icons
   - Add a subtle bottom border or shadow to separate it from content

3. SCROLL BACK TO TOP: Smoothly expand back to the full header when the user scrolls back to the top

4. Implementation approach:
   - Use a scroll event listener (throttled/debounced) or IntersectionObserver
   - Toggle a CSS class (e.g., .header--compact) on the header element
   - Use CSS transitions for height, opacity, padding changes (200-300ms ease)
   - Content below must NOT "jump" — use proper padding/margin compensation

5. Test across: homepage, tool pages, pipeline page, blog pages, both dark and light themes, and mobile. Don't break the mobile header if it has separate logic.
```

---

## PROMPT 6: Color-Coded Category Badges (LOW PRIORITY)

```
Read ./PrivaTools_Competitive_Analysis.md — see section 5.5 for the badge differentiation issue.

Currently all category badges (ORGANIZE, EDIT, SECURITY, TO PDF, CONVERT, ADVANCED) use the same amber color. This means they label tools but don't help users visually scan the grid.

First, explore the codebase to find: the tool card component, the badge/tag component or styles, the category filter tabs component, the section header components, and the theme variables. Understand how badge colors are currently defined. Then implement:

1. Find where badge colors are defined (could be CSS variables, a config object, Tailwind classes, or inline styles). Create a category-to-color mapping:
   - ORGANIZE: Blue (e.g., #5B8DB8 dark / #3A7CA5 light)
   - EDIT: Teal/Cyan (e.g., #5BAFAF dark / #2D8F8F light)
   - SECURITY: Green (e.g., #6BAF6B dark / #4A8F4A light)
   - TO PDF: Purple (e.g., #9B7BBF dark / #7B5BA0 light)
   - CONVERT: Orange (keep close to current amber, e.g., #D4903A)
   - ADVANCED: Red/Rose (e.g., #BF6B6B dark / #A04A4A light)
   - Any other categories: assign appropriate distinct colors

2. Colors must be muted/desaturated — professional, not rainbow. Distinct enough to scan at a glance. Passing WCAG AA contrast on both dark and light backgrounds.

3. Apply the same color scheme to:
   - Category filter tabs at the top of the homepage (the "PDF 78", "IMAGE 15", etc.)
   - Section headers (ORGANIZE & MANAGE, EDIT CONTENT, etc.) — use the color for the left border/accent

4. Keep amber as the primary brand accent for non-category elements (links, buttons, hover states).

5. Test on both dark and light themes.
```

---

## PROMPT 7: "Favorites" Feature (BONUS)

```
Read ./PrivaTools_Competitive_Analysis.md — see section 1.3 (PDF24's favorite feature).

PDF24 has a "favorite" star on each tool. We already have "Recently Used" but explicit favorites would be more useful.

First, explore the codebase to find: the tool card component, the "Recently Used" section logic (to understand how it stores/retrieves data), the homepage layout, and the localStorage usage patterns. Then implement:

1. Add a small star icon to each tool card (top-right corner) — use the same icon library the project already uses
2. Clicking toggles the tool as a favorite — stored in localStorage (check if the project already has a localStorage utility/hook and use it)
3. On the homepage, add a "FAVORITES" section above "RECENTLY USED" when the user has favorites
4. If no favorites exist, don't render the section
5. Favorites section uses the same card layout as "Recently Used"
6. Star icon: outline when unfavorited, filled amber when favorited
7. Subtle scale bounce animation on toggle (CSS transform)
8. Works in both dark and light themes
```

---

## PROMPT 8: Global File Drop Zone (BONUS)

```
Read ./PrivaTools_Competitive_Analysis.md — see section 1.5 (PDF Candy's upload-first approach).

PDF Candy has an "upload first, choose tool later" approach. We can adapt this while keeping our tool-grid.

First, explore the codebase to find: the homepage layout, the existing file upload/drop zone components on individual tool pages (to avoid conflicts), the tool data/config (to map file types to tools), and how file type categories are defined. Then implement:

1. When a user drags a file anywhere over the homepage, show a full-page overlay drop zone
2. Overlay message: "Drop your file to get started" with a file type icon
3. On drop, detect file extension and show a filtered list of relevant tools:
   - .pdf → Show all PDF tools
   - .jpg/.png/.webp/.gif → Show all Image tools
   - .mp4/.mov/.avi → Show all Video tools
   - .zip/.rar/.7z/.tar.gz → Show all Archive tools
   - .docx/.xlsx/.pptx → Show all Docs tools
4. Filtered view as a modal or temporary replacement of the tool grid with a "← Back to all tools" button
5. Drop zone overlay: subtle border pulse animation, semi-transparent background
6. Works in both dark/light themes
7. IMPORTANT: Must NOT interfere with existing file drop zones on /tool/* pages — only activate on the homepage
8. The file should be passed along to the selected tool page so the user doesn't have to re-upload
```

---

## Usage Instructions

### Setup
1. Copy `PrivaTools_Competitive_Analysis.md` to your project root
2. Open Claude Code in your project directory

### Running
Feed prompts one at a time in priority order: **1 → 2 → 3 → 4 → 5 → 6 → 7 → 8**

Each prompt tells Claude Code to explore the codebase first, so it will adapt to your specific tech stack (React, Next.js, Vue, Svelte, etc.) and styling approach (Tailwind, CSS modules, styled-components, etc.) automatically.

### Notes
- Prompts 1-6 are the **core recommendations** from the competitive analysis
- Prompts 7-8 are **bonus improvements** inspired by competitor features
- Each prompt is **self-contained** — you can run them independently or skip any
- Each prompt **starts with codebase exploration** so Claude Code finds the right files to modify
- The analysis file at `./PrivaTools_Competitive_Analysis.md` provides competitive context so Claude Code understands the *why* behind each change
