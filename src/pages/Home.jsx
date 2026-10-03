import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useApi } from "@/hooks/useApi";
import { fetchBatches } from "@/lib/api";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BatchCard from "@/components/BatchCard";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import { Input } from "@/components/ui/input";
import { Search, X, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 24;

export default function Home() {
  const { status, data: batches, error, reload } = useApi(() => fetchBatches(), []);
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // The header search lands here as ?q=… — keep the field in step with it.
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const filtered = useMemo(() => {
    if (!batches) return [];
    const q = query.trim().toLowerCase();
    if (!q) return batches;
    return batches.filter((b) =>
      [b.name, b.byName, b.language].some((f) => (f || "").toLowerCase().includes(q))
    );
  }, [batches, query]);

  // Reset visible window whenever the search changes.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader crumbs={[]} />
      <main>
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />
          <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 sm:py-16 lg:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
              <GraduationCap className="h-3.5 w-3.5 text-primary" />
              QPrep by Quantica Digital
            </span>
            <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Every batch, subject and lecture — in one clean place.
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              Search your batches, browse chapters, and stream lectures with notes and DPPs alongside.
            </p>

            <div className="relative mx-auto mt-6 max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search batches by name, faculty or language…"
                aria-label="Search batches"
                className="h-12 rounded-xl pl-11 pr-11 text-base shadow-sm"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground">All Batches</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {batches ? `${filtered.length} of ${batches.length} batches` : "Loading batches…"}
            </p>
          </div>

          {status === "loading" && <Loader kind="batch" />}
          {status === "error" && <ErrorState message={error} onRetry={reload} />}
          {status === "success" && filtered.length === 0 && (
            <EmptyState
              title="No batches found"
              message={
                query
                  ? "No batches match your search. Try a different keyword."
                  : "No batches are available right now."
              }
              onClear={query ? () => setQuery("") : undefined}
              actionLabel="Clear search"
            />
          )}
          {status === "success" && filtered.length > 0 && (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((b) => (
                  <BatchCard key={b._id} batch={b} />
                ))}
              </div>
              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <Button variant="outline" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
                    Load more
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}