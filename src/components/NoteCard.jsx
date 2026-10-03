import { FileText, ArrowUpRight } from "lucide-react";

export default function NoteCard({ note, onOpen }) {
  const fileName = note?.attachmentIds?.[0]?.name || "Document.pdf";
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex h-full w-full flex-col rounded-xl border border-border/60 bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 font-heading text-sm font-medium leading-snug text-foreground">
            {note?.topic}
          </h3>
          {note?.note && (
            <span className="mt-1.5 inline-block rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">
              {note.note}
            </span>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="truncate">{fileName}</span>
        <span className="ml-auto inline-flex shrink-0 items-center gap-1 font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          Open <ArrowUpRight className="h-3 w-3" />
        </span>
      </div>
    </button>
  );
}