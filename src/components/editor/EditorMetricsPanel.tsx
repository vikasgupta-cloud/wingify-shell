import { useState } from "react";
import { MoreVertical, Plus, Sparkles, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MetricsTab = "added" | "suggested";

const ADDED = [
  { id: "M1", name: "Demo button Clicks", starred: true, ai: true },
];

const SECONDARY = [
  { id: "M2", name: "Calendar Booked - Sitewide" },
  { id: "M3", name: "Metric RD Form Success" },
  { id: "M4", name: "Checkout Started" },
  { id: "M5", name: "Product Page Views" },
  { id: "M6", name: "Newsletter Signup" },
];

const SUGGESTED = [
  { id: "S1", name: "Add to cart clicks" },
  { id: "S2", name: "Form submit success" },
  { id: "S3", name: "Video play rate" },
  { id: "S4", name: "Scroll depth 75%" },
  { id: "S5", name: "Outbound link clicks" },
];

function MetricRow({
  id,
  name,
  starred,
  ai,
}: {
  id: string;
  name: string;
  starred?: boolean;
  ai?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5">
      <span className="inline-flex size-7 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-bold text-foreground">
        {id}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-foreground">{name}</p>
      </div>
      {starred && (
        <Star className="size-3.5 shrink-0 text-foreground" strokeWidth={1.75} />
      )}
      {ai && (
        <Sparkles
          className="size-3.5 shrink-0 text-muted-foreground"
          strokeWidth={1.75}
        />
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-6 shrink-0"
        aria-label="More"
      >
        <MoreVertical className="size-3.5" strokeWidth={1.75} />
      </Button>
    </div>
  );
}

/** Metrics content in the bottom sheet. */
/** Metrics content in the bottom / side sheet. */
export function EditorMetricsPanel({
  onClose,
  compact = false,
}: {
  onClose?: () => void;
  compact?: boolean;
}) {
  const [tab, setTab] = useState<MetricsTab>("added");
  const gridClass = compact
    ? "grid grid-cols-1 gap-2"
    : "grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3";

  return (
    <aside className="flex h-full w-full flex-col bg-background">
      <div
        className={cn(
          "flex h-10 shrink-0 items-center border-b border-border",
          compact ? "gap-2 px-3" : "gap-3 px-4"
        )}
      >
        <p className="shrink-0 text-sm font-semibold text-foreground">Metrics</p>
        <nav
          className={cn(
            "flex min-w-0 flex-1 items-center overflow-x-auto",
            compact ? "gap-0.5" : "gap-1"
          )}
        >
          {(
            [
              ["added", compact ? "Added" : "Added metrics"],
              ["suggested", compact ? "Suggested" : "Suggested metrics"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "shrink-0 rounded-md py-1 font-semibold outline-none transition-colors",
                compact ? "px-2 text-[11px]" : "px-2.5 text-xs",
                tab === id
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </nav>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 shrink-0"
          aria-label="Close"
          onClick={onClose}
        >
          <X className="size-4" strokeWidth={1.75} />
        </Button>
      </div>

      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto",
          compact ? "p-3" : "p-4"
        )}
      >
        {tab === "added" ? (
          <div className={cn(compact ? "space-y-4" : "space-y-5")}>
            <div className={gridClass}>
              {ADDED.map((m) => (
                <MetricRow key={m.id} {...m} />
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold tracking-wide text-muted-foreground">
                  MORE METRICS
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 gap-1 px-2 text-[11px] font-semibold"
                >
                  <Plus className="size-3" strokeWidth={1.75} />
                  Add
                </Button>
              </div>
              <div className={gridClass}>
                {SECONDARY.map((m) => (
                  <MetricRow key={m.id} {...m} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className={gridClass}>
            {SUGGESTED.map((m) => (
              <MetricRow key={m.id} {...m} />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
