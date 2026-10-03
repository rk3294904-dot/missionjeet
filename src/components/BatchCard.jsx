import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { Calendar, Languages, BookOpen } from "lucide-react";

export default function BatchCard({ batch }) {
  const { _id, name, byName, previewImage, language, startDate, type } = batch;
  return (
    <Link to={`/batch/${_id}`} className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:shadow-lg group-hover:shadow-primary/5">
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {previewImage ? (
            <Image
              src={previewImage}
              alt={name}
              fittingType="fill"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <BookOpen className="h-10 w-10 text-primary/40" />
            </div>
          )}
          {type && (
            <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur">
              {type === "E_BATCH" ? "Live Batch" : "Regular"}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="line-clamp-2 font-heading text-base font-semibold leading-snug text-foreground">
            {name}
          </h3>
          {byName && <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{byName}</p>}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {language && (
              <span className="inline-flex items-center gap-1.5">
                <Languages className="h-3.5 w-3.5 text-primary" />
                {language}
              </span>
            )}
            {startDate && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                {startDate}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}