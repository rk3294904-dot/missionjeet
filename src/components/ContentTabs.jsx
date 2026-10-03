import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchContent } from "@/lib/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import VideoCard from "./VideoCard";
import NoteCard from "./NoteCard";
import Loader from "./Loader";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";

const TABS = [
  { key: "LECTURES", label: "Videos", kind: "video" },
  { key: "NOTES", label: "Notes", kind: "note" },
  { key: "DPP_PDF", label: "DPP Notes", kind: "note" },
  { key: "DPP_VIDEOS", label: "DPP Videos", kind: "video" },
];

function ContentPanel({ batchId, subjectId, tag, contentType, kind }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | more | success | error
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const navigate = useNavigate();

  const load = useCallback(
    async (nextPage, append) => {
      setStatus(append ? "more" : "loading");
      try {
        const data = await fetchContent(batchId, subjectId, contentType, tag, nextPage);
        setItems((prev) => (append ? [...prev, ...data] : data));
        setHasMore(data.length > 0);
        setStatus("success");
      } catch {
        setStatus("error");
      }
    },
    [batchId, subjectId, contentType, tag]
  );

  useEffect(() => {
    load(1, false);
  }, [load]);

  if (status === "loading") return <Loader kind={kind === "video" ? "video" : "note"} />;
  if (status === "error") return <ErrorState onRetry={() => load(1, false)} />;

  let cards = [];
  if (kind === "video") {
    cards = items.map((it) => (
      <VideoCard
        key={it._id}
        item={it}
        onPlay={() =>
          navigate(`/watch/${batchId}/${subjectId}/${it._id}`, { state: { lecture: it } })
        }
      />
    ));
  } else {
    cards = items.flatMap((it) =>
      (it.data?.homeworkIds || []).map((hw) => (
        <NoteCard
          key={hw._id}
          note={hw}
          onOpen={() =>
            navigate(
              `/notes/${batchId}/${subjectId}/${hw._id}?tag=${tag}&type=${contentType}`,
              { state: { note: hw } }
            )
          }
        />
      ))
    );
  }

  if (cards.length === 0) {
    return (
      <EmptyState
        title="No content found"
        message="There's no content in this category for this chapter yet."
      />
    );
  }

  return (
    <div>
      <div
        className={
          kind === "video"
            ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            : "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        }
      >
        {cards}
      </div>
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            onClick={() => {
              const p = page + 1;
              setPage(p);
              load(p, true);
            }}
            disabled={status === "more"}
          >
            {status === "more" ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ContentTabs({ batchId, subjectId, tag }) {
  const [active, setActive] = useState("LECTURES");
  return (
    <Tabs value={active} onValueChange={setActive} className="w-full">
      <TabsList className="h-auto flex-wrap justify-start rounded-xl bg-muted/60 p-1">
        {TABS.map((t) => (
          <TabsTrigger
            key={t.key}
            value={t.key}
            className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-background data-[state=active]:text-primary"
          >
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {TABS.map((t) => (
        <TabsContent key={t.key} value={t.key} className="mt-6">
          <ContentPanel
            batchId={batchId}
            subjectId={subjectId}
            tag={tag}
            contentType={t.key}
            kind={t.kind}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}