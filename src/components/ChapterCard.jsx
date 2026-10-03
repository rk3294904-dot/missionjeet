import { Link } from "react-router-dom";
import { ChevronRight, FileText, Video, ClipboardList } from "lucide-react";

export default function ChapterCard({ chapter, batchId, subjectId }) {
  return (
    <Link
      to={`/batch/${batchId}/${subjectId}/${chapter._id}`}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <article className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all group-hover:border-primary/30 group-hover:bg-accent/40">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-heading text-sm font-semibold text-primary">
          {chapter.displayOrder || "•"}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-1 font-heading text-sm font-semibold text-foreground">
            {chapter.name}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {chapter.videos > 0 && (
              <span className="inline-flex items-center gap-1">
                <Video className="h-3 w-3" />
                {chapter.videos} videos
              </span>
            )}
            {chapter.notes > 0 && (
              <span className="inline-flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {chapter.notes} notes
              </span>
            )}
            {chapter.exercises > 0 && (
              <span className="inline-flex items-center gap-1">
                <ClipboardList className="h-3 w-3" />
                {chapter.exercises} DPPs
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </article>
    </Link>
  );
}