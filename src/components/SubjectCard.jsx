import { Link } from "react-router-dom";
import { ChevronRight, BookOpen } from "lucide-react";

export default function SubjectCard({ subject, batchId }) {
  const teacher = subject.teacherIds?.[0];
  const teacherName = teacher
    ? `${teacher.firstName} ${teacher.lastName || ""}`.trim()
    : null;
  return (
    <Link
      to={`/batch/${batchId}/${subject._id}`}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <article className="flex h-full items-center gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all group-hover:border-primary/30 group-hover:bg-accent/40">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <BookOpen className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-1 font-heading text-sm font-semibold text-foreground">
            {subject.subject}
          </h3>
          {teacherName && (
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{teacherName}</p>
          )}
          {teacher?.qualification && (
            <p className="line-clamp-1 text-xs text-muted-foreground/80">{teacher.qualification}</p>
          )}
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </article>
    </Link>
  );
}