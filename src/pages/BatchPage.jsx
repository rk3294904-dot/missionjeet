import { useApi } from "@/hooks/useApi";
import { fetchBatchDetails } from "@/lib/api";
import { useParams } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SubjectCard from "@/components/SubjectCard";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import { Image } from "@/components/ui/image";
import { Calendar, Languages, BookOpen, Layers } from "lucide-react";

function batchImage(data) {
  if (data?.previewImage?.baseUrl && data?.previewImage?.key) {
    return data.previewImage.baseUrl + data.previewImage.key;
  }
  if (data?.previewImageUrl && /^https?:\/\//.test(data.previewImageUrl)) {
    return data.previewImageUrl;
  }
  return null;
}

export default function BatchPage() {
  const { batchId } = useParams();
  const { status, data, error, reload } = useApi(() => fetchBatchDetails(batchId), [batchId]);

  const crumbs = data
    ? [{ label: "Batches", to: "/" }, { label: data.name }]
    : [{ label: "Batches", to: "/" }];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader crumbs={crumbs} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {status === "loading" && <Loader kind="list" />}
        {status === "error" && <ErrorState message={error} onRetry={reload} />}
        {status === "success" && data && (
          <>
            <section className="overflow-hidden rounded-2xl border border-border/60 bg-card">
              <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
                <div className="h-40 w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:h-32 sm:w-48">
                  {batchImage(data) ? (
                    <Image
                      src={batchImage(data)}
                      alt={data.name}
                      fittingType="fill"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                      <BookOpen className="h-10 w-10 text-primary/40" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    {data.name}
                  </h1>
                  {data.byName && <p className="mt-1 text-sm text-muted-foreground">{data.byName}</p>}
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    {data.language && (
                      <span className="inline-flex items-center gap-1.5">
                        <Languages className="h-4 w-4 text-primary" />
                        {data.language}
                      </span>
                    )}
                    {data.startDate && (
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-primary" />
                        {new Date(data.startDate).toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                    {data.subjects?.length > 0 && (
                      <span className="inline-flex items-center gap-1.5">
                        <Layers className="h-4 w-4 text-primary" />
                        {data.subjects.length} subjects
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-10">
              <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground">Subjects</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Select a subject to view its chapters and content.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {data.subjects?.length > 0 ? (
                  data.subjects.map((s) => <SubjectCard key={s._id} subject={s} batchId={batchId} />)
                ) : (
                  <EmptyState
                    title="No subjects available"
                    message="This batch doesn't have any subjects listed yet."
                  />
                )}
              </div>
            </section>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}