import { useRef } from "react";
import { Loader2 } from "lucide-react";
import useDashPlayer from "@/hooks/useDashPlayer";
import PlayerControls from "./PlayerControls";

export default function LecturePlayer({ batchId, subjectId, lectureId, title }) {
  const containerRef = useRef(null);
  const { videoRef, status, error, levels, level, selectLevel } = useDashPlayer({
    batchId,
    subjectId,
    lectureId,
  });

  return (
    <div
      ref={containerRef}
      className="group relative aspect-video w-full overflow-hidden rounded-xl bg-black [&:fullscreen]:aspect-auto [&:fullscreen]:h-full [&:fullscreen]:rounded-none"
    >
      <video ref={videoRef} className="h-full w-full object-contain" playsInline />

      {status !== "error" && (
        <PlayerControls
          videoRef={videoRef}
          containerRef={containerRef}
          title={title}
          status={status}
          levels={levels}
          level={level}
          onSelectLevel={selectLevel}
        />
      )}

      {status === "loading" && (
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/60">
          <Loader2 className="h-9 w-9 animate-spin text-white/90" />
          <p className="text-xs text-white/70">Preparing your lecture…</p>
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/85 px-6 text-center">
          <p className="text-sm text-white/80">{error}</p>
        </div>
      )}
    </div>
  );
}