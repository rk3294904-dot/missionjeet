import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  RotateCcw,
  RotateCw,
  Settings,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const BTN =
  "inline-flex h-8 w-8 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70";

const SEEK_THUMB =
  "[&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary";

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return `${h > 0 ? `${h}:` : ""}${mm}:${String(s).padStart(2, "0")}`;
}

export default function PlayerControls({
  videoRef,
  containerRef,
  title,
  status,
  levels = [],
  level = -1,
  onSelectLevel,
}) {
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [menu, setMenu] = useState(null); // null | "speed" | "quality"
  const [active, setActive] = useState(true);

  const hideTimer = useRef(null);
  const clickTimer = useRef(null);

  // Keep the UI in step with the media element.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const syncTime = () => {
      setTime(video.currentTime || 0);
      try {
        setBuffered(video.buffered.length ? video.buffered.end(video.buffered.length - 1) : 0);
      } catch {
        setBuffered(0);
      }
    };
    const syncDuration = () => setDuration(video.duration || 0);
    const syncPlay = () => setPlaying(!video.paused);
    const syncVolume = () => {
      setVolume(video.volume);
      setMuted(video.muted);
    };
    const syncRate = () => setRate(video.playbackRate);

    video.addEventListener("timeupdate", syncTime);
    video.addEventListener("progress", syncTime);
    video.addEventListener("durationchange", syncDuration);
    video.addEventListener("loadedmetadata", syncDuration);
    video.addEventListener("play", syncPlay);
    video.addEventListener("pause", syncPlay);
    video.addEventListener("volumechange", syncVolume);
    video.addEventListener("ratechange", syncRate);
    syncDuration();
    syncVolume();

    return () => {
      video.removeEventListener("timeupdate", syncTime);
      video.removeEventListener("progress", syncTime);
      video.removeEventListener("durationchange", syncDuration);
      video.removeEventListener("loadedmetadata", syncDuration);
      video.removeEventListener("play", syncPlay);
      video.removeEventListener("pause", syncPlay);
      video.removeEventListener("volumechange", syncVolume);
      video.removeEventListener("ratechange", syncRate);
    };
  }, [videoRef]);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // Controls fade away while playback runs.
  const wake = useCallback(() => {
    setActive(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setActive(false), 3000);
  }, []);

  useEffect(() => {
    wake();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (clickTimer.current) clearTimeout(clickTimer.current);
    };
  }, [wake]);

  useEffect(() => {
    if (playing) return;
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setActive(true);
  }, [playing]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
    wake();
  }, [videoRef, wake]);

  const seekBy = (delta) => {
    const video = videoRef.current;
    if (!video) return;
    const max = video.duration || Number.MAX_SAFE_INTEGER;
    video.currentTime = Math.max(0, Math.min((video.currentTime || 0) + delta, max));
    wake();
  };

  const toggleFullscreen = useCallback(() => {
    const element = containerRef?.current;
    if (!element) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else element.requestFullscreen?.();
    wake();
  }, [containerRef, wake]);

  // A double-tap means fullscreen, so hold the single click briefly.
  const handleSurfaceClick = () => {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      return;
    }
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null;
      togglePlay();
    }, 220);
  };

  const handleSurfaceDoubleClick = () => {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
    toggleFullscreen();
  };

  // Keyboard shortcuts, as long as the user isn't typing somewhere.
  useEffect(() => {
    const onKeyDown = (e) => {
      const video = videoRef.current;
      if (!video) return;
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target?.isContentEditable) return;

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          e.preventDefault();
          seekBy(10);
          break;
        case "ArrowLeft":
          e.preventDefault();
          seekBy(-10);
          break;
        case "ArrowUp":
          e.preventDefault();
          video.volume = Math.min(1, video.volume + 0.1);
          break;
        case "ArrowDown":
          e.preventDefault();
          video.volume = Math.max(0, video.volume - 0.1);
          break;
        case "m":
          video.muted = !video.muted;
          break;
        case "f":
          toggleFullscreen();
          break;
        default:
          break;
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [videoRef, togglePlay, toggleFullscreen]);

  const onSeekInput = (e) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    video.currentTime = (Number(e.target.value) / 100) * video.duration;
    wake();
  };

  const onVolumeInput = (e) => {
    const video = videoRef.current;
    if (!video) return;
    const next = Number(e.target.value) / 100;
    video.volume = next;
    video.muted = next === 0;
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    if (!video.muted && video.volume === 0) video.volume = 1;
  };

  const changeRate = (value) => {
    const video = videoRef.current;
    if (video) video.playbackRate = value;
    setMenu(null);
  };

  const togglePip = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await video.requestPictureInPicture();
    } catch {
      // Picture-in-picture is not available in every browser.
    }
  };

  const playedPct = duration ? Math.min(100, (time / duration) * 100) : 0;
  const bufferedPct = duration ? Math.min(100, (buffered / duration) * 100) : 0;
  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  const menuItems =
    menu === "speed"
      ? SPEEDS.map((s) => ({ key: String(s), label: `${s}x`, selected: s === rate, run: () => changeRate(s) }))
      : levels.map((l) => ({ key: String(l.index), label: l.label, selected: l.index === level, run: () => { onSelectLevel?.(l.index); setMenu(null); } }));

  return (
    <>
      <div
        className="absolute inset-0 z-10"
        onClick={handleSurfaceClick}
        onDoubleClick={handleSurfaceDoubleClick}
        onMouseMove={wake}
        onTouchStart={wake}
      />

      {title && (
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/80 to-transparent px-4 pb-10 pt-3 transition-opacity",
            active ? "opacity-100" : "opacity-0"
          )}
        >
          <p className="line-clamp-1 text-sm font-medium text-white">{title}</p>
        </div>
      )}

      {status === "ready" && !playing && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
            <Play className="ml-1 h-7 w-7" />
          </span>
        </div>
      )}

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-2 pb-1.5 pt-12 transition-opacity duration-200 sm:px-3",
          active ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <div className="relative flex h-5 items-center">
          <div className="absolute inset-x-0 h-1 overflow-hidden rounded-full bg-white/25">
            <div className="h-full bg-white/40" style={{ width: `${bufferedPct}%` }} />
            <div className="absolute inset-y-0 left-0 bg-primary" style={{ width: `${playedPct}%` }} />
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={playedPct}
            onChange={onSeekInput}
            aria-label="Seek"
            className={cn(
              "absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent focus-visible:outline-none",
              SEEK_THUMB
            )}
          />
        </div>

        <div className="mt-1 flex items-center gap-1 text-white">
          <button type="button" onClick={togglePlay} className={BTN} aria-label={playing ? "Pause" : "Play"}>
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={() => seekBy(-10)}
            className={cn(BTN, "hidden sm:inline-flex")}
            aria-label="Back 10 seconds"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => seekBy(10)}
            className={cn(BTN, "hidden sm:inline-flex")}
            aria-label="Forward 10 seconds"
          >
            <RotateCw className="h-4 w-4" />
          </button>
          <span className="ml-1 text-xs tabular-nums text-white/90">
            {formatTime(time)} / {formatTime(duration)}
          </span>

          <div className="relative ml-auto flex items-center gap-1">
            <button type="button" onClick={toggleMute} className={BTN} aria-label={muted ? "Unmute" : "Mute"}>
              <VolumeIcon className="h-4 w-4" />
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={muted ? 0 : Math.round(volume * 100)}
              onChange={onVolumeInput}
              aria-label="Volume"
              className="ml-1 hidden h-1 w-20 cursor-pointer accent-white sm:block"
            />

            <button
              type="button"
              onClick={() => setMenu(menu === "speed" ? null : "speed")}
              className={cn(BTN, "w-auto px-2 text-xs font-semibold")}
              aria-label="Playback speed"
            >
              {rate}x
            </button>

            {levels.length > 1 && (
              <button
                type="button"
                onClick={() => setMenu(menu === "quality" ? null : "quality")}
                className={BTN}
                aria-label="Video quality"
              >
                <Settings className="h-4 w-4" />
              </button>
            )}

            <button
              type="button"
              onClick={togglePip}
              className={cn(BTN, "hidden sm:inline-flex")}
              aria-label="Picture in picture"
            >
              <PictureInPicture2 className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className={BTN}
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </button>

            {menu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenu(null)} />
                <div className="absolute bottom-full right-0 z-20 mb-2 w-32 overflow-hidden rounded-lg border border-white/10 bg-black/90 p-1 backdrop-blur">
                  {menuItems.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={item.run}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-xs text-white/85 transition-colors hover:bg-white/15",
                        item.selected && "text-white"
                      )}
                    >
                      <span>{item.label}</span>
                      {item.selected && <Check className="h-3.5 w-3.5 text-primary" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}