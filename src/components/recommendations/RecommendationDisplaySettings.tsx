/** Strategies Display settings — column visibility + reorder. */

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Settings,
} from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import {
  RECOMMENDATION_COLUMNS,
  RECOMMENDATION_COLUMN_BY_ID,
  type RecommendationColumnId,
} from "@/config/recommendationColumns";
import { useRecommendationTableStore } from "@/store/recommendationTable";
import { cn } from "@/lib/utils";

export default function RecommendationDisplaySettings() {
  const visibleColumns = useRecommendationTableStore((s) => s.visibleColumns);
  const setVisibleColumns = useRecommendationTableStore(
    (s) => s.setVisibleColumns
  );
  const [query, setQuery] = useState("");
  const [hoverId, setHoverId] = useState<RecommendationColumnId | null>(null);

  const q = query.trim().toLowerCase();

  const { visible, hidden } = useMemo(() => {
    const vis = visibleColumns
      .map((id) => RECOMMENDATION_COLUMN_BY_ID[id])
      .filter(Boolean);
    const hid = RECOMMENDATION_COLUMNS.filter(
      (c) => !visibleColumns.includes(c.id)
    );
    if (!q) return { visible: vis, hidden: hid };
    return {
      visible: vis.filter((c) => c.label.toLowerCase().includes(q)),
      hidden: hid.filter((c) => c.label.toLowerCase().includes(q)),
    };
  }, [visibleColumns, q]);

  const lockedCount = RECOMMENDATION_COLUMNS.filter((c) => c.locked).length;

  const toggleColumn = (id: RecommendationColumnId) => {
    const col = RECOMMENDATION_COLUMN_BY_ID[id];
    if (col?.locked) return;
    if (visibleColumns.includes(id)) {
      setVisibleColumns(visibleColumns.filter((c) => c !== id));
    } else {
      setVisibleColumns([...visibleColumns, id]);
    }
  };

  const moveColumn = (id: RecommendationColumnId, dir: -1 | 1) => {
    const from = visibleColumns.indexOf(id);
    if (from < 0) return;
    const to = from + dir;
    if (to < lockedCount || to >= visibleColumns.length) return;
    if (from < lockedCount) return;
    const next = [...visibleColumns];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setVisibleColumns(next);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-2">
          <Settings className="size-3.5" aria-hidden />
          Display settings
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[320px] max-h-[min(70vh,520px)] overflow-hidden p-0"
      >
        <PopoverArrow className="fill-popover stroke-border" />
        <div className="border-b border-border p-3">
          <div className="flex items-center gap-2 rounded-md border border-input bg-background px-2.5 py-1.5">
            <Search className="size-3.5 shrink-0 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a column"
              className="h-auto border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="max-h-[420px] overflow-y-auto px-3 py-3">
          {visible.length > 0 && (
            <section className="mb-4">
              <p className="mb-2 font-sans text-xs font-medium text-muted-foreground">
                Visible in table
              </p>
              <ul className="flex flex-col gap-1">
                {visible.map((col) => {
                  const index = visibleColumns.indexOf(col.id);
                  const canMove = !col.locked && index >= lockedCount;
                  return (
                    <li
                      key={col.id}
                      className="flex items-center gap-2 rounded-md px-1 py-1.5 hover:bg-muted/50"
                      onMouseEnter={() => setHoverId(col.id)}
                      onMouseLeave={() => setHoverId(null)}
                    >
                      <Switch
                        checked
                        disabled={!!col.locked}
                        onCheckedChange={() => toggleColumn(col.id)}
                        aria-label={`Hide ${col.label}`}
                      />
                      <span
                        className={cn(
                          "min-w-0 flex-1 truncate text-sm",
                          col.locked
                            ? "text-muted-foreground"
                            : "text-foreground"
                        )}
                      >
                        {col.label}
                      </span>
                      {canMove && hoverId === col.id && (
                        <span className="flex shrink-0 flex-col">
                          <button
                            type="button"
                            aria-label={`Move ${col.label} up`}
                            disabled={index <= lockedCount}
                            onClick={() => moveColumn(col.id, -1)}
                            className="rounded-sm p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                          >
                            <ChevronUp className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Move ${col.label} down`}
                            disabled={index >= visibleColumns.length - 1}
                            onClick={() => moveColumn(col.id, 1)}
                            className="rounded-sm p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                          >
                            <ChevronDown className="size-3.5" />
                          </button>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <section>
            <p className="mb-2 font-sans text-xs font-medium text-muted-foreground">
              Hidden in table
            </p>
            {hidden.length === 0 ? (
              <p className="px-1 py-2 text-sm text-muted-foreground">
                All columns are already visible.
              </p>
            ) : (
              <ul className="flex flex-col gap-1">
                {hidden.map((col) => (
                  <li
                    key={col.id}
                    className="flex items-center gap-2 rounded-md px-1 py-1.5 hover:bg-muted/50"
                  >
                    <Switch
                      checked={false}
                      onCheckedChange={() => toggleColumn(col.id)}
                      aria-label={`Show ${col.label}`}
                    />
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {col.label}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </PopoverContent>
    </Popover>
  );
}
