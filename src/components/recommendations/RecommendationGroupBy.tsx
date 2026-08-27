/** Strategies — Group By popover (Location / Status). */

import { Filter, Rows3, Trash2 } from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  RECOMMENDATION_GROUP_FIELDS,
  type RecommendationGroupField,
} from "@/config/recommendationFilters";
import { useRecommendationTableStore } from "@/store/recommendationTable";
import { cn } from "@/lib/utils";

export default function RecommendationGroupBy() {
  const groupBy = useRecommendationTableStore((s) => s.groupBy);
  const setGroupBy = useRecommendationTableStore((s) => s.setGroupBy);
  const active = groupBy !== "none";
  const label =
    RECOMMENDATION_GROUP_FIELDS.find((g) => g.id === groupBy)?.label ??
    "Group By";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn("gap-2", active && "border-foreground")}
        >
          <Rows3 className="size-3.5" aria-hidden />
          {active ? label : "Group By"}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={8} className="w-[260px] p-3">
        <PopoverArrow className="fill-popover stroke-border" />
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="font-sans text-sm font-semibold text-foreground">
            Group By
          </p>
          {active && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground"
              aria-label="Clear grouping"
              onClick={() => setGroupBy("none")}
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
        <div className="mb-2 flex items-center gap-2 rounded-md border border-input bg-background px-2.5 py-2 text-sm text-muted-foreground">
          <Filter className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">{active ? label : "Select a field…"}</span>
        </div>
        <ul className="flex flex-col gap-0.5">
          {RECOMMENDATION_GROUP_FIELDS.map((g) => (
            <li key={g.id}>
              <button
                type="button"
                onClick={() =>
                  setGroupBy(
                    groupBy === g.id
                      ? "none"
                      : (g.id as RecommendationGroupField)
                  )
                }
                className={cn(
                  "w-full rounded-md px-2.5 py-2 text-left text-sm hover:bg-muted",
                  groupBy === g.id && "bg-muted font-medium"
                )}
              >
                {g.label}
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
