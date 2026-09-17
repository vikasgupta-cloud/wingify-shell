/** Plan → Observations. Search + table; row opens detail drawer (no /c/ route). */
import { useMemo, useState } from "react";
import {
  LayoutGrid,
  MessageSquare,
  Plus,
  Rows3,
  Search,
  Settings2,
  Star,
  X,
} from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PLAN_OBSERVATIONS } from "@/data/plan";
import { cn } from "@/lib/utils";
import { usePlanModalsStore } from "@/store/planModals";
import PlanModalsHost from "./PlanModalsHost";

export default function PlanObservationsPage() {
  const openObservation = usePlanModalsStore((s) => s.openObservation);
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return PLAN_OBSERVATIONS;
    return PLAN_OBSERVATIONS.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.displayId.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-8 pb-16 pt-8">
      <PlanModalsHost />
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-[14rem] flex-1 items-center gap-2 rounded-md border border-input bg-background px-2.5 py-1.5 sm:max-w-xs">
          <Search className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            aria-label="Search observations"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        <button
          type="button"
          disabled
          className="inline-flex max-w-[16rem] items-center gap-1.5 truncate rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground"
        >
          <span className="truncate">
            Created date range is Sep 7, 2017 – Sep 17…
          </span>
          <X className="size-3 shrink-0 opacity-60" aria-hidden />
        </button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled
          className="gap-1 border-dashed text-muted-foreground"
        >
          Add filter
          <Plus className="size-3.5" strokeWidth={1.75} aria-hidden />
        </Button>
        <div
          role="group"
          aria-label="Layout"
          className="ml-auto inline-flex rounded-md border border-border bg-background p-0.5"
        >
          <button
            type="button"
            aria-pressed
            aria-label="List view"
            className="inline-flex size-8 items-center justify-center rounded bg-muted text-foreground"
          >
            <Rows3 className="size-3.5" strokeWidth={1.75} aria-hidden />
          </button>
          <button
            type="button"
            aria-pressed={false}
            aria-label="Grid view"
            disabled
            className="inline-flex size-8 items-center justify-center rounded text-muted-foreground opacity-60"
          >
            <LayoutGrid className="size-3.5" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
        <div className="grid grid-cols-[2rem_minmax(12rem,1.4fr)_6rem_6rem_minmax(10rem,1fr)_minmax(9rem,1fr)_7.5rem] items-center gap-3 bg-muted/50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <span className="flex justify-center">
            <Checkbox disabled aria-label="Select all" />
          </span>
          <span>Name</span>
          <span>Labels</span>
          <span>Hypothesis</span>
          <span>Logged on/by</span>
          <span>Logged at</span>
          <span className="flex justify-end">
            <Settings2 className="size-3.5" strokeWidth={1.75} aria-hidden />
          </span>
        </div>
        <div>
          {rows.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              No observations match your search.
            </p>
          ) : (
            rows.map((row) => (
              <div
                key={row.id}
                role="link"
                tabIndex={0}
                onClick={() => openObservation(row.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openObservation(row.id);
                  }
                }}
                className="grid cursor-pointer grid-cols-[2rem_minmax(12rem,1.4fr)_6rem_6rem_minmax(10rem,1fr)_minmax(9rem,1fr)_7.5rem] items-center gap-3 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-muted/40"
              >
                <span
                  className="flex justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox disabled aria-label={`Select ${row.name}`} />
                </span>
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-sm font-medium text-foreground">
                    {row.name}
                  </span>
                </div>
                <span className="truncate text-sm text-muted-foreground">
                  {row.labels}
                </span>
                <span className="truncate text-sm text-muted-foreground">
                  {row.hypothesis}
                </span>
                <span className="truncate text-sm text-muted-foreground">
                  {row.loggedOnBy}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm text-[var(--info-fg)]">
                    {row.loggedAt}
                  </p>
                  <button
                    type="button"
                    disabled
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-[var(--info-fg)]/80"
                  >
                    {row.loggedAtAction}
                  </button>
                </div>
                <div
                  className="flex items-center justify-end gap-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled
                    className="h-8 gap-1 px-2 text-xs text-muted-foreground"
                  >
                    <MessageSquare className="size-3.5" strokeWidth={1.75} />
                    Add Comment
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled
                    aria-label={row.starred ? "Unstar" : "Star"}
                    className="size-8 text-muted-foreground"
                  >
                    <Star
                      className={cn(
                        "size-4",
                        row.starred && "fill-foreground text-foreground"
                      )}
                      strokeWidth={1.75}
                    />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
