import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const BADGE_TONES = [
  "neutral",
  "cherry",
  "amber",
  "yellow",
  "green",
  "ocean",
  "berry",
  "maroon",
] as const;
export type BadgeTone = (typeof BADGE_TONES)[number];

export const BADGE_FILLS = ["light", "solid"] as const;
export type BadgeFill = (typeof BADGE_FILLS)[number];

export const BADGE_SIZES = ["sm", "md", "lg"] as const;
export type BadgeSize = (typeof BADGE_SIZES)[number];

const badgeVariants = cva(
  "inline-flex items-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "rounded-md border border-[var(--appearance-badges-border,_transparent)] bg-[var(--appearance-badges-background,_var(--primary))] px-2.5 py-0.5 text-xs font-semibold text-[var(--appearance-badges-text,_var(--primary-foreground))] shadow hover:border-[var(--appearance-badges-hover-border,_var(--appearance-badges-border,_transparent))] hover:bg-[var(--appearance-badges-hover-background,_var(--appearance-badges-background,_var(--primary)))] hover:text-[var(--appearance-badges-hover-text,_var(--appearance-badges-text,_var(--primary-foreground)))] focus:border-[var(--appearance-badges-focus-border,_var(--appearance-badges-border,_transparent))] focus:bg-[var(--appearance-badges-focus-background,_var(--appearance-badges-background,_var(--primary)))] focus:text-[var(--appearance-badges-focus-text,_var(--appearance-badges-text,_var(--primary-foreground)))] focus:ring-[var(--appearance-badges-focus-ring,_var(--ring))] disabled:border-[var(--appearance-badges-disabled-border,_var(--appearance-badges-border,_transparent))] disabled:bg-[var(--appearance-badges-disabled-background,_var(--appearance-badges-background,_var(--primary)))] disabled:text-[var(--appearance-badges-disabled-text,_var(--appearance-badges-text,_var(--primary-foreground)))] disabled:opacity-50",
        secondary:
          "rounded-md border-transparent bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80 focus:ring-ring",
        destructive:
          "rounded-md border-transparent bg-destructive px-2.5 py-0.5 text-xs font-semibold text-destructive-foreground shadow hover:bg-destructive/80 focus:ring-ring",
        outline:
          "rounded-md border border-[var(--appearance-badges-border,_var(--border))] bg-[var(--appearance-badges-background,_transparent)] px-2.5 py-0.5 text-xs font-semibold text-[var(--appearance-badges-text,_var(--foreground))] hover:border-[var(--appearance-badges-hover-border,_var(--appearance-badges-border,_var(--border)))] hover:bg-[var(--appearance-badges-hover-background,_var(--appearance-badges-background,_transparent))] hover:text-[var(--appearance-badges-hover-text,_var(--appearance-badges-text,_var(--foreground)))] focus:border-[var(--appearance-badges-focus-border,_var(--appearance-badges-border,_var(--border)))] focus:bg-[var(--appearance-badges-focus-background,_var(--appearance-badges-background,_transparent))] focus:text-[var(--appearance-badges-focus-text,_var(--appearance-badges-text,_var(--foreground)))] focus:ring-[var(--appearance-badges-focus-ring,_var(--ring))] disabled:border-[var(--appearance-badges-disabled-border,_var(--appearance-badges-border,_var(--border)))] disabled:bg-[var(--appearance-badges-disabled-background,_var(--appearance-badges-background,_transparent))] disabled:text-[var(--appearance-badges-disabled-text,_var(--appearance-badges-text,_var(--foreground)))] disabled:opacity-50",
        pill: "overflow-hidden rounded-full border-0 font-medium shadow-none focus:ring-ring",
      },
      size: {
        sm: "h-5 gap-1 px-1.5 text-[10px] leading-none [&_svg]:size-2.5",
        md: "h-6 gap-1 px-2 text-[11px] leading-none [&_svg]:size-3",
        lg: "h-7 gap-1.5 px-2.5 text-xs leading-none [&_svg]:size-3.5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof badgeVariants>, "size"> {
  tone?: BadgeTone;
  fill?: BadgeFill;
  size?: BadgeSize;
  iconOnly?: boolean;
}

function Badge({
  className,
  variant,
  tone,
  fill = "light",
  size = "md",
  iconOnly = false,
  ...props
}: BadgeProps) {
  const isPill = Boolean(tone);
  return (
    <div
      data-badge={isPill ? "" : undefined}
      data-tone={tone}
      data-fill={isPill ? fill : undefined}
      className={cn(
        badgeVariants({
          variant: isPill ? "pill" : variant,
          size: isPill ? size : undefined,
        }),
        isPill &&
          iconOnly &&
          (size === "sm"
            ? "w-5 justify-center px-0"
            : size === "lg"
              ? "w-7 justify-center px-0"
              : "w-6 justify-center px-0"),
        className
      )}
      {...props}
    />
  );
}

function BadgeDot({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("size-1.5 shrink-0 rounded-full bg-current", className)}
    />
  );
}

function BadgeFlag({
  code = "US",
  className,
}: {
  code?: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-3.5 shrink-0 items-center justify-center rounded-full bg-current/15 text-[7px] font-semibold leading-none",
        className
      )}
    >
      {code}
    </span>
  );
}

export { Badge, BadgeDot, BadgeFlag, badgeVariants };
