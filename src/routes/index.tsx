import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Edu-Leak — JEE & NEET Course Listing" },
      {
        name: "description",
        content:
          "Browse expert-crafted JEE and NEET courses on Edu-Leak. Search, filter and start learning today.",
      },
      { property: "og:title", content: "Edu-Leak — JEE & NEET Course Listing" },
      {
        property: "og:description",
        content:
          "Browse expert-crafted JEE and NEET courses on Edu-Leak. Search, filter and start learning today.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const API_BASE = "https://learnex.vercel.app";
const MJ_API = API_BASE + "/api/mj";
const COURSE_IDS = [151, 152, 184, 185];
const CATEGORY_MAP: Record<number, string> = { 151: "JEE", 152: "NEET", 184: "NEET", 185: "JEE" };

type Course = { id: number; data: Record<string, unknown>; cat: string };

function Index() {
  useEffect(() => {
    const grid = document.getElementById("courseGrid")!;
    const searchInput = document.getElementById("searchInput") as HTMLInputElement;
    const pills = Array.from(document.querySelectorAll<HTMLButtonElement>(".pill"));
    let allCourses: Course[] = [];
    let activeFilter = "ALL";
    let cancelled = false;
    const cleanups: Array<() => void> = [];

    const esc = (s: unknown) =>
      String(s ?? "").replace(
        /[&<>"']/g,
        (c) =>
          (({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }) as Record<
            string,
            string
          >)[c]!,
      );

    function showSkeletons() {
      grid.innerHTML = Array(4)
        .fill(
          `<div class="skeleton">
        <div class="skel-thumb"></div>
        <div class="skel-body">
          <div class="skel-line w40"></div>
          <div class="skel-line w80 h20"></div>
          <div class="skel-line w60"></div>
        </div>
        <div class="skel-footer"><div class="skel-line w40"></div></div>
      </div>`,
        )
        .join("");
    }

    function showError(msg: string) {
      grid.innerHTML = `
      <div class="error-state">
        <h3>Something went wrong</h3>
        <p>${esc(msg)}</p>
        <button class="btn-retry" id="retryBtn">Try Again</button>
      </div>`;
      document.getElementById("retryBtn")?.addEventListener("click", () => location.reload());
    }

    function showEmpty(query: string) {
      grid.innerHTML = `
      <div class="empty">
        <div class="empty-icon">&#128269;</div>
        <h3>No courses found</h3>
        <p>${query ? `No results for "${esc(query)}". Try a different search.` : "No courses available right now."}</p>
      </div>`;
    }

    function extractCourse(json: any) {
      try {
        if (!json?.success || !json.data) return null;
        const overview = json.data.find((d: any) => d.type === "overview");
        if (!overview?.data) return null;
        const details = overview.data.find((d: any) => d.layout_type === "details");
        if (!details?.layout_data?.[0]) return null;
        return details.layout_data[0];
      } catch {
        return null;
      }
    }

    function renderCard(c: any, cat: string, idx: number) {
      const isNew = c.is_new === 1 || c.is_new === true || c.is_new === "1";
      const isTrending = c.is_trending === 1 || c.is_trending === true || c.is_trending === "1";
      let badges = `<span class="badge badge-cat">${esc(cat)}</span>`;
      if (isNew) badges += `<span class="badge badge-new">New</span>`;
      if (isTrending) badges += `<span class="badge badge-trending">Trending</span>`;

      const thumb: string = c.thumbnail || "";
      const imgSrc = thumb
        ? thumb.startsWith("http")
          ? thumb
          : "https://d28jy6s33wbz0j.cloudfront.net/" + thumb.replace(/^\/+/, "")
        : "";
      const stripHtml = (s: string) => {
        const d = document.createElement("div");
        d.innerHTML = s || "";
        d.querySelectorAll("img,table,figure,iframe,style,script").forEach((el) => el.remove());
        return (d.textContent || "").replace(/\s+/g, " ").trim();
      };
      const desc =
        stripHtml(c.description) || "Comprehensive course material designed for exam success.";
      const title = c.title || "Untitled Course";
      const id = c.id || "";

      return `
      <div class="card" data-course-id="${esc(id)}" style="animation-delay:${idx * 0.1}s">
        <div class="card-thumb">
          ${imgSrc ? `<img src="${esc(imgSrc)}" alt="${esc(title)}" loading="lazy" onerror="this.style.display='none'">` : ""}
          <div class="overlay"></div>
          <div class="badge-row">${badges}</div>
        </div>
        <div class="card-body">
          <div class="card-cat">${esc(cat)}</div>
          <div class="card-title">${esc(title)}</div>
          <div class="card-desc">${esc(desc)}</div>
        </div>
        <div class="card-footer">
          <div class="cta">Explore Course <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></div>
        </div>
      </div>`;
    }

    function renderCards(courses: Course[]) {
      const q = searchInput.value.trim().toLowerCase();
      let filtered = courses;
      if (activeFilter !== "ALL") filtered = filtered.filter((c) => c.cat === activeFilter);
      if (q) {
        filtered = filtered.filter((c) => {
          const d = c.data as any;
          return (
            (d.title || "").toLowerCase().includes(q) ||
            (d.description || "").toLowerCase().includes(q) ||
            (c.cat || "").toLowerCase().includes(q)
          );
        });
      }
      if (!filtered.length) {
        showEmpty(q);
        return;
      }
      grid.innerHTML = filtered.map((c, i) => renderCard(c.data, c.cat, i)).join("");
      grid.querySelectorAll<HTMLElement>(".card").forEach((card, i) => {
        const t = setTimeout(() => card.classList.add("visible"), i * 80);
        cleanups.push(() => clearTimeout(t));
      });
    }

    const onGridClick = (e: Event) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>(".card[data-course-id]");
      if (card) window.location.href = `/course.html?course_id=${card.dataset['courseId']}`;
    };
    grid.addEventListener("click", onGridClick);
    cleanups.push(() => grid.removeEventListener("click", onGridClick));

    function updateStats() {
      document.getElementById("totalCourses")!.textContent = String(allCourses.length);
      document.getElementById("totalJEE")!.textContent = String(
        allCourses.filter((c) => c.cat === "JEE").length,
      );
      document.getElementById("totalNEET")!.textContent = String(
        allCourses.filter((c) => c.cat === "NEET").length,
      );
    }

    async function fetchCourse(id: number) {
      const url = `${MJ_API}?course_id=${id}&action=details`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }

    async function loadCourses() {
      showSkeletons();
      try {
        const results = await Promise.allSettled(COURSE_IDS.map((id) => fetchCourse(id)));
        if (cancelled) return;
        allCourses = [];
        results.forEach((r, i) => {
          if (r.status === "fulfilled") {
            const data = extractCourse(r.value);
            if (data)
              allCourses.push({
                id: COURSE_IDS[i]!,
                data,
                cat: CATEGORY_MAP[COURSE_IDS[i]!] || "ALL",
              });
          }
        });
        if (!allCourses.length) {
          showError("No course data could be loaded from the server.");
          return;
        }
        updateStats();
        renderCards(allCourses);
      } catch (e: any) {
        showError(e?.message || "Failed to connect to the server.");
      }
    }

    pills.forEach((pill) => {
      const handler = () => {
        pills.forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
        activeFilter = pill.dataset['filter'] || "ALL";
        renderCards(allCourses);
      };
      pill.addEventListener("click", handler);
      cleanups.push(() => pill.removeEventListener("click", handler));
    });

    let debounceTimer: ReturnType<typeof setTimeout>;
    const onInput = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => renderCards(allCourses), 200);
    };
    searchInput.addEventListener("input", onInput);
    cleanups.push(() => {
      clearTimeout(debounceTimer);
      searchInput.removeEventListener("input", onInput);
    });

    // Telegram popup
    const modal = document.getElementById("tgModal");
    const close = document.getElementById("tgClose");
    const join = document.getElementById("tgJoin");
    if (modal && close && sessionStorage.getItem("mj_tg_popup_shown") !== "1") {
      const openModal = () => {
        modal.classList.add("show");
        modal.setAttribute("aria-hidden", "false");
      };
      const closeModal = () => {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
        sessionStorage.setItem("mj_tg_popup_shown", "1");
      };
      const onOverlay = (e: Event) => {
        if (e.target === modal) closeModal();
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape" && modal.classList.contains("show")) closeModal();
      };
      const onJoin = () => sessionStorage.setItem("mj_tg_popup_shown", "1");
      close.addEventListener("click", closeModal);
      modal.addEventListener("click", onOverlay);
      join?.addEventListener("click", onJoin);
      document.addEventListener("keydown", onKey);
      const t = setTimeout(openModal, 1500);
      cleanups.push(() => {
        clearTimeout(t);
        close.removeEventListener("click", closeModal);
        modal.removeEventListener("click", onOverlay);
        join?.removeEventListener("click", onJoin);
        document.removeEventListener("keydown", onKey);
      });
    }

    loadCourses();

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      <div className="container">
        <header>
          <img className="site-logo" src="/eduleak-logo.jpg" alt="Edu-Leak logo" />
          <div className="logo-badge">
            <img src="/eduleak-logo.jpg" alt="Edu-Leak" />
            <span className="dot"></span>𝐄ᴅᴜ-𝐋ᴇᴀᴋ
          </div>
          <h1>
            <span>Crack</span> Your Exam
          </h1>
          <p>
            Expert-crafted courses for JEE &amp; NEET aspirants. Start your journey to success
            today.
          </p>
        </header>

        <div className="stats">
          <div className="stat">
            <div className="num" id="totalCourses">
              --
            </div>
            <div className="lbl">Courses</div>
          </div>
          <div className="stat">
            <div className="num" id="totalJEE">
              --
            </div>
            <div className="lbl">JEE</div>
          </div>
          <div className="stat">
            <div className="num" id="totalNEET">
              --
            </div>
            <div className="lbl">NEET</div>
          </div>
        </div>

        <div className="controls">
          <div className="search-wrap">
            <svg
              className="search-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" id="searchInput" placeholder="Search courses..." autoComplete="off" />
          </div>
          <div className="pills">
            <button className="pill active" data-filter="ALL">
              All Courses
            </button>
            <button className="pill" data-filter="JEE">
              JEE
            </button>
            <button className="pill" data-filter="NEET">
              NEET
            </button>
          </div>
        </div>

        <div className="grid" id="courseGrid"></div>
      </div>

      <div className="tg-modal-overlay" id="tgModal" aria-hidden="true">
        <div className="tg-modal" role="dialog" aria-modal="true" aria-labelledby="tgTitle">
          <button className="tg-close" id="tgClose" aria-label="Close">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
          <div className="tg-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.54l-1.99 1.93c-.23.23-.42.42-.83.42z" />
            </svg>
          </div>
          <h3 id="tgTitle">Join Our Telegram Channel</h3>
          <p>
            Get the latest exam updates, free study material, and daily tips directly on Telegram.
          </p>
          <a
            className="tg-btn"
            href="https://t.me/Eduleakk"
            target="_blank"
            rel="noopener noreferrer"
            id="tgJoin"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.54l-1.99 1.93c-.23.23-.42.42-.83.42z" />
            </svg>
            Join Telegram Channel
          </a>
          <div className="tg-note">You can join anytime via @Eduleakk</div>
        </div>
      </div>
    </>
  );
}
