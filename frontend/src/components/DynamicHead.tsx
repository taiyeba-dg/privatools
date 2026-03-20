import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { tools } from "@/data/tools";
import { nonPdfTools } from "@/data/non-pdf-tools";

const BASE_URL = "https://privatools.me";

type ToolMeta = { name: string; description: string; longDescription?: string; category?: string };

const toolMap: Record<string, ToolMeta> = {};
tools.forEach(t => { toolMap[`/tool/${t.slug}`] = t; });
nonPdfTools.forEach(t => { toolMap[`/tools/${t.slug}`] = t; });

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
        title: "Batch Process — Apply Tools to Multiple Files | PrivaTools",
        description: "Upload multiple files and apply the same tool to all of them at once. Batch compress, convert, or transform files privately.",
    },
    "/pipeline": {
        title: "PDF Pipeline — Chain Multiple PDF Tools | PrivaTools",
        description: "Chain multiple PDF tools together into a pipeline. Compress, rotate, watermark, and more — all in one pass. Privacy-first.",
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

/**
 * Updates <title>, <meta>, <link rel="canonical">, and JSON-LD on every route change.
 */
export function DynamicHead() {
    const { pathname } = useLocation();

    useEffect(() => {
        const tool = toolMap[pathname];
        const url = `${BASE_URL}${pathname === "/" ? "" : pathname}`;

        if (tool) {
            const title = `${tool.name} — Free Online, Private | PrivaTools`;
            const desc = tool.longDescription || tool.description;

            document.title = title;
            setMeta("description", desc);
            setMeta("og:title", `${tool.name} — Free, Private, Open Source`);
            setMeta("og:description", desc);
            setMeta("og:url", url);
            setMeta("og:type", "website");
            setMeta("twitter:title", `${tool.name} — PrivaTools`);
            setMeta("twitter:description", desc);
            setCanonical(url);
            setJsonLd({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                name: tool.name,
                description: desc,
                url,
                applicationCategory: categoryLabels[tool.category || ""] || "Utility",
                operatingSystem: "Any",
                offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
                provider: {
                    "@type": "Organization",
                    name: "PrivaTools",
                    url: BASE_URL,
                },
            });
        } else {
            const meta = pageMeta[pathname] || pageMeta["/"]!;
            document.title = meta.title;
            setMeta("description", meta.description);
            setMeta("og:title", meta.title);
            setMeta("og:description", meta.description);
            setMeta("og:url", url);
            setMeta("og:type", "website");
            setMeta("twitter:title", meta.title);
            setMeta("twitter:description", meta.description);
            setCanonical(url);

            if (pathname === "/") {
                setJsonLd({
                    "@context": "https://schema.org",
                    "@type": "WebSite",
                    name: "PrivaTools",
                    url: BASE_URL,
                    description: meta.description,
                    potentialAction: {
                        "@type": "SearchAction",
                        target: `${BASE_URL}/?q={search_term_string}`,
                        "query-input": "required name=search_term_string",
                    },
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
    const isTwitter = name.startsWith("twitter:");
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
