import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { attachmentUrl, fetchNotes } from "@/lib/api";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PdfViewer from "@/components/PdfViewer";
import Loader from "@/components/Loader";
import ErrorState from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { ChevronLeft, FileText, Info } from "lucide-react";

export default function NoteViewer() {
  const { batchId, subjectId, noteId } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // tag = chapter id, type = NOTES | DPP_PDF (both required by the endpoint).
  const tag = searchParams.get("tag");
  const type = searchParams.get("type") || "NOTES";
  const passedNote = location.state?.note;

  const [note, setNote] = useState(passedNote || null);
  const [status, setStatus] = useState(passedNote ? "success" : "loading");
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (passedNote) return;
    if (!tag) {
      setStatus("notfound");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    setError(null);
    fetchNotes(batchId, subjectId, tag, type)
      .then((notes) => {
        if (cancelled) return;
        const found = notes.find((n) => n._id === noteId) || null;
        setNote(found);
        setStatus(found ? "success" : "notfound");
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e?.message || "Something went wrong");
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [batchId, subjectId, noteId, tag, type, passedNote, reloadKey]);

  const attachment = note?.attachmentIds?.[0];
  const fileName = attachment?.name || "Document.pdf";
  const created = attachment?.createdAt;
  const pdfUrl = attachmentUrl(attachment);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader crumbs={[{ label: "Batches", to: "/" }]} />
      <main className="mx-auto max-w-4xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="-ml-2 mb-3 text-muted-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        {status === "loading" && <Loader kind="list" />}

        {status === "error" && (
          <ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} />
        )}

        {status === "notfound" && (
          <div className="rounded-2xl border border-border/60 bg-card px-6 py-14 text-center">
            <p className="text-sm text-muted-foreground">
              This note isn't available anymore. Open it again from its chapter.
            </p>
          </div>
        )}

        {status === "success" && note && (
          <>
            <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <h1 className="font-heading text-lg font-semibold leading-snug tracking-tight text-foreground sm:text-xl">
                    {note.topic || "Note"}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    {note.note && (
                      <span className="rounded-full bg-accent px-2 py-0.5 text-accent-foreground">
                        {note.note}
                      </span>
                    )}
                    <span className="break-all">{fileName}</span>
                    {created && <span>· {new Date(created).toLocaleDateString()}</span>}
                  </div>
                </div>
              </div>
            </div>

            {pdfUrl ? (
              <PdfViewer url={pdfUrl} fileName={fileName} />
            ) : (
              <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center sm:py-20">
                <Info className="h-6 w-6 text-muted-foreground" />
                <p className="mt-3 max-w-md text-sm text-muted-foreground">
                  This note has no file link yet — the content source publishes the document's name
                  only. It will open here automatically once a link is available.
                </p>
                <p className="mt-2 max-w-md break-all text-xs text-muted-foreground/80">{fileName}</p>
                <Button variant="outline" size="sm" className="mt-5" onClick={() => navigate(-1)}>
                  Back to chapter
                </Button>
              </div>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}