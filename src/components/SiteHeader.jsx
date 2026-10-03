import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function SiteHeader({ crumbs = [] }) {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const q = term.trim();
    navigate(q ? `/?q=${encodeURIComponent(q)}` : "/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-3">
          <Link
            to="/"
            className="flex min-w-0 shrink-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="font-heading text-base font-semibold leading-none tracking-tight text-foreground sm:text-lg">
                QPrep
              </span>
              <span className="mt-1 truncate text-[10px] font-medium uppercase leading-none tracking-wider text-muted-foreground">
                by Quantica Digital
              </span>
            </span>
          </Link>

          <form onSubmit={submit} role="search" className="relative ml-auto min-w-0 flex-1 max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search batches…"
              aria-label="Search batches"
              className="h-9 pl-9"
            />
          </form>
        </div>

        {crumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-2.5 text-xs text-muted-foreground [scrollbar-width:none] sm:text-sm [&::-webkit-scrollbar]:hidden"
          >
            {crumbs.map((c, i) => {
              const last = i === crumbs.length - 1;
              return (
                <span key={i} className="flex items-center gap-1.5">
                  <ChevronRight className="h-4 w-4 shrink-0 text-border" />
                  {c.to && !last ? (
                    <Link to={c.to} className="transition-colors hover:text-foreground">
                      {c.label}
                    </Link>
                  ) : (
                    <span className="font-medium text-foreground">{c.label}</span>
                  )}
                </span>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}