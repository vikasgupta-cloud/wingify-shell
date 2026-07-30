import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

/**
 * Building blocks of the Reports Overview variation card, shared so the Quick
 * view renders the same design instead of its own variant.
 */

export function VariantChip({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-[23px] min-w-[29px] shrink-0 items-center justify-center rounded-md border border-border bg-muted px-2 text-xs font-medium text-muted-foreground">
      {children}
    </span>
  );
}

export function UpliftPill({ label }: { label: string }) {
  const positive = label.startsWith("+");
  const negative = label.startsWith("-");
  return (
    <span
      className={cn(
        "shrink-0 self-start rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
        positive && "bg-success-fg/10 text-success-fg",
        negative && "bg-danger-fg/10 text-danger-fg",
        !positive && !negative && "bg-muted text-muted-foreground"
      )}
    >
      {label}
    </span>
  );
}

export function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg bg-muted/50 px-3 py-2.5">
      <dt className="truncate text-[11px] leading-none text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1.5 truncate text-sm font-semibold tabular-nums text-foreground">
        {value}
      </dd>
    </div>
  );
}
