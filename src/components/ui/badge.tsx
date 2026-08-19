import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-[hsl(var(--appearance-badges-border,_transparent))] bg-[hsl(var(--appearance-badges-background,_var(--primary)))] text-[hsl(var(--appearance-badges-text,_var(--primary-foreground)))] shadow hover:border-[hsl(var(--appearance-badges-hover-border,_var(--appearance-badges-border,_transparent)))] hover:bg-[hsl(var(--appearance-badges-hover-background,_var(--appearance-badges-background,_var(--primary))))] hover:text-[hsl(var(--appearance-badges-hover-text,_var(--appearance-badges-text,_var(--primary-foreground))))] focus:border-[hsl(var(--appearance-badges-focus-border,_var(--appearance-badges-border,_transparent)))] focus:bg-[hsl(var(--appearance-badges-focus-background,_var(--appearance-badges-background,_var(--primary))))] focus:text-[hsl(var(--appearance-badges-focus-text,_var(--appearance-badges-text,_var(--primary-foreground))))] focus:ring-[hsl(var(--appearance-badges-focus-ring,_var(--ring)))] disabled:border-[hsl(var(--appearance-badges-disabled-border,_var(--appearance-badges-border,_transparent)))] disabled:bg-[hsl(var(--appearance-badges-disabled-background,_var(--appearance-badges-background,_var(--primary))))] disabled:text-[hsl(var(--appearance-badges-disabled-text,_var(--appearance-badges-text,_var(--primary-foreground))))] disabled:opacity-50",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-ring",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80 focus:ring-ring",
        outline:
          "border-[hsl(var(--appearance-badges-border,_var(--border)))] bg-[hsl(var(--appearance-badges-background,_transparent))] text-[hsl(var(--appearance-badges-text,_var(--foreground)))] hover:border-[hsl(var(--appearance-badges-hover-border,_var(--appearance-badges-border,_var(--border))))] hover:bg-[hsl(var(--appearance-badges-hover-background,_var(--appearance-badges-background,_transparent)))] hover:text-[hsl(var(--appearance-badges-hover-text,_var(--appearance-badges-text,_var(--foreground))))] focus:border-[hsl(var(--appearance-badges-focus-border,_var(--appearance-badges-border,_var(--border))))] focus:bg-[hsl(var(--appearance-badges-focus-background,_var(--appearance-badges-background,_transparent)))] focus:text-[hsl(var(--appearance-badges-focus-text,_var(--appearance-badges-text,_var(--foreground))))] focus:ring-[hsl(var(--appearance-badges-focus-ring,_var(--ring)))] disabled:border-[hsl(var(--appearance-badges-disabled-border,_var(--appearance-badges-border,_var(--border))))] disabled:bg-[hsl(var(--appearance-badges-disabled-background,_var(--appearance-badges-background,_transparent)))] disabled:text-[hsl(var(--appearance-badges-disabled-text,_var(--appearance-badges-text,_var(--foreground))))] disabled:opacity-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
