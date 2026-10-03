import { FileX2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmptyState({
  title = "No content found",
  message = "There's nothing here yet. Try another selection or check back later.",
  onClear,
  actionLabel = "Clear search",
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <FileX2 className="h-7 w-7" />
      </div>
      <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
      {onClear && (
        <Button variant="outline" className="mt-5" onClick={onClear}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}