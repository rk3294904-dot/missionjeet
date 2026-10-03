import { useCallback, useEffect, useRef, useState } from "react";
import { fetchLectureStream } from "@/lib/api";
import { buildClearKeyMap } from "@/lib/clearkey";

const CLEARKEY_SYSTEM_ID = "1077efec-c0b2-4d02-ace3-3c1e52e2fb4b";

/**
 * Owns the DASH streaming engine: signed manifest, ClearKey decryption,
 * signed segment requests and the quality ladder. Playback UI lives elsewhere.
 */
export default function useDashPlayer({ batchId, subjectId, lectureId }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState("");
  const [levels, setLevels] = useState([]);
  const [level, setLevel] = useState(-1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !lectureId) return;

    let player = null;
    let cancelled = false;

    setStatus("loading");
    setError("");
    setLevels([]);
    setLevel(-1);

    (async () => {
      try {
        const { manifestUrl, keys } = await fetchLectureStream(batchId, lectureId, subjectId);
        if (cancelled) return;

        // Loaded on demand so the streaming engine stays out of the main bundle.
        const dashjsModule = await import("dashjs");
        const dashjs = dashjsModule.default || dashjsModule;
        if (cancelled) return;

        player = dashjs.MediaPlayer().create();
        playerRef.current = player;

        player.updateSettings({
          streaming: {
            buffer: { fastSwitchEnabled: true, bufferTimeDefault: 12 },
            abr: { autoSwitchBitrate: { video: true, audio: true } },
            retryAttempts: { MPD: 3, MediaSegment: 4, InitializationSegment: 4 },
          },
        });

        const clearKeys = buildClearKeyMap(keys);
        if (clearKeys) {
          const protection = { clearkeys: clearKeys };
          player.setProtectionData({
            "org.w3.clearkey": protection,
            [CLEARKEY_SYSTEM_ID]: protection,
          });
        }

        // The signature authorises the whole stream path, not just the manifest,
        // so it has to tag along on every segment request too.
        const signature = new URL(manifestUrl).search.replace(/^\?/, "");
        if (signature) {
          player.addRequestInterceptor((request) => {
            if (
              request &&
              typeof request.url === "string" &&
              !request.url.includes("Signature=") &&
              !request.url.includes("Policy=")
            ) {
              const separator = request.url.includes("?") ? "&" : "?";
              request.url = `${request.url}${separator}${signature}`;
            }
            return request;
          });
        }

        player.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, () => {
          if (cancelled) return;
          try {
            const tracks = player.getTracksFor("audio");
            if (tracks && tracks.length) player.setCurrentTrack(tracks[0]);
          } catch {
            // Audio track selection is best-effort.
          }
          try {
            const reps = player.getRepresentationsByType("video") || [];
            const options = [{ index: -1, label: "Auto" }];
            reps.forEach((rep, i) => {
              options.push({
                index: i,
                label: rep.height
                  ? `${rep.height}p`
                  : `${Math.round((rep.bandwidth || 0) / 1000)} kbps`,
              });
            });
            setLevels(options);
          } catch {
            // Quality list is optional.
          }
          setStatus("ready");
        });

        player.on(dashjs.MediaPlayer.events.ERROR, () => {
          if (cancelled) return;
          setStatus("error");
          setError("This lecture could not be played.");
        });

        player.initialize(video, manifestUrl, true);
      } catch (e) {
        if (cancelled) return;
        setStatus("error");
        setError(e?.message || "This lecture could not be played.");
      }
    })();

    return () => {
      cancelled = true;
      if (player) {
        player.reset();
        player = null;
      }
      playerRef.current = null;
    };
  }, [batchId, subjectId, lectureId]);

  const selectLevel = useCallback((index) => {
    const player = playerRef.current;
    setLevel(index);
    if (!player) return;
    try {
      player.updateSettings({
        streaming: { abr: { autoSwitchBitrate: { video: index === -1 } } },
      });
      if (index !== -1) player.setQualityFor("video", index);
    } catch {
      // Switching quality is best-effort.
    }
  }, []);

  return { videoRef, status, error, levels, level, selectLevel };
}