import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { tools } from "@/data/tools";
import { nonPdfTools } from "@/data/non-pdf-tools";

type ToolMeta = { name: string; description: string; longDescription?: string };

const toolMap: Record<string, ToolMeta> = {};
tools.forEach(t => { toolMap[`/tool/${t.slug}`] = t; });
nonPdfTools.forEach(t => { toolMap[`/tools/${t.slug}`] = t; });

const pageTitles: Record<string, string> = {
    "/": "PrivaTools — Privacy-First File Tools",
    "/about": "About — PrivaTools",
    "/batch": "Batch Process — PrivaTools",
    "/pipeline": "PDF Pipeline — PrivaTools",
};

/**
 * Updates <title> and <meta> tags on every route change.
 */
export function DynamicHead() {
    const { pathname } = useLocation();

    useEffect(() => {
        const tool = toolMap[pathname];

        if (tool) {
            document.title = `${tool.name} — PrivaTools`;
            setMeta("description", tool.longDescription || tool.description);
            setMeta("og:title", `${tool.name} — Free, Private, Open Source`);
            setMeta("og:description", tool.description);
        } else {
            const title = pageTitles[pathname] || "PrivaTools — Privacy-First File Tools";
            document.title = title;
            setMeta("description", "90+ free, open-source file tools — PDF, image, video, and developer utilities. All processing happens locally. Zero uploads, zero tracking.");
            setMeta("og:title", title);
            setMeta("og:description", "90+ free, privacy-first file tools. Zero uploads, zero tracking.");
        }
    }, [pathname]);

    return null;
}

function setMeta(name: string, content: string) {
    const isOg = name.startsWith("og:");
    const selector = isOg ? `meta[property="${name}"]` : `meta[name="${name}"]`;
    let el = document.querySelector(selector) as HTMLMetaElement | null;
    if (!el) {
        el = document.createElement("meta");
        if (isOg) el.setAttribute("property", name);
        else el.setAttribute("name", name);
        document.head.appendChild(el);
    }
    el.setAttribute("content", content);
}
