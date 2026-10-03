import { useApi } from "@/hooks/useApi";
import { fetchBatchDetails, fetchChapters } from "@/lib/api";
import { useParams } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ChapterCard from "@/components/ChapterCard";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";

export default function SubjectPage() {
  const { batchId, subjectId } = useParams();
  const details = useApi(() => fetchBatchDetails(batchId), [batchId]);
  const chapters = useApi(() => fetchChapters(batchId, subjectId), [batchId, subjectId]);

  const batchName = details.data?.name;
  const subject = details.data?.subjects?.find((s) => s._id === subjectId);
  const subjectName = subject?.subject;
  const teacher = subject?.teacherIds?.[0];

  const crumbs = [
    { label: "Batches", to: "/" },
    ...(batchName ? [{ label: batchName, to: `/batch/${batchId}` }] : []),
    ...(subjectName ? [{ label: subjectName }] : []),
  ];

  const isLoading = details.status === "loading" || chapters.status === "loading";
  const isError = details.status === "error" || chapters.status === "error";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader crumbs={crumbs} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            {subjectName || "Subject"}
          </h1>
          {teacher && (
            <p className="mt-1 text-sm text-muted-foreground">
              {teacher.firstName} {teacher.lastName || ""}
            </p>
          )}
        </div>

        {isLoading && <Loader kind="list" />}
        {isError && (
          <ErrorState
            message={chapters.error || details.error}
            onRetry={() => {
              details.reload();
              chapters.reload();
            }}
          />
        )}
        {!isLoading && !isError && (
          chapters.data?.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {chapters.data.map((c) => (
                <ChapterCard key={c._id} chapter={c} batchId={batchId} subjectId={subjectId} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No chapters found"
              message="This subject doesn't have any chapters or topics listed yet."
            />
          )
        )}
      </main>
      <SiteFooter />
    </div>
  );
}