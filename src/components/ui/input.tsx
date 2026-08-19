import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-[hsl(var(--appearance-inputs-border,_var(--input)))] bg-[hsl(var(--appearance-inputs-background,_var(--background)))] px-3 py-1 text-[hsl(var(--appearance-inputs-text,_var(--foreground)))] shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground hover:border-[hsl(var(--appearance-inputs-hover-border,_var(--appearance-inputs-border,_var(--input))))] hover:bg-[hsl(var(--appearance-inputs-hover-background,_var(--field-hover-bg,_var(--appearance-inputs-background,_var(--background)))))] hover:text-[hsl(var(--appearance-inputs-hover-text,_var(--appearance-inputs-text,_var(--foreground))))] focus-visible:outline-none focus-visible:border-[hsl(var(--appearance-inputs-focus-border,_var(--appearance-inputs-border,_var(--input))))] focus-visible:bg-[hsl(var(--appearance-inputs-focus-background,_var(--appearance-inputs-background,_var(--background))))] focus-visible:text-[hsl(var(--appearance-inputs-focus-text,_var(--appearance-inputs-text,_var(--foreground))))] focus-visible:ring-1 focus-visible:ring-[hsl(var(--appearance-inputs-focus-ring,_var(--appearance-inputs-focus-border,_var(--ring))))] disabled:cursor-not-allowed disabled:border-[hsl(var(--appearance-inputs-disabled-border,_var(--appearance-inputs-border,_var(--input))))] disabled:bg-[hsl(var(--appearance-inputs-disabled-background,_var(--appearance-inputs-background,_var(--background))))] disabled:text-[hsl(var(--appearance-inputs-disabled-text,_var(--appearance-inputs-text,_var(--foreground))))] disabled:opacity-50 read-only:border-[hsl(var(--appearance-inputs-read-only-border,_var(--appearance-inputs-border,_var(--input))))] read-only:bg-[hsl(var(--appearance-inputs-read-only-background,_var(--muted)))] read-only:text-[hsl(var(--appearance-inputs-read-only-text,_var(--appearance-inputs-text,_var(--foreground))))]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
