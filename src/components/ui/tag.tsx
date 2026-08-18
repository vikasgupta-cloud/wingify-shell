import * as React from "react";
import { Plus, X } from "@/components/icons/protoLucide";
import { cn } from "@/lib/utils";

/** Categorical swatch — maps to --chart-1…8 (Wingify pack cats). */
export type TagSwatch = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

const SWATCH_CLASS: Record<TagSwatch, string> = {
  1: "bg-chart-1",
  2: "bg-chart-2",
  3: "bg-chart-3",
  4: "bg-chart-4",
  5: "bg-chart-5",
  6: "bg-chart-6",
  7: "bg-chart-7",
  8: "bg-chart-8",
};

export function tagSwatchClass(swatch: TagSwatch): string {
  return SWATCH_CLASS[swatch];
}

export type TagProps = {
  label: string;
  /** Leading color square from the categorical chart palette. */
  swatch?: TagSwatch;
  onRemove?: () => void;
  className?: string;
};

/**
 * Label chip — muted/feather fill, optional chart swatch, optional dismiss.
 * Colors follow theme tokens (Wingify: canvas/muted chip + cat series dots).
 */
export function Tag({ label, swatch, onRemove, className }: TagProps) {
  return (
    <span
      data-slot="tag"
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-md border-0 bg-muted px-2 text-xs font-medium text-foreground",
        className
      )}
    >
      {swatch != null ? (
        <span
          aria-hidden
          className={cn("size-2.5 shrink-0 rounded-[2px]", SWATCH_CLASS[swatch])}
        />
      ) : null}
      <span className="max-w-[12rem] truncate">{label}</span>
      {onRemove ? (
        <button
          type="button"
          aria-label={`Remove ${label}`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="-mr-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-sm text-foreground/70 transition-colors hover:text-foreground"
        >
          <X className="size-3" strokeWidth={2} />
        </button>
      ) : null}
    </span>
  );
}

export type AddTagProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

/** Trailing “Add tag” control — same chip chrome as Tag. */
export function AddTag({ className, ...props }: AddTagProps) {
  return (
    <button
      type="button"
      data-slot="tag-add"
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded-md border-0 bg-muted px-2 text-xs font-medium text-foreground transition-colors hover:bg-muted/80",
        className
      )}
      {...props}
    >
      <Plus className="size-3.5" strokeWidth={2} />
      Add tag
    </button>
  );
}
