import { useApi } from "@/hooks/useApi";
import { fetchBatchDetails, fetchChapters } from "@/lib/api";
import { useParams } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ContentTabs from "@/components/ContentTabs";
import Loader from "@/components/Loader";
import ErrorState from "@/components/ErrorState";

export default function ChapterPage() {
  const { batchId, subjectId, chapterId } = useParams();
  const details = useApi(() => fetchBatchDetails(batchId), [batchId]);
  const chapters = useApi(() => fetchChapters(batchId, subjectId), [batchId, subjectId]);

  const batchName = details.data?.name;
  const subject = details.data?.subjects?.find((s) => s._id === subjectId);
  const subjectName = subject?.subject;
  const chapter = chapters.data?.find((c) => c._id === chapterId);
  const chapterName = chapter?.name;

  const crumbs = [
    { label: "Batches", to: "/" },
    ...(batchName ? [{ label: batchName, to: `/batch/${batchId}` }] : []),
    ...(subjectName ? [{ label: subjectName, to: `/batch/${batchId}/${subjectId}` }] : []),
    { label: chapterName || "Chapter" },
  ];

  const ready = details.status === "success" && chapters.status === "success";
  const isError = details.status === "error" || chapters.status === "error";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader crumbs={crumbs} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            {chapterName || "Chapter"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse videos, notes and DPPs for this chapter.
          </p>
        </div>

        {isError && (
          <ErrorState
            message={chapters.error || details.error}
            onRetry={() => {
              details.reload();
              chapters.reload();
            }}
          />
        )}
        {!ready && !isError && <Loader kind="list" />}
        {ready && <ContentTabs batchId={batchId} subjectId={subjectId} tag={chapterId} />}
      </main>
      <SiteFooter />
    </div>
  );
}