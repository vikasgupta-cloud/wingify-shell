/** Plan → Hypotheses. Table view + search; row opens detail modal (no /c/ route). */
import { useMemo, useState } from "react";
import {
  FlaskConical,
  LayoutGrid,
  Plus,
  Rows3,
  Search,
  Settings2,
  Star,
  FileText,
  X,
} from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PLAN_HYPOTHESES } from "@/data/plan";
import { cn } from "@/lib/utils";
import { usePlanModalsStore } from "@/store/planModals";
import PlanModalsHost from "./PlanModalsHost";

type HypoView = "progress" | "table";

export default function PlanHypothesesPage() {
  const openHypothesis = usePlanModalsStore((s) => s.openHypothesis);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<HypoView>("table");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return PLAN_HYPOTHESES;
    return PLAN_HYPOTHESES.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.displayId.toLowerCase().includes(q) ||
        row.description.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-8 pb-16 pt-8">
      <PlanModalsHost />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={view}
          onValueChange={(v) => setView(v as HypoView)}
          className="w-auto"
        >
          <TabsList className="h-9 bg-transparent p-0">
            <TabsTrigger
              value="progress"
              className="rounded-none border-b-2 border-transparent px-3 pb-2 pt-1 data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Progress View
            </TabsTrigger>
            <TabsTrigger
              value="table"
              className="rounded-none border-b-2 border-transparent px-3 pb-2 pt-1 data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Table View
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled
          className="gap-1.5 text-muted-foreground"
        >
          <FileText className="size-3.5" strokeWidth={1.75} aria-hidden />
          Import CSV
        </Button>
      </div>

      {view === "progress" ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-border bg-background text-center shadow-sm">
          <p className="text-sm font-medium text-foreground">Progress View</p>
          <p className="mt-1 text-sm text-muted-foreground">Coming soon.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex min-w-[14rem] flex-1 items-center gap-2 rounded-md border border-input bg-background px-2.5 py-1.5 sm:max-w-xs">
              <Search className="size-3.5 shrink-0 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                aria-label="Search hypotheses"
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
            <div className="grid grid-cols-[2rem_minmax(14rem,1.6fr)_5rem_5.5rem_7.5rem_minmax(8rem,0.9fr)_3rem] items-center gap-3 bg-muted/50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <span className="flex justify-center">
                <Checkbox disabled aria-label="Select all" />
              </span>
              <span>Name</span>
              <span>Labels</span>
              <span>Confidence</span>
              <span>Linked Test</span>
              <span>Created On</span>
              <span className="flex justify-end">
                <Settings2 className="size-3.5" strokeWidth={1.75} aria-hidden />
              </span>
            </div>
            <div>
              {rows.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No hypotheses match your search.
                </p>
              ) : (
                rows.map((row) => (
                  <div
                    key={row.id}
                    role="link"
                    tabIndex={0}
                    onClick={() => openHypothesis(row.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openHypothesis(row.id);
                      }
                    }}
                    className="grid cursor-pointer grid-cols-[2rem_minmax(14rem,1.6fr)_5rem_5.5rem_7.5rem_minmax(8rem,0.9fr)_3rem] items-center gap-3 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-muted/40"
                  >
                    <span
                      className="flex justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox disabled aria-label={`Select ${row.name}`} />
                    </span>
                    <div className="min-w-0">
                      <span className="truncate text-sm font-medium text-foreground">
                        {row.name}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {row.description}
                      </span>
                    </div>
                    <span className="truncate text-sm text-muted-foreground">
                      {row.labels}
                    </span>
                    <span className="inline-flex size-8 items-center justify-center rounded-full border border-dashed border-border text-xs text-muted-foreground">
                      {row.confidence > 0 ? row.confidence : "--"}
                    </span>
                    <span className="inline-flex max-w-full items-center gap-1 truncate rounded-md border border-border bg-muted/40 px-2 py-1 text-xs text-foreground">
                      {row.linkedTest !== "-" ? (
                        <FlaskConical
                          className="size-3 shrink-0 text-muted-foreground"
                          strokeWidth={1.75}
                        />
                      ) : null}
                      <span className="truncate">{row.linkedTest}</span>
                    </span>
                    <span className="text-sm leading-snug text-muted-foreground">
                      <span className="block text-foreground">{row.createdOn}</span>
                      <span className="block text-xs">by {row.createdBy}</span>
                    </span>
                    <div
                      className="flex justify-end"
                      onClick={(e) => e.stopPropagation()}
                    >
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
        </>
      )}
    </div>
  );
}
