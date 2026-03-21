export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  readTime: string;
  tags: string[];
  body: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "compress-pdf-without-losing-quality",
    title: "How to Compress a PDF Without Losing Quality",
    description:
      "Learn how to reduce PDF file size by up to 90% without visible quality loss. Three methods compared: online tools, desktop apps, and command-line.",
    publishedAt: "2026-03-22",
    readTime: "5 min read",
    tags: ["PDF", "Compression", "How-To"],
    body: `
<p>PDF files can balloon to enormous sizes — especially scanned documents, presentations, and forms with embedded images. Emailing a 50&nbsp;MB PDF frustrates everyone involved. The good news: you can typically cut that size by 60–90% without any visible loss in quality.</p>

<h2>Why PDF Files Get So Large</h2>
<p>PDFs store several types of data that balloon file sizes:</p>
<ul>
  <li><strong>Embedded images</strong> — The biggest culprit. A single high-resolution TIFF scan can add 10–20&nbsp;MB.</li>
  <li><strong>Embedded fonts</strong> — Full font subsets include every glyph in the typeface, adding overhead even for rarely used characters.</li>
  <li><strong>Revision history</strong> — Deleted content, old form-field states, and comment threads linger invisibly in the file structure.</li>
  <li><strong>Duplicate resources</strong> — The same image referenced on multiple pages is sometimes embedded multiple times.</li>
</ul>

<h2>Lossless vs Lossy Compression</h2>
<p>There are two fundamentally different ways to shrink a PDF:</p>
<p><strong>Lossless compression</strong> removes redundant data structures without touching any content. Images remain at their original quality. Typical savings: 5–30%.</p>
<p><strong>Lossy compression</strong> resamples embedded images at a lower DPI or higher JPEG ratio. Images look nearly identical on screen and when printed at standard sizes, but pixel data is permanently altered. Typical savings: 40–90%.</p>
<p>For most everyday uses — sharing reports, uploading to portals, emailing forms — lossy compression at a "balanced" setting is the right choice. The quality difference is invisible at normal viewing sizes.</p>

<h2>Method 1: Compress PDF Online (Fastest, Free, No Software)</h2>
<p>The fastest method requires nothing but a browser:</p>
<ol>
  <li>Open <a href="/tool/compress-pdf">PrivaTools Compress PDF</a>.</li>
  <li>Drag and drop your PDF (or click to browse).</li>
  <li>Choose a compression level: <em>Light</em>, <em>Balanced</em>, or <em>Extreme</em>.</li>
  <li>Click <strong>Compress</strong> and download the result instantly.</li>
</ol>
<p>Your file is processed and immediately deleted after download — it is never stored, indexed, or shared. If file privacy matters (medical records, legal documents, financials), this matters.</p>

<h2>Method 2: Adobe Acrobat (Desktop, Paid)</h2>
<p>Acrobat Pro's <em>Reduce File Size</em> and <em>PDF Optimizer</em> tools give granular control — you can independently dial down image DPI, remove embedded fonts, strip metadata, and prune revision history. Results are excellent but require an Acrobat Pro subscription (~$23/month).</p>
<p>For occasional compression needs, this is overkill. Use an online tool instead.</p>

<h2>Method 3: Ghostscript (Command-Line, Free, Batch)</h2>
<p>For developers or power users compressing many files:</p>
<pre><code>gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 \
   -dPDFSETTINGS=/ebook \
   -dNOPAUSE -dQUIET -dBATCH \
   -sOutputFile=output.pdf input.pdf</code></pre>
<p>The <code>-dPDFSETTINGS</code> flag controls quality: <code>/screen</code> (smallest), <code>/ebook</code> (balanced), <code>/printer</code> (high quality), <code>/prepress</code> (maximum quality).</p>

<h2>Tips to Get Maximum Compression</h2>
<ul>
  <li><strong>Strip metadata first</strong> — Remove author names, GPS data, and creation timestamps with <a href="/tool/strip-metadata">Strip PDF Metadata</a> before compressing.</li>
  <li><strong>Flatten filled forms</strong> — Interactive fields carry overhead. <a href="/tool/flatten-pdf">Flatten</a> the PDF before compressing if the form is already completed.</li>
  <li><strong>Remove blank pages</strong> — Scanned documents often include blank separators. <a href="/tool/remove-blank-pages">Delete them</a> first.</li>
  <li><strong>Don't compress twice</strong> — Running a compressed PDF through compression again yields minimal savings and can degrade quality further.</li>
</ul>

<h2>Realistic Size Expectations</h2>
<ul>
  <li><strong>Scanned documents (image PDFs)</strong>: 60–90% reduction with Balanced or Extreme.</li>
  <li><strong>PDFs with embedded JPEG photos</strong>: 20–50% reduction with Balanced.</li>
  <li><strong>Text-only PDFs</strong>: 5–20% reduction — there's little image data to compress.</li>
  <li><strong>Already-compressed PDFs</strong>: Minimal savings; may even increase size slightly.</li>
</ul>

<h2>The Bottom Line</h2>
<p>For most documents, the <strong>Balanced</strong> preset in a good PDF compressor will produce a file that looks identical to the original at all standard viewing sizes, at 40–70% smaller size. Start there — only reach for Extreme compression if file size is more critical than occasional print fidelity.</p>
<p><a href="/tool/compress-pdf">Try PrivaTools Compress PDF — free, no sign-up required →</a></p>
    `,
  },
  {
    slug: "merge-pdf-files-online-free",
    title: "How to Merge PDF Files Online for Free",
    description:
      "Step-by-step guide to combining multiple PDF files online for free. Drag, drop, reorder, and merge — no software, no account, no watermarks.",
    publishedAt: "2026-03-22",
    readTime: "4 min read",
    tags: ["PDF", "Merge", "How-To"],
    body: `
<p>Whether you're assembling a report from multiple chapters, combining signed contract pages, or packaging several scanned receipts into one file — merging PDFs is one of the most common file tasks. Here's how to do it online for free, without downloading anything.</p>

<h2>When You Need to Merge PDFs</h2>
<p>Common reasons people merge PDF files:</p>
<ul>
  <li>Combining chapters or sections written separately into one document</li>
  <li>Assembling a job application (resume, cover letter, portfolio) as a single PDF</li>
  <li>Collating multiple invoices or receipts for expense reporting</li>
  <li>Combining front-side and back-side duplex scans in the correct order</li>
  <li>Packaging signed contract pages with attachments</li>
</ul>

<h2>How to Merge PDFs Online — Step by Step</h2>
<ol>
  <li>Open <a href="/tool/merge-pdf">PrivaTools Merge PDF</a> in your browser.</li>
  <li>Click <strong>Add Files</strong> or drag and drop multiple PDFs into the upload zone. You can add as many files as you need.</li>
  <li><strong>Reorder the files</strong> by dragging them into the desired sequence. The top file will be the first pages of the merged document.</li>
  <li>Optionally preview individual file thumbnails to verify page order before merging.</li>
  <li>Click <strong>Merge PDF</strong>. The combined file downloads to your device within seconds.</li>
</ol>
<p>No account, no email, no watermark. The merged PDF is yours entirely — PrivaTools does not retain any copy of your files.</p>

<h2>Page-Level Control</h2>
<p>If you need to merge specific pages rather than entire files, use <a href="/tool/extract-pages">Extract Pages</a> to pull the pages you want from each source PDF first, then merge the extracts. This gives you precise control over exactly which content ends up in the final document.</p>

<h2>Merging Scanned Documents (Duplex Order)</h2>
<p>Scanners that do single-sided scanning produce two files from a double-sided document: all the odd pages in one scan, all the even pages in another — often in reverse order. The <a href="/tool/alternate-mix">Alternate Mix</a> tool interleaves pages from two PDFs in alternating fashion, reconstructing the correct double-sided page order automatically.</p>

<h2>Privacy Considerations</h2>
<p>Most free online PDF mergers upload your files to their servers, process them, and store them for a period afterward (sometimes 1–24 hours). If your PDFs contain sensitive content — legal contracts, financial statements, medical records — this matters.</p>
<p>PrivaTools processes files through a FastAPI backend and deletes them immediately after your download. The source code is open and auditable at <a href="https://github.com/taiyeba-dg/privatools" target="_blank" rel="noopener">GitHub</a>. If you want total certainty, you can self-host the entire stack with Docker.</p>

<h2>What About File Size Limits?</h2>
<p>PrivaTools supports uploads up to 100&nbsp;MB per file. For merging very large PDFs (e.g., high-resolution scan archives), you may need to <a href="/tool/compress-pdf">compress each file first</a> before merging, then optionally compress the merged result.</p>

<h2>Alternatives to Online Merging</h2>
<ul>
  <li><strong>macOS Preview</strong> — Drag thumbnails between open PDFs in the sidebar. Built-in, no software needed.</li>
  <li><strong>pdftk (command-line)</strong> — <code>pdftk file1.pdf file2.pdf cat output merged.pdf</code>. Fast for batch scripts.</li>
  <li><strong>Adobe Acrobat</strong> — Reliable but requires a paid subscription.</li>
</ul>
<p>For quick, occasional merges without installing anything, an online tool is the fastest option.</p>

<p><a href="/tool/merge-pdf">Merge your PDFs now — free, private, no sign-up →</a></p>
    `,
  },
  {
    slug: "best-free-pdf-tools-2026",
    title: "Best Free PDF Tools in 2026: Honest Comparison",
    description:
      "We tested 8 free PDF tool suites in 2026. Honest verdict on which are truly free, which have hidden limits, and which respect your privacy.",
    publishedAt: "2026-03-22",
    readTime: "8 min read",
    tags: ["PDF", "Comparison", "Review"],
    body: `
<p>Searching for "free PDF tools" returns hundreds of options — but many aren't truly free. Some limit you to 2 tasks per day. Others add watermarks unless you pay. A few quietly upload your documents to their servers and retain them indefinitely. This guide cuts through the noise.</p>

<h2>Our Testing Criteria</h2>
<p>We evaluated each tool on four dimensions:</p>
<ul>
  <li><strong>Actually free?</strong> No task limits, no file size caps, no paywalled essentials.</li>
  <li><strong>No account required?</strong> You shouldn't need to hand over your email to compress a PDF.</li>
  <li><strong>Privacy?</strong> Where do files go? How long are they retained? Is the code auditable?</li>
  <li><strong>Tool breadth?</strong> How many operations are covered? PDF-only vs multi-format?</li>
</ul>

<h2>1. PrivaTools — Best Overall for Privacy + Tool Count</h2>
<p><strong>Free:</strong> Yes, 100% · <strong>Account required:</strong> No · <strong>Tools:</strong> 90+ (PDF, Image, Video, Developer)</p>
<p>PrivaTools is open source (MIT license), self-hostable, and covers the most tool categories of any free suite tested. It handles PDF operations, image processing, video tools, and developer utilities — all in one place. Files are processed on the server and immediately deleted.</p>
<p><strong>Strengths:</strong> No task limits, no ads, no watermarks, open-source and auditable. Covers tools that most PDF suites don't touch (video compression, developer utilities, archive tools).</p>
<p><strong>Weaknesses:</strong> Server-side processing (not fully client-side). Newer service with a smaller community than established alternatives.</p>

<h2>2. iLovePDF — Most Popular, but Limited</h2>
<p><strong>Free:</strong> Limited · <strong>Account required:</strong> No · <strong>Tools:</strong> ~25 (PDF only)</p>
<p>iLovePDF is the most trafficked free PDF tool on the internet. The free tier allows basic operations without an account, but file sizes are capped at 25&nbsp;MB and the experience pushes aggressively toward premium upgrades. Files are uploaded to their servers and retained for a period after download.</p>
<p><strong>Verdict:</strong> Good for quick, low-stakes operations. Not suitable for sensitive documents.</p>

<h2>3. Smallpdf — Quality UX, Aggressive Limits</h2>
<p><strong>Free:</strong> 2 tasks/day · <strong>Account required:</strong> No · <strong>Tools:</strong> ~21 (PDF only)</p>
<p>Smallpdf is polished, fast, and handles most common PDF tasks. The 2-tasks-per-day free limit is the most commonly complained-about restriction in the PDF tool space. If you need to compress three files in one afternoon, you'll hit the wall.</p>
<p><strong>Verdict:</strong> Best UX in the free tier. Worst limit. Use sparingly.</p>

<h2>4. PDF24 — Genuinely Free, But Not Open Source</h2>
<p><strong>Free:</strong> Yes · <strong>Account required:</strong> No · <strong>Tools:</strong> ~45 (PDF + basic image)</p>
<p>PDF24 is the closest competitor to PrivaTools in terms of being genuinely free with no task limits. It covers a wide range of PDF operations, has a Windows desktop app, and doesn't require an account. The catch: it's not open source, so you can't audit what happens to your files, and it's ad-supported.</p>
<p><strong>Verdict:</strong> A solid choice if you need a free tool and privacy isn't a concern.</p>

<h2>5. Adobe Acrobat Online — Industry Standard, Expensive</h2>
<p><strong>Free:</strong> Very limited · <strong>Account required:</strong> Yes (Adobe ID) · <strong>Tools:</strong> ~15 free</p>
<p>Adobe's free online tier lets you do a handful of basic conversions per month, but the real tools (editing, signing, OCR) require a subscription. An Adobe ID is mandatory. Files are processed in the Adobe cloud.</p>
<p><strong>Verdict:</strong> Only worth it if you already have an Acrobat subscription. Otherwise, overkill.</p>

<h2>6. Sejda — Clean UI, Strict Hourly Limits</h2>
<p><strong>Free:</strong> 3 tasks/hour, 50&nbsp;MB limit · <strong>Account required:</strong> No · <strong>Tools:</strong> ~25 (PDF only)</p>
<p>Sejda has a clean, minimalist interface and genuinely good tools — especially its PDF editor. The 3-tasks-per-hour limit is more generous than Smallpdf's daily cap but still frustrating for heavy users. Files are deleted from Sejda's servers within 2 hours.</p>
<p><strong>Verdict:</strong> Good for occasional PDF editing. Better privacy policy than most alternatives.</p>

<h2>7. Stirling PDF — Best for Self-Hosting</h2>
<p><strong>Free:</strong> Yes (self-hosted) · <strong>Account required:</strong> No · <strong>Tools:</strong> ~50 (PDF only)</p>
<p>Stirling PDF is an open-source (GPL-3.0) PDF tool suite that you deploy yourself with Docker. If you want zero data leaving your network, this is the strongest option — but it requires technical knowledge to set up.</p>
<p><strong>Verdict:</strong> Best for privacy-conscious users with a home server or VPS. Not suitable for non-technical users.</p>

<h2>8. Foxit PDF — Business Grade, Fully Paid</h2>
<p><strong>Free:</strong> No (trial only) · <strong>Account required:</strong> Yes · <strong>Tools:</strong> PDF suite</p>
<p>Foxit is a legitimate Adobe Acrobat alternative for enterprise use, with strong editing and e-signature capabilities. There is no meaningful free tier — the trial converts files with watermarks.</p>
<p><strong>Verdict:</strong> Consider only for business use where you need desktop-grade PDF editing with support contracts.</p>

<h2>The Verdict</h2>
<p>If you want a tool that is genuinely free (no task limits, no upsells), handles more than just PDFs, and treats your files with respect: <a href="/">PrivaTools</a> is the answer. If you need a self-hosted option and have the technical skills: Stirling PDF. If you just need to compress one file and don't care about privacy: PDF24 works fine.</p>
<p>Avoid Smallpdf's 2-task limit for anything resembling regular use, and don't upload sensitive documents to iLovePDF or Adobe without reading their data retention policies.</p>
    `,
  },
  {
    slug: "remove-password-from-pdf",
    title: "How to Remove a Password from a PDF",
    description:
      "Three ways to remove or bypass a PDF password you own — online tool, Adobe Acrobat, and command-line — explained step by step.",
    publishedAt: "2026-03-22",
    readTime: "4 min read",
    tags: ["PDF", "Security", "How-To"],
    body: `
<p>PDF passwords come in two varieties, and understanding which type you're dealing with determines which removal method works.</p>

<h2>Two Types of PDF Passwords</h2>
<p><strong>Open password (user password)</strong> — Required to open and view the document. Without this password, the file appears as scrambled, unreadable data. This is true encryption.</p>
<p><strong>Permissions password (owner password)</strong> — Does not prevent opening the file, but restricts operations: printing, copying text, editing, or annotating. Many PDF tools can remove this type of restriction without knowing the password, because the file content itself isn't encrypted — only the permission flags are set.</p>
<p>The methods below apply to removing passwords from PDFs <strong>you legally own</strong>. Attempting to decrypt PDFs you don't have rights to is illegal in most jurisdictions.</p>

<h2>Method 1: Remove Password Online (Easiest)</h2>
<p>For PDFs where you know the open password:</p>
<ol>
  <li>Open <a href="/tool/unlock-pdf">PrivaTools Unlock PDF</a>.</li>
  <li>Upload your password-protected PDF.</li>
  <li>Enter the correct password when prompted.</li>
  <li>Download the unlocked PDF — password-free, fully accessible.</li>
</ol>
<p>This works for both open passwords (when you provide the correct one) and permissions passwords (restrictions are lifted). Your file is deleted immediately after download.</p>

<h2>Method 2: Adobe Acrobat (Desktop)</h2>
<p>If you have Acrobat Pro:</p>
<ol>
  <li>Open the PDF in Acrobat. Enter the password if prompted.</li>
  <li>Go to <strong>Tools → Protect → Security → Remove Security</strong>.</li>
  <li>If prompted for the permissions password, enter it. Click <strong>OK</strong>.</li>
  <li>Save the file. The password is removed from the saved copy.</li>
</ol>
<p>Acrobat also shows exactly which permissions are restricted and allows you to modify them individually.</p>

<h2>Method 3: Print to PDF (Works for Open Passwords You Know)</h2>
<p>A simple workaround available on any operating system:</p>
<ol>
  <li>Open the PDF in any viewer (enter the password).</li>
  <li>Use <strong>File → Print</strong> and select <strong>"Save as PDF"</strong> (macOS) or <strong>"Microsoft Print to PDF"</strong> (Windows) as the printer.</li>
  <li>Save the new PDF. It will be a copy without the password.</li>
</ol>
<p>Caveat: this re-renders the PDF as a new document. Complex layouts, hyperlinks, form fields, bookmarks, and exact font rendering may not be preserved. Use this only when you need the content, not the exact file structure.</p>

<h2>What If You Forgot the Password?</h2>
<p>If you've genuinely forgotten the password to a PDF you own, options are limited:</p>
<ul>
  <li>Check if the original sender can resend an unlocked version.</li>
  <li>Check your password manager or saved passwords.</li>
  <li>For permissions-only passwords (no open password), online tools like PrivaTools can often remove the restrictions without needing the password, since the file content is technically accessible.</li>
  <li>True open-password encryption (AES-128/256) cannot be broken with any online tool. Forensic password recovery software exists but is slow and not guaranteed for strong passwords.</li>
</ul>

<h2>How to Check What Kind of Password a PDF Has</h2>
<p>Try opening the PDF without a password:</p>
<ul>
  <li>If it opens but printing/copying is greyed out → it has a <strong>permissions password only</strong>. You can remove restrictions without the password using <a href="/tool/unlock-pdf">Unlock PDF</a>.</li>
  <li>If it won't open at all and demands a password → it has an <strong>open password</strong>. You must know the correct password to decrypt it.</li>
</ul>

<p><a href="/tool/unlock-pdf">Remove PDF password now — free, private, no sign-up →</a></p>
    `,
  },
  {
    slug: "convert-word-to-pdf-free",
    title: "How to Convert Word to PDF for Free",
    description:
      "5 ways to convert .docx files to PDF without Microsoft Office — online tools, Google Docs, LibreOffice — plus which preserves formatting best.",
    publishedAt: "2026-03-22",
    readTime: "5 min read",
    tags: ["PDF", "Convert", "How-To"],
    body: `
<p>Converting a Word document to PDF is one of the most common file tasks — and one of the easiest to do for free. Here are five methods, from fastest to most control, with honest notes on which preserves formatting best.</p>

<h2>Why Convert Word to PDF?</h2>
<p>PDF is the universally readable format — it looks the same on every device, operating system, and screen size, regardless of whether the recipient has Microsoft Office installed. Sending a .docx file is risky: fonts may substitute, spacing may shift, and the layout you spent hours perfecting can look different on the other end. PDF locks the presentation.</p>

<h2>Method 1: PrivaTools Word to PDF (Online, No Software)</h2>
<p>The fastest option if you don't have Office installed:</p>
<ol>
  <li>Open <a href="/tool/word-to-pdf">PrivaTools Word to PDF</a>.</li>
  <li>Upload your .docx file (up to 100&nbsp;MB).</li>
  <li>Click <strong>Convert</strong> and download the PDF.</li>
</ol>
<p>Conversion uses LibreOffice under the hood, which handles most formatting correctly — headings, bold/italic, images, tables, and standard paragraph styles. Your file is deleted immediately after conversion.</p>
<p><strong>Formatting fidelity:</strong> Excellent for standard documents. Complex custom styles, tracked changes, or embedded macros may not survive perfectly.</p>

<h2>Method 2: Google Docs (Free, Browser-Based)</h2>
<ol>
  <li>Upload the .docx to Google Drive.</li>
  <li>Open it with Google Docs (right-click → Open with → Google Docs).</li>
  <li>Go to <strong>File → Download → PDF Document (.pdf)</strong>.</li>
</ol>
<p><strong>Formatting fidelity:</strong> Good for simple documents. Google Docs re-renders the document in its own engine, which can shift spacing on complex layouts. Headers/footers, custom page sizes, and intricate tables sometimes look different.</p>
<p><strong>Privacy note:</strong> Your document is uploaded to and processed by Google's servers. It will remain in your Google Drive unless you delete it.</p>

<h2>Method 3: Microsoft Word (Save as PDF)</h2>
<p>If you have Microsoft Word (desktop or Microsoft 365):</p>
<ol>
  <li>Open your document in Word.</li>
  <li>Go to <strong>File → Save As → PDF</strong> (or <strong>File → Export → Create PDF/XPS</strong>).</li>
  <li>Choose whether to optimize for <em>Standard</em> (print quality) or <em>Minimum size</em> (web).</li>
</ol>
<p><strong>Formatting fidelity:</strong> Best. Word renders its own format natively, preserving every typographic detail exactly.</p>
<p><strong>Cost:</strong> Requires a Microsoft 365 subscription or perpetual license.</p>

<h2>Method 4: LibreOffice (Free Desktop App)</h2>
<ol>
  <li><a href="https://www.libreoffice.org/download/libreoffice/" target="_blank" rel="noopener">Download and install LibreOffice</a> (free, open source).</li>
  <li>Open your .docx in LibreOffice Writer.</li>
  <li>Go to <strong>File → Export As → Export as PDF</strong>.</li>
</ol>
<p><strong>Formatting fidelity:</strong> Very good for standard documents. Matches what PrivaTools produces (same rendering engine). Better than Google Docs for complex layouts.</p>
<p><strong>Best for:</strong> Users who need offline conversion without a subscription.</p>

<h2>Method 5: macOS Print to PDF (Built-In)</h2>
<p>Every Mac has a built-in PDF printer — no software needed:</p>
<ol>
  <li>Open the .docx in any application (even Preview can open simple Word files).</li>
  <li>Press <strong>Cmd + P</strong> to open the Print dialog.</li>
  <li>Click the PDF dropdown in the bottom-left → <strong>Save as PDF</strong>.</li>
</ol>
<p><strong>Formatting fidelity:</strong> Depends on the application you used to open the file. If opened in Pages or Preview rather than Word, formatting can shift significantly.</p>

<h2>Which Method Preserves Formatting Best?</h2>
<table>
  <thead>
    <tr>
      <th>Method</th>
      <th>Formatting Fidelity</th>
      <th>Cost</th>
      <th>Privacy</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Microsoft Word</td><td>Excellent</td><td>Paid</td><td>Local</td></tr>
    <tr><td>LibreOffice</td><td>Very good</td><td>Free</td><td>Local</td></tr>
    <tr><td>PrivaTools</td><td>Very good</td><td>Free</td><td>Files deleted immediately</td></tr>
    <tr><td>Google Docs</td><td>Good</td><td>Free</td><td>Stored in Google Drive</td></tr>
    <tr><td>macOS Print to PDF</td><td>Varies</td><td>Free</td><td>Local</td></tr>
  </tbody>
</table>

<h2>What About .doc Files (Older Word Format)?</h2>
<p>All five methods above also work with the older .doc format, though formatting fidelity may be slightly lower due to the format's age and quirks. If possible, re-save .doc files as .docx before converting.</p>

<p><a href="/tool/word-to-pdf">Convert Word to PDF now — free, no sign-up required →</a></p>
    `,
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
