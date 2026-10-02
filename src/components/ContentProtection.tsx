import { useEffect } from "react";

/**
 * Client-side content protection: blocks right-click, text selection,
 * copy/cut, image drag, and common devtools / view-source shortcuts.
 * Note: this is a deterrent, not absolute security.
 */
export function ContentProtection() {
  useEffect(() => {
    const stop = (e: Event) => {
      e.preventDefault();
      return false;
    };

    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const blockedCtrl = ["u", "s", "c", "x", "a", "p"];
      if (e.key === "F12") return stop(e);
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ["i", "j", "c"].includes(k)) return stop(e);
      if ((e.ctrlKey || e.metaKey) && blockedCtrl.includes(k)) return stop(e);
      return undefined;
    };

    document.addEventListener("contextmenu", stop);
    document.addEventListener("copy", stop);
    document.addEventListener("cut", stop);
    document.addEventListener("dragstart", stop);
    document.addEventListener("selectstart", stop);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("contextmenu", stop);
      document.removeEventListener("copy", stop);
      document.removeEventListener("cut", stop);
      document.removeEventListener("dragstart", stop);
      document.removeEventListener("selectstart", stop);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return null;
}
