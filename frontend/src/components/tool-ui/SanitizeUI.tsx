import { ShieldCheck } from "lucide-react";
import { SimpleProcessUI } from "./SimpleProcessUI";

export function SanitizeUI() {
    return (
        <SimpleProcessUI
            endpoint="/sanitize"
            accepts=".pdf"
            outputSuffix="sanitized"
            outputExt="pdf"
            dropIcon={ShieldCheck}
            dropTitle="Drop PDF to sanitize"
            dropSubtitle="Strips embedded scripts, hidden data, and malicious content"
            actionLabel="Sanitize PDF"
            processingLabel="Sanitizing…"
            doneTitle="Sanitized"
        />
    );
}
