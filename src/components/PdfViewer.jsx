import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, FileText, Loader2 } from "lucide-react";

// Embedded PDF viewer with its own toolbar. The document renders straight from
// the file URL the notes endpoint provides.
export default function PdfViewer({ url, fileName }) {
  const [loading, setLoading] = useState(true);

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-3 py-2">
        <FileText className="h-4 w-4 shrink-0 text-primary" />
        <p className="min-w-0 flex-1 truncate text-xs font-medium text-muted-foreground">{fileName}</p>
        <Button variant="ghost" size="sm" className="shrink-0 gap-1.5" asChild>
          <a href={url} target="_blank" rel="noreferrer">
            <ExternalLink className="h-3.5 w-3.5" />
            Open
          </a>
        </Button>
        <Button variant="ghost" size="sm" className="shrink-0 gap-1.5" asChild>
          <a href={url} download={fileName} target="_blank" rel="noreferrer">
            <Download className="h-3.5 w-3.5" />
            Download
          </a>
        </Button>
      </div>

      <div className="relative h-[65vh] min-h-[360px] w-full bg-muted/20">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p className="text-xs">Loading document…</p>
          </div>
        )}
        <iframe
          src={url}
          title={fileName}
          onLoad={() => setLoading(false)}
          className="h-full w-full"
        />
      </div>
    </div>
  );
}