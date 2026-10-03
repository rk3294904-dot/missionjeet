import { Image } from "@/components/ui/image";
import { PlayCircle, Clock, Radio } from "lucide-react";

export default function VideoCard({ item, onPlay }) {
  const d = item?.data || {};
  const video = d.videoDetails || {};
  const thumb = video.image || d.previewImageUrl;
  const duration = video.duration;
  const isLive = d.lectureType === "LIVE";
  const title = d.topic || video.name || "Lecture";
  const date = d.startTime
    ? new Date(d.startTime).toLocaleDateString(undefined, { day: "numeric", month: "short" })
    : null;

  return (
    <button
      type="button"
      onClick={onPlay}
      className="group block w-full cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-card text-left transition-all hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {thumb ? (
          <Image
            src={thumb}
            alt={title}
            fittingType="fill"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <PlayCircle className="h-10 w-10 text-primary/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <PlayCircle className="absolute bottom-3 left-3 h-9 w-9 text-white drop-shadow-lg transition-transform group-hover:scale-110" />
        {duration && (
          <span className="absolute bottom-3 right-3 rounded bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
            {duration}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 font-heading text-sm font-medium leading-snug text-foreground">
          {title}
        </h3>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          {isLive ? <Radio className="h-3 w-3 text-primary" /> : <Clock className="h-3 w-3" />}
          <span>{isLive ? "Live class" : "Recorded"}</span>
          {date && <span className="text-muted-foreground/70">· {date}</span>}
        </div>
      </div>
    </button>
  );
}