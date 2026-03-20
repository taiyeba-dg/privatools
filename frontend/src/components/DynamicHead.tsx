import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { tools } from "@/data/tools";
import { nonPdfTools } from "@/data/non-pdf-tools";

const BASE_URL = "https://privatools.me";

type ToolMeta = {
    name: string;
    description: string;
    longDescription?: string;
    category?: string;
    slug?: string;
};

const toolMap: Record<string, ToolMeta> = {};
tools.forEach(t => { toolMap[`/tool/${t.slug}`] = { ...t }; });
nonPdfTools.forEach(t => { toolMap[`/tools/${t.slug}`] = { ...t }; });

const pageMeta: Record<string, { title: string; description: string }> = {
    "/": {
        title: "PrivaTools — Free, Open-Source Privacy-First File Tools",
        description: "90+ free, open-source file tools — PDF, image, video, and developer utilities. All processing happens on your device. Zero uploads, zero tracking.",
    },
    "/about": {
        title: "About PrivaTools — Privacy-First File Processing",
        description: "PrivaTools is a free, open-source suite of 90+ file tools. Your files never leave your device — all processing happens locally.",
    },
    "/batch": {
        title: "Batch Process Files — Apply Tools to Multiple Files | PrivaTools",
        description: "Upload multiple files and apply the same tool to all of them at once. Batch compress, convert, or transform PDF, image, and video files privately. Free, no limits.",
    },
    "/pipeline": {
        title: "PDF Pipeline — Chain Multiple PDF Tools Together | PrivaTools",
        description: "Chain multiple PDF tools together into a processing pipeline. Compress, rotate, watermark, and more — all in one pass. Privacy-first and free.",
    },
};

const categoryLabels: Record<string, string> = {
    organize: "PDF Tools",
    edit: "PDF Editor",
    optimize: "PDF Optimization",
    security: "PDF Security",
    "to-pdf": "File Conversion",
    "from-pdf": "PDF Conversion",
    advanced: "Advanced PDF Tools",
    image: "Image Tools",
    "video-audio": "Video & Audio Tools",
    developer: "Developer Tools",
    archive: "Archive Tools",
    "document-office": "Document Conversion",
};

const categoryPaths: Record<string, string> = {
    organize: "PDF Tools",
    edit: "Edit PDF",
    optimize: "Optimize PDF",
    security: "PDF Security",
    "to-pdf": "Convert to PDF",
    "from-pdf": "Convert from PDF",
    advanced: "Advanced",
    image: "Image Tools",
    "video-audio": "Video & Audio",
    developer: "Developer Tools",
    archive: "Archives",
    "document-office": "Document Tools",
};

/** FAQ entries shown on every tool page for FAQPage schema. */
function getToolFAQ(toolName: string) {
    return [
        {
            question: `Is ${toolName} free to use?`,
            answer: `Yes, ${toolName} on PrivaTools is 100% free with no limits, no accounts required, and no premium tiers.`,
        },
        {
            question: `Is it safe to use ${toolName} online?`,
            answer: `Yes. PrivaTools processes files on our secure server and immediately deletes them after processing. We never store, share, or analyze your files. Many tools also work entirely in your browser.`,
        },
        {
            question: `Do I need to create an account?`,
            answer: `No. PrivaTools requires no account, no email, and no registration. Just upload your file and use the tool immediately.`,
        },
        {
            question: `Can I use ${toolName} on mobile?`,
            answer: `Yes. PrivaTools is fully responsive and works on phones, tablets, and desktops in any modern browser.`,
        },
    ];
}

/** HowTo steps for each tool. */
function getToolHowTo(toolName: string) {
    return [
        { name: "Upload your file", text: `Open ${toolName} on PrivaTools and drag & drop your file, or click to browse.` },
        { name: "Configure settings", text: "Adjust any tool-specific settings or options as needed." },
        { name: "Process and download", text: "Click the process button. Your result downloads automatically — no email required." },
    ];
}

/**
 * Updates <title>, <meta>, <link rel="canonical">, and JSON-LD on every route change.
 * Includes: WebApplication, FAQPage, BreadcrumbList, HowTo schemas.
 */
