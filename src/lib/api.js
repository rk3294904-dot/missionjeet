// API layer — all network logic lives here, separate from UI components.
const BASE_URL = "https://devcoderz-backend.vercel.app/api";

// Lightweight in-memory cache for batch details (used across multiple pages
// for breadcrumbs + subject lookup). Keyed by batchId.
const detailsCache = new Map();

async function request(path, params) {
  const url = new URL(BASE_URL + path);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
    });
  }
  let body;
  try {
    const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
    body = await res.json();
    if (!res.ok || body?.success === false) {
      throw new Error(body?.message || `Request failed (${res.status})`);
    }
    return body;
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw new Error("The server returned an invalid response. Please try again.");
    }
    throw e;
  }
}

export async function fetchBatches() {
  const data = await request("/batches");
  return data.batches || [];
}

export async function fetchBatchDetails(batchId) {
  if (detailsCache.has(batchId)) return detailsCache.get(batchId);
  const promise = request("/details", { batch_id: batchId })
    .then((d) => d.data)
    .catch((e) => {
      detailsCache.delete(batchId);
      throw e;
    });
  detailsCache.set(batchId, promise);
  return promise;
}

export async function fetchChapters(batchId, subjectId) {
  const data = await request("/chapters", { batchId, subjectId });
  return data.data || [];
}

export async function fetchContent(batchId, subjectId, contentType, tag, page = 1) {
  const data = await request("/lectures", {
    batchSlug: batchId,
    subjectSlug: subjectId,
    contentType,
    tag,
    page,
  });
  return data.data || [];
}

// Resolves a note attachment to a viewable file URL. The lectures endpoint
// returns a baseUrl + key pair; when the key is empty there is no file to show.
export function attachmentUrl(attachment) {
  if (!attachment) return null;
  const direct = attachment.url || attachment.fileUrl || attachment.file_url;
  if (direct) return direct;
  if (attachment.baseUrl && attachment.key) return attachment.baseUrl + attachment.key;
  return null;
}

// Notes are nested inside a lecture record's homeworkIds — flatten them so the
// viewer can work with one note per entry.
export async function fetchNotes(batchId, subjectId, tag, contentType = CONTENT_TYPES.NOTES) {
  const data = await fetchContent(batchId, subjectId, contentType, tag, 1);
  return data.flatMap((item) => item.data?.homeworkIds || []);
}

// Content type enum used by the lectures endpoint.
export const CONTENT_TYPES = {
  VIDEOS: "LECTURES",
  NOTES: "NOTES",
  DPP_NOTES: "DPP_PDF",
  DPP_VIDEOS: "DPP_VIDEOS",
};

// Lecture streaming lives on the platform's own player API. It returns a signed
// DASH manifest plus the ClearKey needed to decrypt that stream.
const PLAYER_API = "https://player.examcrushers.in/api/videox";
const PLAYER_KEY = "Vinyl";

export async function fetchLectureStream(batchId, lectureId, subjectId) {
  const url = new URL(PLAYER_API);
  url.searchParams.set("batchId", batchId);
  url.searchParams.set("lectureId", lectureId);
  url.searchParams.set("subjectId", subjectId);
  url.searchParams.set("key", PLAYER_KEY);

  const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
  const body = await res.json().catch(() => null);

  if (!res.ok || !body || body.success === false) {
    throw new Error(body?.error || "This lecture could not be loaded.");
  }

  const manifestUrl = body.url || body.dashurl;
  if (!manifestUrl) throw new Error("This lecture has no playable stream.");

  return { manifestUrl, keys: body.keys || null };
}