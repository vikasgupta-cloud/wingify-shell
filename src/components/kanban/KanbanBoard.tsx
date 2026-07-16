import { useMemo, useState } from "react";
import type { CampaignStatus } from "../../data/campaigns";
import { applyFilters } from "../../config/filters";
import { groupRows, type GroupField } from "../../config/grouping";
import { STATUS_WORKFLOW } from "../../config/statusWorkflow";
import { useRowsStore, useVisibleCampaigns } from "../../store/rows";
import { useTableStore } from "../../store/table";
import { useActiveViewState } from "../../store/views";
import { cn } from "../../lib/utils";
import { sortCampaigns } from "../table/CampaignTable";
import StatusBadge from "../ui/StatusBadge";
import KanbanCard from "./KanbanCard";
import { naturalKeys, visibleKeys } from "./columns";

export default function KanbanBoard() {
  const { search } = useTableStore();
  const { filters, sort, groupBy, boardColumns } = useActiveViewState();
  const campaigns = useVisibleCampaigns();
  const setStatus = useRowsStore((s) => s.setStatus);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const field: GroupField = groupBy ?? "status";
  const isStatus = field === "status";

  const rows = useMemo(() => {
    const byFilters = applyFilters(campaigns, filters);
    const q = search.trim().toLowerCase();
    const searched = q
      ? byFilters.filter(
          (c) =>
            c.name.toLowerCase().includes(q) || c.url.toLowerCase().includes(q)
        )
      : byFilters;
    return sortCampaigns(searched, sort);
  }, [campaigns, filters, search, sort]);

  const columns = useMemo(() => {
    const natural = naturalKeys(field, rows);
    const keys = visibleKeys(natural, boardColumns[field]);
    const byKey = new Map(groupRows(rows, field).map((g) => [g.key, g.rows]));
    return keys.map((key) => ({ key, rows: byKey.get(key) ?? [] }));
  }, [field, rows, boardColumns]);

  const draggedCard = draggedId
    ? rows.find((r) => r.id === draggedId) ?? null
    : null;
  const validTargets =
    draggedCard && isStatus
      ? new Set(STATUS_WORKFLOW[draggedCard.status].map((t) => t.to))
      : null;

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border px-3 py-16 text-center text-muted-foreground">
        {search.trim()
          ? "No campaigns match your search."
          : "Nothing here yet."}
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map(({ key, rows: colRows }) => {
        const isValid = validTargets ? validTargets.has(key as CampaignStatus) : false;
        const dragging = draggedId !== null && isStatus;
        return (
          <div
            key={key}
            onDragOver={(e) => {
              if (dragging && isValid) e.preventDefault();
            }}
            onDrop={(e) => {
              if (!dragging || !isValid || !draggedId) return;
              e.preventDefault();
              setStatus(draggedId, key as CampaignStatus);
              setDraggedId(null);
            }}
            className={cn(
              "flex max-h-[70vh] w-80 shrink-0 flex-col rounded-lg transition-opacity",
              dragging && !isValid && "opacity-50",
              dragging && isValid && "ring-2 ring-foreground/20"
            )}
          >
            <div className="flex items-center justify-between gap-2 px-1 pb-2">
              {isStatus ? (
                <StatusBadge status={key as CampaignStatus} />
              ) : (
                <span className="truncate text-sm font-medium text-foreground">
                  {key}
                </span>
              )}
              <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {colRows.length}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-0.5">
              {colRows.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  Nothing here
                </div>
              ) : (
                colRows.map((c) => (
                  <div
                    key={c.id}
                    draggable={isStatus}
                    onDragStart={
                      isStatus
                        ? (e) => {
                            e.dataTransfer.setData("text/plain", c.id);
                            e.dataTransfer.effectAllowed = "move";
                            setDraggedId(c.id);
                          }
                        : undefined
                    }
                    onDragEnd={isStatus ? () => setDraggedId(null) : undefined}
                  >
                    <KanbanCard campaign={c} showStatus={!isStatus} />
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
