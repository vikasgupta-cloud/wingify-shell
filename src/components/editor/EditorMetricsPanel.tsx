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
];

const SUGGESTED = [
  { id: "S1", name: "Add to cart clicks" },
  { id: "S2", name: "Form submit success" },
  { id: "S3", name: "Video play rate" },
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
    <div className="flex items-center gap-2 rounded-md border border-border px-2.5 py-2">
      <span className="inline-flex size-6 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-bold text-foreground">
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

/** Left Metrics panel — added and suggested metrics. */
export function EditorMetricsPanel({ onClose }: { onClose?: () => void }) {
  const [tab, setTab] = useState<MetricsTab>("added");

  return (
    <aside className="flex h-full w-full flex-col bg-background">
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-border px-3">
        <p className="text-sm font-semibold text-foreground">Metrics</p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label="Close"
          onClick={onClose}
        >
          <X className="size-4" strokeWidth={1.75} />
        </Button>
      </div>

      <div className="flex min-h-0 flex-1">
        <nav className="flex w-[120px] shrink-0 flex-col gap-0.5 border-r border-border p-2">
          {(
            [
              ["added", "Added metrics"],
              ["suggested", "Suggested metrics"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "rounded-md px-2 py-1.5 text-left text-xs font-semibold outline-none",
                tab === id
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {tab === "added" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                {ADDED.map((m) => (
                  <MetricRow key={m.id} {...m} />
                ))}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
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
                {SECONDARY.map((m) => (
                  <MetricRow key={m.id} {...m} />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {SUGGESTED.map((m) => (
                <MetricRow key={m.id} {...m} />
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