export function DynamicHead() {
    const { pathname } = useLocation();

    useEffect(() => {
        const tool = toolMap[pathname];
        const url = `${BASE_URL}${pathname === "/" ? "" : pathname}`;

        if (tool) {
            const title = `${tool.name} Online Free — No Sign Up | PrivaTools`;
            const desc = tool.longDescription || tool.description;
            const category = tool.category || "";
            const breadcrumbCategory = categoryPaths[category] || "Tools";

            document.title = title;
            setMeta("description", desc);
            setMeta("og:title", `${tool.name} — Free, Private, Open Source | PrivaTools`);
            setMeta("og:description", desc);
            setMeta("og:url", url);
            setMeta("og:type", "website");
            setMeta("og:image", `${BASE_URL}/og-image.png`);
            setMeta("twitter:title", `${tool.name} — Free Online | PrivaTools`);
            setMeta("twitter:description", desc);
            setMeta("twitter:image", `${BASE_URL}/og-image.png`);
            setCanonical(url);

            // Combined JSON-LD graph
            const faq = getToolFAQ(tool.name);
            const howTo = getToolHowTo(tool.name);

            setJsonLd({
                "@context": "https://schema.org",
                "@graph": [
                    // WebApplication
                    {
                        "@type": "WebApplication",
                        name: tool.name,
                        description: desc,
                        url,
                        applicationCategory: categoryLabels[category] || "Utility",
                        operatingSystem: "Any",
                        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
                        provider: {
                            "@type": "Organization",
                            name: "PrivaTools",
                            url: BASE_URL,
                        },
                    },
                    // BreadcrumbList
                    {
                        "@type": "BreadcrumbList",
                        itemListElement: [
                            { "@type": "ListItem", position: 1, name: "PrivaTools", item: BASE_URL },
                            { "@type": "ListItem", position: 2, name: breadcrumbCategory, item: `${BASE_URL}/` },
                            { "@type": "ListItem", position: 3, name: tool.name, item: url },
                        ],
                    },
                    // FAQPage
                    {
                        "@type": "FAQPage",
                        mainEntity: faq.map(f => ({
                            "@type": "Question",
                            name: f.question,
                            acceptedAnswer: { "@type": "Answer", text: f.answer },
                        })),
                    },
                    // HowTo
                    {
                        "@type": "HowTo",
                        name: `How to use ${tool.name} online`,
                        description: `Step-by-step guide to using ${tool.name} on PrivaTools for free.`,
                        step: howTo.map((s, i) => ({
                            "@type": "HowToStep",
                            position: i + 1,
                            name: s.name,
                            text: s.text,
                        })),
                    },
                ],
            });
        } else {
            const meta = pageMeta[pathname] || pageMeta["/"]!;
            document.title = meta.title;
            setMeta("description", meta.description);
            setMeta("og:title", meta.title);
            setMeta("og:description", meta.description);
            setMeta("og:url", url);
            setMeta("og:type", "website");
            setMeta("og:image", `${BASE_URL}/og-image.png`);
            setMeta("twitter:title", meta.title);
            setMeta("twitter:description", meta.description);
            setMeta("twitter:image", `${BASE_URL}/og-image.png`);
            setCanonical(url);

            if (pathname === "/") {
                setJsonLd({
                    "@context": "https://schema.org",
                    "@graph": [
                        {
                            "@type": "WebSite",
                            name: "PrivaTools",
                            url: BASE_URL,
                            description: meta.description,
                            potentialAction: {
                                "@type": "SearchAction",
                                target: `${BASE_URL}/?q={search_term_string}`,
                                "query-input": "required name=search_term_string",
                            },
                        },
                        {
                            "@type": "Organization",
                            name: "PrivaTools",
                            url: BASE_URL,
                            logo: `${BASE_URL}/og-image.png`,
                            sameAs: ["https://github.com/taiyeba-dg/privatools"],
                        },
                    ],
                });
            } else {
                removeJsonLd();
            }
        }
    }, [pathname]);

    return null;
}

function setMeta(name: string, content: string) {
    const isOg = name.startsWith("og:");
    const attr = isOg ? "property" : "name";
    const selector = isOg ? `meta[property="${name}"]` : `meta[name="${name}"]`;
    let el = document.querySelector(selector) as HTMLMetaElement | null;
    if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
    }
    el.setAttribute("content", content);
}

function setCanonical(url: string) {
    let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", "canonical");
        document.head.appendChild(el);
    }
    el.setAttribute("href", url);
}

function setJsonLd(data: Record<string, unknown>) {
    let el = document.getElementById("jsonld-seo") as HTMLScriptElement | null;
    if (!el) {
        el = document.createElement("script");
        el.id = "jsonld-seo";
        el.type = "application/ld+json";
        document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
}

function removeJsonLd() {
    document.getElementById("jsonld-seo")?.remove();
}
