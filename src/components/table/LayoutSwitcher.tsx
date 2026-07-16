import { Columns3, GanttChartSquare, Table } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useActiveViewState, useViewsStore, type Layout } from "../../store/views";
import { cn } from "../../lib/utils";

// Config-driven so other sections can opt into layouts later.
export const LAYOUTS_BY_PATH: Record<string, Array<Layout>> = {
  "/web-experiment": ["table", "kanban", "gantt"],
};

export function getLayouts(pathname: string): Layout[] {
  return LAYOUTS_BY_PATH[pathname] ?? ["table"];
}

const OPTIONS: { layout: Layout; label: string; icon: LucideIcon }[] = [
  { layout: "table", label: "Table", icon: Table },
  { layout: "kanban", label: "Kanban", icon: Columns3 },
  { layout: "gantt", label: "Gantt", icon: GanttChartSquare },
];

export default function LayoutSwitcher({ layouts }: { layouts: Layout[] }) {
  const { layout } = useActiveViewState();
  const updateDraft = useViewsStore((s) => s.updateActiveViewDraft);
  const options = OPTIONS.filter((o) => layouts.includes(o.layout));

  return (
    <div className="inline-flex items-center gap-0.5 rounded-md bg-muted p-0.5">
      {options.map(({ layout: value, label, icon: Icon }) => {
        const active = layout === value;
        return (
          <button
            key={value}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={active}
            onClick={() => updateDraft({ layout: value })}
            className={cn(
              "rounded-md p-1.5 transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
