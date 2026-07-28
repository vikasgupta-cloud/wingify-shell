// Shared right-hand definition panel for config + reports segment pickers.
// Source of truth: configuration SegmentPicker layout (badge + All Visitors / where).

import type { SegmentDefCondition } from "../../config/segments";

export type SegmentDisplayDef = {
  label: string;
  kind: "Standard" | "Custom";
  description?: string;
  condition?: SegmentDefCondition;
};

export function SegmentDefinitionPanel({
  def,
  emptyText = "Hover over a segment to see its definition.",
}: {
  def: SegmentDisplayDef | null;
  emptyText?: string;
}) {
  if (!def) {
    return <div className="text-sm text-muted-foreground">{emptyText}</div>;
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-base font-semibold text-foreground">{def.label}</span>
        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {def.kind}
        </span>
      </div>
      {def.description && (
        <p className="mt-2 text-sm text-muted-foreground">{def.description}</p>
      )}
      <div className="mt-5">
        <div className="text-sm font-semibold text-foreground">All Visitors</div>
        {def.condition && (
          <div className="mt-2">
            <div className="text-sm text-muted-foreground">where</div>
            <div className="mt-1 text-sm">
              <span className="font-semibold text-foreground">
                {def.condition.subject}
              </span>{" "}
              <span className="text-foreground">
                {def.condition.operator} {def.condition.value}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
