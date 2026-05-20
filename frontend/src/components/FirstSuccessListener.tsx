/**
 * FirstSuccessListener — mounted once at App scope, listens for the
 * "privatools:tool-success" event and fires the one-time celebration via
 * `useFirstSuccess`.
 *
 * Tool UIs that don't want to import the hook directly can call
 * `emitToolSuccess()` from `@/hooks/useFirstSuccess`. Both routes go
 * through the same gate so the toast fires at most once per browser.
 */
import { useEffect } from "react";
import { TOOL_SUCCESS_EVENT, useFirstSuccess } from "@/hooks/useFirstSuccess";

export function FirstSuccessListener() {
    const { celebrate } = useFirstSuccess();

    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent<{ tool?: string }>).detail;
            celebrate(detail?.tool);
        };
        window.addEventListener(TOOL_SUCCESS_EVENT, handler);
        return () => window.removeEventListener(TOOL_SUCCESS_EVENT, handler);
    }, [celebrate]);

    return null;
}
