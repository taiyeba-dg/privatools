import { Archive } from "lucide-react";
import { SimpleProcessUI } from "./SimpleProcessUI";

export function ExtractArchiveUI() {
    return (
        <SimpleProcessUI
            endpoint="/extract-archive"
            accepts=".zip,.tar,.tar.gz,.tgz,.tar.bz2,.tbz2,.tar.xz,.txz"
            outputSuffix="extracted"
            outputExt="zip"
            dropIcon={Archive}
            dropTitle="Drop archive to extract"
            dropSubtitle="ZIP · TAR · TAR.GZ · TAR.BZ2 · TAR.XZ"
            actionLabel="Extract archive"
            processingLabel="Extracting…"
            doneTitle="Extracted"
        />
    );
}
