import { useLocation, useNavigate, useParams } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import LecturePlayer from "@/components/player/LecturePlayer";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function Watch() {
  const { batchId, subjectId, lectureId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const lecture = state?.lecture?.data;
  const title = lecture?.topic || lecture?.videoDetails?.name || "Lecture";
  const isLive = lecture?.lectureType === "LIVE";
  const startTime = lecture?.startTime
    ? new Date(lecture.startTime).toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader crumbs={[{ label: "Batches", to: "/" }]} />
      <main className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="-ml-2 mb-2 text-muted-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        <LecturePlayer
          batchId={batchId}
          subjectId={subjectId}
          lectureId={lectureId}
          title={title}
        />

        <div className="mt-4">
          <h1 className="font-heading text-lg font-semibold leading-snug tracking-tight text-foreground sm:text-xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLive ? "Live class" : "Recorded lecture"}
            {startTime ? ` · ${startTime}` : ""}
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}