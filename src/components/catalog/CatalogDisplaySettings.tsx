/** Catalog Display settings — column visibility, search, reorder (up/down). */

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
  CATALOG_COLUMNS,
  CATALOG_COLUMN_BY_ID,
  type CatalogColumnId,
} from "@/config/catalogColumns";
import { useCatalogTableStore } from "@/store/catalogTable";
import { cn } from "@/lib/utils";

export default function CatalogDisplaySettings() {
  const visibleColumns = useCatalogTableStore((s) => s.visibleColumns);
  const toggleColumn = useCatalogTableStore((s) => s.toggleColumn);
  const moveColumn = useCatalogTableStore((s) => s.moveColumn);
  const [query, setQuery] = useState("");
  const [hoverId, setHoverId] = useState<CatalogColumnId | null>(null);

  const q = query.trim().toLowerCase();

  const { visible, hidden } = useMemo(() => {
    const vis = visibleColumns
      .map((id) => CATALOG_COLUMN_BY_ID[id])
      .filter(Boolean);
    const hid = CATALOG_COLUMNS.filter((c) => !visibleColumns.includes(c.id));
    if (!q) return { visible: vis, hidden: hid };
    return {
      visible: vis.filter((c) => c.label.toLowerCase().includes(q)),
      hidden: hid.filter((c) => c.label.toLowerCase().includes(q)),
    };
  }, [visibleColumns, q]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-2">
          <Settings className="size-3.5" aria-hidden />
          Display settings
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-[320px] max-h-[min(70vh,520px)] overflow-hidden p-0"
      >
        <PopoverArrow className="fill-popover stroke-border" />
        <div className="border-b border-border p-3">
          <div className="flex items-center gap-2 rounded-md border border-input bg-background px-2.5 py-1.5">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a column"
              className="h-auto border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0"
            />
            <Search className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
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
                  const locked = !!col.locked;
                  const index = visibleColumns.indexOf(col.id);
                  const canMove = !locked && index >= 2;
                  return (
                    <li
                      key={col.id}
                      className="group flex items-center gap-2 rounded-md px-1 py-1.5 hover:bg-muted/50"
                      onMouseEnter={() => setHoverId(col.id)}
                      onMouseLeave={() => setHoverId(null)}
                    >
                      <Switch
                        checked
                        disabled={locked}
                        onCheckedChange={() => {
                          if (!locked) toggleColumn(col.id);
                        }}
                        aria-label={`Hide ${col.label}`}
                      />
                      <span
                        className={cn(
                          "min-w-0 flex-1 truncate text-sm",
                          locked ? "text-muted-foreground" : "text-foreground"
                        )}
                      >
                        {col.label}
                      </span>
                      {canMove && hoverId === col.id && (
                        <span className="flex shrink-0 flex-col">
                          <button
                            type="button"
                            aria-label={`Move ${col.label} up`}
                            disabled={index <= 2}
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

          {hidden.length > 0 && (
            <section>
              <p className="mb-2 font-sans text-xs font-medium text-muted-foreground">
                Hidden in table
              </p>
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
                    <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                      {col.label}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {visible.length === 0 && hidden.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No columns match “{query}”.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
